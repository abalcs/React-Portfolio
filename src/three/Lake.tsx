import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { LAKE } from './terrainHeight';
import { ProgressRef } from './hooks/useScrollProgress';

interface LakeProps {
  tier: 'high' | 'low';
  progress: ProgressRef;
}

/**
 * A still alpine tarn in the valley. Real planar reflections are only
 * rendered while the lake is actually in view (the early journey) — the
 * reflection pass re-renders the whole scene, so it's the single most
 * expensive effect and gets unmounted once the hiker climbs past it.
 */
export default function Lake({ tier, progress }: LakeProps) {
  const [inView, setInView] = useState(true);

  useFrame(() => {
    const visible = progress.current < 0.45;
    if (visible !== inView) setInView(visible);
  });

  const reflective = tier === 'high' && inView;

  return (
    <mesh
      position={[LAKE.x, LAKE.waterY, LAKE.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[LAKE.radius + 4, 48]} />
      {reflective ? (
        <MeshReflectorMaterial
          mirror={0.55}
          resolution={256}
          mixBlur={1}
          blur={[320, 100]}
          mixStrength={2.2}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#5e88a6"
          metalness={0.05}
          roughness={0.6}
        />
      ) : (
        <meshStandardMaterial
          color="#3f7397"
          roughness={0.12}
          metalness={0.3}
          transparent
          opacity={0.94}
        />
      )}
    </mesh>
  );
}
