import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { gridHeight, LAKE, TERRAIN_SIZE } from './terrainHeight';
import { besideTrail } from './curve';
import { engineState, suvTelemetry } from '../lib/vehicleBus';

export interface SuvState {
  pos: THREE.Vector3;
  heading: number;
  speed: number;
  spawn: THREE.Vector3;
}

export function createSuvState(): SuvState {
  const parked = besideTrail(0.012, 14);
  return {
    pos: parked.clone(),
    heading: Math.PI * 0.75,
    speed: 0,
    spawn: parked.clone(),
  };
}

const WHEELBASE = 2.9;
const TRACK = 1.7;
const MAX_FWD = 19;
const MAX_REV = -6;
const ACCEL = 9;
const BRAKE = 16;
const DRAG = 0.7;
const STEER_RATE = 1.9;
const TIP_THRESHOLD = 0.62; // beyond this roll the truck falls onto its side

const PAINT = '#3c5e40';
const TRIM = '#23272b';
const CHROME = '#b9c0c8';
const GLASS = '#0d1318';

const DUST_COUNT = 26;

function makeDustTexture(): THREE.CanvasTexture {
  const S = 64;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  }
  return new THREE.CanvasTexture(c);
}

function Paint() {
  return (
    <meshPhysicalMaterial
      color={PAINT}
      metalness={0.6}
      roughness={0.34}
      clearcoat={1}
      clearcoatRoughness={0.08}
    />
  );
}

interface SuvProps {
  driving: boolean;
  state: React.MutableRefObject<SuvState>;
}

/**
 * The family's SUV. Arcade kinematics conformed to terrain, plus a
 * spring-damper roll model: hard bumps at speed inject roll energy, and
 * past the stability threshold the truck genuinely tips onto its side —
 * throttle applies righting torque to recover.
 */
