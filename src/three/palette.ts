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
  fog: '#dbe7f2',
  fogDensityNear: 0.0024,
  fogDensityFar: 0.0009,
  sun: '#fff3dd',
  hemiSky: '#9cc4ec',
  hemiGround: '#75855e',
  grass: '#557d3f',
  grassAlt: '#6b9152',
  rock: '#8d8f94',
  rockDeep: '#66686e',
  snow: '#f7fafd',
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
