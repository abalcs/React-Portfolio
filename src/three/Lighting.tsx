import React from 'react';
import { ScenePalette } from './palette';
import { SUN_POSITION } from './DaySky';

interface LightingProps {
  palette: ScenePalette;
  shadows: boolean;
}

export default function Lighting({ palette, shadows }: LightingProps) {
  return (
    <>
      {/* warm sun key light */}
      <directionalLight
        position={SUN_POSITION}
        intensity={1.85}
        color={palette.sun}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-260}
        shadow-camera-right={260}
        shadow-camera-top={260}
        shadow-camera-bottom={-260}
        shadow-camera-near={50}
        shadow-camera-far={900}
        shadow-bias={-0.0004}
        shadow-radius={4}
      />
      {/* blue-sky / meadow bounce — generous so unlit sides read as
          "shade" rather than "shadow" */}
      <hemisphereLight args={[palette.hemiSky, palette.hemiGround, 1.05]} />
      <ambientLight intensity={0.26} />
    </>
  );
}