export default function Suv({ driving, state }: SuvProps) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const wheels = useRef<Array<THREE.Group | null>>([null, null, null, null]);
  const dustGroup = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const steerVisual = useRef(0);
  const keys = useRef<Record<string, boolean>>({});
  const smoothY = useRef<number | null>(null);
  const pitch = useRef(0);
  const rollDyn = useRef({ a: 0, v: 0 });
  const leanPitch = useRef(0);
  const prevSpeed = useRef(0);
  const prevTargetY = useRef<number | null>(null);
  const emitTimer = useRef(0);
  const dustIndex = useRef(0);

  // rounded coachwork reads as sheet metal instead of cardboard boxes
  const geos = useMemo(
    () => ({
      bodyG: new RoundedBoxGeometry(1.85, 0.88, 4.35, 4, 0.1),
      hood: new RoundedBoxGeometry(1.78, 0.32, 1.1, 3, 0.08),
      cabin: new RoundedBoxGeometry(1.7, 0.72, 2.1, 4, 0.12),
      roof: new RoundedBoxGeometry(1.74, 0.1, 2.16, 2, 0.04),
      windshield: new RoundedBoxGeometry(1.62, 0.78, 0.08, 2, 0.03),
    }),
    []
  );

  const dustTexture = useMemo(makeDustTexture, []);
  const dust = useMemo(
    () =>
      Array.from({ length: DUST_COUNT }, () => ({
        sprite: new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: dustTexture,
            color: '#b3a184',
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
        ),
        life: 1,
      })),
    [dustTexture]
  );

  useEffect(() => {
    const g = dustGroup.current;
    if (!g) return;
    dust.forEach((d) => g.add(d.sprite));
    return () => {
      dust.forEach((d) => g.remove(d.sprite));
    };
  }, [dust]);

  useEffect(() => {
    if (!driving) {
      keys.current = {};
      return;
    }
    const relevant = new Set([
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Space',
    ]);
    const down = (e: KeyboardEvent) => {
      if (!relevant.has(e.code)) return;
      e.preventDefault();
      keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      if (relevant.has(e.code)) keys.current[e.code] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [driving]);

  useEffect(() => {
    engineState.active = driving;
    suvTelemetry.driving = driving;
    return () => {
      engineState.active = false;
      engineState.intensity = 0;
      suvTelemetry.driving = false;
    };
  }, [driving]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const s = state.current;
    const dt = Math.min(delta, 0.05);
    const tipped = Math.abs(rollDyn.current.a) > TIP_THRESHOLD;

    let throttle = 0;
    let steer = 0;

    if (driving) {
      const k = keys.current;
      throttle =
        (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
      steer =
        (k.KeyA || k.ArrowLeft ? 1 : 0) - (k.KeyD || k.ArrowRight ? 1 : 0);
      const braking = k.Space;

      if (!tipped) {
        if (throttle > 0) s.speed += ACCEL * dt;
        else if (throttle < 0) s.speed -= (s.speed > 0 ? BRAKE : ACCEL) * dt;
        if (braking) s.speed = THREE.MathUtils.damp(s.speed, 0, 8, dt);
        s.speed -= s.speed * DRAG * dt;
        s.speed = THREE.MathUtils.clamp(s.speed, MAX_REV, MAX_FWD);
        if (Math.abs(s.speed) < 0.02 && throttle === 0) s.speed = 0;

        const authority = THREE.MathUtils.clamp(s.speed / 7, -1, 1);
        s.heading += steer * STEER_RATE * authority * dt;
        steerVisual.current = THREE.MathUtils.damp(
          steerVisual.current,
          steer * 0.45,
          10,
          dt
        );

        const nx = s.pos.x + Math.sin(s.heading) * s.speed * dt;
        const nz = s.pos.z + Math.cos(s.heading) * s.speed * dt;
        const bound = TERRAIN_SIZE * 0.47;
        const ldx = nx - LAKE.x;
        const ldz = nz - LAKE.z;
        const inLake = ldx * ldx + ldz * ldz < (LAKE.radius + 2.5) ** 2;
        if (Math.abs(nx) < bound && Math.abs(nz) < bound && !inLake) {
          s.pos.x = nx;
          s.pos.z = nz;
        } else {
          s.speed *= -0.25;
        }
      } else {
        // on its side: no travel, wheels spin uselessly
        s.speed = THREE.MathUtils.damp(s.speed, 0, 6, dt);
        steerVisual.current = THREE.MathUtils.damp(steerVisual.current, 0, 6, dt);
      }
    } else {
      s.speed = THREE.MathUtils.damp(s.speed, 0, 4, dt);
      steerVisual.current = THREE.MathUtils.damp(steerVisual.current, 0, 6, dt);
    }

    engineState.intensity = Math.abs(s.speed) / MAX_FWD;
    suvTelemetry.distFromSpawn = s.pos.distanceTo(s.spawn);

    // terrain conforming via four wheel-point samples
    const sinH = Math.sin(s.heading);
    const cosH = Math.cos(s.heading);
    const half = WHEELBASE / 2;
    const halfT = TRACK / 2;
    const hF = gridHeight(s.pos.x + sinH * half, s.pos.z + cosH * half);
    const hB = gridHeight(s.pos.x - sinH * half, s.pos.z - cosH * half);
    const hR = gridHeight(s.pos.x + cosH * halfT, s.pos.z - sinH * halfT);
    const hL = gridHeight(s.pos.x - cosH * halfT, s.pos.z + sinH * halfT);

    // resting height rises as the truck rolls onto its side
    const absRoll = Math.abs(rollDyn.current.a);
    const sideRest = THREE.MathUtils.smoothstep(absRoll, 0.55, 1.45) * 0.42;
    const targetY = (hF + hB + hL + hR) / 4 + 0.46 + sideRest;
    const jolt =
      prevTargetY.current === null
        ? 0
        : Math.abs(targetY - prevTargetY.current) / dt;
    prevTargetY.current = targetY;
    smoothY.current =
      smoothY.current === null
        ? targetY
        : THREE.MathUtils.damp(smoothY.current, targetY, 10, dt);
    s.pos.y = smoothY.current;

    pitch.current = THREE.MathUtils.damp(
      pitch.current,
      -Math.atan2(hF - hB, WHEELBASE),
      10,
      dt
    );

    // ---- roll dynamics: spring-damper toward terrain roll, energized by
    // hard bumps at speed; past the threshold gravity takes over ----
    const r = rollDyn.current;
    const terrainRoll = Math.atan2(hR - hL, TRACK);
    const leanRoll =
      -steerVisual.current *
      THREE.MathUtils.clamp(s.speed / MAX_FWD, -1, 1) *
      0.09;
    if (!tipped) {
      r.v += ((terrainRoll + leanRoll - r.a) * 34 - r.v * 7) * dt;
      if (driving && jolt > 3.4 && Math.abs(s.speed) > 9.5) {
        const dir = terrainRoll >= r.a ? 1 : -1;
        r.v +=
          dir *
          Math.min(jolt * 0.085, 1.7) *
          (Math.abs(s.speed) / MAX_FWD);
      }
    } else {
      r.v += Math.sign(r.a) * 6.5 * dt; // gravity pulls it onto the side
      r.v -= r.v * 2.2 * dt;
      if (throttle > 0) r.v -= Math.sign(r.a) * 16 * dt; // drive to right it
      if (absRoll >= 1.5) {
        r.a = Math.sign(r.a) * 1.5;
        if (Math.sign(r.v) === Math.sign(r.a)) r.v = 0;
      }
    }
    r.a = THREE.MathUtils.clamp(r.a + r.v * dt, -1.5, 1.5);

    group.current.position.copy(s.pos);
    group.current.rotation.order = 'YXZ';
    group.current.rotation.set(pitch.current, s.heading, r.a);

    // body-only pitch lean (dive/squat)
    const accel = (s.speed - prevSpeed.current) / Math.max(dt, 1e-4);
    prevSpeed.current = s.speed;
    leanPitch.current = THREE.MathUtils.damp(
      leanPitch.current,
      THREE.MathUtils.clamp(accel * 0.004, -0.05, 0.05),
      6,
      dt
    );
    if (body.current) {
      body.current.rotation.set(leanPitch.current, 0, 0);
    }

    spin.current -= (s.speed * dt) / 0.44;
    wheels.current.forEach((w, i) => {
      if (!w) return;
      w.rotation.order = 'YXZ';
      w.rotation.y = i < 2 ? steerVisual.current : 0;
      w.rotation.x = spin.current;
    });

    // dust from the rear wheels at speed
    emitTimer.current -= dt;
    if (driving && !tipped && Math.abs(s.speed) > 5 && emitTimer.current <= 0) {
      emitTimer.current = 0.055;
      const d = dust[dustIndex.current % DUST_COUNT];
      dustIndex.current++;
      const side = dustIndex.current % 2 === 0 ? 1 : -1;
      d.sprite.position.set(
        s.pos.x - sinH * 1.5 + cosH * 0.8 * side + (Math.random() - 0.5) * 0.3,
        s.pos.y - 0.2,
        s.pos.z - cosH * 1.5 - sinH * 0.8 * side + (Math.random() - 0.5) * 0.3
      );
      d.life = 0;
    }
    for (const d of dust) {
      if (d.life >= 1) continue;
      d.life = Math.min(1, d.life + dt / 1.15);
      const mat = d.sprite.material as THREE.SpriteMaterial;
      mat.opacity = 0.38 * (1 - d.life);
      const sc = 0.5 + d.life * 2.6;
      d.sprite.scale.set(sc, sc, 1);
      d.sprite.position.y += dt * 0.85;
    }
  });

  const halfTX = TRACK / 2 + 0.06;
  const wheelPositions: Array<[number, number, number]> = [
    [halfTX, 0, WHEELBASE / 2],
    [-halfTX, 0, WHEELBASE / 2],
    [halfTX, 0, -WHEELBASE / 2],
    [-halfTX, 0, -WHEELBASE / 2],
  ];

  return (
    <>
      <group ref={group}>
        <group ref={body}>
          <mesh geometry={geos.bodyG} position={[0, 0.62, 0]}>
            <Paint />
          </mesh>
          <mesh geometry={geos.hood} position={[0, 0.9, 1.62]}>
            <Paint />
          </mesh>
          <mesh geometry={geos.cabin} position={[0, 1.42, -0.55]}>
            <meshPhysicalMaterial color={GLASS} metalness={1} roughness={0.06} />
          </mesh>
          <mesh
            geometry={geos.windshield}
            position={[0, 1.36, 0.78]}
            rotation={[-0.42, 0, 0]}
          >
            <meshPhysicalMaterial color={GLASS} metalness={1} roughness={0.06} />
          </mesh>
          <mesh geometry={geos.roof} position={[0, 1.82, -0.55]}>
            <Paint />
          </mesh>
          {/* window pillar trim */}
          {[0.86, -0.86].map((x) => (
            <mesh key={`p${x}`} position={[x, 1.42, -0.55]}>
              <boxGeometry args={[0.04, 0.74, 2.14]} />
              <meshStandardMaterial color={TRIM} roughness={0.6} />
            </mesh>
          ))}
          {/* door seams + handles */}
          {[0.94, -0.94].map((x) =>
            [0.45, -0.62].map((z) => (
              <mesh key={`s${x}${z}`} position={[x, 0.72, z]}>
                <boxGeometry args={[0.015, 0.62, 0.02]} />
                <meshStandardMaterial color="#1a2016" roughness={0.7} />
              </mesh>
            ))
          )}
          {[0.95, -0.95].map((x) =>
            [0.18, -0.88].map((z) => (
              <mesh key={`h${x}${z}`} position={[x, 1.02, z]}>
                <boxGeometry args={[0.03, 0.05, 0.22]} />
                <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.25} />
              </mesh>
            ))
          )}
          {/* roof rails */}
          {[0.62, -0.62].map((x) => (
            <mesh key={x} position={[x, 1.96, -0.55]}>
              <boxGeometry args={[0.07, 0.12, 1.9]} />
              <meshStandardMaterial color={TRIM} roughness={0.6} />
            </mesh>
          ))}
          {/* arch flares + running boards */}
          {wheelPositions.map(([wx, , wz], i) => (
            <mesh key={i} position={[wx > 0 ? 0.97 : -0.97, 0.6, wz]}>
              <boxGeometry args={[0.16, 0.5, 1.2]} />
              <meshStandardMaterial color={TRIM} roughness={0.8} />
            </mesh>
          ))}
          {[1.04, -1.04].map((x) => (
            <mesh key={x} position={[x, 0.24, -0.1]}>
              <boxGeometry args={[0.2, 0.07, 2.2]} />
              <meshStandardMaterial color={TRIM} roughness={0.7} />
            </mesh>
          ))}
          {/* mirrors */}
          {[1.0, -1.0].map((x) => (
            <group key={x} position={[x, 1.28, 0.72]}>
              <mesh position={[x > 0 ? 0.08 : -0.08, 0, 0]}>
                <boxGeometry args={[0.16, 0.04, 0.05]} />
                <meshStandardMaterial color={TRIM} roughness={0.6} />
              </mesh>
              <mesh position={[x > 0 ? 0.18 : -0.18, 0, 0]}>
                <Paint />
                <boxGeometry args={[0.06, 0.16, 0.24]} />
              </mesh>
            </group>
          ))}
          {/* grille, chrome, bull bar */}
          <mesh position={[0, 0.72, 2.19]}>
            <boxGeometry args={[1.24, 0.34, 0.07]} />
            <meshStandardMaterial color="#191c1f" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.92, 2.19]}>
            <boxGeometry args={[1.34, 0.06, 0.08]} />
            <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.62, 2.32]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
            <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.25} />
          </mesh>
          {[0.55, -0.55].map((x) => (
            <mesh key={x} position={[x, 0.45, 2.3]}>
              <cylinderGeometry args={[0.045, 0.045, 0.5, 8]} />
              <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.25} />
            </mesh>
          ))}
          {/* exhaust */}
          <mesh position={[-0.6, 0.28, -2.24]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
            <meshStandardMaterial color="#4a4f54" metalness={0.8} roughness={0.4} />
          </mesh>
          {/* spare */}
          <mesh position={[0, 1.0, -2.28]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.26, 18]} />
            <meshStandardMaterial color={TRIM} roughness={0.9} />
          </mesh>
          {/* lights */}
          {[0.62, -0.62].map((x) => (
            <mesh key={`hl${x}`} position={[x, 0.78, 2.21]}>
              <boxGeometry args={[0.3, 0.14, 0.06]} />
              <meshStandardMaterial
                color="#fff8dd"
                emissive="#fff3c4"
                emissiveIntensity={driving ? 1.6 : 0.25}
                toneMapped={false}
              />
            </mesh>
          ))}
          {[0.66, -0.66].map((x) => (
            <mesh key={`tl${x}`} position={[x, 0.82, -2.2]}>
              <boxGeometry args={[0.22, 0.12, 0.05]} />
              <meshStandardMaterial
                color="#5c1010"
                emissive="#e02020"
                emissiveIntensity={driving ? 0.9 : 0.15}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
        {wheelPositions.map((p, i) => (
          <group
            key={i}
            position={p}
            ref={(el) => {
              wheels.current[i] = el;
            }}
          >
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.44, 0.44, 0.32, 18]} />
              <meshStandardMaterial color="#16181a" roughness={0.95} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.19, 0.19, 0.34, 12]} />
              <meshStandardMaterial color="#8f959c" metalness={0.85} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={dustGroup} />
    </>
  );
}
