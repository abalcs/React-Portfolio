import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useTrailWalker } from './hikerMotion';
import {
  ANIMS_BASE,
  MODELS_BASE,
  attachHikerGear,
  enableShadows,
  useAssetAvailable,
  useExternalClips,
} from './rpm';
import { ProgressRef } from './hooks/useScrollProgress';

const RPM_HIKER_URL = `${MODELS_BASE}/hiker.glb`;
const SOLDIER_URL = `${MODELS_BASE}/Soldier.glb`;

/** Ready Player Me avatar walking the trail (drop hiker.glb to enable). */
function RpmHiker({ progress }: { progress: ProgressRef }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(RPM_HIKER_URL) as unknown as {
    scene: THREE.Group;
  };
  const clipMap = useMemo(
    () => ({
      Idle: `${ANIMS_BASE}/M_Standing_Idle_001.glb`,
      Walk: `${ANIMS_BASE}/M_Walk_001.glb`,
      Run: `${ANIMS_BASE}/M_Run_001.glb`,
    }),
    []
  );
  const clips = useExternalClips(clipMap);
  const { actions } = useAnimations(clips, group);

  useEffect(() => {
    enableShadows(scene);
    attachHikerGear(scene);
  }, [scene]);

  useEffect(() => {
    [actions.Idle, actions.Walk, actions.Run].forEach((a) => {
      if (!a) return;
      a.reset();
      a.setEffectiveWeight(0);
      a.play();
    });
    actions.Idle?.setEffectiveWeight(1);
  }, [actions]);

  useTrailWalker(group, progress, actions, {
    yawOffset: 0, // RPM avatars face +Z
    walkClipSpeed: 1.4,
    runClipSpeed: 4.4,
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.15} />
    </group>
  );
}

/** Fallback rigged human (three.js Soldier) until an RPM avatar exists. */
function SoldierHiker({ progress }: { progress: ProgressRef }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(SOLDIER_URL) as unknown as {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
  };
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    enableShadows(scene);
    attachHikerGear(scene);
  }, [scene]);

  useEffect(() => {
    [actions.Idle, actions.Walk, actions.Run].forEach((a) => {
      if (!a) return;
      a.reset();
      a.setEffectiveWeight(0);
      a.play();
    });
    actions.Idle?.setEffectiveWeight(1);
  }, [actions]);

  useTrailWalker(group, progress, actions, {
    yawOffset: Math.PI, // the Soldier model faces -Z
    walkClipSpeed: 1.6,
    runClipSpeed: 5.0,
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.15} />
    </group>
  );
}

export default function Hiker({ progress }: { progress: ProgressRef }) {
  const rpmAvailable = useAssetAvailable(RPM_HIKER_URL);
  if (rpmAvailable === null) return null;
  return rpmAvailable ? (
    <RpmHiker progress={progress} />
  ) : (
    <SoldierHiker progress={progress} />
  );
}

useGLTF.preload(SOLDIER_URL);
