import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type TextSize = 'Compact' | 'Standard' | 'Large';
export type SortDefault = 'By Time' | 'By Table' | 'By Type';
export type TempUnit = 'F' | 'C';
export type WeekStart = 'Sunday' | 'Monday';
export type TicketHeaderLayout = 'kitchen' | 'guest';

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
  'take-out': '#2980B9',
  'delivery': '#16A085',
  'banquet': '#F59E0B',
  'drive-thru': '#8E44AD',
  'curb-side': '#10B981',
  'scheduled': '#2C3E50',
  'phone-in': '#D35400',
  'custom': '#6B7280',
};

export const DEFAULT_ORDER_TYPE_DETAILED_COLORS: OrderTypeDetailedColors = {
  'dine-in': { headerBg: '#1A1A2E', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'take-out': { headerBg: '#2980B9', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'delivery': { headerBg: '#16A085', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'banquet': { headerBg: '#F59E0B', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'drive-thru': { headerBg: '#8E44AD', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'curb-side': { headerBg: '#10B981', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'scheduled': { headerBg: '#2C3E50', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'phone-in': { headerBg: '#D35400', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
  'custom': { headerBg: '#6B7280', headerText: '#FFFFFF', ticketNumber: '#2C3E50', bodyText: '#6C7A89' },
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
}

const STORAGE_KEY = 'posai-kds-settings';

const defaults: KDSSettings = {
  cardsPerRow: 4,
  textSize: 'Standard',
  showAllergens: true,
  sortDefault: 'By Time',
  staggerMode: false,
  servableModifiers: true,
  timezone: 'auto',
  currency: 'USD',
  tempUnit: 'F',
  weekStart: 'Sunday',
  orderTypeColors: { ...DEFAULT_ORDER_TYPE_COLORS },
  orderTypeDetailedColors: { ...DEFAULT_ORDER_TYPE_DETAILED_COLORS },
  ticketHeaderLayout: 'kitchen',
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
