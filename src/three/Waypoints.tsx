import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import { FaGithub, FaEnvelope } from 'react-icons/fa';
import { besideTrail, trailCurve, WAYPOINT_T } from './curve';
import { gridHeight } from './terrainHeight';
import { makeBoulderGeometry } from './Rocks';
import { projects } from '../data/projects';
import { skills } from '../data/skills';
import { experiences } from '../data/experience';
import { ProgressRef } from './hooks/useScrollProgress';
import {
  ANIMS_BASE,
  MODELS_BASE,
  RpmFigure,
  useAssetAvailable,
} from './rpm';
import profileImg from '../components/About/images/profile.jpg';

import type { SectionId } from './journey';
export type { SectionId } from './journey';


/* ---------- preview card contents (plain HTML, shown on the sign) ---------- */

function PreviewCard({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="block w-[240px] cursor-pointer select-none rounded-lg border-2 border-[#5d4429] bg-[#f5eeda] p-3 text-left font-sans shadow-md transition-shadow duration-300 hover:shadow-xl hover:ring-2 hover:ring-accent"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-display text-sm font-bold uppercase tracking-wider text-[#4a3722]">
          {title}
        </span>
        <span className="text-[10px] font-semibold text-accent">OPEN ↗</span>
      </div>
      <div className="text-[11px] leading-snug text-[#6b5940]">{children}</div>
    </button>
  );
}

function previewFor(id: SectionId, onClick: () => void): React.ReactNode {
  switch (id) {
    case 'about':
      return (
        <PreviewCard title="About Me" onClick={onClick}>
          <div className="flex items-center gap-2">
            <img
              src={profileImg}
              alt="Alan Balcom"
              className="h-12 w-12 rounded-md object-cover"
            />
            <div>
              <div className="font-semibold text-[#4a3722]">Alan Balcom</div>
              Full-Stack Developer
              <br />
              Andover, MA
            </div>
          </div>
        </PreviewCard>
      );
    case 'skills': {
      const counts = skills.reduce<Record<string, number>>((acc, s) => {
        acc[s.category] = (acc[s.category] ?? 0) + 1;
        return acc;
      }, {});
      return (
        <PreviewCard title="Skills" onClick={onClick}>
          <div className="flex flex-wrap gap-1">
            {Object.entries(counts).map(([cat, n]) => (
              <span
                key={cat}
                className="rounded-full bg-[#e3d7ba] px-2 py-0.5 capitalize"
              >
                {cat} · {n}
              </span>
            ))}
          </div>
          <div className="mt-1">{skills.length} technologies on the belt</div>
        </PreviewCard>
      );
    }
    case 'experience':
      return (
        <PreviewCard title="Experience" onClick={onClick}>
          <div className="font-semibold text-[#4a3722]">
            {experiences[0].title}
          </div>
          {experiences[0].company} · {experiences[0].period}
          <div className="mt-1">{experiences.length} milestones on the map</div>
        </PreviewCard>
      );
    case 'projects': {
      const featured = projects.find((p) => p.featured) ?? projects[0];
      return (
        <PreviewCard title="Projects" onClick={onClick}>
          <img
            src={featured.image}
            alt={featured.title}
            className="mb-1.5 h-16 w-full rounded object-cover"
          />
          <div className="font-semibold text-[#4a3722]">{featured.title}</div>
          +{projects.length - 1} more builds
        </PreviewCard>
      );
    }
    case 'github':
      return (
        <PreviewCard title="GitHub" onClick={onClick}>
          <div className="flex items-center gap-2">
            <FaGithub size={26} className="text-[#4a3722]" />
            <div>
              Live stats — repos, stars,
              <br />
              followers &amp; top languages
            </div>
          </div>
        </PreviewCard>
      );
    case 'contact':
      return (
        <PreviewCard title="Get in Touch" onClick={onClick}>
          <div className="flex items-center gap-2">
            <FaEnvelope size={22} className="text-[#4a3722]" />
            <div>
              You made the summit!
              <br />
              Send a message from the top.
            </div>
          </div>
        </PreviewCard>
      );
  }
}

/* ---------------------------- the sign itself ---------------------------- */

const SIGN_TITLES: Record<SectionId, string> = {
  about: 'About Me',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  github: 'GitHub',
  contact: 'Get in Touch',
};

function TrailSign({
  id,
  t,
  side,
  progress,
  onSelect,
}: {
  id: SectionId;
  t: number;
  side: number;
  progress: ProgressRef;
  onSelect: (id: SectionId) => void;
}) {
  const [near, setNear] = useState(false);
  const [titleVisible, setTitleVisible] = useState(t < 0.4);
  const [hovered, setHovered] = useState(false);
  const inner = useRef<THREE.Group>(null);

  const { map: planks, normalMap: planksN } = useTexture({
    map: `${process.env.PUBLIC_URL}/assets/pbr/brown_planks_07_diff_1k.jpg`,
    normalMap: `${process.env.PUBLIC_URL}/assets/pbr/brown_planks_07_nor_gl_1k.jpg`,
  });
  useMemo(() => {
    [planks, planksN].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.needsUpdate = true;
    });
    planks.colorSpace = THREE.SRGBColorSpace;
  }, [planks, planksN]);

  const { position, yaw } = useMemo(() => {
    const p = besideTrail(t, side);
    const tangent = trailCurve.getTangentAt(Math.min(t, 0.999));
    // board faces back down-trail toward the approaching hiker
    const facing = Math.atan2(-tangent.x, -tangent.z);
    // anchor to the LOWEST ground under either post so no corner floats
    // on cross-slopes; buried post length absorbs the uphill side
    const lx = Math.cos(facing);
    const lz = -Math.sin(facing);
    const hL = gridHeight(p.x + lx * 1.15, p.z + lz * 1.15);
    const hR = gridHeight(p.x - lx * 1.15, p.z - lz * 1.15);
    p.y = Math.min(p.y, hL, hR) - 0.3;
    return { position: p, yaw: facing };
  }, [t, side]);

  const boardMat = useRef<THREE.MeshStandardMaterial>(null);
  const [occluded, setOccluded] = useState(false);
  const camPos = useRef(new THREE.Vector3());

  useFrame(({ camera }, delta) => {
    const isNear = Math.abs(progress.current - t) < 0.14;
    if (isNear !== near) setNear(isNear);
    // title chips are DOM nodes repositioned every frame — only keep the
    // ones within eyeshot mounted
    const showTitle = Math.abs(progress.current - t) < 0.22;
    if (showTitle !== titleVisible) setTitleVisible(showTitle);

    // DOM labels don't depth-test — hide them when a ridge blocks the
    // sightline (cheap: sample terrain height along the camera→sign line)
    if (showTitle || isNear) {
      camera.getWorldPosition(camPos.current);
      const bx = position.x;
      const by = position.y + 2.6;
      const bz = position.z;
      let blocked = false;
      for (let i = 1; i <= 8; i++) {
        const f = (i / 9) * 0.92 + 0.04;
        const sx = camPos.current.x + (bx - camPos.current.x) * f;
        const sy = camPos.current.y + (by - camPos.current.y) * f;
        const sz = camPos.current.z + (bz - camPos.current.z) * f;
        if (gridHeight(sx, sz) > sy + 0.4) {
          blocked = true;
          break;
        }
      }
      if (blocked !== occluded) setOccluded(blocked);
    }
    if (inner.current) {
      // prominent pop: springy scale-up + lift toward the viewer
      const s = THREE.MathUtils.damp(
        inner.current.scale.x,
        hovered ? 1.2 : 1,
        14,
        delta
      );
      inner.current.scale.setScalar(s);
      inner.current.position.y = THREE.MathUtils.damp(
        inner.current.position.y,
        hovered ? 0.28 : 0,
        14,
        delta
      );
      inner.current.position.z = THREE.MathUtils.damp(
        inner.current.position.z,
        hovered ? 0.35 : 0,
        14,
        delta
      );
    }
    if (boardMat.current) {
      boardMat.current.emissiveIntensity = THREE.MathUtils.damp(
        boardMat.current.emissiveIntensity,
        hovered ? 0.32 : 0,
        12,
        delta
      );
    }
  });

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* STATIC invisible hitbox carries all pointer events — the visible
          sign animates on hover, and an animated hit surface shifting
          under a stationary cursor causes enter/leave flicker */}
      <mesh
        position={[0, 2.5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
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
        <boxGeometry args={[4.2, 5.4, 2.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={inner}>
      {/* posts — run well below grade so they stay planted on slopes */}
      <mesh position={[-1.15, 0.75, 0]}>
        <cylinderGeometry args={[0.09, 0.13, 3.7, 6]} />
        <meshStandardMaterial map={planks} normalMap={planksN} roughness={0.9} />
      </mesh>
      <mesh position={[1.15, 0.75, 0]}>
        <cylinderGeometry args={[0.09, 0.13, 3.7, 6]} />
        <meshStandardMaterial map={planks} normalMap={planksN} roughness={0.9} />
      </mesh>
      {/* board */}
      <mesh position={[0, 2.6, 0]}>
        <boxGeometry args={[3.2, 2.05, 0.14]} />
        <meshStandardMaterial
          ref={boardMat}
          map={planks}
          normalMap={planksN}
          color="#8a7358"
          roughness={0.85}
          emissive="#ffd9a0"
          emissiveIntensity={0}
        />
      </mesh>
      {/* corner bolts */}
      {[
        [-1.35, 3.4],
        [1.35, 3.4],
        [-1.35, 1.85],
        [1.35, 1.85],
      ].map(([bx, by], i) => (
        <mesh key={i} position={[bx, by, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.05, 8]} />
          <meshStandardMaterial color="#3c3c42" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {/* little roof cap */}
      <mesh position={[0, 3.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 3.5, 3]} />
        <meshStandardMaterial map={planks} normalMap={planksN} roughness={0.9} />
      </mesh>
      {/* carved title plank */}
      {titleVisible && !occluded && (
        <Html
          transform
          position={[0, 4.45, 0]}
          scale={0.78}
          zIndexRange={[30, 0]}
          style={{ pointerEvents: 'none', backfaceVisibility: 'hidden' }}
        >
          <div className="select-none whitespace-nowrap rounded-md border-2 border-[#4a3722] bg-[#7a5b3a] px-4 py-1 font-display text-lg font-bold uppercase tracking-[0.2em] text-[#f5eeda] shadow-md">
            {SIGN_TITLES[id]}
          </div>
        </Html>
      )}
      {/* live preview pinned to the board face */}
      {near && !occluded && (
        <Html
          transform
          position={[0, 2.6, 0.09]}
          scale={0.4}
          zIndexRange={[30, 0]}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* keep the pop alive while the cursor is on the DOM card —
              the canvas fires pointerout the moment the DOM captures it */}
          <div
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
          >
            {previewFor(id, () => onSelect(id))}
          </div>
        </Html>
      )}
      </group>
    </group>
  );
}

/* ------------------------------- scenery -------------------------------- */

function Cairn({ position }: { position: THREE.Vector3 }) {
  const { map, normalMap } = useTexture({
    map: `${process.env.PUBLIC_URL}/assets/pbr/rock_face_diff_1k.jpg`,
    normalMap: `${process.env.PUBLIC_URL}/assets/pbr/rock_face_nor_gl_1k.jpg`,
  });
  useMemo(() => {
    [map, normalMap].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.needsUpdate = true;
    });
    map.colorSpace = THREE.SRGBColorSpace;
  }, [map, normalMap]);
  const geometry = useMemo(makeBoulderGeometry, []);

  // stacked weathered stones, each with its own tumble and squash
  const stones: Array<{ s: number; y: number; rot: [number, number, number] }> = [
    { s: 1.55, y: 0.55, rot: [0.3, 0.4, 0.1] },
    { s: 1.05, y: 1.6, rot: [1.2, 2.2, 0.5] },
    { s: 0.62, y: 2.35, rot: [2.1, 0.9, 1.3] },
  ];

  return (
    <group position={position} scale={1.5}>
      {stones.map((st, i) => (
        <mesh
          key={i}
          geometry={geometry}
          position={[0, st.y, 0]}
          rotation={st.rot}
          scale={[st.s, st.s * 0.72, st.s]}
        >
          <meshStandardMaterial
            map={map}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(1.1, 1.1)}
            roughness={0.95}
          />
        </mesh>
      ))}
    </group>
  );
}

const FLAG_W = 3.2;
const FLAG_H = 1.7;
const POLE_H = 8;

/** Old Glory at the summit — canvas-drawn texture, cloth-wave animated. */
function SummitFlag({ position }: { position: THREE.Vector3 }) {
  const flagRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 380;
    c.height = 200;
    const ctx = c.getContext('2d');
    if (ctx) {
      const stripe = c.height / 13;
      for (let i = 0; i < 13; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#B22234' : '#FFFFFF';
        ctx.fillRect(0, Math.floor(i * stripe), c.width, Math.ceil(stripe) + 1);
      }
      const cantonW = c.width * 0.4;
      const cantonH = stripe * 7;
      ctx.fillStyle = '#3C3B6E';
      ctx.fillRect(0, 0, cantonW, cantonH);
      // 50 stars: 9 rows alternating 6 and 5
      ctx.fillStyle = '#FFFFFF';
      for (let row = 0; row < 9; row++) {
        const cols = row % 2 === 0 ? 6 : 5;
        for (let col = 0; col < cols; col++) {
          const x = (cantonW * ((row % 2 === 0 ? 1 : 2) + col * 2)) / 12;
          const y = (cantonH * (row + 1)) / 10;
          ctx.beginPath();
          ctx.arc(x, y, 4.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
    return tex;
  }, []);

  useFrame(({ clock }) => {
    const mesh = flagRef.current;
    if (!mesh) return;
    const geo = mesh.geometry as THREE.PlaneGeometry;
    const posAttr = geo.attributes.position;
    const time = clock.elapsedTime;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const u = x / FLAG_W + 0.5; // 0 at the pole, 1 at the fly end
      posAttr.setZ(
        i,
        Math.sin(u * 5 - time * 3.2) * 0.22 * u +
          Math.sin(u * 11 - time * 5.1) * 0.05 * u
      );
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <group position={position}>
      {/* pole */}
      <mesh position={[0, POLE_H / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.09, POLE_H, 6]} />
        <meshStandardMaterial color="#9aa3b2" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0, POLE_H + 0.12, 0]}>
        <sphereGeometry args={[0.13, 8, 6]} />
        <meshStandardMaterial color="#d8b544" roughness={0.35} metalness={0.6} />
      </mesh>
      {/* the flag — hoist at the pole, waving in the summit wind */}
      <mesh
        ref={flagRef}
        position={[FLAG_W / 2 + 0.08, POLE_H - FLAG_H / 2 - 0.15, 0]}
      >
        <planeGeometry args={[FLAG_W, FLAG_H, 18, 8]} />
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
          roughness={0.85}
        />
      </mesh>
    </group>
  );
}

/** Animated campfire: flickering flame + dancing warm light. */
function Campfire() {
  const flame = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const f = 1 + Math.sin(t * 9.3) * 0.14 + Math.sin(t * 23.7) * 0.07;
    if (flame.current) {
      flame.current.scale.set(f, 1.1 * f, f);
      flame.current.rotation.y = t * 1.6;
    }
    if (inner.current) inner.current.rotation.y = -t * 2.3;
    if (light.current) {
      light.current.intensity =
        0.9 + Math.sin(t * 11.4) * 0.2 + Math.sin(t * 28.9) * 0.09;
    }
  });

  return (
    <group>
      {/* stone ring */}
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.62, 0.13, Math.sin(a) * 0.62]}
            rotation={[a, a * 2, 0]}
          >
            <dodecahedronGeometry args={[0.19, 0]} />
            <meshStandardMaterial color="#6f7278" roughness={0.95} flatShading />
          </mesh>
        );
      })}
      {/* charred logs */}
      {[0.4, 1.9].map((rot, i) => (
        <mesh key={i} position={[0, 0.12, 0]} rotation={[0, rot, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.08, 0.85, 5]} />
          <meshStandardMaterial color="#33261a" roughness={1} flatShading />
        </mesh>
      ))}
      {/* flame */}
      <mesh ref={flame} position={[0, 0.42, 0]}>
        <coneGeometry args={[0.24, 0.62, 5]} />
        <meshStandardMaterial
          color="#ff9a3c"
          emissive="#ff7a1c"
          emissiveIntensity={2.2}
          toneMapped={false}
          transparent
          opacity={0.9}
          flatShading
        />
      </mesh>
      <mesh ref={inner} position={[0, 0.34, 0]}>
        <coneGeometry args={[0.13, 0.4, 4]} />
        <meshStandardMaterial
          color="#ffd98a"
          emissive="#ffc95c"
          emissiveIntensity={3}
          toneMapped={false}
          flatShading
        />
      </mesh>
      <pointLight ref={light} position={[0, 0.9, 0]} distance={11} color="#ffb45c" />
    </group>
  );
}

