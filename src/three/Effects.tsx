import React from 'react';
import {
  EffectComposer,
  Bloom,
  Vignette,
  SMAA,
} from '@react-three/postprocessing';

interface EffectsProps {
  tier: 'high' | 'low';
}

/**
 * Post stack: subtle bloom, light vignette, SMAA for edges. No ambient
 * occlusion — the only darkening in the scene is cloud shadows.
 */
export default function Effects({ tier }: EffectsProps) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={tier === 'high' ? 0.35 : 0.25}
        luminanceThreshold={0.92}
        luminanceSmoothing={0.2}
      />
      <SMAA />
      <Vignette offset={0.14} darkness={0.42} />
    </EffectComposer>
  );
}
