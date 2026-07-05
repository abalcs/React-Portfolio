import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Matches the visible sun in the HDRI (kloofendal 48d puresky) closely
// enough for coherent shadows — refine against screenshots.
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

/**
 * Invisible drifting cloud volumes that exist only to cast the moving
 * shadows sweeping the terrain — the visible sky itself is the HDRI.
 */
export default function ShadowClouds({ count = 8 }: { count?: number }) {
  const group = useRef<THREE.Group>(null);

  const clouds = useMemo<CloudSpec[]>(() => {
    const rand = mulberry32(777);
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * 800,
      y: 135 + rand() * 75,
      z: (rand() - 0.5) * 800,
      scale: 10 + rand() * 10,
      speed: 1.2 + rand() * 1.8,
      puffs: Array.from({ length: 7 + Math.floor(rand() * 4) }, () => [
        (rand() - 0.5) * 3.2,
        (rand() - 0.5) * 0.35,
        (rand() - 0.5) * 1.4,
        0.38 + rand() * 0.42,
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
              scale={[1.8, 0.55, 1.1]}
            >
              <icosahedronGeometry args={[p[3], 1]} />
              {/* never rendered — only the shadow pass sees this */}
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
