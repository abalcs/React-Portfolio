import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface BirdSpec {
  radius: number;
  height: number;
  speed: number;
  phase: number;
  centerX: number;
  centerZ: number;
}

function Bird({ spec }: { spec: BirdSpec }) {
  const group = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime * spec.speed + spec.phase;
    const x = spec.centerX + Math.cos(t) * spec.radius;
    const z = spec.centerZ + Math.sin(t) * spec.radius;
    group.current.position.set(x, spec.height + Math.sin(t * 2.3) * 3, z);
    // face along the circular path
    group.current.rotation.y = -t - Math.PI / 2;
    // slow wing beats with the occasional glide
    const flap = Math.sin(t * 7) * 0.5 * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.4)));
    if (wingL.current) wingL.current.rotation.z = flap;
    if (wingR.current) wingR.current.rotation.z = -flap;
  });

  return (
    <group ref={group}>
      <mesh>
        <coneGeometry args={[0.14, 0.9, 4]} />
        <meshStandardMaterial color="#2c2f36" roughness={0.9} flatShading />
      </mesh>
      <mesh ref={wingL} position={[0.45, 0.05, 0]}>
        <boxGeometry args={[0.95, 0.03, 0.3]} />
        <meshStandardMaterial color="#2c2f36" roughness={0.9} flatShading />
      </mesh>
      <mesh ref={wingR} position={[-0.45, 0.05, 0]}>
        <boxGeometry args={[0.95, 0.03, 0.3]} />
        <meshStandardMaterial color="#2c2f36" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

/** A few hawks riding thermals over the valley — distant signs of life. */
export default function Birds() {
  const birds = useMemo<BirdSpec[]>(
    () => [
      { radius: 55, height: 70, speed: 0.14, phase: 0, centerX: 60, centerZ: 60 },
      { radius: 40, height: 84, speed: 0.18, phase: 2.1, centerX: 55, centerZ: 50 },
      { radius: 70, height: 62, speed: 0.11, phase: 4.4, centerX: -70, centerZ: 100 },
    ],
    []
  );

  return (
    <group>
      {birds.map((b, i) => (
        <Bird key={i} spec={b} />
      ))}
    </group>
  );
}
