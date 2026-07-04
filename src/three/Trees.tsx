import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
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

interface TreesProps {
  count?: number;
}

/**
 * A low-poly pine forest below the treeline — instanced trunks + canopies
 * (2 draw calls total), kept clear of the trail.
 */
export default function Trees({ count = 260 }: TreesProps) {
  const { trunks, canopies, canopyColors, placed } = useMemo(() => {
    const rand = mulberry32(1337);
    const trailPts = trailCurve.getSpacedPoints(160);

    const trunkMatrices: THREE.Matrix4[] = [];
    const canopyMatrices: THREE.Matrix4[] = [];
    const colors: number[] = [];
    const c1 = new THREE.Color('#2f5d2a');
    const c2 = new THREE.Color('#41754f');
    const tmp = new THREE.Color();
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);

    let attempts = 0;
    while (trunkMatrices.length < count && attempts < count * 14) {
      attempts++;
      const x = (rand() - 0.5) * TERRAIN_SIZE * 0.92;
      const z = (rand() - 0.5) * TERRAIN_SIZE * 0.92;
      const h = gridHeight(x, z);
      if (h > TREELINE || h < 1.5) continue;
      // stay out of the lake
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
        new THREE.Vector3(x, h + 0.9 * s, z),
        q,
        new THREE.Vector3(s, s, s)
      );
      trunkMatrices.push(m.clone());

      m.compose(
        new THREE.Vector3(x, h + 3.1 * s, z),
        q,
        new THREE.Vector3(s, s, s)
      );
      canopyMatrices.push(m.clone());

      tmp.copy(c1).lerp(c2, rand());
      colors.push(tmp.r, tmp.g, tmp.b);
    }

    return {
      trunks: trunkMatrices,
      canopies: canopyMatrices,
      canopyColors: new Float32Array(colors),
      placed: trunkMatrices.length,
    };
  }, [count]);

  const trunkRef = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    trunks.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  };

  const canopyRef = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    canopies.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceColor = new THREE.InstancedBufferAttribute(canopyColors, 3);
    mesh.instanceMatrix.needsUpdate = true;
  };

  // wind: inject a per-instance sway into the canopy vertex shader,
  // strongest at the tip, phase-offset by instance position
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
          float tip = smoothstep(-2.3, 2.3, position.y);
          float sway = tip * tip * 0.16;
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
        <cylinderGeometry args={[0.14, 0.22, 1.8, 5]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh
        ref={canopyRef}
        args={[undefined, undefined, placed]}
      >
        <coneGeometry args={[1.4, 4.6, 6]} />
        <meshStandardMaterial
          roughness={0.9}
          flatShading
          onBeforeCompile={onBeforeCompile}
        />
      </instancedMesh>
    </group>
  );
}
