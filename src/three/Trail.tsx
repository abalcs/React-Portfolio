import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { trailCurve } from './curve';
import { gridHeight } from './terrainHeight';

const LIFT = 0.12; // just above the terrain triangles it drapes over
const TEX_REPEAT_LEN = 6; // world units of path per texture repeat

/**
 * A worn dirt footpath draped flush onto the rendered terrain — textured,
 * width-wobbling, with feathered edges that blend into the meadow instead
 * of ending in a hard brown stripe.
 */
export default function Trail() {
  const { map, normalMap } = useTexture({
    map: `${process.env.PUBLIC_URL}/assets/pbr/dirt_floor_diff_1k.jpg`,
    normalMap: `${process.env.PUBLIC_URL}/assets/pbr/dirt_floor_nor_gl_1k.jpg`,
  });

  useMemo(() => {
    [map, normalMap].forEach((tex) => {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 8;
      tex.needsUpdate = true;
    });
    map.colorSpace = THREE.SRGBColorSpace;
  }, [map, normalMap]);

  const geometry = useMemo(() => {
    const N = 700;
    // 4 vertices across: transparent edge, opaque core, transparent edge
    const ACROSS = [-0.5, -0.22, 0.22, 0.5];
    const ALPHA = [0, 1, 1, 0];
    const positions = new Float32Array((N + 1) * ACROSS.length * 3);
    const colors = new Float32Array((N + 1) * ACROSS.length * 4);
    const uvs = new Float32Array((N + 1) * ACROSS.length * 2);
    const indices: number[] = [];
    const p = new THREE.Vector3();
    const tan = new THREE.Vector3();
    let dist = 0;
    let prevX = 0;
    let prevZ = 0;

    for (let i = 0; i <= N; i++) {
      const t = i / N;
      trailCurve.getPointAt(t, p);
      trailCurve.getTangentAt(t, tan);
      if (i > 0) dist += Math.hypot(p.x - prevX, p.z - prevZ);
      prevX = p.x;
      prevZ = p.z;

      // organic width variation so it never reads as a uniform strip
      const width =
        1.9 * (0.82 + 0.22 * Math.sin(i * 0.19) + 0.12 * Math.sin(i * 0.53 + 2));
      const inv = 1 / Math.hypot(tan.z, tan.x);
      const px = -tan.z * inv;
      const pz = tan.x * inv;

      for (let j = 0; j < ACROSS.length; j++) {
        const off = ACROSS[j] * width;
        const x = p.x + px * off;
        const z = p.z + pz * off;
        const vi = (i * ACROSS.length + j) * 3;
        positions[vi] = x;
        positions[vi + 1] = gridHeight(x, z) + LIFT;
        positions[vi + 2] = z;
        const ci = (i * ACROSS.length + j) * 4;
        // slightly darker, packed-earth core
        const tint = j === 1 || j === 2 ? 0.92 : 1;
        colors[ci] = tint;
        colors[ci + 1] = tint;
        colors[ci + 2] = tint;
        colors[ci + 3] = ALPHA[j];
        const ui = (i * ACROSS.length + j) * 2;
        uvs[ui] = ACROSS[j] + 0.5;
        uvs[ui + 1] = dist / TEX_REPEAT_LEN;
      }
      if (i < N) {
        const row = i * ACROSS.length;
        const next = row + ACROSS.length;
        for (let j = 0; j < ACROSS.length - 1; j++) {
          indices.push(row + j, next + j, row + j + 1);
          indices.push(next + j, next + j + 1, row + j + 1);
        }
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={map}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.7, 0.7)}
        vertexColors
        transparent
        depthWrite={false}
        roughness={1}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}
