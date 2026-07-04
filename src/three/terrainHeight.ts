import { createNoise2D } from 'simplex-noise';

// Deterministic PRNG so the mountain is identical on every visit and the
// camera curve (whose heights are derived from this function) always fits.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const noise2D = createNoise2D(mulberry32(4217));

export const TERRAIN_SIZE = 900;
export const TERRAIN_SEGMENTS = 220;
export const PEAK = { x: 0, z: -60, height: 78, sigma: 62 };
// Alpine lake in the valley east of the trailhead approach.
// Constants verified numerically (scratchpad/lakecheck.mjs): shoreline
// stays between r=11.5 and r=21.5 and never reaches the water plane edge.
export const LAKE = { x: 95, z: 130, radius: 22, waterY: 0.8, sigma: 14, depth: 8 };

/** Ridged fractal detail: sharp alpine ridges rather than soft hills. */
function ridgedFbm(x: number, z: number): number {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let max = 0;
  for (let i = 0; i < 5; i++) {
    const n = 1 - Math.abs(noise2D(x * frequency, z * frequency));
    sum += n * n * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return sum / max; // 0..1
}

/**
 * World-space terrain height. One authored main peak (gaussian) guarantees
 * the summit location; ridged noise supplies the alpine texture, scaled up
 * near the peak so detail reads as rock faces, gentler in the valley.
 */
export function terrainHeight(x: number, z: number): number {
  const dx = x - PEAK.x;
  const dz = z - PEAK.z;
  const d2 = dx * dx + dz * dz;
  const peak = PEAK.height * Math.exp(-d2 / (2 * PEAK.sigma * PEAK.sigma));

  const detailScale = 4 + peak * 0.22; // rougher up high
  const detail = ridgedFbm(x * 0.012, z * 0.012) * detailScale;

  // Secondary far ridges framing the horizon
  const backdrop =
    Math.max(0, -z - 120) * 0.16 * (0.6 + ridgedFbm(x * 0.004 + 9, z * 0.004));

  // carve the lake basin — depth modulated by noise so the shoreline
  // contour is irregular, plus a wide shore berm that keeps the
  // surrounding valley floor above the waterline (the water's edge is
  // then always a terrain contour, never the water plane's rim)
  const lx = x - LAKE.x;
  const lz = z - LAKE.z;
  const ld2 = lx * lx + lz * lz;
  const basinMod = 0.7 + 0.6 * ridgedFbm(x * 0.02 + 31, z * 0.02 + 17);
  const basin =
    LAKE.depth * basinMod * Math.exp(-ld2 / (2 * LAKE.sigma * LAKE.sigma));
  const berm = 3.0 * Math.exp(-ld2 / (2 * 30 * 30));

  return peak + detail + backdrop + berm - basin;
}

/**
 * Height of the RENDERED terrain mesh at (x, z) — interpolates the exact
 * triangles PlaneGeometry generates, unlike the analytic terrainHeight().
 * Anything that must sit flush on the visible ground (trail ribbon, the
 * hiker's feet, props) samples this.
 */
export function gridHeight(x: number, z: number): number {
  const half = TERRAIN_SIZE / 2;
  const cell = TERRAIN_SIZE / TERRAIN_SEGMENTS;
  const gx = Math.min(Math.max((x + half) / cell, 0), TERRAIN_SEGMENTS - 1e-6);
  const gz = Math.min(Math.max((z + half) / cell, 0), TERRAIN_SEGMENTS - 1e-6);
  const ix = Math.floor(gx);
  const iz = Math.floor(gz);
  const fx = gx - ix;
  const fz = gz - iz;
  const x0 = ix * cell - half;
  const x1 = x0 + cell;
  const z0 = iz * cell - half;
  const z1 = z0 + cell;
  const h00 = terrainHeight(x0, z0);
  const h10 = terrainHeight(x1, z0);
  const h01 = terrainHeight(x0, z1);
  const h11 = terrainHeight(x1, z1);
  // PlaneGeometry splits each cell along the (x0,z1)-(x1,z0) diagonal
  if (fx + fz <= 1) {
    return h00 + (h10 - h00) * fx + (h01 - h00) * fz;
  }
  return h11 + (h01 - h11) * (1 - fx) + (h10 - h11) * (1 - fz);
}
