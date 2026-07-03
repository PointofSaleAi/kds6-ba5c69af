import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useOrderStore } from '@/hooks/use-order-store';
import type { Order } from '@/types/kds';
import {
  makeTrainingSampleOrders,
  isTrainingSampleOrder,
} from '@/data/training-sample-orders';

interface TrainingModeContextValue {
  active: boolean;
  enter: () => void;
  exit: () => void;
  reload: () => void;
}

const TrainingModeContext = createContext<TrainingModeContextValue | null>(null);

export function TrainingModeProvider({ children }: { children: ReactNode }) {
  const { orders, setOrders } = useOrderStore();
  const [active, setActive] = useState(false);
  const snapshotRef = useRef<Order[] | null>(null);

  const enter = useCallback(() => {
    if (active) return;
    setOrders((current) => {
      // Snapshot only the real (non-sample) tickets so we can restore on exit.
      snapshotRef.current = current.filter((o) => !isTrainingSampleOrder(o));
      return makeTrainingSampleOrders();
    });
    setActive(true);
  }, [active, setOrders]);

  const exit = useCallback(() => {
    setOrders(snapshotRef.current ?? []);
    snapshotRef.current = null;
    setActive(false);
  }, [setOrders]);

  const reload = useCallback(() => {
    if (!active) return;
    setOrders((current) => {
      const kept = current.filter((o) => !isTrainingSampleOrder(o));
      return [...makeTrainingSampleOrders(), ...kept.filter(() => false)];
    });
  }, [active, setOrders]);

  // Hand-off from onboarding completion prompt.
  useEffect(() => {
    const handler = () => enter();
    window.addEventListener('kds:start-training-mode', handler);
    return () => window.removeEventListener('kds:start-training-mode', handler);
  }, [enter]);

  const value = useMemo<TrainingModeContextValue>(
    () => ({ active, enter, exit, reload }),
    [active, enter, exit, reload],
  );

  // Reference `orders` so the linter sees it and future extensions can react.
  void orders;

  return (
    <TrainingModeContext.Provider value={value}>{children}</TrainingModeContext.Provider>
  );
}

export function useTrainingMode() {
  const ctx = useContext(TrainingModeContext);
  if (!ctx) throw new Error('useTrainingMode must be used within TrainingModeProvider');
  return ctx;
}
