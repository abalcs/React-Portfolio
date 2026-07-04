import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { trailCurve } from './curve';
import { gridHeight } from './terrainHeight';
import { ACCENT } from './palette';
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
        {/* legs — pivot at hips */}
        <group ref={legL} position={[0.14, 0.85, 0]}>
          <mesh position={[0, -0.35, 0]}>
            <boxGeometry args={[0.18, 0.7, 0.18]} />
            <meshStandardMaterial color={PANTS} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, -0.72, 0.05]}>
            <boxGeometry args={[0.2, 0.16, 0.32]} />
            <meshStandardMaterial color={BOOTS} roughness={0.9} flatShading />
          </mesh>
        </group>
        <group ref={legR} position={[-0.14, 0.85, 0]}>
          <mesh position={[0, -0.35, 0]}>
            <boxGeometry args={[0.18, 0.7, 0.18]} />
            <meshStandardMaterial color={PANTS} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, -0.72, 0.05]}>
            <boxGeometry args={[0.2, 0.16, 0.32]} />
            <meshStandardMaterial color={BOOTS} roughness={0.9} flatShading />
          </mesh>
        </group>

        {/* torso — accent-green expedition jacket */}
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[0.52, 0.78, 0.32]} />
          <meshStandardMaterial
            color={ACCENT}
            roughness={0.7}
            flatShading
            emissive={ACCENT}
            emissiveIntensity={0.12}
          />
        </mesh>

        {/* backpack */}
        <mesh position={[0, 1.32, -0.3]}>
          <boxGeometry args={[0.38, 0.52, 0.24]} />
          <meshStandardMaterial color={PACK} roughness={0.8} flatShading />
        </mesh>
        <mesh position={[0, 1.62, -0.28]}>
          <boxGeometry args={[0.26, 0.14, 0.18]} />
          <meshStandardMaterial color="#b45309" roughness={0.8} flatShading />
        </mesh>

        {/* arms — pivot at shoulders */}
        <group ref={armL} position={[0.34, 1.55, 0]}>
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.14, 0.64, 0.14]} />
            <meshStandardMaterial color={ACCENT} roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, -0.68, 0]}>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} flatShading />
          </mesh>
        </group>
        <group ref={armR} position={[-0.34, 1.55, 0]}>
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.14, 0.64, 0.14]} />
            <meshStandardMaterial color={ACCENT} roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, -0.68, 0]}>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} flatShading />
          </mesh>
          {/* trekking pole — gripped in the right hand, swings with it */}
          <mesh position={[0, -1.1, 0.16]} rotation={[0.22, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.05, 1.75, 5]} />
            <meshStandardMaterial color="#7a5b3a" roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, -0.66, 0.06]}>
            <sphereGeometry args={[0.07, 6, 5]} />
            <meshStandardMaterial color="#3f3128" roughness={0.9} flatShading />
          </mesh>
        </group>

        {/* head + beanie + headlamp */}
        <mesh position={[0, 1.87, 0]}>
          <sphereGeometry args={[0.19, 8, 6]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} flatShading />
        </mesh>
        <mesh position={[0, 2.0, 0]}>
          <cylinderGeometry args={[0.2, 0.21, 0.12, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.8} flatShading />
        </mesh>
        <mesh position={[0, 1.9, 0.19]}>
          <boxGeometry args={[0.1, 0.07, 0.06]} />
          <meshStandardMaterial
            color="#fff7cc"
            emissive="#ffeda0"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          position={[0, 1.9, 1.1]}
          intensity={0.85}
          distance={14}
          color="#ffe9b8"
        />
      </group>
    </group>
  );
}
