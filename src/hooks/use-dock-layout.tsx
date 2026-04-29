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

export type DockLocks = Record<DockPanel, boolean>;

const DEFAULT_LAYOUT: DockLayout = {
  mainSidebar: 'left',
  summaryPanel: 'right',
  bottomBar: 'bottom',
};

const DEFAULT_LOCKS: DockLocks = {
  mainSidebar: true,
  summaryPanel: true,
  bottomBar: true,
};

const STORAGE_KEY = 'kds.dock-layout.v1';
const LOCKS_STORAGE_KEY = 'kds.dock-locks.v1';

interface DockLayoutContextValue {
  layout: DockLayout;
  locks: DockLocks;
  setDock: (panel: DockPanel, edge: DockEdge) => void;
  toggleLock: (panel: DockPanel) => void;
  isLocked: (panel: DockPanel) => boolean;
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

function loadInitialLocks(): DockLocks {
  if (typeof window === 'undefined') return DEFAULT_LOCKS;
  try {
    const raw = window.localStorage.getItem(LOCKS_STORAGE_KEY);
    if (!raw) return DEFAULT_LOCKS;
    const parsed = JSON.parse(raw) as Partial<DockLocks>;
    return {
      mainSidebar: parsed.mainSidebar !== false,
      summaryPanel: parsed.summaryPanel !== false,
      bottomBar: parsed.bottomBar !== false,
    };
  } catch {
    return DEFAULT_LOCKS;
  }
}

export function DockLayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<DockLayout>(loadInitial);
  const [locks, setLocks] = useState<DockLocks>(loadInitialLocks);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch { /* ignore */ }
  }, [layout]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCKS_STORAGE_KEY, JSON.stringify(locks));
    } catch { /* ignore */ }
  }, [locks]);

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

  const toggleLock = useCallback((panel: DockPanel) => {
    setLocks(prev => ({ ...prev, [panel]: !prev[panel] }));
  }, []);

  const isLocked = useCallback((panel: DockPanel) => locks[panel], [locks]);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    setLocks(DEFAULT_LOCKS);
  }, []);

  const value = useMemo(() => ({ layout, locks, setDock, toggleLock, isLocked, resetLayout }), [layout, locks, setDock, toggleLock, isLocked, resetLayout]);

  return <DockLayoutContext.Provider value={value}>{children}</DockLayoutContext.Provider>;
}

export function useDockLayout(): DockLayoutContextValue {
  const ctx = useContext(DockLayoutContext);
  if (!ctx) throw new Error('useDockLayout must be used within DockLayoutProvider');
  return ctx;
}
