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
import Effects from './Effects';
import { DAY } from './palette';
import { trailCurve } from './curve';
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

interface AscentSceneProps {
  onSelect: (section: SectionId) => void;
  /** a content panel is open — suspend camera mouse tracking */
  paused?: boolean;
  /** free camera orbit around the hiker instead of follow-cam */
  freeLook?: boolean;
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
}: AscentSceneProps) {
  const tier = usePerfTier();
  const palette = DAY;

  // single damped scroll value shared by hiker/camera/fog/signs
  const progress = useRef(0);
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
        {freeLook ? (
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
          <Waypoints progress={progress} onSelect={onSelect} />
          <Lighting palette={palette} shadows={tier === 'high'} />
          <Effects tier={tier} />
        </Suspense>
      </Canvas>
    </div>
  );
}
