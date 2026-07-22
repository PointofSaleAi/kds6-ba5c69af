import { createContext, useContext, useState, type ReactNode } from 'react';

export type ScreenMode = 'pos' | 'kds' | 'cfd' | 'kiosk';

interface Ctx {
  mode: ScreenMode;
  setMode: (m: ScreenMode) => void;
}

const ScreenModeContext = createContext<Ctx>({ mode: 'kds', setMode: () => {} });

export function ScreenModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ScreenMode>('kds');
  return (
    <ScreenModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ScreenModeContext.Provider>
  );
}

export function useScreenMode() {
  return useContext(ScreenModeContext);
}
