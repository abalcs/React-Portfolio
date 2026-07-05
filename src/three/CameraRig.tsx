import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { trailCurve } from './curve';
import { gridHeight } from './terrainHeight';
import { ProgressRef } from './hooks/useScrollProgress';

const FOLLOW_DIST = 22;
const FOLLOW_HEIGHT = 10;
const BASE_FOV = 58;
const SUMMIT_FOV = 70; // widen for the summit reveal

/**
 * Third-person follow camera: trails behind the hiker looking up-trail,
 * kept above the terrain on switchback bends, with mouse parallax.
 */
export default function CameraRig({
  progress,
  frozen = false,
}: {
  progress: ProgressRef;
  /** true while a panel is open — mouse parallax eases off entirely */
  frozen?: boolean;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const mouse = useRef({ x: 0, y: 0 });
  const influence = useRef(1);

  const hiker = useRef(new THREE.Vector3());
  const tangent = useRef(new THREE.Vector3());
  const perp = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const initialized = useRef(false);
  const groundClamp = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame(({ clock }, delta) => {
    const t = THREE.MathUtils.clamp(progress.current, 0.0005, 0.9995);
    const time = clock.elapsedTime;

    // ease mouse influence out while a panel is open
    influence.current = THREE.MathUtils.damp(
      influence.current,
      frozen ? 0 : 1,
      6,
      delta
    );
    const mx = mouse.current.x * influence.current;
    const my = mouse.current.y * influence.current;

    trailCurve.getPointAt(t, hiker.current);
    trailCurve.getTangentAt(t, tangent.current);
    perp.current.set(-tangent.current.z, 0, tangent.current.x).normalize();

    // behind and above the hiker, with lateral mouse orbit + idle sway
    desired.current
      .copy(hiker.current)
      .addScaledVector(tangent.current, -FOLLOW_DIST)
      .addScaledVector(perp.current, mx * 4 + Math.sin(time * 0.25) * 1.2);
    desired.current.y +=
      FOLLOW_HEIGHT - my * 2.5 + Math.sin(time * 0.18) * 0.5;

    // never sink into a hillside — but a hard max() snaps the camera on
    // sharp ridges, so the clamp itself is smoothed: it RISES quickly
    // (can't clip into rock) and RELEASES slowly (no drop-off jolt).
    // Look-ahead samples anticipate the ridge instead of reacting to it.
    const gHere = gridHeight(desired.current.x, desired.current.z);
    const gMid = gridHeight(
      (desired.current.x + hiker.current.x) / 2,
      (desired.current.z + hiker.current.z) / 2
    );
    const clampTarget = Math.max(gHere, gMid) + 2.8;
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
      const k = 1 - Math.exp(-4.5 * delta);
      camera.position.lerp(desired.current, k);
    }

    // look at the hiker's head, biased slightly up-trail
    look.current
      .copy(hiker.current)
      .addScaledVector(tangent.current, 6)
      .setY(hiker.current.y + 2.2 - my * 2);
    camera.lookAt(look.current);

    const fov = THREE.MathUtils.lerp(
      BASE_FOV,
      SUMMIT_FOV,
      THREE.MathUtils.smoothstep(t, 0.85, 1)
    );
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
