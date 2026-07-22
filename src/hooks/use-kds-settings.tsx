import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';


export type TextSize = 'Compact' | 'Standard' | 'Large';
export type SortDefault = 'By time' | 'By table' | 'By type';
export type TempUnit = 'F' | 'C';
export type WeekStart = 'Sunday' | 'Monday';
export type TicketHeaderLayout = 'kitchen' | 'guest';
export type ExpoSendButtonMode = 'always' | 'when-ready';
export type TicketLayout = 'standard' | 'compact' | 'header';
export type TicketSpacing = 'Compact' | 'Standard' | 'Spacious';
export type TicketHeaderStyle = 'default' | 'v1' | 'v2' | 'v3';

export type OrderTypeColors = Record<string, string>;

export interface OrderTypeColorSet {
  headerBg: string;
  headerText: string;
  ticketNumber: string;
  bodyText: string;
}

export type OrderTypeDetailedColors = Record<string, OrderTypeColorSet>;

export const DEFAULT_ORDER_TYPE_COLORS: OrderTypeColors = {
  'dine-in': '#1A1A2E',
  'take-out': '#DB2777',
  'delivery': '#7C3AED',
  'banquet': '#0E7490',
  'drive-thru': '#15803D',
  'curb-side': '#134E4A',
  'scheduled': '#3730A3',
  'phone-in': '#334155',
  'custom': '#581C87',
};

