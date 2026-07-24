import type { TicketsRouteKey } from '@/hooks/use-kds-settings';

export type CardVariant = 'default' | 'v1' | 'v2' | 'v3' | 'v4' | 'v5';

export const TICKETS_ROUTE_STORAGE_KEY = 'kds-tickets-route';
export const TICKETS_ROUTE_CHANGE_EVENT = 'kds:tickets-route-change';

const ROUTE_TO_CARD_VARIANT: Record<TicketsRouteKey, CardVariant> = {
  Default: 'default',
  v1: 'default',
  v2: 'v1',
  v3: 'v2',
  'v3-lite': 'v2',
  v4: 'v3',
  v5: 'v4',
  v6: 'v5',
};

const CARD_VARIANT_TO_ROUTE: Record<CardVariant, TicketsRouteKey> = {
  default: 'v1',
  v1: 'v2',
  v2: 'v3',
  v3: 'v4',
  v4: 'v5',
  v5: 'v6',
};

export function normalizeTicketsRoute(value: string | null | undefined, fallback: TicketsRouteKey = 'v3'): TicketsRouteKey {
  if (value === 'Default' || value === 'v1' || value === 'v2' || value === 'v3' || value === 'v3-lite' || value === 'v4' || value === 'v5' || value === 'v6') {
    return value;
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