import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { gridHeight, LAKE } from './terrainHeight';
import { trailCurve, CAMP } from './curve';
import { projects } from '../data/projects';

/** Painted title strip under each billboard image. */
function makeTitleTexture(title: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#3d2f1e';
    ctx.fillRect(0, 0, 512, 96);
    ctx.strokeStyle = '#241a0e';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 506, 90);
    ctx.fillStyle = '#f2e7c9';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title.toUpperCase(), 256, 52, 480);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// desired ring positions [angle, radius] around the valley — nudged
// outward at build time until they land on drivable meadow
const SPOTS: Array<[number, number]> = [
  [0.45, 170],
  [1.35, 200],
  [2.2, 185],
  [3.1, 210],
  [4.1, 190],
  [5.2, 175],
];
const RING_CENTER = { x: 0, z: 55 };

function findSpot(
  angle: number,
  radius: number,
  trailPts: THREE.Vector3[]
): { x: number; z: number } {
  let r = radius;
  for (let i = 0; i < 12; i++) {
    const x = RING_CENTER.x + Math.cos(angle) * r;
    const z = RING_CENTER.z + Math.sin(angle) * r;
    const h = gridHeight(x, z);
    const lakeD2 = (x - LAKE.x) ** 2 + (z - LAKE.z) ** 2;
    const campD2 = (x - CAMP.x) ** 2 + (z - CAMP.z) ** 2;
    let nearTrail = false;
    for (const tp of trailPts) {
      if ((tp.x - x) ** 2 + (tp.z - z) ** 2 < 100) {
        nearTrail = true;
        break;
      }
    }
    if (
      h > 1.5 &&
      h < 18 &&
      lakeD2 > (LAKE.radius + 12) ** 2 &&
      campD2 > 144 &&
      !nearTrail
    ) {
      return { x, z };
    }
    r += 14;
  }
  return {
    x: RING_CENTER.x + Math.cos(angle) * radius,
    z: RING_CENTER.z + Math.sin(angle) * radius,
  };
}

function Billboard({
  image,
  title,
  url,
  position,
  yaw,
}: {
  image: string;
  title: string;
  url: string;
  position: THREE.Vector3;
  yaw: number;
}) {
  const inner = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const screenshot = useTexture(image);
  useMemo(() => {
    screenshot.colorSpace = THREE.SRGBColorSpace;
    screenshot.anisotropy = 8;
  }, [screenshot]);
  const titleTex = useMemo(() => makeTitleTexture(title), [title]);

  useFrame((_, delta) => {
    if (!inner.current) return;
    const s = THREE.MathUtils.damp(
      inner.current.scale.x,
      hovered ? 1.06 : 1,
      12,
      delta
    );
    inner.current.scale.setScalar(s);
  });

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* static hitbox — pointer events stay stable while the board pops */}
      <mesh
        position={[0, 4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[7, 6.5, 1.6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={inner}>
        {/* posts, sunk below grade for slopes */}
        {[-2.4, 2.4].map((x) => (
          <mesh key={x} position={[x, 1.9, 0]}>
            <cylinderGeometry args={[0.13, 0.17, 5.6, 7]} />
            <meshStandardMaterial color="#5d4429" roughness={0.9} />
          </mesh>
        ))}
        {/* cream frame */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[6.5, 3.9, 0.16]} />
          <meshStandardMaterial color="#e8dfc8" roughness={0.7} />
        </mesh>
        {/* the project screenshot */}
        <mesh position={[0, 5.22, 0.1]}>
          <planeGeometry args={[6.1, 3.1]} />
          <meshStandardMaterial map={screenshot} roughness={0.55} />
        </mesh>
        {/* title strip */}
        <mesh position={[0, 3.36, 0.1]}>
          <planeGeometry args={[6.1, 0.62]} />
          <meshStandardMaterial map={titleTex} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * The portfolio's projects as roadside billboards ringing the valley —
 * drive-to destinations that open the real project when clicked.
 */
export default function Billboards() {
  const placements = useMemo(() => {
    const trailPts = trailCurve.getSpacedPoints(200);
    return projects.slice(0, SPOTS.length).map((project, i) => {
      const [angle, radius] = SPOTS[i];
      const { x, z } = findSpot(angle, radius, trailPts);
      const pos = new THREE.Vector3(x, gridHeight(x, z) - 0.25, z);
      // face the ring center so approaches read the board
      const yaw = Math.atan2(RING_CENTER.x - x, RING_CENTER.z - z);
      return { project, pos, yaw };
    });
  }, []);

  return (
    <group>
      {placements.map(({ project, pos, yaw }) => (
        <Billboard
          key={project.id}
          image={project.image}
          title={project.title}
          url={project.liveUrl || project.githubUrl}
          position={pos}
          yaw={yaw}
        />
      ))}
    </group>
  );
}
