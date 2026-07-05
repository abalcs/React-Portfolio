import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerformanceMonitor, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { ProgressRef } from './hooks/useScrollProgress';
import Terrain from './Terrain';
import ShadowClouds from './DaySky';
import Trees from './Trees';
import Grass from './Grass';
import Undergrowth from './Undergrowth';
import TrailScatter from './TrailScatter';
import Rocks from './Rocks';
import Birds from './Birds';
import Lake from './Lake';
import Lighting from './Lighting';
import CameraRig from './CameraRig';
import Trail from './Trail';
import Waypoints, { SectionId } from './Waypoints';
import Hiker from './Hiker';
import Suv, { createSuvState, SuvState } from './Suv';
import Billboards from './Billboards';
import Deer from './Deer';
import NameLetters from './NameLetters';
import Effects from './Effects';
import { DAY } from './palette';
import { trailCurve } from './curve';
import { gridHeight } from './terrainHeight';
import { ProgressDriver } from './hooks/useScrollProgress';
import { usePerfTier } from './hooks/usePerfTier';

/** Fog thins as you climb — breaking above the valley haze. */
function FogRig({
  near,
  far,
  progress,
}: {
  near: number;
  far: number;
  progress: React.MutableRefObject<number>;
}) {
  const scene = useThree((s) => s.scene);
  useFrame(() => {
    const fog = scene.fog as THREE.FogExp2 | null;
    if (fog && 'density' in fog) {
      fog.density = THREE.MathUtils.lerp(
        near,
        far,
        THREE.MathUtils.clamp(progress.current, 0, 1)
      );
    }
  });
  return null;
}

/** Stop rendering entirely while the tab is hidden. */
function VisibilityPause() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    const onChange = () => {
      setFrameloop(document.hidden ? 'never' : 'always');
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, [setFrameloop]);
  return null;
}

/**
 * Free-look mode: drag to orbit around the hiker. Scroll still walks him
 * (zoom is disabled so the wheel keeps driving the journey).
 */
function FreeLook({ progress }: { progress: ProgressRef }) {
  const controls = useRef<any>(null);
  const target = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useFrame(() => {
    if (!controls.current) return;
    trailCurve.getPointAt(
      THREE.MathUtils.clamp(progress.current, 0.0005, 0.9995),
      target.current
    );
    if (!initialized.current) {
      // snap the orbit target to the hiker BEFORE the first update —
      // otherwise controls lerp from world origin and the camera lurches
      initialized.current = true;
      controls.current.target.set(
        target.current.x,
        target.current.y + 2,
        target.current.z
      );
    } else {
      controls.current.target.lerp(
        { x: target.current.x, y: target.current.y + 2, z: target.current.z },
        0.12
      );
    }
    controls.current.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableZoom={false}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI * 0.52}
    />
  );
}

