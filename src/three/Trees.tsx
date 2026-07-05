import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { gridHeight, TERRAIN_SIZE, LAKE } from './terrainHeight';
import { trailCurve, CAMP, CAMP_CLEARANCE } from './curve';

const TREELINE = 20; // pines only grow below this altitude
const TRAIL_CLEARANCE = 7;

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
 * Pine silhouette painted with individual needle strokes — the texture
 * that goes on each tree's crossed cards (the standard open-world-game
 * foliage technique).
 */
function makePineTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 512;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  if (ctx) {
    const rand = mulberry32(90210);
    ctx.clearRect(0, 0, W, H);
    // central leader trunk
    ctx.strokeStyle = '#4a3423';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(W / 2, 10);
    ctx.lineTo(W / 2, H);
    ctx.stroke();

    const greens = ['#22381c', '#2c4a24', '#35592c', '#3f6935', '#2a4522'];
    // branch whorls from tip to base, widening downward
    for (let y = 18; y < H - 8; y += 9 + rand() * 7) {
      const t = y / H;
      const half = 8 + Math.pow(t, 0.85) * (W / 2 - 14);
      const branches = 10 + Math.floor(t * 26);
      for (let b = 0; b < branches; b++) {
        const dir = rand() < 0.5 ? -1 : 1;
        const len = (0.35 + rand() * 0.65) * half;
        const x0 = W / 2 + dir * rand() * 6;
        const droop = 4 + rand() * 10 + t * 8;
        ctx.strokeStyle = greens[Math.floor(rand() * greens.length)];
        ctx.globalAlpha = 0.75 + rand() * 0.25;
        ctx.lineWidth = 1.6 + rand() * 2;
        ctx.beginPath();
        ctx.moveTo(x0, y + rand() * 4);
        ctx.quadraticCurveTo(
          x0 + dir * len * 0.55,
          y + droop * 0.4,
          x0 + dir * len,
          y + droop
        );
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Three crossed, alpha-tested cards showing the pine silhouette. */
function makeCardGeometry(): THREE.BufferGeometry {
  const planes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 3; i++) {
    const p = new THREE.PlaneGeometry(3.6, 5.6, 1, 1);
    p.rotateY((i / 3) * Math.PI);
    planes.push(p);
  }
  const merged = mergeGeometries(planes);
  planes.forEach((p) => p.dispose());
  return merged;
}

interface TreesProps {
  count?: number;
}

/**
 * A pine forest below the treeline: bark-textured trunks + alpha-card
 * needle canopies (2 draw calls), kept clear of trail, lake, and camp.
 */
export default function Trees({ count = 260 }: TreesProps) {
  const bark = useTexture(
    `${process.env.PUBLIC_URL}/assets/pbr/bark_brown_01_diff_1k.jpg`
  );
  useMemo(() => {
    bark.wrapS = bark.wrapT = THREE.RepeatWrapping;
    bark.repeat.set(2, 1);
    bark.colorSpace = THREE.SRGBColorSpace;
    bark.needsUpdate = true;
  }, [bark]);

  const needleTex = useMemo(makePineTexture, []);
  const cardGeometry = useMemo(makeCardGeometry, []);

  const { trunks, cards, tints, placed } = useMemo(() => {
    const rand = mulberry32(1337);
    const trailPts = trailCurve.getSpacedPoints(160);

    const trunkMatrices: THREE.Matrix4[] = [];
    const cardMatrices: THREE.Matrix4[] = [];
    const colors: number[] = [];
    const tmp = new THREE.Color();
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);

    // grove-clustered distribution: trees gather in copses with natural
    // clearings between them instead of a uniform sprinkle
    const groves: Array<[number, number]> = [];
    let groveTries = 0;
    while (groves.length < 34 && groveTries < 400) {
      groveTries++;
      const gx = (rand() - 0.5) * TERRAIN_SIZE * 0.88;
      const gz = (rand() - 0.5) * TERRAIN_SIZE * 0.88;
      const gh = gridHeight(gx, gz);
      if (gh > TREELINE - 2 || gh < 1.5) continue;
      groves.push([gx, gz]);
    }

    let attempts = 0;
    while (trunkMatrices.length < count && attempts < count * 14) {
      attempts++;
      let x: number;
      let z: number;
      if (rand() < 0.78 && groves.length > 0) {
        const g = groves[Math.floor(rand() * groves.length)];
        const a = rand() * Math.PI * 2;
        const r = Math.pow(rand(), 0.6) * 15;
        x = g[0] + Math.cos(a) * r;
        z = g[1] + Math.sin(a) * r;
      } else {
        x = (rand() - 0.5) * TERRAIN_SIZE * 0.92;
        z = (rand() - 0.5) * TERRAIN_SIZE * 0.92;
      }
      const h = gridHeight(x, z);
      if (h > TREELINE || h < 1.5) continue;
      const ldx = x - LAKE.x;
      const ldz = z - LAKE.z;
      if (ldx * ldx + ldz * ldz < (LAKE.radius + 10) ** 2) continue;
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

      const s = 0.8 + rand() * 1.4;
      const yaw = rand() * Math.PI * 2;
      q.setFromAxisAngle(up, yaw);

      m.compose(
        new THREE.Vector3(x, h + 1.1 * s, z),
        q,
        new THREE.Vector3(s, s, s)
      );
      trunkMatrices.push(m.clone());

      m.compose(
        new THREE.Vector3(x, h + 3.4 * s, z),
        q,
        new THREE.Vector3(s, s, s)
      );
      cardMatrices.push(m.clone());

      // per-tree needle tint variation
      tmp.setHSL(0.33 + rand() * 0.03, 0.35, 0.42 + rand() * 0.2);
      colors.push(tmp.r, tmp.g, tmp.b);
    }

    return {
      trunks: trunkMatrices,
      cards: cardMatrices,
      tints: new Float32Array(colors),
      placed: trunkMatrices.length,
    };
  }, [count]);

  const trunkRef = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    trunks.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  };

  const cardRef = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    cards.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceColor = new THREE.InstancedBufferAttribute(tints, 3);
    mesh.instanceMatrix.needsUpdate = true;
  };

  // wind: per-instance sway, strongest at the crown
  const windShader = useRef<any>(null);
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
          float tip = smoothstep(-2.8, 2.8, position.y);
          float sway = tip * tip * 0.14;
          transformed.x += sin(uTime * 1.4 + instX * 0.6 + instZ * 0.4) * sway;
          transformed.z += cos(uTime * 1.1 + instX * 0.4 + instZ * 0.7) * sway * 0.7;
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
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, placed]}
      >
        <cylinderGeometry args={[0.14, 0.24, 2.6, 7]} />
        <meshStandardMaterial map={bark} roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={cardRef}
        args={[undefined, undefined, placed]}
        geometry={cardGeometry}
      >
        <meshStandardMaterial
          map={needleTex}
          alphaTest={0.45}
          side={THREE.DoubleSide}
          roughness={1}
          onBeforeCompile={onBeforeCompile}
        />
      </instancedMesh>
    </group>
  );
}
