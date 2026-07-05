import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { gridHeight } from './terrainHeight';
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
 * Near-field detail along the path edges — pebbles kicked to the sides
 * and dry twigs — the ground clutter every real trail has.
 */
export default function TrailScatter({
  pebbleCount = 600,
  twigCount = 140,
}: {
  pebbleCount?: number;
  twigCount?: number;
}) {
  const { rock, rockN, bark } = useTexture({
    rock: `${process.env.PUBLIC_URL}/assets/pbr/rock_face_diff_1k.jpg`,
    rockN: `${process.env.PUBLIC_URL}/assets/pbr/rock_face_nor_gl_1k.jpg`,
    bark: `${process.env.PUBLIC_URL}/assets/pbr/bark_brown_01_diff_1k.jpg`,
  });
  useMemo(() => {
    [rock, rockN, bark].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.needsUpdate = true;
    });
    rock.colorSpace = THREE.SRGBColorSpace;
    bark.colorSpace = THREE.SRGBColorSpace;
  }, [rock, rockN, bark]);

  const pebbleGeo = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = Math.sin(v.x * 7.3) * Math.sin(v.z * 5.9) * 0.18;
      v.multiplyScalar(1 + n);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const { pebbles, twigs } = useMemo(() => {
    const rand = mulberry32(11235);
    const pts = trailCurve.getSpacedPoints(400);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();

    const place = (
      count: number,
      minLat: number,
      maxLat: number,
      make: (x: number, z: number, h: number) => void
    ) => {
      let tries = 0;
      let placedCount = 0;
      while (placedCount < count && tries < count * 5) {
        tries++;
        const i = Math.floor(rand() * (pts.length - 1));
        const p = pts[i];
        const nxt = pts[i + 1];
        // perpendicular offset to either side of the path
        const dx = nxt.x - p.x;
        const dz = nxt.z - p.z;
        const inv = 1 / (Math.hypot(dx, dz) || 1);
        const side = rand() < 0.5 ? -1 : 1;
        const lat = minLat + rand() * (maxLat - minLat);
        const x = p.x + -dz * inv * lat * side + (rand() - 0.5) * 0.6;
        const z = p.z + dx * inv * lat * side + (rand() - 0.5) * 0.6;
        const h = gridHeight(x, z);
        if (h < 0.5) continue;
        make(x, z, h);
        placedCount++;
      }
    };

    const pebbleMs: THREE.Matrix4[] = [];
    place(600, 1.1, 2.6, (x, z, h) => {
      const s = 0.05 + rand() * rand() * 0.16;
      e.set(rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI);
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(x, h + s * 0.4, z),
        q,
        new THREE.Vector3(s, s * 0.75, s)
      );
      pebbleMs.push(m.clone());
    });

    const twigMs: THREE.Matrix4[] = [];
    place(140, 1.3, 4, (x, z, h) => {
      const s = 0.5 + rand() * 0.9;
      e.set(0, rand() * Math.PI * 2, Math.PI / 2 + (rand() - 0.5) * 0.2);
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(x, h + 0.03, z),
        q,
        new THREE.Vector3(s, s, s)
      );
      twigMs.push(m.clone());
    });

    return { pebbles: pebbleMs, twigs: twigMs };
  }, []);

  const setMatrices =
    (list: THREE.Matrix4[]) => (mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return;
      list.forEach((mat, i) => mesh.setMatrixAt(i, mat));
      mesh.instanceMatrix.needsUpdate = true;
    };

  return (
    <group>
      <instancedMesh
        ref={setMatrices(pebbles)}
        args={[undefined, undefined, pebbles.length]}
        geometry={pebbleGeo}
      >
        <meshStandardMaterial map={rock} normalMap={rockN} roughness={0.95} />
      </instancedMesh>
      <instancedMesh
        ref={setMatrices(twigs)}
        args={[undefined, undefined, twigs.length]}
      >
        <cylinderGeometry args={[0.02, 0.032, 0.9, 5]} />
        <meshStandardMaterial map={bark} roughness={1} />
      </instancedMesh>
    </group>
  );
}