export const DEFAULT_ORDER_TYPE_DETAILED_COLORS: OrderTypeDetailedColors = {
  'dine-in': { headerBg: '#1A1A2E', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'take-out': { headerBg: '#DB2777', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'delivery': { headerBg: '#7C3AED', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'banquet': { headerBg: '#0E7490', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'drive-thru': { headerBg: '#15803D', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'curb-side': { headerBg: '#134E4A', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'scheduled': { headerBg: '#3730A3', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'phone-in': { headerBg: '#334155', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'custom': { headerBg: '#581C87', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
};

export type TicketsRouteKey = 'Default' | 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6';
export const TICKETS_ROUTE_KEYS: TicketsRouteKey[] = ['Default', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6'];

export interface RouteOverride {
  textSize?: TextSize;
  ticketSpacing?: TicketSpacing;
  ticketLayout?: TicketLayout;
  ticketHeaderLayout?: TicketHeaderLayout;
}

export type RouteOverrides = Partial<Record<TicketsRouteKey, RouteOverride>>;

export const DEFAULT_QUICK_REPLIES: string[] = [
  'Got it',
  '5 min out',
  'Item unavailable',
  'On it',
  'Need more time',
];

export interface KDSSettings {
  cardsPerRow: number;
  textSize: TextSize;
  showAllergens: boolean;
  showHeaderAllergens: boolean;
  sortDefault: SortDefault;
  staggerMode: boolean;
  servableModifiers: boolean;
  productTimers: boolean;
  orderHold: boolean;
  orderHoldMinutes: number;
  timezone: string;
  currency: string;
  tempUnit: TempUnit;
  weekStart: WeekStart;
  orderTypeColors: OrderTypeColors;
  orderTypeDetailedColors: OrderTypeDetailedColors;
  ticketHeaderLayout: TicketHeaderLayout;
  expoSendButtonMode: ExpoSendButtonMode;
  ticketLayout: TicketLayout;
  ticketSpacing: TicketSpacing;
  ticketHeaderStyle: TicketHeaderStyle;
  routeOverrides: RouteOverrides;
  reducedMotion: boolean;
  quickReplies: boolean;
  quickReplyItems: string[];
}

interface KDSSettingsContextValue extends KDSSettings {
  setCardsPerRow: (v: number) => void;
  setTextSize: (v: TextSize) => void;
  setShowAllergens: (v: boolean) => void;
  setShowHeaderAllergens: (v: boolean) => void;
  setSortDefault: (v: SortDefault) => void;
  setStaggerMode: (v: boolean) => void;
  setServableModifiers: (v: boolean) => void;
  setProductTimers: (v: boolean) => void;
  setOrderHold: (v: boolean) => void;
  setOrderHoldMinutes: (v: number) => void;
  setTimezone: (v: string) => void;
  setCurrency: (v: string) => void;
  setTempUnit: (v: TempUnit) => void;
  setWeekStart: (v: WeekStart) => void;
  setOrderTypeColors: (v: OrderTypeColors) => void;
  setOrderTypeDetailedColors: (v: OrderTypeDetailedColors) => void;
  setTicketHeaderLayout: (v: TicketHeaderLayout) => void;
  setExpoSendButtonMode: (v: ExpoSendButtonMode) => void;
  setTicketLayout: (v: TicketLayout) => void;
  setTicketSpacing: (v: TicketSpacing) => void;
  setTicketHeaderStyle: (v: TicketHeaderStyle) => void;
  setReducedMotion: (v: boolean) => void;
  /** Currently-active tickets route ('Default'..'v6') or null when not on a tickets route. */
  activeTicketsRoute: TicketsRouteKey | null;
  getRouteSetting: <K extends keyof RouteOverride>(route: TicketsRouteKey, key: K) => NonNullable<RouteOverride[K]>;
  setRouteSetting: <K extends keyof RouteOverride>(route: TicketsRouteKey, key: K, value: NonNullable<RouteOverride[K]>) => void;
}

const STORAGE_KEY = 'posai-kds-settings-v7';
const LEGACY_STORAGE_KEYS = ['posai-kds-settings-v6', 'posai-kds-settings-v5', 'posai-kds-settings-v4', 'posai-kds-settings-v3', 'posai-kds-settings-v2'];


const defaults: KDSSettings = {
  cardsPerRow: 4,
  textSize: 'Standard',
  showAllergens: true,
  showHeaderAllergens: true,
  sortDefault: 'By time',
  staggerMode: false,
  servableModifiers: false,
  productTimers: false,
  orderHold: false,
  orderHoldMinutes: 5,
  timezone: 'auto',
  currency: 'USD',
  tempUnit: 'F',
  weekStart: 'Sunday',
  orderTypeColors: { ...DEFAULT_ORDER_TYPE_COLORS },
  orderTypeDetailedColors: { ...DEFAULT_ORDER_TYPE_DETAILED_COLORS },
  ticketHeaderLayout: 'kitchen',
  expoSendButtonMode: 'when-ready',
  ticketLayout: 'standard',
  ticketSpacing: 'Standard',
  ticketHeaderStyle: 'default',
  routeOverrides: {},
  reducedMotion: false,
};

function loadSettings(): KDSSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacy = localStorage.getItem(legacyKey);
        if (legacy) {
          try {
            const parsedLegacy = JSON.parse(legacy);
            delete parsedLegacy.orderTypeColors;
            delete parsedLegacy.orderTypeDetailedColors;
            localStorage.removeItem(legacyKey);
            const migrated = { ...defaults, ...parsedLegacy };
            migrated.servableModifiers = false;
            migrated.routeOverrides = migrated.routeOverrides || {};
            return migrated;
          } catch {
            localStorage.removeItem(legacyKey);
          }
        }
      }
      return defaults;
    }
    const parsed = { ...defaults, ...JSON.parse(raw) };
    const sortMigration: Record<string, SortDefault> = {
      'By Time': 'By time',
      'By Table': 'By table',
      'By Type': 'By type',
    };
    if (parsed.sortDefault && sortMigration[parsed.sortDefault as string]) {
      parsed.sortDefault = sortMigration[parsed.sortDefault as string];
    }
    parsed.servableModifiers = false;
    parsed.routeOverrides = parsed.routeOverrides || {};
    return parsed;
  } catch {
    return defaults;
  }
}

function pathToRouteKey(pathname: string): TicketsRouteKey | null {
  if (/^\/kds\/v1\/settings(?:\/|$)/i.test(pathname)) return null;
  const m = pathname.match(/^\/kds\/(default|v[1-6])(?:\/|$)/i);
  if (!m) return null;
  const seg = m[1].toLowerCase();
  if (seg === 'default') return 'Default';
  return seg as TicketsRouteKey;
}

const KDSSettingsContext = createContext<KDSSettingsContextValue | null>(null);

export function KDSSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<KDSSettings>(loadSettings);
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/',
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', update);
    // Patch pushState/replaceState to emit updates for SPA navigation.
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;
    window.history.pushState = function (...args) {
      const r = origPush.apply(this, args as any);
      update();
      return r;
    };
    window.history.replaceState = function (...args) {
      const r = origReplace.apply(this, args as any);
      update();
      return r;
    };
    return () => {
      window.removeEventListener('popstate', update);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, []);
  const activeTicketsRoute = useMemo(() => pathToRouteKey(pathname), [pathname]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = <K extends keyof KDSSettings>(key: K) => (value: KDSSettings[K]) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const getRouteSetting = <K extends keyof RouteOverride>(route: TicketsRouteKey, key: K): NonNullable<RouteOverride[K]> => {
    const override = settings.routeOverrides?.[route]?.[key];
    if (override !== undefined) return override as NonNullable<RouteOverride[K]>;
    return settings[key] as NonNullable<RouteOverride[K]>;
  };

  const setRouteSetting = <K extends keyof RouteOverride>(route: TicketsRouteKey, key: K, value: NonNullable<RouteOverride[K]>) => {
    setSettings(prev => ({
      ...prev,
      routeOverrides: {
        ...prev.routeOverrides,
        [route]: { ...(prev.routeOverrides?.[route] || {}), [key]: value },
      },
    }));
  };

  // Route-aware setters: when on a tickets route, write to per-route override.
  const setPerRoute = <K extends keyof RouteOverride>(key: K) => (value: NonNullable<RouteOverride[K]>) => {
    if (activeTicketsRoute) {
      setRouteSetting(activeTicketsRoute, key, value);
    } else {
      update(key as keyof KDSSettings)(value as KDSSettings[keyof KDSSettings]);
    }
  };

  const effectiveTextSize = activeTicketsRoute ? getRouteSetting(activeTicketsRoute, 'textSize') : settings.textSize;
  const effectiveSpacing = activeTicketsRoute ? getRouteSetting(activeTicketsRoute, 'ticketSpacing') : settings.ticketSpacing;
  const effectiveLayout = activeTicketsRoute ? getRouteSetting(activeTicketsRoute, 'ticketLayout') : settings.ticketLayout;
  const effectiveHeaderLayout = activeTicketsRoute ? getRouteSetting(activeTicketsRoute, 'ticketHeaderLayout') : settings.ticketHeaderLayout;

  return (
    <KDSSettingsContext.Provider
      value={{
        ...settings,
        textSize: effectiveTextSize,
        ticketSpacing: effectiveSpacing,
        ticketLayout: effectiveLayout,
        ticketHeaderLayout: effectiveHeaderLayout,
        setCardsPerRow: update('cardsPerRow'),
        setTextSize: setPerRoute('textSize'),
        setShowAllergens: update('showAllergens'),
        setShowHeaderAllergens: update('showHeaderAllergens'),
        setSortDefault: update('sortDefault'),
        setStaggerMode: update('staggerMode'),
        setServableModifiers: update('servableModifiers'),
        setProductTimers: update('productTimers'),
        setOrderHold: update('orderHold'),
        setOrderHoldMinutes: update('orderHoldMinutes'),
        setTimezone: update('timezone'),
        setCurrency: update('currency'),
        setTempUnit: update('tempUnit'),
        setWeekStart: update('weekStart'),
        setOrderTypeColors: update('orderTypeColors'),
        setOrderTypeDetailedColors: update('orderTypeDetailedColors'),
        setTicketHeaderLayout: setPerRoute('ticketHeaderLayout'),
        setExpoSendButtonMode: update('expoSendButtonMode'),
        setTicketLayout: setPerRoute('ticketLayout'),
        setTicketSpacing: setPerRoute('ticketSpacing'),
        setTicketHeaderStyle: update('ticketHeaderStyle'),
        setReducedMotion: update('reducedMotion'),
        activeTicketsRoute,
        getRouteSetting,
        setRouteSetting,
      }}
    >
      {children}
    </KDSSettingsContext.Provider>
  );
}

export function useKDSSettings() {
  const ctx = useContext(KDSSettingsContext);
  if (!ctx) throw new Error('useKDSSettings must be used within KDSSettingsProvider');
  return ctx;
}

/**
 * Overrides the effective per-route settings within its subtree so a
 * preview renders as if the app were on the given tickets route.
 */
export function KDSSettingsPreviewScope({
  route,
  children,
}: {
  route: TicketsRouteKey;
  children: ReactNode;
}) {
  const ctx = useContext(KDSSettingsContext);
  if (!ctx) throw new Error('KDSSettingsPreviewScope must be used within KDSSettingsProvider');
  const value: KDSSettingsContextValue = {
    ...ctx,
    textSize: ctx.getRouteSetting(route, 'textSize'),
    ticketSpacing: ctx.getRouteSetting(route, 'ticketSpacing'),
    ticketLayout: ctx.getRouteSetting(route, 'ticketLayout'),
    ticketHeaderLayout: ctx.getRouteSetting(route, 'ticketHeaderLayout'),
    setTextSize: (v) => ctx.setRouteSetting(route, 'textSize', v),
    setTicketSpacing: (v) => ctx.setRouteSetting(route, 'ticketSpacing', v),
    setTicketLayout: (v) => ctx.setRouteSetting(route, 'ticketLayout', v),
    setTicketHeaderLayout: (v) => ctx.setRouteSetting(route, 'ticketHeaderLayout', v),
    activeTicketsRoute: route,
  };
  return <KDSSettingsContext.Provider value={value}>{children}</KDSSettingsContext.Provider>;
}
