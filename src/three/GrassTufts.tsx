import React, { useMemo } from 'react';
import * as THREE from 'three';
import { gridHeight, LAKE } from './terrainHeight';
import { trailCurve } from './curve';

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

/**
 * Small grass tufts flanking the trail through the meadow stretches —
 * near-field detail where the camera actually looks.
 */
export default function GrassTufts({ count = 480 }: { count?: number }) {
  const { matrices, colors, placed } = useMemo(() => {
    const rand = mulberry32(2024);
    const pts = trailCurve.getSpacedPoints(240);
    const ms: THREE.Matrix4[] = [];
    const cs: number[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const c1 = new THREE.Color('#4f7a3a');
    const c2 = new THREE.Color('#7fa055');
    const tmp = new THREE.Color();

    let attempts = 0;
    while (ms.length < count && attempts < count * 8) {
      attempts++;
      const p = pts[Math.floor(rand() * pts.length)];
      const angle = rand() * Math.PI * 2;
      const dist = 2.5 + rand() * 9;
      const x = p.x + Math.cos(angle) * dist;
      const z = p.z + Math.sin(angle) * dist;
      const h = gridHeight(x, z);
      if (h > 18 || h < 1) continue; // meadows only
      const ldx = x - LAKE.x;
      const ldz = z - LAKE.z;
      if (ldx * ldx + ldz * ldz < (LAKE.radius + 4) ** 2) continue;

      const s = 0.5 + rand() * 0.9;
      q.setFromAxisAngle(up, rand() * Math.PI * 2);
      m.compose(
        new THREE.Vector3(x, h + 0.18 * s, z),
        q,
        new THREE.Vector3(s, s * (0.8 + rand() * 0.6), s)
      );
      ms.push(m.clone());
      tmp.copy(c1).lerp(c2, rand());
      cs.push(tmp.r, tmp.g, tmp.b);
    }
    return { matrices: ms, colors: new Float32Array(cs), placed: ms.length };
  }, [count]);

  const ref = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    mesh.instanceMatrix.needsUpdate = true;
  };

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, placed]}>
      <coneGeometry args={[0.28, 0.6, 5]} />
      <meshStandardMaterial roughness={1} flatShading />
    </instancedMesh>
  );
}
