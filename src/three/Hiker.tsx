import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { trailCurve } from './curve';
import { gridHeight } from './terrainHeight';
import { ACCENT } from './palette';
import { emitStep } from '../lib/stepBus';
import { ProgressRef } from './hooks/useScrollProgress';

const SKIN = '#e8c39e';
const PANTS = '#2b3648';
const BOOTS = '#1c2430';
const PACK = '#d97706';

/**
 * The explorer — a low-poly hiker who walks the glowing trail as the
 * user scrolls. Legs/arms swing with actual travel speed; a headlamp
 * lights the path at night.
 */
export default function Hiker({ progress }: { progress: ProgressRef }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  const curveLength = useMemo(() => trailCurve.getLength(), []);
  const phase = useRef(0);
  const lastStepIndex = useRef(0);
  const lastT = useRef(0);
  const facing = useRef(1); // 1 = up-trail, -1 = down-trail
  const yaw = useRef(0);
  const pos = useRef(new THREE.Vector3());
  const tangent = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = THREE.MathUtils.clamp(progress.current, 0.0005, 0.9995);

    trailCurve.getPointAt(t, pos.current);
    trailCurve.getTangentAt(t, tangent.current);
    // feet planted on the rendered trail surface
    pos.current.y = gridHeight(pos.current.x, pos.current.z) + 0.15;
    group.current.position.copy(pos.current);

    // face the way he's actually walking — turn around when descending
    const dp = t - lastT.current;
    if (dp > 1e-5) facing.current = 1;
    else if (dp < -1e-5) facing.current = -1;

    // wrap-safe yaw damping toward the direction of travel
    const targetYaw = Math.atan2(
      tangent.current.x * facing.current,
      tangent.current.z * facing.current
    );
    const diff =
      ((targetYaw - yaw.current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    yaw.current += diff * Math.min(1, delta * 6);
    group.current.rotation.y = yaw.current;

    // walk cycle from real travel speed
    const travel = Math.abs(dp) * curveLength;
    lastT.current = t;
    const speed = travel / Math.max(delta, 1e-4);
    const stride = THREE.MathUtils.clamp(speed * 0.045, 0, 0.75);
    phase.current += speed * delta * 1.6;

    // each half-cycle of the swing is one foot planting on the dirt
    const stepIndex = Math.floor(phase.current / Math.PI);
    if (stepIndex !== lastStepIndex.current && stride > 0.06) {
      lastStepIndex.current = stepIndex;
      emitStep(Math.min(1, stride / 0.75), (stepIndex % 2) as 0 | 1);
    }

    const swing = Math.sin(phase.current) * stride;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.8;
    if (armR.current) armR.current.rotation.x = swing * 0.8;

    // bob while walking, gentle breath while idle
    if (body.current) {
      const bob = Math.abs(Math.sin(phase.current)) * 0.06 * stride;
      const breathe = Math.sin(state.clock.elapsedTime * 1.8) * 0.012;
      body.current.position.y = bob + breathe;
    }
  });

  return (
    <group ref={group}>
      <group ref={body}>
        {/* legs — rounded capsule limbs, pivot at hips */}
        {[
          { side: 0.13, ref: legL },
          { side: -0.13, ref: legR },
        ].map(({ side, ref }) => (
          <group key={side} ref={ref} position={[side, 0.95, 0]}>
            <mesh position={[0, -0.24, 0]}>
              <capsuleGeometry args={[0.1, 0.34, 4, 10]} />
              <meshStandardMaterial color={PANTS} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.62, 0.01]}>
              <capsuleGeometry args={[0.08, 0.3, 4, 10]} />
              <meshStandardMaterial color={PANTS} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.89, 0.06]}>
              <capsuleGeometry args={[0.085, 0.14, 4, 8]} />
              <meshStandardMaterial color={BOOTS} roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* hips */}
        <mesh position={[0, 0.98, 0]} scale={[1, 0.8, 0.82]}>
          <sphereGeometry args={[0.23, 12, 10]} />
          <meshStandardMaterial color={PANTS} roughness={0.85} />
        </mesh>

        {/* torso — expedition jacket, shoulders wider than waist */}
        <mesh position={[0, 1.32, 0]} scale={[1, 1, 0.76]}>
          <capsuleGeometry args={[0.26, 0.36, 6, 14]} />
          <meshStandardMaterial color={ACCENT} roughness={0.75} />
        </mesh>
        {/* jacket zip line */}
        <mesh position={[0, 1.32, 0.195]}>
          <boxGeometry args={[0.025, 0.5, 0.015]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} />
        </mesh>
        {/* backpack straps over the shoulders */}
        {[0.13, -0.13].map((x) => (
          <mesh key={x} position={[x, 1.42, 0.19]} rotation={[0.08, 0, 0]}>
            <boxGeometry args={[0.07, 0.44, 0.03]} />
            <meshStandardMaterial color="#b45309" roughness={0.85} />
          </mesh>
        ))}

        {/* backpack — rounded, with top roll */}
        <mesh position={[0, 1.36, -0.31]} scale={[1, 1.25, 0.62]}>
          <sphereGeometry args={[0.22, 12, 10]} />
          <meshStandardMaterial color={PACK} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.68, -0.29]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.09, 0.22, 4, 8]} />
          <meshStandardMaterial color="#b45309" roughness={0.85} />
        </mesh>

        {/* arms — capsules with hands, pivot at shoulders */}
        <group ref={armL} position={[0.32, 1.56, 0]}>
          <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0.1]}>
            <capsuleGeometry args={[0.075, 0.24, 4, 10]} />
            <meshStandardMaterial color={ACCENT} roughness={0.75} />
          </mesh>
          <mesh position={[0.02, -0.52, 0.04]} rotation={[-0.18, 0, 0.06]}>
            <capsuleGeometry args={[0.065, 0.22, 4, 10]} />
            <meshStandardMaterial color={ACCENT} roughness={0.75} />
          </mesh>
          <mesh position={[0.04, -0.7, 0.08]}>
            <sphereGeometry args={[0.065, 8, 7]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
        </group>
        <group ref={armR} position={[-0.32, 1.56, 0]}>
          <mesh position={[0, -0.2, 0]} rotation={[0, 0, -0.1]}>
            <capsuleGeometry args={[0.075, 0.24, 4, 10]} />
            <meshStandardMaterial color={ACCENT} roughness={0.75} />
          </mesh>
          <mesh position={[-0.02, -0.52, 0.04]} rotation={[-0.18, 0, -0.06]}>
            <capsuleGeometry args={[0.065, 0.22, 4, 10]} />
            <meshStandardMaterial color={ACCENT} roughness={0.75} />
          </mesh>
          <mesh position={[-0.04, -0.7, 0.08]}>
            <sphereGeometry args={[0.065, 8, 7]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
          {/* trekking pole — gripped in the right hand, swings with it */}
          <mesh position={[-0.04, -1.1, 0.18]} rotation={[0.22, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.045, 1.7, 8]} />
            <meshStandardMaterial color="#7a5b3a" roughness={0.85} />
          </mesh>
        </group>

        {/* neck, head, face, beanie, headlamp */}
        <mesh position={[0, 1.63, 0]}>
          <cylinderGeometry args={[0.06, 0.075, 0.1, 8]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.79, 0]} scale={[0.92, 1, 0.94]}>
          <sphereGeometry args={[0.165, 14, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
        {[0.055, -0.055].map((x) => (
          <mesh key={x} position={[x, 1.8, 0.14]}>
            <sphereGeometry args={[0.017, 6, 6]} />
            <meshStandardMaterial color="#2a2620" roughness={0.4} />
          </mesh>
        ))}
        {/* beanie */}
        <mesh position={[0, 1.88, 0]} scale={[1, 0.72, 1]}>
          <sphereGeometry args={[0.165, 12, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.845, 0]}>
          <cylinderGeometry args={[0.168, 0.172, 0.055, 12]} />
          <meshStandardMaterial color="#26343f" roughness={0.85} />
        </mesh>
        {/* headlamp */}
        <mesh position={[0, 1.86, 0.16]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 8]} />
          <meshStandardMaterial
            color="#fff7cc"
            emissive="#ffeda0"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          position={[0, 1.86, 1.1]}
          intensity={0.85}
          distance={14}
          color="#ffe9b8"
        />
      </group>
    </group>
  );
}
