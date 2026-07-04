import React, { useMemo } from 'react';
import * as THREE from 'three';
import { gridHeight, TERRAIN_SIZE, LAKE } from './terrainHeight';
import { trailCurve } from './curve';

const TRAIL_CLEARANCE = 6;

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
 * Weathered boulders strewn across the slopes (one instanced draw call),
 * denser up high where the grass gives way to scree.
 */
export default function Rocks({ count = 140 }: { count?: number }) {
  const { matrices, colors, placed } = useMemo(() => {
    const rand = mulberry32(4242);
    const trailPts = trailCurve.getSpacedPoints(160);
    const ms: THREE.Matrix4[] = [];
    const cs: number[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const c1 = new THREE.Color('#7d8087');
    const c2 = new THREE.Color('#9a9da3');
    const tmp = new THREE.Color();

    let attempts = 0;
    while (ms.length < count && attempts < count * 12) {
      attempts++;
      const x = (rand() - 0.5) * TERRAIN_SIZE * 0.9;
      const z = (rand() - 0.5) * TERRAIN_SIZE * 0.9;
      const h = gridHeight(x, z);
      // boulders favor the rocky heights; sparse in the meadow
      if (h < 6 && rand() < 0.7) continue;
      const ldx = x - LAKE.x;
      const ldz = z - LAKE.z;
      if (ldx * ldx + ldz * ldz < (LAKE.radius + 6) ** 2) continue;

      let nearTrail = false;
      for (const p of trailPts) {
        const dx = p.x - x;
        const dz = p.z - z;
        if (dx * dx + dz * dz < TRAIL_CLEARANCE * TRAIL_CLEARANCE) {
          nearTrail = true;
          break;
        }
      }
      if (nearTrail) continue;

      const s = 0.5 + rand() * rand() * 2.6;
      e.set(rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI);
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(x, h + s * 0.25, z),
        q,
        new THREE.Vector3(s, s * (0.7 + rand() * 0.5), s)
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
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={0.95} flatShading />
    </instancedMesh>
  );
}
