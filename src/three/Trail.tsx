import React, { useMemo } from 'react';
import * as THREE from 'three';
import { trailCurve } from './curve';
import { gridHeight } from './terrainHeight';

const LIFT = 0.12; // just above the terrain triangles it drapes over
const TEX_REPEAT_LEN = 7; // world units of path per texture repeat

/** Procedurally-drawn dirt: mottled earth, pebbles, worn foot-lines. */
function makeDirtTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#a08260';
    ctx.fillRect(0, 0, 256, 256);

    // multi-scale mottling
    const earthTones = ['#8a6f50', '#b3946e', '#96795a', '#a98c66', '#7e654a'];
    for (let i = 0; i < 380; i++) {
      ctx.fillStyle = earthTones[Math.floor(Math.random() * earthTones.length)];
      ctx.globalAlpha = 0.10 + Math.random() * 0.14;
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 256,
        Math.random() * 256,
        2 + Math.random() * 13,
        1.5 + Math.random() * 9,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // twin worn foot-lines running along the path (v axis)
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = '#6f5940';
    for (const u of [0.34, 0.66]) {
      for (let y = 0; y < 256; y += 4) {
        const wobble = Math.sin(y * 0.05 + u * 20) * 6;
        ctx.fillRect(u * 256 - 11 + wobble, y, 22, 4);
      }
    }

    // pebbles
    ctx.globalAlpha = 1;
    for (let i = 0; i < 90; i++) {
      const shade = 100 + Math.floor(Math.random() * 90);
      ctx.fillStyle = `rgb(${shade},${shade - 8},${shade - 18})`;
      ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.arc(
        Math.random() * 256,
        Math.random() * 256,
        0.7 + Math.random() * 1.8,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

/**
 * A worn dirt footpath draped flush onto the rendered terrain — textured,
 * width-wobbling, with feathered edges that blend into the meadow instead
 * of ending in a hard brown stripe.
 */
export default function Trail() {
  const texture = useMemo(makeDirtTexture, []);

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
        map={texture}
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