/** Rounded, human-proportioned seated figure — facing +Z. */
function SeatedFigure({
  position,
  rotationY,
  seatHeight,
  scale = 1,
  jacket,
  jacketDark,
  pants,
  hair,
  pigtails = false,
  marshmallowStick = false,
}: {
  position: [number, number, number];
  rotationY: number;
  seatHeight: number;
  scale?: number;
  jacket: string;
  jacketDark: string;
  pants: string;
  hair: string;
  pigtails?: boolean;
  marshmallowStick?: boolean;
}) {
  const h = seatHeight;
  const SKIN = '#e8c39e';
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* thighs (horizontal) + shins (down) + shoes */}
      {[0.11, -0.11].map((x, i) => (
        <group key={i}>
          <mesh position={[x, h + 0.05, 0.19]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.085, 0.26, 4, 10]} />
            <meshStandardMaterial color={pants} roughness={0.85} />
          </mesh>
          <mesh position={[x, Math.max(h / 2 - 0.03, 0.09), 0.38]}>
            <capsuleGeometry
              args={[0.07, Math.max(h - 0.18, 0.06), 4, 10]}
            />
            <meshStandardMaterial color={pants} roughness={0.85} />
          </mesh>
          <mesh position={[x, 0.07, 0.45]}>
            <capsuleGeometry args={[0.07, 0.1, 4, 8]} />
            <meshStandardMaterial color="#2b2b30" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* hips + torso */}
      <mesh position={[0, h + 0.06, 0]} scale={[1, 0.75, 0.8]}>
        <sphereGeometry args={[0.2, 12, 10]} />
        <meshStandardMaterial color={pants} roughness={0.85} />
      </mesh>
      <mesh position={[0, h + 0.38, 0]} scale={[1, 1, 0.74]}>
        <capsuleGeometry args={[0.22, 0.28, 6, 14]} />
        <meshStandardMaterial color={jacket} roughness={0.78} />
      </mesh>
      <mesh position={[0, h + 0.38, 0.155]}>
        <boxGeometry args={[0.02, 0.4, 0.012]} />
        <meshStandardMaterial color={jacketDark} roughness={0.7} />
      </mesh>
      {/* arms resting toward the lap, small hands */}
      {[0.24, -0.24].map((x, i) => (
        <group key={i} position={[x, h + 0.52, 0.02]} rotation={[0.65, 0, x > 0 ? 0.12 : -0.12]}>
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.062, 0.2, 4, 10]} />
            <meshStandardMaterial color={jacket} roughness={0.78} />
          </mesh>
          <mesh position={[0, -0.4, 0.02]}>
            <capsuleGeometry args={[0.055, 0.16, 4, 10]} />
            <meshStandardMaterial color={jacket} roughness={0.78} />
          </mesh>
          <mesh position={[0, -0.54, 0.04]}>
            <sphereGeometry args={[0.055, 8, 7]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* neck + head + face */}
      <mesh position={[0, h + 0.66, 0]}>
        <cylinderGeometry args={[0.05, 0.065, 0.08, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.6} />
      </mesh>
      <mesh position={[0, h + 0.8, 0]} scale={[0.92, 1, 0.94]}>
        <sphereGeometry args={[0.145, 14, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      {[0.05, -0.05].map((x) => (
        <mesh key={x} position={[x, h + 0.81, 0.125]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#2a2620" roughness={0.4} />
        </mesh>
      ))}
      {/* hair: soft cap; bun for mom, pigtails for the kid */}
      <mesh position={[0, h + 0.85, -0.02]} scale={[1, 0.85, 1.02]}>
        <sphereGeometry args={[0.15, 12, 10]} />
        <meshStandardMaterial color={hair} roughness={0.9} />
      </mesh>
      {pigtails ? (
        [0.15, -0.15].map((x, i) => (
          <group key={i}>
            <mesh position={[x, h + 0.82, -0.03]}>
              <sphereGeometry args={[0.06, 8, 7]} />
              <meshStandardMaterial color={hair} roughness={0.9} />
            </mesh>
            <mesh position={[x * 1.15, h + 0.72, -0.04]}>
              <capsuleGeometry args={[0.035, 0.09, 4, 8]} />
              <meshStandardMaterial color={hair} roughness={0.9} />
            </mesh>
          </group>
        ))
      ) : (
        <mesh position={[0, h + 0.84, -0.15]}>
          <sphereGeometry args={[0.075, 8, 7]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
      )}
      {marshmallowStick && (
        <group position={[0.24, h + 0.16, 0.35]} rotation={[-0.55, 0, 0.1]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.018, 0.028, 0.95, 6]} />
            <meshStandardMaterial color="#7a5b3a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.94, 0]}>
            <capsuleGeometry args={[0.045, 0.05, 4, 8]} />
            <meshStandardMaterial color="#fff4e0" roughness={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Taut line from tent apex to a ground stake. */
function GuyLine({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const { mid, quat, len } = useMemo(() => {
    const f = new THREE.Vector3(...from);
    const t = new THREE.Vector3(...to);
    const dir = t.clone().sub(f);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize()
    );
    return { mid: f.add(t).multiplyScalar(0.5), quat, len };
  }, [from, to]);
  return (
    <group>
      <mesh position={mid} quaternion={quat}>
        <cylinderGeometry args={[0.012, 0.012, len, 4]} />
        <meshStandardMaterial color="#ded7c2" roughness={0.8} />
      </mesh>
      <mesh position={[to[0], to[1] + 0.08, to[2]]} rotation={[0.3, 0, 0.2]}>
        <cylinderGeometry args={[0.025, 0.035, 0.22, 5]} />
        <meshStandardMaterial color="#5d4429" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Worn dirt patch under the camp, draped on the terrain, feathered edge. */
function CampFloor({
  groundAt,
  center,
  radius,
}: {
  groundAt: (lx: number, lz: number) => number;
  center: [number, number];
  radius: number;
}) {
  const geometry = useMemo(() => {
    const SEG = 22;
    const RINGS = [0, 0.5, 1];
    const ALPHA = [0.5, 0.4, 0];
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    for (let r = 0; r < RINGS.length; r++) {
      for (let s = 0; s < SEG; s++) {
        const a = (s / SEG) * Math.PI * 2;
        const lx = center[0] + Math.cos(a) * RINGS[r] * radius;
        const lz = center[1] + Math.sin(a) * RINGS[r] * radius;
        positions.push(lx, groundAt(lx, lz) + 0.1, lz);
        colors.push(1, 1, 1, ALPHA[r]);
      }
    }
    for (let r = 0; r < RINGS.length - 1; r++) {
      for (let s = 0; s < SEG; s++) {
        const a = r * SEG + s;
        const b = r * SEG + ((s + 1) % SEG);
        const c = (r + 1) * SEG + s;
        const d = (r + 1) * SEG + ((s + 1) % SEG);
        indices.push(a, c, b, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 4));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [groundAt, center, radius]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#9c7f5f"
        vertexColors
        transparent
        depthWrite={false}
        roughness={1}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}

/** Basecamp at the trailhead — the hiker's family sees him off. */
function Campsite({ position, yaw }: { position: THREE.Vector3; yaw: number }) {
  const momAvailable = useAssetAvailable(`${MODELS_BASE}/mom.glb`);
  const kidAvailable = useAssetAvailable(`${MODELS_BASE}/kid.glb`);

  const { map: tentFabric, normalMap: tentFabricN } = useTexture({
    map: `${process.env.PUBLIC_URL}/assets/pbr/fabric_pattern_07_col_1_1k.jpg`,
    normalMap: `${process.env.PUBLIC_URL}/assets/pbr/fabric_pattern_07_nor_gl_1k.jpg`,
  });
  useMemo(() => {
    [tentFabric, tentFabricN].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 2);
      tex.needsUpdate = true;
    });
    tentFabric.colorSpace = THREE.SRGBColorSpace;
  }, [tentFabric, tentFabricN]);

  // seat every prop on the rendered terrain at ITS OWN spot — the camp
  // spans ~5 units of sloping meadow, one shared height floats things
  const groundAt = useMemo(() => {
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    return (lx: number, lz: number) => {
      const wx = position.x + lx * cos + lz * sin;
      const wz = position.z - lx * sin + lz * cos;
      return gridHeight(wx, wz) - position.y;
    };
  }, [position, yaw]);

  const g = useMemo(
    () => ({
      fire: groundAt(3.4, 1.6),
      log: groundAt(3.2, 3.3),
      kid: groundAt(4.7, 2.1),
      wood: groundAt(1.9, 3.1),
      pack: groundAt(-1.7, 1.1),
      cooler: groundAt(-0.6, 2.4),
      bedroll: groundAt(1.2, -1.6),
      stakeA: groundAt(2.3, 0.9),
      stakeB: groundAt(-2.3, 0.9),
      stakeC: groundAt(0, -2.6),
    }),
    [groundAt]
  );

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <CampFloor groundAt={groundAt} center={[1.7, 1.4]} radius={4.8} />

      {/* canvas tent — woven fabric with real weave normal detail */}
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.72, 1]}>
        <coneGeometry args={[2.3, 3, 4]} />
        <meshStandardMaterial
          map={tentFabric}
          normalMap={tentFabricN}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          color="#d8c092"
          roughness={0.95}
          flatShading
        />
      </mesh>
      <mesh position={[0, 0.62, 1.35]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.7, 1]}>
        <coneGeometry args={[0.55, 1.25, 4]} />
        <meshStandardMaterial color="#3a2f22" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 2.25, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.7, 5]} />
        <meshStandardMaterial color="#7a5b3a" roughness={0.9} flatShading />
      </mesh>
      <GuyLine from={[0, 2.15, 0]} to={[2.3, g.stakeA, 0.9]} />
      <GuyLine from={[0, 2.15, 0]} to={[-2.3, g.stakeB, 0.9]} />
      <GuyLine from={[0, 2.15, 0]} to={[0, g.stakeC, -2.6]} />

      <group position={[3.4, g.fire, 1.6]}>
        <Campfire />
      </group>

      {/* sitting log by the fire */}
      <mesh position={[3.2, g.log + 0.2, 3.3]} rotation={[0, 0.35, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.24, 2.1, 6]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.95} flatShading />
      </mesh>

      {/* mom by the fire (RPM avatar when mom.glb exists) */}
      {momAvailable ? (
        <RpmFigure
          modelUrl={`${MODELS_BASE}/mom.glb`}
          clipUrl={`${ANIMS_BASE}/F_Standing_Idle_001.glb`}
          position={[2.7, g.log, 2.9]}
          rotationY={Math.atan2(3.4 - 2.7, 1.6 - 2.9)}
        />
      ) : (
        <SeatedFigure
          position={[3.3, g.log, 3.12]}
          rotationY={Math.PI + 0.1}
          seatHeight={0.43}
          jacket="#b13a5e"
          jacketDark="#8a2c49"
          pants="#3b4256"
          hair="#5b4232"
        />
      )}
      {/* the seven-year-old (RPM avatar when kid.glb exists) */}
      {kidAvailable ? (
        <RpmFigure
          modelUrl={`${MODELS_BASE}/kid.glb`}
          clipUrl={`${ANIMS_BASE}/F_Standing_Idle_Variations_001.glb`}
          position={[4.6, g.kid, 2.3]}
          rotationY={Math.atan2(3.4 - 4.6, 1.6 - 2.3)}
          scale={0.72}
        />
      ) : (
        <SeatedFigure
          position={[4.7, g.kid, 2.1]}
          rotationY={Math.atan2(3.4 - 4.7, 1.6 - 2.1)}
          seatHeight={0.16}
          scale={0.62}
          jacket="#eab308"
          jacketDark="#b8880a"
          pants="#7c3aed"
          hair="#6b4a2f"
          pigtails
          marshmallowStick
        />
      )}

      {/* firewood — two on the ground, one stacked across */}
      <mesh position={[1.9, g.wood + 0.1, 3.1]} rotation={[0, 1.25, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.1, 0.9, 6]} />
        <meshStandardMaterial color="#7a5b3a" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[1.9, g.wood + 0.1, 3.35]} rotation={[0, 1.15, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.1, 0.9, 6]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[1.9, g.wood + 0.27, 3.22]} rotation={[0, 2.75, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.095, 0.85, 6]} />
        <meshStandardMaterial color="#8a6a45" roughness={0.95} flatShading />
      </mesh>

      {/* cooler by the tent */}
      <group position={[-0.6, g.cooler + 0.21, 2.4]} rotation={[0, -0.4, 0]}>
        <mesh>
          <boxGeometry args={[0.56, 0.38, 0.36]} />
          <meshStandardMaterial color="#4d7ea8" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <boxGeometry args={[0.58, 0.06, 0.38]} />
          <meshStandardMaterial color="#e8eef2" roughness={0.5} />
        </mesh>
      </group>

      {/* rolled sleeping bag beside the tent */}
      <mesh position={[1.2, g.bedroll + 0.17, -1.6]} rotation={[0, 0.9, Math.PI / 2]}>
        <capsuleGeometry args={[0.17, 0.5, 4, 10]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.85} />
      </mesh>

      {/* stowed pack leaning on the tent */}
      <mesh position={[-1.7, g.pack + 0.32, 1.1]} rotation={[0.15, 0.4, -0.12]}>
        <boxGeometry args={[0.5, 0.7, 0.32]} />
        <meshStandardMaterial color="#d97706" roughness={0.85} flatShading />
      </mesh>
    </group>
  );
}

/* --------------------------------- root --------------------------------- */

const SIGNS: Array<{ id: SectionId; side: number }> = [
  { id: 'about', side: 5.5 },
  { id: 'skills', side: -5.5 },
  { id: 'experience', side: 5.5 },
  { id: 'projects', side: -5.5 },
  { id: 'github', side: 4.2 },
  { id: 'contact', side: 3.5 },
];

interface WaypointsProps {
  progress: ProgressRef;
  onSelect: (section: SectionId) => void;
}

/**
 * The site's navigation, physicalized: wooden trail signs along the
 * ascent, each carrying a live preview of its section; clicking opens
 * the full content panel.
 */
export default function Waypoints({ progress, onSelect }: WaypointsProps) {
  const scenery = useMemo(() => {
    const campPos = besideTrail(0.018, 8);
    const campTangent = trailCurve.getTangentAt(0.018);
    return {
      trailhead: besideTrail(WAYPOINT_T.home + 0.005, -5),
      camp: campPos,
      // tent door turned toward the trail
      campYaw: Math.atan2(-campTangent.x, -campTangent.z) + Math.PI / 2,
      summit: besideTrail(0.998, -3),
    };
  }, []);

  return (
    <group>
      <Cairn position={scenery.trailhead} />
      <Campsite position={scenery.camp} yaw={scenery.campYaw} />
      <SummitFlag position={scenery.summit} />
      {SIGNS.map(({ id, side }) => (
        <TrailSign
          key={id}
          id={id}
          t={WAYPOINT_T[id]}
          side={side}
          progress={progress}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
