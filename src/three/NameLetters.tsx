import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { gridHeight } from './terrainHeight';
import { besideTrail, trailCurve } from './curve';
import { ACCENT } from './palette';
import { SuvState } from './Suv';

const FONT_URL = `${process.env.PUBLIC_URL}/assets/fonts/helvetiker_bold.typeface.json`;
const NAME = 'ALAN BALCOM';
const LETTER_SIZE = 2.3;
const LETTER_DEPTH = 0.6;
const GRAVITY = 22;

interface LetterBody {
  char: string;
  geometry: THREE.BufferGeometry;
  half: THREE.Vector3; // bbox half extents
  home: THREE.Vector3;
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  vel: THREE.Vector3;
  angVel: THREE.Vector3;
  asleep: boolean;
  sleepTimer: number;
  hitCooldown: number;
}

const CORNERS: THREE.Vector3[] = [];
for (const sx of [-1, 1])
  for (const sy of [-1, 1])
    for (const sz of [-1, 1]) CORNERS.push(new THREE.Vector3(sx, sy, sz));

/**
 * The owner's name as solid 3D letters standing in the meadow near the
 * trailhead — with just enough rigid-body simulation that the SUV can
 * plow through and send them tumbling.
 */
export default function NameLetters({
  suvState,
}: {
  suvState: React.MutableRefObject<SuvState>;
}) {
  const font = useLoader(FontLoader, FONT_URL) as Font;

  const letters = useMemo<LetterBody[]>(() => {
    // The row stands in the meadow beside the SUV and FACES the
    // trailhead, so it reads correctly from the hero camera. Facing
    // direction F points at the viewer; letters advance along the
    // viewer's left-to-right, which is -cross(F, up) in world space.
    const rowCenter = besideTrail(0.004, 24);
    const trailhead = trailCurve.getPointAt(0);
    const up = new THREE.Vector3(0, 1, 0);
    const facing = new THREE.Vector3(
      trailhead.x - rowCenter.x,
      0,
      trailhead.z - rowCenter.z
    ).normalize();
    const along = new THREE.Vector3()
      .crossVectors(facing, up)
      .normalize()
      .multiplyScalar(-1);
    const yaw = Math.atan2(facing.x, facing.z);
    const quatBase = new THREE.Quaternion().setFromAxisAngle(up, yaw);

    // first pass: build geometries and measure the row
    const built: Array<{
      char: string;
      geometry: THREE.BufferGeometry | null;
      size: THREE.Vector3;
    }> = [];
    for (const char of NAME) {
      if (char === ' ') {
        built.push({
          char,
          geometry: null,
          size: new THREE.Vector3(LETTER_SIZE * 0.55, 0, 0),
        });
        continue;
      }
      const geometry = new TextGeometry(char, {
        font,
        size: LETTER_SIZE,
        height: LETTER_DEPTH,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.04,
        bevelSegments: 2,
      });
      geometry.computeBoundingBox();
      const bb = geometry.boundingBox!;
      const size = new THREE.Vector3();
      bb.getSize(size);
      const center = new THREE.Vector3();
      bb.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);
      built.push({ char, geometry, size });
    }
    const GAP = 0.42;
    const totalWidth =
      built.reduce((sum, b) => sum + b.size.x, 0) + GAP * (built.length - 1);

    // second pass: place letters centered on the row
    const bodies: LetterBody[] = [];
    let cursor = -totalWidth / 2;
    for (const b of built) {
      if (!b.geometry) {
        cursor += b.size.x + GAP;
        continue;
      }
      const home = rowCenter
        .clone()
        .addScaledVector(along, cursor + b.size.x / 2);
      home.y = gridHeight(home.x, home.z) + b.size.y / 2;
      cursor += b.size.x + GAP;

      bodies.push({
        char: b.char,
        geometry: b.geometry,
        half: b.size.clone().multiplyScalar(0.5),
        home,
        pos: home.clone(),
        quat: quatBase.clone(),
        vel: new THREE.Vector3(),
        angVel: new THREE.Vector3(),
        asleep: true,
        sleepTimer: 0,
        hitCooldown: 0,
      });
    }
    return bodies;
  }, [font]);

  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);
  const tmp = useRef({
    dir: new THREE.Vector3(),
    axis: new THREE.Vector3(),
    dq: new THREE.Quaternion(),
    corner: new THREE.Vector3(),
    up: new THREE.Vector3(0, 1, 0),
  });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.045);
    const suv = suvState.current;
    const suvSpeed = Math.abs(suv.speed);
    const t = tmp.current;

    letters.forEach((b, i) => {
      b.hitCooldown -= dt;

      // SUV impact: impulse away from the truck + tumbling spin
      if (suvSpeed > 2 && b.hitCooldown <= 0) {
        const dx = b.pos.x - suv.pos.x;
        const dz = b.pos.z - suv.pos.z;
        const reach = Math.hypot(b.half.x, b.half.z) + 2.1;
        if (dx * dx + dz * dz < reach * reach) {
          b.hitCooldown = 0.3;
          b.asleep = false;
          b.sleepTimer = 0;
          t.dir.set(dx, 0, dz).normalize();
          b.vel.addScaledVector(t.dir, suvSpeed * 0.85);
          b.vel.y += suvSpeed * 0.3;
          // topple axis: perpendicular to the push direction
          t.axis.crossVectors(t.up, t.dir);
          b.angVel.addScaledVector(t.axis, suvSpeed * 0.55);
          b.angVel.y += (Math.random() - 0.5) * suvSpeed * 0.4;
        }
      }

      if (b.asleep) return;

      // integrate
      b.vel.y -= GRAVITY * dt;
      b.pos.addScaledVector(b.vel, dt);
      const w = b.angVel.length();
      if (w > 1e-4) {
        t.axis.copy(b.angVel).multiplyScalar(1 / w);
        t.dq.setFromAxisAngle(t.axis, w * dt);
        b.quat.premultiply(t.dq).normalize();
      }

      // ground contact via the lowest transformed bbox corner
      let minY = Infinity;
      for (const c of CORNERS) {
        t.corner
          .set(c.x * b.half.x, c.y * b.half.y, c.z * b.half.z)
          .applyQuaternion(b.quat);
        if (t.corner.y < minY) minY = t.corner.y;
      }
      const ground = gridHeight(b.pos.x, b.pos.z);
      const bottom = b.pos.y + minY;
      if (bottom < ground) {
        b.pos.y += ground - bottom;
        if (b.vel.y < 0) b.vel.y *= -0.26;
        b.vel.x *= 0.8;
        b.vel.z *= 0.8;
        b.angVel.multiplyScalar(0.78);
      }

      // settle to sleep
      if (b.vel.lengthSq() < 0.09 && b.angVel.lengthSq() < 0.09) {
        b.sleepTimer += dt;
        if (b.sleepTimer > 0.6) {
          b.asleep = true;
          b.vel.set(0, 0, 0);
          b.angVel.set(0, 0, 0);
        }
      } else {
        b.sleepTimer = 0;
      }

      const mesh = meshRefs.current[i];
      if (mesh) {
        mesh.position.copy(b.pos);
        mesh.quaternion.copy(b.quat);
      }
    });
  });

  return (
    <group>
      {letters.map((b, i) => (
        <mesh
          key={i}
          geometry={b.geometry}
          position={b.home}
          quaternion={b.quat}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
        >
          <meshPhysicalMaterial
            color={ACCENT}
            metalness={0.35}
            roughness={0.3}
            clearcoat={0.8}
            clearcoatRoughness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}
