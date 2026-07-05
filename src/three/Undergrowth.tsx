import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { gridHeight, TERRAIN_SIZE, LAKE } from './terrainHeight';
import { trailCurve, CAMP, CAMP_CLEARANCE } from './curve';

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

/** Mixed wildflower clump — pre-colored heads on green stems. */
function makeFlowerTexture(): THREE.CanvasTexture {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d');
  if (ctx) {
    const rand = mulberry32(6060);
    ctx.clearRect(0, 0, S, S);
    const heads = ['#e8d44d', '#b085d6', '#f2f2f0', '#e8944d', '#d66a8f'];
    for (let i = 0; i < 9; i++) {
      const x0 = 18 + rand() * (S - 36);
      const lean = (rand() - 0.5) * 26;
      const h = 46 + rand() * 52;
      // stem
      ctx.strokeStyle = '#5d7038';
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, S);
      ctx.quadraticCurveTo(x0 + lean * 0.4, S - h * 0.6, x0 + lean, S - h);
      ctx.stroke();
      // head: petal cluster
      const hx = x0 + lean;
      const hy = S - h;
      const color = heads[Math.floor(rand() * heads.length)];
      ctx.fillStyle = color;
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2 + rand();
        ctx.beginPath();
        ctx.ellipse(
          hx + Math.cos(a) * 2.6,
          hy + Math.sin(a) * 2.6,
          2.6,
          1.7,
          a,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.fillStyle = '#8a6d2f';
      ctx.beginPath();
      ctx.arc(hx, hy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Rounded leafy shrub silhouette. */
function makeBushTexture(): THREE.CanvasTexture {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d');
  if (ctx) {
    const rand = mulberry32(7171);
    ctx.clearRect(0, 0, S, S);
    const greens = ['#2e4a26', '#3a5c30', '#48703c', '#557f46'];
    // clustered leafy blobs forming a mound
    for (let i = 0; i < 240; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.55);
      const x = S / 2 + Math.cos(a) * r * 52;
      const y = S - 12 - Math.abs(Math.sin(a)) * r * 78 - rand() * 10;
      ctx.fillStyle = greens[Math.floor(rand() * greens.length)];
      ctx.globalAlpha = 0.75 + rand() * 0.25;
      ctx.beginPath();
      ctx.ellipse(x, y, 3.4 + rand() * 3, 2.4 + rand() * 2.4, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCrossCards(w: number, h: number): THREE.BufferGeometry {
  const planes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 2; i++) {
    const p = new THREE.PlaneGeometry(w, h, 1, 1);
    p.translate(0, h / 2, 0);
    p.rotateY((i / 2) * Math.PI);
    planes.push(p);
  }
  const merged = mergeGeometries(planes);
  planes.forEach((p) => p.dispose());
  return merged;
}

interface UndergrowthProps {
  flowerCount?: number;
  bushCount?: number;
  logCount?: number;
}

/**
 * The valley's supporting cast: wildflower drifts, leafy shrubs, and
 * fallen logs — three instanced draw calls that fill the space between
 * the trail and the horizon with believable life.
 */
export default function Undergrowth({
  flowerCount = 2400,
  bushCount = 220,
  logCount = 30,
}: UndergrowthProps) {
  const bark = useTexture(
    `${process.env.PUBLIC_URL}/assets/pbr/bark_brown_01_diff_1k.jpg`
  );
  useMemo(() => {
    bark.wrapS = bark.wrapT = THREE.RepeatWrapping;
    bark.colorSpace = THREE.SRGBColorSpace;
    bark.needsUpdate = true;
  }, [bark]);

  const flowerTex = useMemo(makeFlowerTexture, []);
  const bushTex = useMemo(makeBushTexture, []);
  const flowerGeo = useMemo(() => makeCrossCards(0.55, 0.5), []);
  const bushGeo = useMemo(() => makeCrossCards(1.7, 1.15), []);

  const placements = useMemo(() => {
    const rand = mulberry32(20260);
    const pts = trailCurve.getSpacedPoints(280);

    const valid = (x: number, z: number, h: number, trailClear: number) => {
      if (h < 1 || h > 19) return false;
      const ldx = x - LAKE.x;
      const ldz = z - LAKE.z;
      if (ldx * ldx + ldz * ldz < (LAKE.radius + 4) ** 2) return false;
      const cdx = x - CAMP.x;
      const cdz = z - CAMP.z;
      if (cdx * cdx + cdz * cdz < CAMP_CLEARANCE ** 2) return false;
      for (const tp of pts) {
        const dx = tp.x - x;
        const dz = tp.z - z;
        if (dx * dx + dz * dz < trailClear * trailClear) return false;
      }
      return true;
    };

    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const up = new THREE.Vector3(0, 1, 0);

    // flowers: drifts around ~40 patch centers
    const flowers: THREE.Matrix4[] = [];
    const patches: Array<[number, number]> = [];
    let tries = 0;
    while (patches.length < 40 && tries < 500) {
      tries++;
      const x = (rand() - 0.5) * 700;
      const z = (rand() - 0.5) * 700;
      if (valid(x, z, gridHeight(x, z), 2.2)) patches.push([x, z]);
    }
    tries = 0;
    while (flowers.length < flowerCount && tries < flowerCount * 5) {
      tries++;
      const p = patches[Math.floor(rand() * patches.length)];
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.7) * 9;
      const x = p[0] + Math.cos(a) * r;
      const z = p[1] + Math.sin(a) * r;
      const h = gridHeight(x, z);
      if (!valid(x, z, h, 1.9)) continue;
      const s = 0.7 + rand() * 0.8;
      q.setFromAxisAngle(up, rand() * Math.PI * 2);
      m.compose(new THREE.Vector3(x, h, z), q, new THREE.Vector3(s, s, s));
      flowers.push(m.clone());
    }

    // bushes: forest edges and open meadow
    const bushes: THREE.Matrix4[] = [];
    tries = 0;
    while (bushes.length < bushCount && tries < bushCount * 10) {
      tries++;
      const x = (rand() - 0.5) * TERRAIN_SIZE * 0.9;
      const z = (rand() - 0.5) * TERRAIN_SIZE * 0.9;
      const h = gridHeight(x, z);
      if (!valid(x, z, h, 3)) continue;
      const s = 0.7 + rand() * 1.1;
      q.setFromAxisAngle(up, rand() * Math.PI * 2);
      m.compose(new THREE.Vector3(x, h, z), q, new THREE.Vector3(s, s * (0.8 + rand() * 0.4), s));
      bushes.push(m.clone());
    }

    // fallen logs: scattered in the forest belt
    const logs: THREE.Matrix4[] = [];
    tries = 0;
    while (logs.length < logCount && tries < logCount * 20) {
      tries++;
      const x = (rand() - 0.5) * TERRAIN_SIZE * 0.85;
      const z = (rand() - 0.5) * TERRAIN_SIZE * 0.85;
      const h = gridHeight(x, z);
      if (!valid(x, z, h, 4)) continue;
      e.set(0, rand() * Math.PI * 2, Math.PI / 2 + (rand() - 0.5) * 0.12);
      q.setFromEuler(e);
      const s = 0.8 + rand() * 0.7;
      m.compose(
        new THREE.Vector3(x, h + 0.24 * s, z),
        q,
        new THREE.Vector3(s, s, s)
      );
      logs.push(m.clone());
    }

    return { flowers, bushes, logs };
  }, [flowerCount, bushCount, logCount]);

  const setMatrices =
    (list: THREE.Matrix4[]) => (mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return;
      list.forEach((mat, i) => mesh.setMatrixAt(i, mat));
      mesh.instanceMatrix.needsUpdate = true;
    };

  return (
    <group>
      <instancedMesh
        ref={setMatrices(placements.flowers)}
        args={[undefined, undefined, placements.flowers.length]}
        geometry={flowerGeo}
      >
        <meshStandardMaterial
          map={flowerTex}
          alphaTest={0.35}
          side={THREE.DoubleSide}
          roughness={1}
        />
      </instancedMesh>
      <instancedMesh
        ref={setMatrices(placements.bushes)}
        args={[undefined, undefined, placements.bushes.length]}
        geometry={bushGeo}
      >
        <meshStandardMaterial
          map={bushTex}
          alphaTest={0.4}
          side={THREE.DoubleSide}
          roughness={1}
        />
      </instancedMesh>
      <instancedMesh
        ref={setMatrices(placements.logs)}
        args={[undefined, undefined, placements.logs.length]}
      >
        <cylinderGeometry args={[0.2, 0.28, 3.2, 8]} />
        <meshStandardMaterial map={bark} roughness={1} />
      </instancedMesh>
    </group>
  );
}
