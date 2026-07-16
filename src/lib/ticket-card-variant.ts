import type { TicketsRouteKey } from '@/hooks/use-kds-settings';

export type CardVariant =
  | 'default'
  | 'v1'
  | 'v2'
  | 'v3'
  | 'v4'
  | 'v5'
  | 'v6'
  | 'v7'
  | 'v8'
  | 'v9'
  | 'v10'
  | 'v11'
  | 'v12'
  | 'v13';

export const TICKETS_ROUTE_STORAGE_KEY = 'kds-tickets-route';
export const TICKETS_ROUTE_CHANGE_EVENT = 'kds:tickets-route-change';

const ROUTE_TO_CARD_VARIANT: Record<TicketsRouteKey, CardVariant> = {
  Default: 'default',
  v1: 'default',
  v2: 'v1',
  v3: 'v2',
  v4: 'v3',
  v5: 'v4',
  v6: 'v5',
  v7: 'v6',
  v8: 'v7',
  v9: 'v8',
  v10: 'v9',
  v11: 'v10',
  v12: 'v11',
  v13: 'v12',
  v14: 'v13',
};

const CARD_VARIANT_TO_ROUTE: Record<CardVariant, TicketsRouteKey> = {
  default: 'v1',
  v1: 'v2',
  v2: 'v3',
  v3: 'v4',
  v4: 'v5',
  v5: 'v6',
  v6: 'v7',
  v7: 'v8',
  v8: 'v9',
  v9: 'v10',
  v10: 'v11',
  v11: 'v12',
  v12: 'v13',
  v13: 'v14',
};

const VALID_ROUTES: readonly TicketsRouteKey[] = [
  'Default', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13', 'v14',
];

export function normalizeTicketsRoute(value: string | null | undefined, fallback: TicketsRouteKey = 'v3'): TicketsRouteKey {
  if (value && (VALID_ROUTES as readonly string[]).includes(value)) {
    return value as TicketsRouteKey;
  }
  return fallback;
}

export function getCardVariantForTicketsRoute(route: TicketsRouteKey): CardVariant {
  return ROUTE_TO_CARD_VARIANT[route];
}

export function getTicketsRouteForCardVariant(cardVariant: CardVariant, legacyActions = false): TicketsRouteKey {
  if (legacyActions && cardVariant === 'default') return 'Default';
  return CARD_VARIANT_TO_ROUTE[cardVariant];
}

export function getTicketsRoutePath(route: TicketsRouteKey): string {
  return route === 'Default' ? '/kds/default' : `/kds/${route}`;
}

export function readStoredTicketsRoute(fallback: TicketsRouteKey = 'v3'): TicketsRouteKey {
  if (typeof window === 'undefined') return fallback;
  return normalizeTicketsRoute(window.localStorage.getItem(TICKETS_ROUTE_STORAGE_KEY), fallback);
}

export function writeStoredTicketsRoute(route: TicketsRouteKey) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TICKETS_ROUTE_STORAGE_KEY, route);
  window.dispatchEvent(new CustomEvent(TICKETS_ROUTE_CHANGE_EVENT, { detail: route }));
}

/**
 * Display names for each Ticket Layout route in the settings picker.
 */
export const TICKETS_ROUTE_LABELS: Record<TicketsRouteKey, string> = {
  Default: 'Default',
  v1: 'v1',
  v2: 'v2',
  v3: 'v3',
  v4: 'v4',
  v5: 'v5',
  v6: 'v6',
  v7: 'Calm Board',
  v8: 'Focus Lane',
  v9: 'Distance View',
  v10: 'Progressive Ticket',
  v11: 'Safety First',
  v12: 'Timeline Flow',
  v13: 'Adaptive Density',
  v14: 'Dark Command Center',
};
