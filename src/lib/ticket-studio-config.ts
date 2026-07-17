import type { TicketsRouteKey } from '@/hooks/use-kds-settings';

export type TSLayout = 'compact' | 'standard' | 'spacious';
export type TSDensity = 'low' | 'medium' | 'high';
export type TSTextSize = 'small' | 'medium' | 'large';
export type TSIdentifier = 'order' | 'guest' | 'table';
export type TSSafety = 'muted' | 'bright' | 'highlighted';
export type TSTheme = 'light' | 'dark' | 'auto';

export type TicketStudioBoardId =
  | 'calm-board'
  | 'focus-lane'
  | 'distance-view'
  | 'progressive-ticket'
  | 'safety-first'
  | 'timeline-flow'
  | 'adaptive-density'
  | 'dark-command-center';

export interface TicketStudioConfig {
  board: TicketStudioBoardId;
  layout: TSLayout;
  density: TSDensity;
  textSize: TSTextSize;
  identifier: TSIdentifier;
  safety: TSSafety;
  theme: TSTheme;
}

export const TICKET_STUDIO_STORAGE_KEY = 'kds-ticket-studio-config';
export const TICKET_STUDIO_CHANGE_EVENT = 'kds:ticket-studio-change';

export const DEFAULT_TICKET_STUDIO_CONFIG: TicketStudioConfig = {
  board: 'calm-board',
  layout: 'standard',
  density: 'medium',
  textSize: 'large',
  identifier: 'order',
  safety: 'highlighted',
  theme: 'light',
};

/** Best-fit mapping of a Ticket Studio board to the existing card variant route. */
export const BOARD_TO_ROUTE: Record<TicketStudioBoardId, TicketsRouteKey> = {
  'calm-board': 'v4',
  'focus-lane': 'v3',
  'distance-view': 'v1',
  'progressive-ticket': 'v2',
  'safety-first': 'Default',
  'timeline-flow': 'v5',
  'adaptive-density': 'v6',
  'dark-command-center': 'v4',
};

export function readTicketStudioConfig(): TicketStudioConfig {
  if (typeof window === 'undefined') return DEFAULT_TICKET_STUDIO_CONFIG;
  try {
    const raw = window.localStorage.getItem(TICKET_STUDIO_STORAGE_KEY);
    if (!raw) return DEFAULT_TICKET_STUDIO_CONFIG;
    return { ...DEFAULT_TICKET_STUDIO_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TICKET_STUDIO_CONFIG;
  }
}

export function writeTicketStudioConfig(config: TicketStudioConfig) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TICKET_STUDIO_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent(TICKET_STUDIO_CHANGE_EVENT, { detail: config }));
}
