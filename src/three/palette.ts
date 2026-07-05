// Single source of truth for scene colors. ACCENT/TEAL mirror the
// hardcoded Tailwind accent colors in tailwind.config.js.
export const ACCENT = '#22c55e';
export const TEAL = '#14b8a6';

export interface ScenePalette {
  skyTop: string;
  skyBottom: string;
  fog: string;
  fogDensityNear: number; // valley (progress 0)
  fogDensityFar: number; // summit (progress 1)
  sun: string;
  hemiSky: string;
  hemiGround: string;
  grass: string;
  grassAlt: string;
  rock: string;
  rockDeep: string;
  snow: string;
}

// Clear alpine day — the primary look.
export const DAY: ScenePalette = {
  skyTop: '#2f74d0',
  skyBottom: '#cfe5f7',
  // thin haze tinted to the HDRI's horizon — distance cue, not overcast
  fog: '#c3d2e2',
  fogDensityNear: 0.0011,
  fogDensityFar: 0.0004,
  sun: '#fff3dd',
  hemiSky: '#9cc4ec',
  hemiGround: '#6d7c57',
  grass: '#4e7638',
  grassAlt: '#628a48',
  rock: '#8f8a82',
  rockDeep: '#6b665f',
  snow: '#ffffff',
};

// Night palette — kept for a future night mode.
export const NIGHT: ScenePalette = {
  skyTop: '#03060f',
  skyBottom: '#0c1524',
  fog: '#0a1220',
  fogDensityNear: 0.0042,
  fogDensityFar: 0.0016,
  sun: '#b8ccee',
  hemiSky: '#16303f',
  hemiGround: '#05080f',
  grass: '#1b2a22',
  grassAlt: '#22332a',
  rock: '#1c2848',
  rockDeep: '#0d1628',
  snow: '#dde4ed',
};
