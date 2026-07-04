import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';

export const SUN_POSITION: [number, number, number] = [260, 380, 200];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface CloudSpec {
  x: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  puffs: Array<[number, number, number, number]>;
}

function Clouds({ count = 9 }: { count?: number }) {
  const group = useRef<THREE.Group>(null);

  const clouds = useMemo<CloudSpec[]>(() => {
    const rand = mulberry32(777);
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * 800,
      y: 105 + rand() * 70,
      z: (rand() - 0.5) * 800,
      scale: 8 + rand() * 12,
      speed: 1.2 + rand() * 1.8,
      puffs: Array.from({ length: 4 + Math.floor(rand() * 3) }, () => [
        (rand() - 0.5) * 2.4,
        (rand() - 0.5) * 0.5,
        (rand() - 0.5) * 1.2,
        0.55 + rand() * 0.5,
      ]),
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.children.forEach((cloud, i) => {
      cloud.position.x += clouds[i].speed * delta;
      if (cloud.position.x > 460) cloud.position.x = -460;
    });
  });

  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.scale}>
          {c.puffs.map((p, j) => (
            <mesh
              key={j}
              castShadow
              position={[p[0], p[1], p[2]]}
              scale={[1.6, 0.8, 1]}
            >
              <icosahedronGeometry args={[p[3], 0]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={1}
                transparent
                opacity={0.92}
                flatShading
                fog={false}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

interface DaySkyProps {
  cloudCount?: number;
}

/**
 * Physically-based day sky (Preetham atmospheric scattering via drei)
 * with drifting low-poly clouds whose shadows sweep the terrain.
 */
export default function DaySky({ cloudCount }: DaySkyProps) {
  return (
    <>
      <Sky
        sunPosition={SUN_POSITION}
        distance={3000}
        turbidity={4.5}
        rayleigh={1.1}
        mieCoefficient={0.004}
        mieDirectionalG={0.85}
      />
      <Clouds count={cloudCount} />
    </>
  );
}
