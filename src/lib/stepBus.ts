// Tiny event bus connecting the hiker's animation (lazy 3D chunk) to the
// ambient audio (main bundle). Zero imports — must never pull three.js
// into the eager bundle.

type StepListener = (strength: number, foot: 0 | 1) => void;

const listeners = new Set<StepListener>();

/** Called by the hiker each time a foot visibly plants. */
export function emitStep(strength: number, foot: 0 | 1): void {
  listeners.forEach((cb) => cb(strength, foot));
}

export function onStep(cb: StepListener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
