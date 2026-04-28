import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type TextSize = 'Compact' | 'Standard' | 'Large';
export type SortDefault = 'By Time' | 'By Table' | 'By Type';
export type TempUnit = 'F' | 'C';
export type WeekStart = 'Sunday' | 'Monday';
export type TicketHeaderLayout = 'kitchen' | 'guest';
export type ExpoSendButtonMode = 'always' | 'when-ready';
export type TicketLayout = 'standard' | 'compact';
export type TicketSpacing = 'Compact' | 'Standard' | 'Spacious';

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
  'take-out': '#1B4F8A',
  'delivery': '#5B21B6',
  'banquet': '#1F4E79',
  'drive-thru': '#065F46',
  'curb-side': '#0E7460',
  'scheduled': '#1E3A5F',
  'phone-in': '#164E63',
  'custom': '#312E81',
};

export const DEFAULT_ORDER_TYPE_DETAILED_COLORS: OrderTypeDetailedColors = {
  'dine-in': { headerBg: '#1A1A2E', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'take-out': { headerBg: '#1B4F8A', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'delivery': { headerBg: '#5B21B6', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'banquet': { headerBg: '#1F4E79', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'drive-thru': { headerBg: '#065F46', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'curb-side': { headerBg: '#0E7460', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'scheduled': { headerBg: '#1E3A5F', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'phone-in': { headerBg: '#164E63', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'custom': { headerBg: '#312E81', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
};

export interface KDSSettings {
  cardsPerRow: number;
  textSize: TextSize;
  showAllergens: boolean;
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
}

interface KDSSettingsContextValue extends KDSSettings {
  setCardsPerRow: (v: number) => void;
  setTextSize: (v: TextSize) => void;
  setShowAllergens: (v: boolean) => void;
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
}

const STORAGE_KEY = 'posai-kds-settings-v2';

const defaults: KDSSettings = {
  cardsPerRow: 4,
  textSize: 'Standard',
  showAllergens: true,
  sortDefault: 'By Time',
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
};

function loadSettings(): KDSSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
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
