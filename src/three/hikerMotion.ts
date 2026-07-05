import { MutableRefObject, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { trailCurve } from './curve';
import { gridHeight } from './terrainHeight';
import { emitStep } from '../lib/stepBus';
import { ProgressRef } from './hooks/useScrollProgress';

export interface WalkerConfig {
  /** rotation to add so the model's visual forward matches +tangent */
  yawOffset: number;
  /** authored ground speed of the walk clip (m/s) — kills foot sliding */
  walkClipSpeed: number;
  runClipSpeed: number;
}

interface WalkerActions {
  [key: string]: THREE.AnimationAction | null;
}

/**
 * Drives any rigged humanoid along the trail: position/facing from the
 * damped scroll progress, Idle/Walk/Run blending from real ground speed,
 * and footstep events for the audio engine.
 */
export function useTrailWalker(
  group: MutableRefObject<THREE.Group | null>,
  progress: ProgressRef,
  actions: WalkerActions,
  config: WalkerConfig
) {
  const curveLength = useMemo(() => trailCurve.getLength(), []);
  const phase = useRef(0);
  const lastStepIndex = useRef(0);
  const lastT = useRef(0);
  const facing = useRef(1); // 1 = up-trail, -1 = down-trail
  const yaw = useRef(0);
  const pos = useRef(new THREE.Vector3());
  const tangent = useRef(new THREE.Vector3());
  const weights = useRef({ move: 0, run: 0 });

  useFrame((_, delta) => {
    if (!group.current) return;
    const t = THREE.MathUtils.clamp(progress.current, 0.0005, 0.9995);

    trailCurve.getPointAt(t, pos.current);
    trailCurve.getTangentAt(t, tangent.current);
    pos.current.y = gridHeight(pos.current.x, pos.current.z) + 0.05;
    group.current.position.copy(pos.current);

    // face the direction of actual travel — about-face when descending
    const dp = t - lastT.current;
    if (dp > 1e-5) facing.current = 1;
    else if (dp < -1e-5) facing.current = -1;

    const targetYaw =
      Math.atan2(
        tangent.current.x * facing.current,
        tangent.current.z * facing.current
      ) + config.yawOffset;
    const diff =
      ((targetYaw - yaw.current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    yaw.current += diff * Math.min(1, delta * 6);
    group.current.rotation.y = yaw.current;

    // locomotion blend from real ground speed
    const travel = Math.abs(dp) * curveLength;
    lastT.current = t;
    const speed = travel / Math.max(delta, 1e-4);

    const moveTarget = THREE.MathUtils.smoothstep(speed, 0.08, 0.9);
    const runTarget = THREE.MathUtils.smoothstep(speed, 3.2, 5.4);
    weights.current.move = THREE.MathUtils.damp(
      weights.current.move,
      moveTarget,
      8,
      delta
    );
    weights.current.run = THREE.MathUtils.damp(
      weights.current.run,
      runTarget,
      6,
      delta
    );

    const idle = actions.Idle;
    const walk = actions.Walk;
    const run = actions.Run;
    if (idle && walk && run) {
      const { move, run: r } = weights.current;
      idle.setEffectiveWeight(1 - move);
      walk.setEffectiveWeight(move * (1 - r));
      run.setEffectiveWeight(move * r);
      walk.setEffectiveTimeScale(
        THREE.MathUtils.clamp(speed / config.walkClipSpeed, 0.6, 2.4)
      );
      run.setEffectiveTimeScale(
        THREE.MathUtils.clamp(speed / config.runClipSpeed, 0.7, 1.6)
      );
    }

    // footstep events for the audio engine
    const stride = THREE.MathUtils.clamp(speed * 0.045, 0, 0.75);
    phase.current += speed * delta * 1.6;
    const stepIndex = Math.floor(phase.current / Math.PI);
    if (stepIndex !== lastStepIndex.current && stride > 0.06) {
      lastStepIndex.current = stepIndex;
      emitStep(Math.min(1, stride / 0.75), (stepIndex % 2) as 0 | 1);
    }
  });
}
