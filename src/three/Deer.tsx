import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { gridHeight, LAKE, TERRAIN_SIZE } from './terrainHeight';
import { trailCurve } from './curve';
import { ProgressRef } from './hooks/useScrollProgress';
import { SuvState } from './Suv';

const HIDE = '#a5825f';
const HIDE_DARK = '#8a6a4a';
const FLEE_RADIUS = 17;
const HERDS: Array<[number, number]> = [
  [150, 45],
  [-125, 185],
];

interface DeerBrain {
  pos: THREE.Vector3;
  heading: number;
  speed: number;
  state: 'graze' | 'flee' | 'wander';
  timer: number;
  grazePhase: number;
  gait: number;
}

function DeerBody({
  brainRef,
  index,
}: {
  brainRef: React.MutableRefObject<DeerBrain[]>;
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const legs = useRef<Array<THREE.Group | null>>([null, null, null, null]);

  useFrame((_, delta) => {
    const brain = brainRef.current[index];
    if (!brain || !group.current) return;
    group.current.position.copy(brain.pos);
    group.current.rotation.y = brain.heading;

    // gait: diagonal leg pairs swing while moving
    brain.gait += brain.speed * delta * 2.4;
    const amp = THREE.MathUtils.clamp(brain.speed / 8, 0, 0.7);
    legs.current.forEach((leg, i) => {
      if (!leg) return;
      const pair = i === 0 || i === 3 ? 1 : -1;
      leg.rotation.x = Math.sin(brain.gait) * amp * pair;
    });

    // grazing: head dips to the grass and back up
    if (head.current) {
      const down =
        brain.state === 'graze' && Math.sin(brain.grazePhase) > 0 ? 1.05 : 0;
      head.current.rotation.x = THREE.MathUtils.damp(
        head.current.rotation.x,
        down,
        3,
        delta
      );
    }
  });

  return (
    <group ref={group}>
      {/* body */}
      <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.3, 0.62, 6, 12]} />
        <meshStandardMaterial color={HIDE} roughness={0.9} />
      </mesh>
      {/* neck + head */}
      <group ref={head} position={[0, 1.02, 0.42]}>
        <mesh position={[0, 0.18, 0.1]} rotation={[-0.55, 0, 0]}>
          <capsuleGeometry args={[0.11, 0.32, 4, 10]} />
          <meshStandardMaterial color={HIDE} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.42, 0.28]}>
          <boxGeometry args={[0.2, 0.2, 0.36]} />
          <meshStandardMaterial color={HIDE_DARK} roughness={0.9} />
        </mesh>
        {/* ears */}
        {[0.09, -0.09].map((x) => (
          <mesh key={x} position={[x, 0.56, 0.2]} rotation={[0, 0, x > 0 ? -0.4 : 0.4]}>
            <coneGeometry args={[0.05, 0.16, 5]} />
            <meshStandardMaterial color={HIDE_DARK} roughness={0.9} />
          </mesh>
        ))}
        {/* nose */}
        <mesh position={[0, 0.38, 0.47]}>
          <boxGeometry args={[0.1, 0.09, 0.08]} />
          <meshStandardMaterial color="#33261c" roughness={0.8} />
        </mesh>
      </group>
      {/* legs — pivot at hips/shoulders */}
      {(
        [
          [0.16, 0.28],
          [-0.16, 0.28],
          [0.16, -0.3],
          [-0.16, -0.3],
        ] as Array<[number, number]>
      ).map(([x, z], i) => (
        <group
          key={i}
          position={[x, 0.72, z]}
          ref={(el) => {
            legs.current[i] = el;
          }}
        >
          <mesh position={[0, -0.34, 0]}>
            <capsuleGeometry args={[0.05, 0.55, 4, 8]} />
            <meshStandardMaterial color={HIDE_DARK} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* white tail patch */}
      <mesh position={[0, 0.95, -0.48]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#f2ede2" roughness={0.9} />
      </mesh>
    </group>
  );
}

interface DeerProps {
  progress: ProgressRef;
  suvState: React.MutableRefObject<SuvState>;
}

/**
 * Two small herds grazing the meadows. They scatter when the SUV (or the
 * hiker) gets close, then settle and wander back to grazing.
 */
export default function Deer({ progress, suvState }: DeerProps) {
  const brains = useRef<DeerBrain[]>([]);
  const hikerPos = useRef(new THREE.Vector3());
  const threat = useRef(new THREE.Vector3());

  if (brains.current.length === 0) {
    let seed = 97;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    HERDS.forEach(([hx, hz]) => {
      for (let i = 0; i < 4; i++) {
        const x = hx + (rand() - 0.5) * 16;
        const z = hz + (rand() - 0.5) * 16;
        brains.current.push({
          pos: new THREE.Vector3(x, gridHeight(x, z), z),
          heading: rand() * Math.PI * 2,
          speed: 0,
          state: 'graze',
          timer: rand() * 4,
          grazePhase: rand() * 10,
          gait: 0,
        });
      }
    });
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    trailCurve.getPointAt(
      THREE.MathUtils.clamp(progress.current, 0.0005, 0.9995),
      hikerPos.current
    );
    const suv = suvState.current;

    for (const b of brains.current) {
      b.timer -= dt;
      b.grazePhase += dt * 0.7;

      // nearest threat: SUV or hiker
      const dSuv = b.pos.distanceTo(suv.pos);
      const dHiker = b.pos.distanceTo(hikerPos.current);
      const nearest = dSuv < dHiker ? suv.pos : hikerPos.current;
      const dist = Math.min(dSuv, dHiker);

      if (dist < FLEE_RADIUS && b.state !== 'flee') {
        b.state = 'flee';
        b.timer = 2.5 + Math.random() * 2;
        threat.current.copy(nearest);
      }

      if (b.state === 'flee') {
        const away = Math.atan2(
          b.pos.x - nearest.x,
          b.pos.z - nearest.z
        );
        const diff =
          ((away - b.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        b.heading += diff * Math.min(1, dt * 5);
        b.speed = THREE.MathUtils.damp(b.speed, 9.5, 5, dt);
        if (b.timer <= 0 && dist > FLEE_RADIUS * 1.5) {
          b.state = 'wander';
          b.timer = 2 + Math.random() * 3;
        }
      } else if (b.state === 'wander') {
        b.speed = THREE.MathUtils.damp(b.speed, 1.4, 3, dt);
        b.heading += (Math.random() - 0.5) * dt * 1.2;
        if (b.timer <= 0) {
          b.state = 'graze';
          b.timer = 4 + Math.random() * 6;
        }
      } else {
        b.speed = THREE.MathUtils.damp(b.speed, 0, 4, dt);
        if (b.timer <= 0) {
          b.state = 'wander';
          b.timer = 1.5 + Math.random() * 2.5;
        }
      }

      if (b.speed > 0.05) {
        let nx = b.pos.x + Math.sin(b.heading) * b.speed * dt;
        let nz = b.pos.z + Math.cos(b.heading) * b.speed * dt;
        // stay out of the lake and inside the world
        const inLake =
          (nx - LAKE.x) ** 2 + (nz - LAKE.z) ** 2 < (LAKE.radius + 4) ** 2;
        const bound = TERRAIN_SIZE * 0.45;
        if (inLake || Math.abs(nx) > bound || Math.abs(nz) > bound) {
          b.heading += Math.PI / 2;
          nx = b.pos.x;
          nz = b.pos.z;
        }
        b.pos.set(nx, gridHeight(nx, nz), nz);
      }
    }
  });

  return (
    <group>
      {brains.current.map((_, i) => (
        <DeerBody key={i} brainRef={brains} index={i} />
      ))}
    </group>
  );
}
