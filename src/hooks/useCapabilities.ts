import { useMemo } from 'react';

export interface Capabilities {
  webgl: boolean;
  reducedMotion: boolean;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return gl !== null;
  } catch {
    return false;
  }
}

function detectReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Detects whether the immersive 3D experience can run. When webgl is
 * unavailable (including jsdom in tests) or the user prefers reduced
 * motion, the app falls back to the classic 2D site.
 */
export function useCapabilities(): Capabilities {
  return useMemo(
    () => ({
      webgl: detectWebGL(),
      reducedMotion: detectReducedMotion(),
    }),
    []
  );
}
