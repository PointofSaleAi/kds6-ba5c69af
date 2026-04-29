import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type SideEdge = 'left' | 'right';
export type BarEdge = 'top' | 'bottom';
export type DockEdge = SideEdge | BarEdge;
export type DockPanel = 'mainSidebar' | 'summaryPanel' | 'bottomBar';

export interface DockLayout {
  mainSidebar: SideEdge;
  summaryPanel: SideEdge;
  bottomBar: BarEdge;
}

const DEFAULT_LAYOUT: DockLayout = {
  mainSidebar: 'left',
  summaryPanel: 'right',
  bottomBar: 'bottom',
};

const STORAGE_KEY = 'kds.dock-layout.v1';

interface DockLayoutContextValue {
  layout: DockLayout;
  setDock: (panel: DockPanel, edge: DockEdge) => void;
  resetLayout: () => void;
}

const DockLayoutContext = createContext<DockLayoutContextValue | null>(null);

function loadInitial(): DockLayout {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw) as Partial<DockLayout>;
    return {
      mainSidebar: parsed.mainSidebar === 'right' ? 'right' : 'left',
      summaryPanel: parsed.summaryPanel === 'left' ? 'left' : 'right',
      bottomBar: parsed.bottomBar === 'top' ? 'top' : 'bottom',
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export function DockLayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<DockLayout>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {
      /* ignore */
    }
  }, [layout]);

  const setDock = useCallback((panel: DockPanel, edge: DockEdge) => {
    setLayout(prev => {
      if (panel === 'bottomBar') {
        if (edge !== 'top' && edge !== 'bottom') return prev;
        if (prev.bottomBar === edge) return prev;
        return { ...prev, bottomBar: edge };
      }
      if (edge !== 'left' && edge !== 'right') return prev;
      if (prev[panel] === edge) return prev;
      return { ...prev, [panel]: edge };
    });
  }, []);

  const resetLayout = useCallback(() => setLayout(DEFAULT_LAYOUT), []);

  const value = useMemo(() => ({ layout, setDock, resetLayout }), [layout, setDock, resetLayout]);

  return <DockLayoutContext.Provider value={value}>{children}</DockLayoutContext.Provider>;
}

export function useDockLayout(): DockLayoutContextValue {
  const ctx = useContext(DockLayoutContext);
  if (!ctx) throw new Error('useDockLayout must be used within DockLayoutProvider');
  return ctx;
}
