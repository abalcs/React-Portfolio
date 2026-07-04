import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const SUN_POSITION: [number, number, number] = [260, 380, 200];

const SKY_RADIUS = 1400;
// Bluebird day — exact colors, no atmospheric model to wash them out
const ZENITH = '#1c64cf';
const HORIZON = '#b7d7f2';

const skyVertex = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform vec3 uSunDir;
  varying vec3 vWorldPosition;
  void main() {
    vec3 dir = normalize(vWorldPosition);
    float h = max(dir.y, 0.0);
    // deep blue overhead, pale blue (never white) at the horizon
    vec3 col = mix(uBottom, uTop, pow(h, 0.62));
    // warm halo hugging the sun
    float sunAmt = pow(max(dot(dir, uSunDir), 0.0), 180.0);
    col += vec3(1.0, 0.95, 0.82) * sunAmt * 0.9;
    float wideGlow = pow(max(dot(dir, uSunDir), 0.0), 7.0);
    col += vec3(0.75, 0.78, 0.72) * wideGlow * 0.10;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function SkyDome() {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(ZENITH) },
      uBottom: { value: new THREE.Color(HORIZON) },
      uSunDir: { value: new THREE.Vector3(...SUN_POSITION).normalize() },
    }),
    []
  );

  return (
    <mesh>
      <sphereGeometry args={[SKY_RADIUS, 32, 24]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
        uniforms={uniforms}
        toneMapped={false}
      />
    </mesh>
  );
}

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

interface CloudSpec {
  x: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  puffs: Array<[number, number, number, number]>;
}

function Clouds({ count = 9 }: { count?: number }) {
  const group = useRef<THREE.Group>(null);

  const clouds = useMemo<CloudSpec[]>(() => {
    const rand = mulberry32(777);
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * 800,
      y: 135 + rand() * 75,
      z: (rand() - 0.5) * 800,
      scale: 10 + rand() * 10,
      speed: 1.2 + rand() * 1.8,
      // many small overlapping puffs in a flat wide layout — reads as
      // cumulus rather than a faceted boulder
      puffs: Array.from({ length: 7 + Math.floor(rand() * 4) }, () => [
        (rand() - 0.5) * 3.2,
        (rand() - 0.5) * 0.35,
        (rand() - 0.5) * 1.4,
        0.38 + rand() * 0.42,
      ]),
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.children.forEach((cloud, i) => {
      cloud.position.x += clouds[i].speed * delta;
      if (cloud.position.x > 460) cloud.position.x = -460;
    });
  });

  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.scale}>
          {c.puffs.map((p, j) => (
            <mesh
              key={j}
              castShadow
              position={[p[0], p[1], p[2]]}
              scale={[1.8, 0.55, 1.1]}
            >
              <icosahedronGeometry args={[p[3], 1]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.55}
                roughness={1}
                transparent
                opacity={0.96}
                fog={false}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

interface DaySkyProps {
  cloudCount?: number;
}

/**
 * Bluebird-day sky: exact-color gradient dome with a warm sun halo, and
 * drifting low-poly clouds whose shadows sweep the terrain.
 */
export default function DaySky({ cloudCount }: DaySkyProps) {
  return (
    <>
      <SkyDome />
      {/* the sun disc */}
      <mesh position={SUN_POSITION}>
        <sphereGeometry args={[26, 16, 12]} />
        <meshBasicMaterial color="#fffdf2" toneMapped={false} fog={false} />
      </mesh>
      <Clouds count={cloudCount} />
    </>
  );
}
