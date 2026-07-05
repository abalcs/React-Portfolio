// Shared state bridging the SUV (lazy 3D chunk) and the audio engine
// (main bundle). Zero imports — must never pull three.js into the eager
// bundle.

export const engineState = {
  active: false,
  /** 0..1 normalized speed for engine pitch/volume */
  intensity: 0,
};

/** Read by the DOM layer (hero overlay) — written by the SUV each frame. */
export const suvTelemetry = {
  driving: false,
  distFromSpawn: 0,
};
