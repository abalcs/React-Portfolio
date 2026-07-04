import React, { useMemo } from 'react';
import * as THREE from 'three';
import { trailCurve } from './curve';
import { gridHeight } from './terrainHeight';

const WIDTH = 1.8;
const LIFT = 0.12; // just above the terrain triangles it drapes over

/**
 * A worn dirt footpath draped flush onto the rendered terrain: a ribbon
 * whose every vertex sits on the actual terrain mesh surface.
 */
export default function Trail() {
  const geometry = useMemo(() => {
    const N = 700;
    const positions = new Float32Array((N + 1) * 2 * 3);
    const indices: number[] = [];
    const p = new THREE.Vector3();
    const tan = new THREE.Vector3();

    for (let i = 0; i <= N; i++) {
      const t = i / N;
      trailCurve.getPointAt(t, p);
      trailCurve.getTangentAt(t, tan);
      const inv = 1 / Math.hypot(tan.z, tan.x);
      const ox = -tan.z * inv * (WIDTH / 2);
      const oz = tan.x * inv * (WIDTH / 2);
      const lx = p.x + ox;
      const lz = p.z + oz;
      const rx = p.x - ox;
      const rz = p.z - oz;
      positions.set([lx, gridHeight(lx, lz) + LIFT, lz], i * 6);
      positions.set([rx, gridHeight(rx, rz) + LIFT, rz], i * 6 + 3);
      if (i < N) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#a98a68"
        roughness={1}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}
