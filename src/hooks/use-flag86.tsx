import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface Flag86ContextValue {
  clearedIds: Set<string>;
  confirmedIds: Set<string>;
  clear: (itemId: string) => void;
  confirm: (itemId: string) => void;
  isActive: (itemId: string, is86Flagged?: boolean) => boolean;
  isConfirmed: (itemId: string) => boolean;
}

const Flag86Context = createContext<Flag86ContextValue | null>(null);

export function Flag86Provider({ children }: { children: ReactNode }) {
  const [clearedIds, setClearedIds] = useState<Set<string>>(new Set());
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  const clear = useCallback((itemId: string) => {
    setClearedIds(prev => {
      if (prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  }, []);

  const confirm = useCallback((itemId: string) => {
    setConfirmedIds(prev => {
      if (prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  }, []);

  const isActive = useCallback(
    (itemId: string, is86Flagged?: boolean) => !!is86Flagged && !clearedIds.has(itemId) && !confirmedIds.has(itemId),
    [clearedIds, confirmedIds]
  );

  const isConfirmed = useCallback(
    (itemId: string) => confirmedIds.has(itemId),
    [confirmedIds]
  );

  const value = useMemo(
    () => ({ clearedIds, confirmedIds, clear, confirm, isActive, isConfirmed }),
    [clearedIds, confirmedIds, clear, confirm, isActive, isConfirmed]
  );

  return <Flag86Context.Provider value={value}>{children}</Flag86Context.Provider>;
}

export function useFlag86() {
  const ctx = useContext(Flag86Context);
  if (!ctx) throw new Error('useFlag86 must be used within Flag86Provider');
  return ctx;
}
