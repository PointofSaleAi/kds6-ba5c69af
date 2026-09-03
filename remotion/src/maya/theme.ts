export const FPS = 30;

export const C = {
  bg0: '#05060C',
  bg1: '#0D0D1A',
  violet: '#7C3AED',
  magenta: '#E0399B',
  teal: '#16A085',
  blue: '#2980B9',
  blueBright: '#3B9BE0',
  cream: '#F0F2F5',
  ink: '#05060C',
  /** The only two text colours used in the film. */
  white: '#FFFFFF',
  pink: '#FF3D8B',
};

export const SHOT = {
  aiInstructions: 'shots/ai-instructions.png',
  menuChat: 'shots/menu-chat.png',
  menusync: 'shots/menusync.png',
  dashRail: 'shots/dash-rail.png',
  allRecs: 'shots/all-recs.png',
  askMaya: 'shots/ask-maya.png',
  askMaya2: 'shots/ask-maya-2.png',
  kdsBoard: 'shots/kds-board.png',
} as const;

/**
 * Trimmed screen recordings supplied by the client, pre-extracted to frame
 * sequences (the sandbox compositor segfaults on inline video decoding).
 */
export const CLIP = {
  s2Dash: { dir: 's2-dash', count: 315 },
  s3Dash: { dir: 's3-dash', count: 205 },
  s4Kds: { dir: 's4-kds', count: 375 },
  s5Dash: { dir: 's5-dash', count: 270 },
  s6Kds: { dir: 's6-kds', count: 286 },
  s7Pos: { dir: 's7-pos', count: 240 },
} as const;

/** The six product demos for the suite montage. */
export const SUITE = [
  { label: 'Point of Sale', dir: 't-pos' },
  { label: 'Kitchen Display', dir: 't-kds' },
  { label: 'Dashboard', dir: 't-dash' },
  { label: 'Guest Display', dir: 't-cfd' },
  { label: 'Kiosk', dir: 't-kiosk' },
  { label: 'InventoryOS', dir: 't-inv' },
] as const;

export const TILE_FRAMES = 270;

export const framePath = (dir: string, index: number, count: number) =>
  `frames/${dir}/f${String(Math.min(count, Math.max(1, index + 1))).padStart(4, '0')}.jpg`;

export const E_LOGO = 'e-logo.png';

export const LOGO_FRAMES = 114;

/** Scene durations in frames — derived from measured voiceover lengths. */
export const SCENES = [
  { id: 's1', dur: 258 },
  { id: 's2', dur: 285 },
  { id: 's3', dur: 193 },
  { id: 's4', dur: 356 },
  { id: 's5', dur: 243 },
  { id: 's6', dur: 260 },
  { id: 's7', dur: 197 },
  { id: 's8', dur: 271 },
  { id: 's9', dur: 240 },
  { id: 's10', dur: 130 },
] as const;

export const SCENE_STARTS = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].dur);
  return acc;
}, []);

export const TOTAL = SCENES.reduce((a, s) => a + s.dur, 0);
