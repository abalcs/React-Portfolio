import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { FaGithub, FaEnvelope } from 'react-icons/fa';
import { besideTrail, trailCurve, WAYPOINT_T } from './curve';
import { gridHeight } from './terrainHeight';
import { projects } from '../data/projects';
import { skills } from '../data/skills';
import { experiences } from '../data/experience';
import { ProgressRef } from './hooks/useScrollProgress';
import profileImg from '../components/About/images/profile.jpg';

import type { SectionId } from './journey';
export type { SectionId } from './journey';

const WOOD = '#7a5b3a';
const WOOD_DARK = '#5d4429';

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

  useFrame((_, delta) => {
    const isNear = Math.abs(progress.current - t) < 0.14;
    if (isNear !== near) setNear(isNear);
    // title chips are DOM nodes repositioned every frame — only keep the
    // ones within eyeshot mounted
    const showTitle = Math.abs(progress.current - t) < 0.38;
    if (showTitle !== titleVisible) setTitleVisible(showTitle);
    if (inner.current) {
      const s = THREE.MathUtils.damp(
        inner.current.scale.x,
        hovered ? 1.09 : 1,
        10,
        delta
      );
      inner.current.scale.setScalar(s);
    }
  });

  return (
    <group
      position={position}
      rotation={[0, yaw, 0]}
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
      <group ref={inner}>
      {/* posts — run well below grade so they stay planted on slopes */}
      <mesh position={[-1.15, 0.75, 0]}>
        <cylinderGeometry args={[0.09, 0.13, 3.7, 6]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[1.15, 0.75, 0]}>
        <cylinderGeometry args={[0.09, 0.13, 3.7, 6]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} flatShading />
      </mesh>
      {/* board */}
      <mesh position={[0, 2.6, 0]}>
        <boxGeometry args={[3.2, 2.05, 0.14]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.85} flatShading />
      </mesh>
      {/* little roof cap */}
      <mesh position={[0, 3.75, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 3.5, 3]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} flatShading />
      </mesh>
      {/* carved title plank */}
      {titleVisible && (
        <Html
          transform
          position={[0, 4.45, 0]}
          scale={0.78}
          zIndexRange={[30, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="select-none whitespace-nowrap rounded-md border-2 border-[#4a3722] bg-[#7a5b3a] px-4 py-1 font-display text-lg font-bold uppercase tracking-[0.2em] text-[#f5eeda] shadow-md">
            {SIGN_TITLES[id]}
          </div>
        </Html>
      )}
      {/* live preview pinned to the board face */}
      {near && (
        <Html
          transform
          position={[0, 2.6, 0.09]}
          scale={0.4}
          zIndexRange={[30, 0]}
        >
          {previewFor(id, () => onSelect(id))}
        </Html>
      )}
      </group>
    </group>
  );
}

/* ------------------------------- scenery -------------------------------- */

function Cairn({ position }: { position: THREE.Vector3 }) {
  return (
    <group position={position} scale={1.5}>
      {[
        [1.1, 0.5],
        [0.8, 1.25],
        [0.5, 1.85],
      ].map(([r, y], i) => (
        <mesh key={i} position={[0, y, 0]}>
          <dodecahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color="#8d8f94" roughness={0.9} flatShading />
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

/** Basecamp at the trailhead — the hiker's journey starts here. */
function Campsite({ position, yaw }: { position: THREE.Vector3; yaw: number }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* canvas tent — squat pyramid, door facing the fire */}
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.72, 1]}>
        <coneGeometry args={[2.3, 3, 4]} />
        <meshStandardMaterial color="#c9a15e" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.62, 1.35]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.7, 1]}>
        <coneGeometry args={[0.55, 1.25, 4]} />
        <meshStandardMaterial color="#3a2f22" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 2.25, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.7, 5]} />
        <meshStandardMaterial color="#7a5b3a" roughness={0.9} flatShading />
      </mesh>

      {/* campfire ring */}
      <group position={[3.4, 0, 1.6]}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.6, 0.14, Math.sin(a) * 0.6]}
              rotation={[a, a * 2, 0]}
            >
              <dodecahedronGeometry args={[0.2, 0]} />
              <meshStandardMaterial color="#6f7278" roughness={0.95} flatShading />
            </mesh>
          );
        })}
        <mesh position={[0, 0.22, 0]}>
          <icosahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial
            color="#ffb45c"
            emissive="#ff8a2c"
            emissiveIntensity={2.4}
            toneMapped={false}
            flatShading
          />
        </mesh>
        <pointLight position={[0, 0.9, 0]} intensity={0.8} distance={9} color="#ffb45c" />
      </group>

      {/* sitting log */}
      <mesh position={[3.2, 0.22, 3.4]} rotation={[0, 0.5, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.24, 1.9, 6]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.95} flatShading />
      </mesh>

      {/* stowed pack leaning on the tent */}
      <mesh position={[-1.7, 0.35, 1.1]} rotation={[0.15, 0.4, -0.12]}>
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
