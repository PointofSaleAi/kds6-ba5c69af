import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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


export interface KDSSettings {
  cardsPerRow: number;
  textSize: TextSize;
  showAllergens: boolean;
  showHeaderAllergens: boolean;
  sortDefault: SortDefault;
  staggerMode: boolean;
  servableModifiers: boolean;
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
}

interface KDSSettingsContextValue extends KDSSettings {
  setCardsPerRow: (v: number) => void;
  setTextSize: (v: TextSize) => void;
  setShowAllergens: (v: boolean) => void;
  setShowHeaderAllergens: (v: boolean) => void;
  setSortDefault: (v: SortDefault) => void;
  setStaggerMode: (v: boolean) => void;
  setServableModifiers: (v: boolean) => void;
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
}

const STORAGE_KEY = 'posai-kds-settings-v3';
const LEGACY_STORAGE_KEYS = ['posai-kds-settings-v2'];


const defaults: KDSSettings = {
  cardsPerRow: 4,
  textSize: 'Standard',
  showAllergens: true,
  showHeaderAllergens: true,
  sortDefault: 'By time',
  staggerMode: false,
  servableModifiers: false,
  timezone: 'auto',
  currency: 'USD',
  tempUnit: 'F',
  weekStart: 'Sunday',
  orderTypeColors: { ...DEFAULT_ORDER_TYPE_COLORS },
  orderTypeDetailedColors: { ...DEFAULT_ORDER_TYPE_DETAILED_COLORS },
  ticketHeaderLayout: 'kitchen',
  expoSendButtonMode: 'when-ready',
  ticketLayout: 'standard',
  ticketSpacing: 'Compact',
  ticketHeaderStyle: 'default',
};

function loadSettings(): KDSSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate from legacy storage but discard old order type color defaults
      // so the refreshed manufacturer palette takes effect.
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
    return parsed;
  } catch {
    return defaults;
  }
}


const KDSSettingsContext = createContext<KDSSettingsContextValue | null>(null);

export function KDSSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<KDSSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = <K extends keyof KDSSettings>(key: K) => (value: KDSSettings[K]) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  return (
    <KDSSettingsContext.Provider
      value={{
        ...settings,
        setCardsPerRow: update('cardsPerRow'),
        setTextSize: update('textSize'),
        setShowAllergens: update('showAllergens'),
        setShowHeaderAllergens: update('showHeaderAllergens'),
        setSortDefault: update('sortDefault'),
        setStaggerMode: update('staggerMode'),
        setServableModifiers: update('servableModifiers'),
        setTimezone: update('timezone'),
        setCurrency: update('currency'),
        setTempUnit: update('tempUnit'),
        setWeekStart: update('weekStart'),
        setOrderTypeColors: update('orderTypeColors'),
        setOrderTypeDetailedColors: update('orderTypeDetailedColors'),
        setTicketHeaderLayout: update('ticketHeaderLayout'),
        setExpoSendButtonMode: update('expoSendButtonMode'),
        setTicketLayout: update('ticketLayout'),
        setTicketSpacing: update('ticketSpacing'),
        setTicketHeaderStyle: update('ticketHeaderStyle'),
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
