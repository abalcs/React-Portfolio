import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';

export const MODELS_BASE = `${process.env.PUBLIC_URL}/assets/models`;
export const ANIMS_BASE = `${process.env.PUBLIC_URL}/assets/anims`;

/**
 * Does a runtime asset actually exist? The CRA dev server answers 200
 * with index.html for ANY path (SPA fallback), so content-type must be
 * checked too. Lets the scene upgrade itself when avatar files appear.
 */
export function useAssetAvailable(url: string): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(url, { method: 'HEAD' })
      .then((res) => {
        const type = res.headers.get('content-type') ?? '';
        if (alive) setAvailable(res.ok && !type.includes('text/html'));
      })
      .catch(() => {
        if (alive) setAvailable(false);
      });
    return () => {
      alive = false;
    };
  }, [url]);
  return available;
}

/** Load animation clips from separate GLB files, renamed to given keys. */
export function useExternalClips(
  map: Record<string, string>
): THREE.AnimationClip[] {
  const urls = useMemo(() => Object.values(map), [map]);
  const gltfs = useGLTF(urls) as unknown as Array<{
    animations: THREE.AnimationClip[];
  }>;
  return useMemo(
    () =>
      Object.keys(map).map((name, i) => {
        const clip = gltfs[i].animations[0].clone();
        clip.name = name;
        return clip;
      }),
    [gltfs, map]
  );
}

/** Find a bone whether the rig prefixes names (mixamorig:) or not. */
export function findBone(
  root: THREE.Object3D,
  name: string
): THREE.Object3D | undefined {
  return (
    root.getObjectByName(name) ??
    root.getObjectByName(`mixamorig:${name}`) ??
    root.getObjectByName(`mixamorig${name}`)
  );
}

/** Strap the signature orange pack + trekking pole onto a humanoid rig. */
export function attachHikerGear(scene: THREE.Object3D) {
  const spine = findBone(scene, 'Spine2');
  if (spine && !spine.getObjectByName('hikerPack')) {
    const ws = new THREE.Vector3();
    spine.getWorldScale(ws);
    const inv = 1 / (ws.x || 1);
    const pack = new THREE.Group();
    pack.name = 'hikerPack';
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 10),
      new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.85 })
    );
    body.scale.set(1, 1.3, 0.6);
    body.castShadow = false;
    const roll = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, 0.2, 4, 8),
      new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.85 })
    );
    roll.rotation.z = Math.PI / 2;
    roll.position.y = 0.3;
    roll.castShadow = false;
    pack.add(body, roll);
    pack.scale.setScalar(inv);
    pack.position.set(0, 0.06 * inv, -0.16 * inv);
    spine.add(pack);
  }

  const hand = findBone(scene, 'RightHand');
  if (hand && !hand.getObjectByName('hikerPole')) {
    const ws = new THREE.Vector3();
    hand.getWorldScale(ws);
    const inv = 1 / (ws.x || 1);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.026, 1.35, 8),
      new THREE.MeshStandardMaterial({ color: '#7a5b3a', roughness: 0.85 })
    );
    pole.name = 'hikerPole';
    pole.castShadow = false;
    pole.scale.setScalar(inv);
    pole.position.set(0, -0.35 * inv, 0.02 * inv);
    hand.add(pole);
  }
}

export function enableShadows(scene: THREE.Object3D) {
  scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = false;
      obj.frustumCulled = false; // skinned bounds lag the animation
    }
  });
}

interface RpmFigureProps {
  modelUrl: string;
  clipUrl: string;
  position: [number, number, number];
  rotationY: number;
  scale?: number;
}

/** A stationary Ready Player Me character playing an idle loop. */
export function RpmFigure({
  modelUrl,
  clipUrl,
  position,
  rotationY,
  scale = 1,
}: RpmFigureProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelUrl) as unknown as { scene: THREE.Group };
  const clipMap = useMemo(() => ({ Idle: clipUrl }), [clipUrl]);
  const clips = useExternalClips(clipMap);
  const { actions } = useAnimations(clips, group);

  useEffect(() => enableShadows(scene), [scene]);
  useEffect(() => {
    actions.Idle?.reset().play();
  }, [actions]);

  return (
    <group
      ref={group}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
    >
      <primitive object={scene} />
    </group>
  );
}
