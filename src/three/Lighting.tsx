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
        intensity={2.4}
        color={palette.sun}
        castShadow={shadows}
        // clouds are the only casters — soft blobs need no fine detail
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-260}
        shadow-camera-right={260}
        shadow-camera-top={260}
        shadow-camera-bottom={-260}
        shadow-camera-near={50}
        shadow-camera-far={900}
        // near-zero depth bias + normal offset = shadows attach at the
        // contact point instead of floating away (peter-panning)
        shadow-bias={-0.00005}
        shadow-normalBias={0.9}
        shadow-radius={5}
      />
      {/* small fill only — the HDRI environment supplies sky/bounce light */}
      <hemisphereLight args={[palette.hemiSky, palette.hemiGround, 0.3]} />
    </>
  );
}
