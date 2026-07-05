import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { gridHeight, LAKE } from './terrainHeight';
import { trailCurve, CAMP } from './curve';

const MEADOW_TOP = 19; // grass only grows below this altitude

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

/** A clump of grass blades painted with alpha — one card texture. */
function makeBladeTexture(): THREE.CanvasTexture {
  const W = 128;
  const H = 128;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  if (ctx) {
    const rand = mulberry32(808);
    ctx.clearRect(0, 0, W, H);
    const tones = ['#6f7f40', '#7d8d4a', '#8a9a52', '#65753c', '#93a35e'];
    for (let i = 0; i < 17; i++) {
      const x0 = 14 + rand() * (W - 28);
      const lean = (rand() - 0.5) * 46;
      const height = 55 + rand() * 66;
      ctx.strokeStyle = tones[Math.floor(rand() * tones.length)];
      ctx.globalAlpha = 0.85 + rand() * 0.15;
      ctx.lineWidth = 2.2 + rand() * 2.4;
      ctx.beginPath();
      ctx.moveTo(x0, H);
      ctx.quadraticCurveTo(
        x0 + lean * 0.3,
        H - height * 0.6,
        x0 + lean,
        H - height
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Two crossed quads, base at y=0. */
function makeClumpGeometry(): THREE.BufferGeometry {
  const planes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 2; i++) {
    const p = new THREE.PlaneGeometry(0.6, 0.52, 1, 1);
    p.translate(0, 0.26, 0);
    p.rotateY((i / 2) * Math.PI);
    planes.push(p);
  }
  const merged = mergeGeometries(planes);
  planes.forEach((p) => p.dispose());
  return merged;
}

/**
 * Wind-blown grass clumps carpeting the trail corridor — where the
 * camera actually spends the journey. One instanced draw call.
 */
export default function Grass({ count = 7000 }: { count?: number }) {
  const texture = useMemo(makeBladeTexture, []);
  const geometry = useMemo(makeClumpGeometry, []);
  const windShader = useRef<any>(null);

  const { matrices, tints, placed } = useMemo(() => {
    const rand = mulberry32(31415);
    const pts = trailCurve.getSpacedPoints(320);
    const ms: THREE.Matrix4[] = [];
    const colors: number[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const tmp = new THREE.Color();

    // a clump may be placed relative to one trail segment yet land on
    // ANOTHER crossing switchback — always check the whole path
    const clearOfTrail = (x: number, z: number) => {
      for (const tp of pts) {
        const dx = tp.x - x;
        const dz = tp.z - z;
        if (dx * dx + dz * dz < 1.8 * 1.8) return false;
      }
      return true;
    };

    let attempts = 0;
    while (ms.length < count && attempts < count * 6) {
      attempts++;
      let x: number;
      let z: number;
      if (ms.length < count * 0.7) {
        // corridor pass: dense beside the path, thinning outward
        const p = pts[Math.floor(rand() * pts.length)];
        const angle = rand() * Math.PI * 2;
        const lateral = 1.8 + Math.pow(rand(), 1.6) * 16;
        x = p.x + Math.cos(angle) * lateral;
        z = p.z + Math.sin(angle) * lateral;
      } else {
        // world pass: sparser life across the whole valley
        x = (rand() - 0.5) * 780;
        z = (rand() - 0.5) * 780;
      }
      const h = gridHeight(x, z);
      if (h > MEADOW_TOP || h < 1) continue;
      if (!clearOfTrail(x, z)) continue;
      const ldx = x - LAKE.x;
      const ldz = z - LAKE.z;
      if (ldx * ldx + ldz * ldz < (LAKE.radius + 3) ** 2) continue;
      const cdx = x - CAMP.x;
      const cdz = z - CAMP.z;
      if (cdx * cdx + cdz * cdz < 5.5 ** 2) continue; // trampled at camp

      const s = 0.75 + rand() * 0.9;
      q.setFromAxisAngle(up, rand() * Math.PI * 2);
      m.compose(
        new THREE.Vector3(x, h, z),
        q,
        new THREE.Vector3(s, s * (0.8 + rand() * 0.5), s)
      );
      ms.push(m.clone());
      // olive-green range matching the meadow texture
      tmp.setHSL(0.19 + rand() * 0.05, 0.32 + rand() * 0.12, 0.34 + rand() * 0.14);
      colors.push(tmp.r, tmp.g, tmp.b);
    }
    return {
      matrices: ms,
      tints: new Float32Array(colors),
      placed: ms.length,
    };
  }, [count]);

  const ref = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceColor = new THREE.InstancedBufferAttribute(tints, 3);
    mesh.instanceMatrix.needsUpdate = true;
  };

  const onBeforeCompile = (shader: any) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader =
      'uniform float uTime;\n' +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          float instX = instanceMatrix[3][0];
          float instZ = instanceMatrix[3][2];
          float tip = smoothstep(0.0, 0.5, position.y);
          float gust = sin(uTime * 1.7 + instX * 0.35 + instZ * 0.28)
                     + 0.5 * sin(uTime * 3.1 + instX * 0.9);
          transformed.x += gust * tip * 0.055;
          transformed.z += cos(uTime * 1.3 + instZ * 0.4) * tip * 0.035;
        }`
      );
    windShader.current = shader;
  };

  useFrame(({ clock }) => {
    if (windShader.current) {
      windShader.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, placed]}
      geometry={geometry}
    >
      <meshStandardMaterial
        map={texture}
        alphaTest={0.35}
        side={THREE.DoubleSide}
        roughness={1}
        onBeforeCompile={onBeforeCompile}
      />
    </instancedMesh>
  );
}
