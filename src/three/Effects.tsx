import React from 'react';
import {
  EffectComposer,
  Bloom,
  Vignette,
  SMAA,
  N8AO,
  BrightnessContrast,
  HueSaturation,
} from '@react-three/postprocessing';

interface EffectsProps {
  tier: 'high' | 'low';
}

/**
 * Film-grade post stack: mild AO for contact depth on the PBR surfaces,
 * subtle bloom, SMAA, light vignette.
 */
export default function Effects({ tier }: EffectsProps) {
  return (
    <EffectComposer multisampling={0}>
      {tier === 'high' ? (
        <N8AO
          halfRes
          aoRadius={1.4}
          intensity={1.6}
          distanceFalloff={1}
          quality="performance"
        />
      ) : (
        <></>
      )}
      <Bloom
        mipmapBlur
        intensity={tier === 'high' ? 0.35 : 0.25}
        luminanceThreshold={0.92}
        luminanceSmoothing={0.2}
      />
      <SMAA />
      {/* cinematic grade: gentle contrast + saturation lift */}
      <BrightnessContrast contrast={0.07} brightness={0.01} />
      <HueSaturation saturation={0.1} />
      <Vignette offset={0.14} darkness={0.42} />
    </EffectComposer>
  );
}
