import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { gridHeight, TERRAIN_SIZE, LAKE } from './terrainHeight';
import { trailCurve, CAMP, CAMP_CLEARANCE } from './curve';

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

/** Noise-displaced sphere with spherical UVs — a believable boulder shape. */
export function makeBoulderGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 3);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const rand = mulberry32(555);
  // random plane "facets" chopping the sphere + per-vertex noise
  const cuts = Array.from({ length: 3 }, () =>
    new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize()
  );
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      Math.sin(v.x * 5.1) * Math.sin(v.y * 4.3) * Math.sin(v.z * 6.2) * 0.12 +
      Math.sin(v.x * 11 + 3.0) * 0.05;
    let r = 1 + n;
    for (const c of cuts) {
      const d = v.dot(c);
      if (d > 0.72) r *= 1 - (d - 0.72) * 0.55; // flatten facet
    }
    v.multiplyScalar(r);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  // spherical UVs for the rock texture
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    uvs[i * 2] = Math.atan2(v.z, v.x) / (Math.PI * 2) + 0.5;
    uvs[i * 2 + 1] = Math.acos(THREE.MathUtils.clamp(v.y, -1, 1)) / Math.PI;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Weathered boulders strewn across the slopes (one instanced draw call),
 * denser up high where the grass gives way to scree.
 */
export default function Rocks({ count = 140 }: { count?: number }) {
  const { map, normalMap } = useTexture({
    map: `${process.env.PUBLIC_URL}/assets/pbr/rock_face_diff_1k.jpg`,
    normalMap: `${process.env.PUBLIC_URL}/assets/pbr/rock_face_nor_gl_1k.jpg`,
  });
  useMemo(() => {
    [map, normalMap].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 8;
      tex.needsUpdate = true;
    });
    map.colorSpace = THREE.SRGBColorSpace;
  }, [map, normalMap]);

  const geometry = useMemo(makeBoulderGeometry, []);

  const { matrices, colors, placed } = useMemo(() => {
    const rand = mulberry32(4242);
    const trailPts = trailCurve.getSpacedPoints(160);
    const ms: THREE.Matrix4[] = [];
    const cs: number[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const c1 = new THREE.Color('#9a948c');
    const c2 = new THREE.Color('#c9c4bc');
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
      const cdx = x - CAMP.x;
      const cdz = z - CAMP.z;
      if (cdx * cdx + cdz * cdz < CAMP_CLEARANCE ** 2) continue;

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
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, placed]}
      geometry={geometry}
    >
      <meshStandardMaterial
        map={map}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(1.1, 1.1)}
        roughness={0.95}
      />
    </instancedMesh>
  );
}
