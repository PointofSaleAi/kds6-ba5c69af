import { useCallback, useEffect, useState } from 'react';
import type {
  KDSDensity, KDSSafetyEmphasis, TicketSpacing, TextSize, TicketHeaderLayout,
} from '@/hooks/use-kds-settings';

export type LSTheme = 'Light' | 'Dark' | 'Auto';
export type LSIdentifier = 'Order #' | 'Guest' | 'Table';
export type LSStation = 'Expediter' | 'Bar' | 'Prep 1' | 'Prep 2';

export interface LiveStudioDraft {
  layout: TicketSpacing;         // Compact | Standard | Spacious
  density: KDSDensity;           // Low | Medium | High
  textSize: TextSize;            // Compact | Standard | Large
  identifier: LSIdentifier;      // Order # | Guest | Table
  safety: KDSSafetyEmphasis;     // Muted | Bright | Highlighted
  theme: LSTheme;
  station: LSStation;
}

export const LS_DEFAULTS: LiveStudioDraft = {
  layout: 'Standard',
  density: 'Medium',
  textSize: 'Large',
  identifier: 'Order #',
  safety: 'Highlighted',
  theme: 'Dark',
  station: 'Expediter',
};

const FAV_KEY = 'kds.live-studio.favorites';
const PRESETS_KEY = 'kds.live-studio.presets';
const DRAFT_KEY = 'kds.live-studio.draft';

export interface LiveStudioPreset {
  id: string;
  name: string;
  boardId: string;
  config: LiveStudioDraft;
  createdAt: number;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => readJSON<string[]>(FAV_KEY, []));
  useEffect(() => { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); }, [favorites]);
  const toggle = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  return { favorites, toggle };
}

export function usePresets() {
  const [presets, setPresets] = useState<LiveStudioPreset[]>(() => readJSON<LiveStudioPreset[]>(PRESETS_KEY, []));
  useEffect(() => { localStorage.setItem(PRESETS_KEY, JSON.stringify(presets)); }, [presets]);
  const save = useCallback((name: string, boardId: string, config: LiveStudioDraft) => {
    const preset: LiveStudioPreset = {
      id: `preset-${Date.now()}`, name, boardId, config, createdAt: Date.now(),
    };
    setPresets((prev) => [preset, ...prev].slice(0, 12));
    return preset;
  }, []);
  const remove = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);
  return { presets, save, remove };
}

export function useDraft(initial: LiveStudioDraft) {
  const [draft, setDraft] = useState<LiveStudioDraft>(() => readJSON<LiveStudioDraft>(DRAFT_KEY, initial));
  useEffect(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }, [draft]);
  const set = useCallback(<K extends keyof LiveStudioDraft>(k: K, v: LiveStudioDraft[K]) => {
    setDraft((prev) => ({ ...prev, [k]: v }));
  }, []);
  const reset = useCallback(() => setDraft(initial), [initial]);
  return { draft, set, reset, setAll: setDraft };
}

/** Map inspector identifier value to app's TicketHeaderLayout setting. */
export function identifierToHeaderLayout(id: LSIdentifier): TicketHeaderLayout {
  // App only distinguishes 'kitchen' (order #) vs 'guest'; Table falls back to kitchen.
  return id === 'Guest' ? 'guest' : 'kitchen';
}
