import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { terrainHeight, TERRAIN_SIZE, TERRAIN_SEGMENTS } from './terrainHeight';
import { ScenePalette } from './palette';

// altitude bands (jittered per-vertex for natural transitions)
const GRASS_TOP = 16;
const ROCK_BLEND = 12;
const SNOW_LINE = 38;
const SNOW_BLEND = 9;

const ASSET = (f: string) => `${process.env.PUBLIC_URL}/assets/pbr/${f}`;

function hash2(x: number, z: number): number {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

interface TerrainProps {
  palette: ScenePalette;
  segments?: number;
}

/**
 * Geometry with two custom attributes:
 * - aSplat: grass/rock/snow blend weights (from altitude + slope + jitter)
 * - color:  baked ambient-occlusion tint that multiplies the textures
 */
function buildGeometry(segments: number) {
  const geometry = new THREE.PlaneGeometry(
    TERRAIN_SIZE,
    TERRAIN_SIZE,
    segments,
    segments
  );
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    positions.setY(i, terrainHeight(positions.getX(i), positions.getZ(i)));
  }
  geometry.computeVertexNormals();
  const normals = geometry.attributes.normal;

  const splat = new Float32Array(positions.count * 3);
  const colors = new Float32Array(positions.count * 3);

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const h = positions.getY(i);
    const ny = normals.getY(i); // 1 = flat, 0 = cliff
    const steep = 1 - THREE.MathUtils.clamp(ny, 0, 1);
    const jitter = (hash2(x * 0.31, z * 0.31) - 0.5) * 6;

    // rock takes over with altitude AND on steep faces
    const rockAmt = THREE.MathUtils.clamp(
      (h + jitter - GRASS_TOP) / ROCK_BLEND + steep * 2.2,
      0,
      1
    );
    // snow near the summit, thinning on the steepest faces
    const snowAmt =
      THREE.MathUtils.clamp((h + jitter - SNOW_LINE) / SNOW_BLEND, 0, 1) *
      THREE.MathUtils.clamp(1 - steep * 1.1, 0.15, 1);

    const s = snowAmt;
    const r = rockAmt * (1 - s);
    const g = Math.max(0, 1 - r - s);
    splat[i * 3] = g;
    splat[i * 3 + 1] = r;
    splat[i * 3 + 2] = s;

    // baked AO + subtle patchiness so tiling never reads uniform
    const patch = 0.92 + 0.16 * hash2(Math.floor(x / 11), Math.floor(z / 11));
    const ao = (0.72 + 0.28 * ny) * patch;
    colors[i * 3] = ao;
    colors[i * 3 + 1] = ao;
    colors[i * 3 + 2] = ao;
  }

  geometry.setAttribute('aSplat', new THREE.BufferAttribute(splat, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export default function Terrain({ segments = TERRAIN_SEGMENTS }: TerrainProps) {
  const textures = useTexture({
    grass: ASSET('aerial_grass_rock_diff_1k.jpg'),
    grassN: ASSET('aerial_grass_rock_nor_gl_1k.jpg'),
    rock: ASSET('rock_face_diff_1k.jpg'),
    rockN: ASSET('rock_face_nor_gl_1k.jpg'),
    snow: ASSET('snow_02_diff_1k.jpg'),
    snowN: ASSET('snow_02_nor_gl_1k.jpg'),
  });

  useMemo(() => {
    Object.entries(textures).forEach(([key, tex]) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 8;
      // hardware sRGB decode for diffuse; normals stay linear
      tex.colorSpace = key.endsWith('N')
        ? THREE.NoColorSpace
        : THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    });
  }, [textures]);

  const geometry = useMemo(() => buildGeometry(segments), [segments]);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true, // carries the baked AO tint
      roughness: 1,
      metalness: 0,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.tGrass = { value: textures.grass };
      shader.uniforms.tGrassN = { value: textures.grassN };
      shader.uniforms.tRock = { value: textures.rock };
      shader.uniforms.tRockN = { value: textures.rockN };
      shader.uniforms.tSnow = { value: textures.snow };
      shader.uniforms.tSnowN = { value: textures.snowN };

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          attribute vec3 aSplat;
          varying vec3 vSplat;
          varying vec3 vWorldPos;`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vSplat = aSplat;
          vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform sampler2D tGrass;
          uniform sampler2D tGrassN;
          uniform sampler2D tRock;
          uniform sampler2D tRockN;
          uniform sampler2D tSnow;
          uniform sampler2D tSnowN;
          varying vec3 vSplat;
          varying vec3 vWorldPos;

          mat3 splatTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
            vec3 q0 = dFdx( eye_pos.xyz );
            vec3 q1 = dFdy( eye_pos.xyz );
            vec2 st0 = dFdx( uv.st );
            vec2 st1 = dFdy( uv.st );
            vec3 N = surf_norm;
            vec3 q1perp = cross( q1, N );
            vec3 q0perp = cross( N, q0 );
            vec3 T = q1perp * st0.x + q0perp * st1.x;
            vec3 B = q1perp * st0.y + q0perp * st1.y;
            float det = max( dot( T, T ), dot( B, B ) );
            float s = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
            return mat3( T * s, B * s, N );
          }`
        )
        .replace(
          '#include <map_fragment>',
          `#include <map_fragment>
          {
            vec2 suvG = vWorldPos.xz * 0.11;
            vec2 suvR = vWorldPos.xz * 0.055;
            vec2 suvS = vWorldPos.xz * 0.08;
            vec3 gTex = texture2D( tGrass, suvG ).rgb;
            vec3 rTex = texture2D( tRock, suvR ).rgb;
            vec3 sTex = texture2D( tSnow, suvS ).rgb;
            // macro-scale modulation breaks up visible texture tiling
            float macro = dot( texture2D( tGrass, vWorldPos.xz * 0.011 ).rgb, vec3( 0.333 ) );
            gTex *= 0.55 + 0.95 * macro;
            rTex *= 0.75 + 0.5 * macro;
            vec3 blended = gTex * vSplat.x + rTex * vSplat.y + sTex * vSplat.z;
            diffuseColor.rgb *= blended;
          }`
        )
        .replace(
          '#include <normal_fragment_begin>',
          `#include <normal_fragment_begin>
          {
            vec2 suv = vWorldPos.xz * 0.08;
            vec3 nG = texture2D( tGrassN, vWorldPos.xz * 0.11 ).xyz;
            vec3 nR = texture2D( tRockN, vWorldPos.xz * 0.055 ).xyz;
            vec3 nS = texture2D( tSnowN, vWorldPos.xz * 0.08 ).xyz;
            vec3 mapN = ( nG * vSplat.x + nR * vSplat.y + nS * vSplat.z ) * 2.0 - 1.0;
            mapN.xy *= 0.85;
            mat3 tbnSplat = splatTangentFrame( -vViewPosition, normal, suv );
            normal = normalize( tbnSplat * normalize( mapN ) );
          }`
        );
    };
    mat.customProgramCacheKey = () => 'terrain-splat-v2';
    return mat;
  }, [textures]);

  return <mesh geometry={geometry} material={material} receiveShadow />;
}
