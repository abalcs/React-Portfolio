import { useMemo } from 'react';

export type PerfTier = 'high' | 'low';

/**
 * Coarse device tier: phones and low-memory devices get reduced DPR,
 * particle counts, and effects. Wow factor is the priority, so the bar
 * for "high" is generous — this only exists so weak devices still run.
 */
export function usePerfTier(): PerfTier {
  return useMemo(() => {
    try {
      const smallScreen = window.matchMedia('(max-width: 768px)').matches;
      const memory = (navigator as any).deviceMemory as number | undefined;
      const lowMemory = memory !== undefined && memory <= 4;
      return smallScreen || lowMemory ? 'low' : 'high';
    } catch {
      return 'low';
    }
  }, []);
}
