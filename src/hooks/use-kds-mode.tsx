import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type KDSMode = 'Standard' | 'Expo' | 'Prep';

interface KDSModeContextType {
  mode: KDSMode;
  setMode: (mode: KDSMode) => void;
}

const KDSModeContext = createContext<KDSModeContextType>({
  mode: 'Standard',
  setMode: () => {},
});

export function KDSModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<KDSMode>('Standard');

  return (
    <KDSModeContext.Provider value={{ mode, setMode }}>
      {children}
    </KDSModeContext.Provider>
  );
}

export function useKDSMode() {
  return useContext(KDSModeContext);
}
