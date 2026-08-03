import type { CSSProperties } from 'react';
import { LIGHT_SKIN, DARK_SKIN, type GlassSkin } from '@/components/kds/glass/glass-theme';

/**
 * App-wide ticket skin. The glass board's LIGHT_SKIN / DARK_SKIN stay the
 * canonical source of truth; this module extends them with the extra tokens
 * the non-glass boards and layout cards need, and exposes everything as CSS
 * custom properties so class-based markup can consume them via
 * `bg-[var(--tkt-card)]`, `text-[var(--tkt-text)]`, ... .
 */
export interface TicketSkinExtras {
  /** Page / board background behind the cards. */
  surface: string;
  /** Solid (non translucent) card fill for dense layouts. */
  cardSolid: string;
  /** Neutral chip surface (qty bubbles, mode pills). */
  chipBg: string;
  chipFg: string;
  /** Order-note (amber) block. */
  noteBg: string;
  noteBorder: string;
  noteFg: string;
  /** Allergen text/inline emphasis (not the glossy chip). */
  allergenText: string;
  allergenSoftBg: string;
  /** Modifier colors. */
  modAdd: string;
  modRemove: string;
  modNeutral: string;
  /** Secondary allergen tones used by board chips. */
  amberBg: string;
  amberFg: string;
  blueBg: string;
  blueFg: string;
  /** Aging ring unfilled track. */
  ringTrack: string;
  /** Ready (outlined green) + served (filled green) action visuals. */
  readyBg: string;
  readyFg: string;
  readyBorder: string;
  servedBg: string;
  servedFg: string;
  /** Cooking (dome) action visual. */
  cookingBg: string;
  cookingFg: string;
  /** Idle action icon color. */
  iconIdle: string;
  /** Row hover wash. */
  hover: string;
  /** Accent used by lane/course boards. */
  accent: string;
  accentFg: string;
  /** Strong header surface (order-type / command bars). */
  headerBg: string;
  headerFg: string;
}

export type TicketSkin = GlassSkin & TicketSkinExtras;

const LIGHT_EXTRAS: TicketSkinExtras = {
  surface: '#F0F2F5',
  cardSolid: '#FFFFFF',
  chipBg: 'rgba(120,130,150,0.12)',
  chipFg: '#2C3E50',
  noteBg: 'rgba(255,246,214,0.92)',
  noteBorder: 'rgba(226,183,60,0.55)',
  noteFg: '#8A5A00',
  allergenText: '#C0392B',
  allergenSoftBg: 'rgba(251,234,234,0.95)',
  modAdd: '#2471A3',
  modRemove: '#C0392B',
  modNeutral: 'rgba(60,60,67,0.68)',
  amberBg: 'rgba(255,243,214,0.95)',
  amberFg: '#8A5A00',
  blueBg: 'rgba(227,240,250,0.95)',
  blueFg: '#1D6FA5',
  ringTrack: '#E5E7EB',
  readyBg: '#DCFCE7',
  readyFg: '#16A34A',
  readyBorder: '#16A34A',
  servedBg: '#16A34A',
  servedFg: '#FFFFFF',
  cookingBg: '#374151',
  cookingFg: '#FFFFFF',
  iconIdle: '#6C7A89',
  hover: 'rgba(0,0,0,0.04)',
  accent: '#16A085',
  accentFg: '#FFFFFF',
  headerBg: '#1A1A2E',
  headerFg: '#FFFFFF',
};

