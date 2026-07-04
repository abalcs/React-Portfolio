import React, { useMemo } from 'react';
import * as THREE from 'three';
import { terrainHeight, TERRAIN_SIZE } from './terrainHeight';
import { ScenePalette } from './palette';

// altitude bands (jittered per-vertex for natural transitions)
const GRASS_TOP = 16;
const ROCK_BLEND = 12;
const SNOW_LINE = 38;
const SNOW_BLEND = 9;

function hash2(x: number, z: number): number {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

interface TerrainProps {
  palette: ScenePalette;
  segments?: number;
}

function buildGeometry(segments: number, palette: ScenePalette) {
  const geometry = new THREE.PlaneGeometry(
    TERRAIN_SIZE,
    TERRAIN_SIZE,
    segments,
    segments
  );
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);

  const grass = new THREE.Color(palette.grass);
  const grassAlt = new THREE.Color(palette.grassAlt);
  const rock = new THREE.Color(palette.rock);
  const rockDeep = new THREE.Color(palette.rockDeep);
  const snow = new THREE.Color(palette.snow);
  const tmp = new THREE.Color();
  const rockMix = new THREE.Color();

  for (let i = 0; i < positions.count; i++) {
    positions.setY(i, terrainHeight(positions.getX(i), positions.getZ(i)));
  }
  // normals first — coloring below is slope-aware
  geometry.computeVertexNormals();
  const normals = geometry.attributes.normal;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const h = positions.getY(i);
    const ny = normals.getY(i); // 1 = flat, 0 = cliff
    const steep = 1 - THREE.MathUtils.clamp(ny, 0, 1);
    const jitter = (hash2(x * 0.31, z * 0.31) - 0.5) * 6;

    // patchy meadow: two grass tones mixed by a coarse hash
    tmp.copy(grass).lerp(grassAlt, hash2(Math.floor(x / 14), Math.floor(z / 14)));

    // rock takes over with altitude AND on steep faces — grass can't
    // cling to cliffs, which is what sells the mountain as real
    rockMix
      .copy(rock)
      .lerp(rockDeep, THREE.MathUtils.clamp(1 - h / 50, 0, 1) * 0.5);
    const rockAmt = THREE.MathUtils.clamp(
      (h + jitter - GRASS_TOP) / ROCK_BLEND + steep * 2.2,
      0,
      1
    );
    tmp.lerp(rockMix, rockAmt);

    // snow near the summit — thinning on the steepest faces so the cap
    // still reads clearly white from the valley
    const snowAmt =
      THREE.MathUtils.clamp((h + jitter - SNOW_LINE) / SNOW_BLEND, 0, 1) *
      THREE.MathUtils.clamp(1 - steep * 1.1, 0.15, 1);
    tmp.lerp(snow, snowAmt);

    // baked ambient occlusion: crevices and steep faces sit in shade
    const ao = 0.72 + 0.28 * ny;
    colors[i * 3] = tmp.r * ao;
    colors[i * 3 + 1] = tmp.g * ao;
    colors[i * 3 + 2] = tmp.b * ao;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export default function Terrain({ palette, segments = 220 }: TerrainProps) {
  const geometry = useMemo(
    () => buildGeometry(segments, palette),
    [segments, palette]
  );

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        vertexColors
        flatShading
        roughness={0.96}
        metalness={0}
      />
    </mesh>
  );
}
