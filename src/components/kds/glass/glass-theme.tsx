import { createContext, useContext, type ReactNode } from 'react';
import type { GlassStage } from './glass-tickets-data';

/**
 * Glass board skin. The glass design uses inline styles (ported 1:1 from the
 * reference HTML), so light/dark theming is threaded through this context
 * instead of Tailwind classes.
 */
export interface GlassSkin {
  dark: boolean;
  card: string;
  cardBorder: string;
  cardShadow: string;
  sheen: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  hairline: string;
  panel: string;
  panelHeader: string;
  panelBorder: string;
  panelShadow: string;
  btnBg: string;
  btnBorder: string;
  btnFg: string;
  fill: string;
  fillFg: string;
  fillBorder: string;
  allergenBg: string;
  allergenFg: string;
  allergenBorder: string;
  allergenShadow: string;
  /** Acknowledgement (order note seen): neutral grey shade + black tick. */
  ackBg: string;
  ackFg: string;
  ackBorder: string;
  ackRowBg: string;
}

export const LIGHT_SKIN: GlassSkin = {
  dark: false,
  card: 'rgba(255,255,255,0.62)',
  cardBorder: 'rgba(255,255,255,0.75)',
  cardShadow: '0 18px 44px rgba(28,33,54,0.16), inset 0 1px 0 rgba(255,255,255,0.95)',
  sheen: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0))',
  text: '#0b0b0c',
  textSecondary: 'rgba(60,60,67,0.8)',
  textMuted: 'rgba(60,60,67,0.62)',
  hairline: 'rgba(60,60,67,0.14)',
  panel: 'rgba(255,255,255,0.5)',
  panelHeader: 'rgba(120,130,150,0.1)',
  panelBorder: 'rgba(255,255,255,0.8)',
  panelShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
  btnBg: 'rgba(255,255,255,0.7)',
  btnBorder: 'rgba(255,255,255,0.9)',
  btnFg: '#0b0b0c',
  fill: 'rgba(20,20,24,0.92)',
  fillFg: '#ffffff',
  fillBorder: 'rgba(255,255,255,0.18)',
  allergenBg:
    'linear-gradient(180deg, rgba(255,250,249,0.97) 0%, rgba(255,234,231,0.9) 48%, rgba(252,208,202,0.78) 100%)',
  allergenFg: '#9e1f14',
  allergenBorder: 'rgba(255,255,255,0.85)',
  allergenShadow:
    '0 4px 10px rgba(158,31,20,0.22), inset 0 1.5px 0 rgba(255,255,255,0.9), inset 0 -2px 3px rgba(190,90,80,0.3)',
};

export const DARK_SKIN: GlassSkin = {
  dark: true,
  card: 'rgba(32,34,45,0.66)',
  cardBorder: 'rgba(255,255,255,0.12)',
  cardShadow: '0 18px 44px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10)',
  sheen: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0))',
  text: '#f3f5f9',
  textSecondary: 'rgba(233,237,245,0.78)',
  textMuted: 'rgba(233,237,245,0.58)',
  hairline: 'rgba(255,255,255,0.13)',
  panel: 'rgba(255,255,255,0.06)',
  panelHeader: 'rgba(255,255,255,0.08)',
  panelBorder: 'rgba(255,255,255,0.12)',
  panelShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
  btnBg: 'rgba(255,255,255,0.12)',
  btnBorder: 'rgba(255,255,255,0.18)',
  btnFg: '#f3f5f9',
  fill: 'rgba(245,246,250,0.94)',
  fillFg: '#14141a',
  fillBorder: 'rgba(255,255,255,0.28)',
  allergenBg: 'linear-gradient(180deg, rgba(120,32,26,0.9) 0%, rgba(94,24,19,0.9) 100%)',
  allergenFg: '#ffd9d4',
  allergenBorder: 'rgba(255,160,150,0.35)',
  allergenShadow: '0 4px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)',
};

export type GlassSafety = 'muted' | 'bright' | 'highlighted';

export interface GlassStyle {
  skin: GlassSkin;
  /** Multiplier on card-level padding (Spacing / Layout control). */
  padScale: number;
  /** Multiplier on item row padding (Density control). */
  rowScale: number;
  safety: GlassSafety;
  /** Appearance: compact hides secondary blocks, header emphasises the head. */
  appearance: 'compact' | 'standard' | 'header';
}

const DEFAULT_STYLE: GlassStyle = {
  skin: LIGHT_SKIN,
  padScale: 1,
  rowScale: 1,
  safety: 'bright',
  appearance: 'standard',
};

const GlassStyleContext = createContext<GlassStyle>(DEFAULT_STYLE);

export function GlassStyleProvider({ value, children }: { value: GlassStyle; children: ReactNode }) {
  return <GlassStyleContext.Provider value={value}>{children}</GlassStyleContext.Provider>;
}

export function useGlassStyle() {
  return useContext(GlassStyleContext);
}

export function useGlassSkin() {
  return useContext(GlassStyleContext).skin;
}

/** Allergen chip styles, themed. */
export function glossTicket(skin: GlassSkin): React.CSSProperties {
  return {
    padding: '8px 15px 9px',
    borderRadius: 999,
    background: skin.allergenBg,
    border: `1px solid ${skin.allergenBorder}`,
    color: skin.allergenFg,
    whiteSpace: 'nowrap',
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1,
    textShadow: skin.dark ? 'none' : '0 1px 0 rgba(255,255,255,0.8)',
    boxShadow: skin.allergenShadow,
  };
}

export function glossItem(skin: GlassSkin): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 11px 6px',
    borderRadius: 999,
    background: skin.allergenBg,
    border: `1px solid ${skin.allergenBorder}`,
    color: skin.allergenFg,
    whiteSpace: 'nowrap',
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1,
    letterSpacing: '0.05em',
    textShadow: skin.dark ? 'none' : '0 1px 0 rgba(255,255,255,0.75)',
    boxShadow: skin.allergenShadow,
  };
}

/** Stage visuals, themed. */
export function stageVisualsFor(stage: GlassStage, skin: GlassSkin) {
  const filled = stage === 'preparing' || stage === 'served';
  return {
    icon: (stage === 'unseen' ? 'eye' : stage === 'preparing' ? 'dome' : 'tick') as 'eye' | 'dome' | 'tick',
    sw: stage === 'ready' || stage === 'served' ? 2.6 : 1.9,
    bg: filled ? skin.fill : skin.btnBg,
    fg: filled ? skin.fillFg : skin.btnFg,
    border: filled ? skin.fillBorder : skin.btnBorder,
  };
}

/** Safety emphasis applied to allergen chips only. */
export function safetyStyle(safety: GlassSafety): React.CSSProperties {
  if (safety === 'muted') return { filter: 'saturate(0.35)', opacity: 0.85 };
  if (safety === 'highlighted') return { animation: 'glass-safety-pulse 1.4s ease-in-out infinite' };
  return { filter: 'saturate(1.25)' };
}
