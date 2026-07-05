import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial, useTexture } from '@react-three/drei';
import { LAKE } from './terrainHeight';
import { ProgressRef } from './hooks/useScrollProgress';

interface LakeProps {
  tier: 'high' | 'low';
  progress: ProgressRef;
}

/**
 * An alpine tarn with drifting ripple normals. True planar reflections
 * render only while the lake is in view (the early journey) — that pass
 * re-renders the whole scene, so it unmounts once the hiker climbs past.
 */
export default function Lake({ tier, progress }: LakeProps) {
  const [inView, setInView] = useState(true);

  const ripples = useTexture(
    `${process.env.PUBLIC_URL}/assets/pbr/waternormals.jpg`
  );
  useMemo(() => {
    ripples.wrapS = ripples.wrapT = THREE.RepeatWrapping;
    ripples.repeat.set(6, 6);
    ripples.needsUpdate = true;
  }, [ripples]);

  const drift = useRef(0);
  useFrame((_, delta) => {
    const visible = progress.current < 0.45;
    if (visible !== inView) setInView(visible);
    // slow diagonal drift of the ripple field
    drift.current += delta;
    ripples.offset.set(drift.current * 0.012, drift.current * 0.008);
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
          mirror={0.6}
          resolution={256}
          mixBlur={0.6}
          blur={[220, 60]}
          mixStrength={1.8}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#88a8bf"
          metalness={0.05}
          roughness={0.25}
          normalMap={ripples}
          normalScale={new THREE.Vector2(0.35, 0.35)}
        />
      ) : (
        <meshStandardMaterial
          color="#4d86ad"
          roughness={0.15}
          metalness={0.3}
          normalMap={ripples}
          normalScale={new THREE.Vector2(0.4, 0.4)}
          transparent
          opacity={0.95}
        />
      )}
    </mesh>
  );
}
