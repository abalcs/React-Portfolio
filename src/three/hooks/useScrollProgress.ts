import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type ProgressRef = React.MutableRefObject<number>;

// Hard ceiling on how fast the journey can advance, in progress-units/sec.
// Damping alone scales speed with how far the scroll target has run ahead,
// so an aggressive fling would send the hiker sprinting; this cap keeps
// even a top-to-bottom jump to a brisk ~11s traverse.
const MAX_RATE = 0.09;

/**
 * Owns the single damped scroll-progress value (0..1) that every scene
 * system (hiker, camera, fog, labels) reads, so they all stay in
 * lockstep. Raw scroll sets a target; each frame damps toward it so the
 * journey stays buttery regardless of scroll jitter.
 */
export function ProgressDriver({
  progress,
  damping = 3.2,
}: {
  progress: ProgressRef;
  damping?: number;
}) {
  const target = useRef(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target.current =
        max > 0 ? THREE.MathUtils.clamp(window.scrollY / max, 0, 1) : 0;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useFrame((_, delta) => {
    const next = THREE.MathUtils.damp(
      progress.current,
      target.current,
      damping,
      delta
    );
    const maxStep = MAX_RATE * delta;
    progress.current += THREE.MathUtils.clamp(
      next - progress.current,
      -maxStep,
      maxStep
    );
  });

  return null;
}
