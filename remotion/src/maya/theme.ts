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
  { id: 's9', dur: 216 },
] as const;

export const SCENE_STARTS = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].dur);
  return acc;
}, []);

export const TOTAL = SCENES.reduce((a, s) => a + s.dur, 0);