const DARK_EXTRAS: TicketSkinExtras = {
  surface: '#0D0D1A',
  cardSolid: 'rgba(32,34,45,0.94)',
  chipBg: 'rgba(255,255,255,0.12)',
  chipFg: '#f3f5f9',
  noteBg: 'rgba(96,72,18,0.55)',
  noteBorder: 'rgba(226,183,60,0.35)',
  noteFg: '#F6D98A',
  allergenText: '#FF9C90',
  allergenSoftBg: 'rgba(120,32,26,0.55)',
  modAdd: '#7FC0F5',
  modRemove: '#FF9C90',
  modNeutral: 'rgba(233,237,245,0.62)',
  amberBg: 'rgba(96,72,18,0.6)',
  amberFg: '#F6D98A',
  blueBg: 'rgba(24,58,88,0.7)',
  blueFg: '#9FD1F7',
  ringTrack: 'rgba(255,255,255,0.14)',
  readyBg: 'rgba(22,163,74,0.22)',
  readyFg: '#5EE39B',
  readyBorder: 'rgba(94,227,155,0.65)',
  servedBg: '#16A34A',
  servedFg: '#0b0b0c',
  cookingBg: 'rgba(255,255,255,0.9)',
  cookingFg: '#14141a',
  iconIdle: 'rgba(233,237,245,0.7)',
  hover: 'rgba(255,255,255,0.07)',
  accent: '#4FD1B5',
  accentFg: '#08201c',
  headerBg: 'rgba(12,12,22,0.92)',
  headerFg: '#f3f5f9',
};

export const LIGHT_TICKET_SKIN: TicketSkin = { ...LIGHT_SKIN, ...LIGHT_EXTRAS };
export const DARK_TICKET_SKIN: TicketSkin = { ...DARK_SKIN, ...DARK_EXTRAS };

export function resolveTicketSkin(theme: 'light' | 'dark' | undefined): TicketSkin {
  return theme === 'dark' ? DARK_TICKET_SKIN : LIGHT_TICKET_SKIN;
}

/** Maps a resolved skin to the `--tkt-*` custom properties. */
export function ticketSkinVars(skin: TicketSkin): CSSProperties {
  return {
    '--tkt-card': skin.card,
    '--tkt-card-solid': skin.cardSolid,
    '--tkt-card-border': skin.cardBorder,
    '--tkt-card-shadow': skin.cardShadow,
    '--tkt-sheen': skin.sheen,
    '--tkt-surface': skin.surface,
    '--tkt-text': skin.text,
    '--tkt-text-2': skin.textSecondary,
    '--tkt-text-3': skin.textMuted,
    '--tkt-hairline': skin.hairline,
    '--tkt-panel': skin.panel,
    '--tkt-btn-bg': skin.btnBg,
    '--tkt-btn-border': skin.btnBorder,
    '--tkt-btn-fg': skin.btnFg,
    '--tkt-fill': skin.fill,
    '--tkt-fill-fg': skin.fillFg,
    '--tkt-fill-border': skin.fillBorder,
    '--tkt-chip-bg': skin.chipBg,
    '--tkt-chip-fg': skin.chipFg,
    '--tkt-note-bg': skin.noteBg,
    '--tkt-note-border': skin.noteBorder,
    '--tkt-note-fg': skin.noteFg,
    '--tkt-allergen-bg': skin.allergenBg,
    '--tkt-allergen-fg': skin.allergenFg,
    '--tkt-allergen-text': skin.allergenText,
    '--tkt-allergen-soft': skin.allergenSoftBg,
    '--tkt-mod-add': skin.modAdd,
    '--tkt-mod-remove': skin.modRemove,
    '--tkt-mod-neutral': skin.modNeutral,
    '--tkt-amber-bg': skin.amberBg,
    '--tkt-amber-fg': skin.amberFg,
    '--tkt-blue-bg': skin.blueBg,
    '--tkt-blue-fg': skin.blueFg,
    '--tkt-ring-track': skin.ringTrack,
    '--tkt-ready-bg': skin.readyBg,
    '--tkt-ready-fg': skin.readyFg,
    '--tkt-ready-border': skin.readyBorder,
    '--tkt-served-bg': skin.servedBg,
    '--tkt-served-fg': skin.servedFg,
    '--tkt-cooking-bg': skin.cookingBg,
    '--tkt-cooking-fg': skin.cookingFg,
    '--tkt-icon': skin.iconIdle,
    '--tkt-hover': skin.hover,
    '--tkt-accent': skin.accent,
    '--tkt-accent-fg': skin.accentFg,
    '--tkt-header-bg': skin.headerBg,
    '--tkt-header-fg': skin.headerFg,
  } as CSSProperties;
}
