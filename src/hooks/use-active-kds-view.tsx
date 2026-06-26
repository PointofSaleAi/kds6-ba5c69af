import { createContext, useContext, useState, ReactNode } from 'react';

export type ActiveKDSView = 'home' | 'history' | 'seen-orders' | 'unseen-orders' | null;

interface Ctx {
  view: ActiveKDSView;
  setView: (v: ActiveKDSView) => void;
}

const ActiveKDSViewContext = createContext<Ctx>({ view: null, setView: () => {} });

export function ActiveKDSViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ActiveKDSView>(null);
  return (
    <ActiveKDSViewContext.Provider value={{ view, setView }}>
      {children}
    </ActiveKDSViewContext.Provider>
  );
}

export function useActiveKDSView() {
  return useContext(ActiveKDSViewContext);
}
