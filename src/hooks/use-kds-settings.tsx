import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type TextSize = 'Compact' | 'Standard' | 'Large';
export type SortDefault = 'By Time' | 'By Table' | 'By Type';

export interface KDSSettings {
  cardsPerRow: number;
  textSize: TextSize;
  showAllergens: boolean;
  sortDefault: SortDefault;
  staggerMode: boolean;
  servableModifiers: boolean;
}

interface KDSSettingsContextValue extends KDSSettings {
  setCardsPerRow: (v: number) => void;
  setTextSize: (v: TextSize) => void;
  setShowAllergens: (v: boolean) => void;
  setSortDefault: (v: SortDefault) => void;
  setStaggerMode: (v: boolean) => void;
  setServableModifiers: (v: boolean) => void;
}

const STORAGE_KEY = 'posai-kds-settings';

const defaults: KDSSettings = {
  cardsPerRow: 4,
  textSize: 'Standard',
  showAllergens: true,
  sortDefault: 'By Time',
  staggerMode: false,
  servableModifiers: true,
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