/** Chase camera for Drive mode — snappier than the hiking follow-cam. */
function DriveCamera({ state }: { state: React.MutableRefObject<SuvState> }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const desired = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const groundClamp = useRef(0);
  const initialized = useRef(false);

  useFrame((_, delta) => {
    const s = state.current;
    const sinH = Math.sin(s.heading);
    const cosH = Math.cos(s.heading);

    desired.current.set(
      s.pos.x - sinH * 9.5,
      s.pos.y + 4.2,
      s.pos.z - cosH * 9.5
    );

    // same smoothed asymmetric terrain clamp as the hiking camera
    const gHere = gridHeight(desired.current.x, desired.current.z);
    const gMid = gridHeight(
      (desired.current.x + s.pos.x) / 2,
      (desired.current.z + s.pos.z) / 2
    );
    const clampTarget = Math.max(gHere, gMid) + 2.4;
    if (!initialized.current) groundClamp.current = clampTarget;
    groundClamp.current = THREE.MathUtils.damp(
      groundClamp.current,
      clampTarget,
      clampTarget > groundClamp.current ? 16 : 2.5,
      delta
    );
    if (desired.current.y < groundClamp.current) {
      desired.current.y = groundClamp.current;
    }

    if (!initialized.current) {
      camera.position.copy(desired.current);
      initialized.current = true;
    } else {
      camera.position.lerp(desired.current, 1 - Math.exp(-5.5 * delta));
    }

    look.current.set(
      s.pos.x + sinH * 5,
      s.pos.y + 1.4,
      s.pos.z + cosH * 5
    );
    camera.lookAt(look.current);

    // subtle speed-FOV for the sensation of pace
    const fov = THREE.MathUtils.lerp(58, 68, Math.abs(s.speed) / 19);
    if (Math.abs(camera.fov - fov) > 0.05) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

interface AscentSceneProps {
  onSelect: (section: SectionId) => void;
  /** a content panel is open — suspend camera mouse tracking */
  paused?: boolean;
  /** free camera orbit around the hiker instead of follow-cam */
  freeLook?: boolean;
  /** free-roam Drive mode — user controls the SUV */
  driving?: boolean;
}

/**
 * The Ascent — the world IS the site. A hiker climbs an alpine trail on a
 * clear sunny day; wooden signs along the way preview and open each
 * section. Everything three/fiber/drei stays behind this lazy module.
 */
export default function AscentScene({
  onSelect,
  paused = false,
  freeLook = false,
  driving = false,
}: AscentSceneProps) {
  const tier = usePerfTier();
  const palette = DAY;

  // single damped scroll value shared by hiker/camera/fog/signs
  const progress = useRef(0);
  const suvState = useRef<SuvState | null>(null);
  if (!suvState.current) suvState.current = createSuvState();
  // adaptive resolution: step down under sustained load, back up when free
  const [dpr, setDpr] = React.useState(tier === 'high' ? 1.5 : 1);

  const start = trailCurve.getPointAt(0);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        shadows={tier === 'high'}
        dpr={dpr}
        camera={{
          position: [start.x, start.y + 10, start.z + 22],
          fov: 58,
          near: 0.1,
          far: 2200,
        }}
        onCreated={({ gl }) => {
          // allow vertical touch-scrolling over the canvas on mobile
          gl.domElement.style.touchAction = 'pan-y';
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
          onIncline={() =>
            setDpr((d) => Math.min(tier === 'high' ? 1.75 : 1, d + 0.25))
          }
        />
        <fogExp2 attach="fog" args={[palette.fog, palette.fogDensityNear]} />
        <ProgressDriver progress={progress} />
        <FogRig
          near={palette.fogDensityNear}
          far={palette.fogDensityFar}
          progress={progress}
        />
        <VisibilityPause />
        {driving ? (
          <DriveCamera state={suvState as React.MutableRefObject<SuvState>} />
        ) : freeLook ? (
          <FreeLook progress={progress} />
        ) : (
          <CameraRig progress={progress} frozen={paused} />
        )}
        <Suspense fallback={null}>
          {/* photographed sky with mountain skyline: visible background +
              image-based lighting — the world no longer ends at a haze ring */}
          <Environment
            files={`${process.env.PUBLIC_URL}/assets/hdri/horizon_2k.hdr`}
            background
          />
          <ShadowClouds count={tier === 'high' ? 8 : 5} />
          {/* segment count must stay in lockstep with gridHeight() */}
          <Terrain palette={palette} />
          <Trees count={tier === 'high' ? 380 : 150} />
          <Grass count={tier === 'high' ? 9000 : 3000} />
          <Undergrowth
            flowerCount={tier === 'high' ? 2400 : 800}
            bushCount={tier === 'high' ? 220 : 80}
            logCount={30}
          />
          <TrailScatter />
          <Rocks count={tier === 'high' ? 140 : 60} />
          <Lake tier={tier} progress={progress} />
          <Birds />
          <Trail />
          <Hiker progress={progress} />
          <Suv
            driving={driving}
            state={suvState as React.MutableRefObject<SuvState>}
          />
          <Billboards />
          <NameLetters suvState={suvState as React.MutableRefObject<SuvState>} />
          <Deer
            progress={progress}
            suvState={suvState as React.MutableRefObject<SuvState>}
          />
          <Waypoints progress={progress} onSelect={onSelect} />
          <Lighting palette={palette} shadows={tier === 'high'} />
          <Effects tier={tier} />
        </Suspense>
      </Canvas>
    </div>
  );
}
