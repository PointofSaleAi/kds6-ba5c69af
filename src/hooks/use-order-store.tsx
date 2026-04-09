// TODO: Replace with API endpoint - all data should come from backend
import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Order } from '@/types/kds';
import type { ExpoTicket, ExpoStation, ExpoItem, ExpoItemStatus } from '@/data/mock-expo-orders';
import { mockOrders } from '@/data/mock-orders';

/* ------------------------------------------------------------------ */
/*  Shared order store: single source of truth for Home + Expo views  */
/* ------------------------------------------------------------------ */

interface OrderStoreContextValue {
  /** All active orders (not served) */
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;

  /** Derived expo tickets from the same orders */
  expoTickets: ExpoTicket[];

  /** Mark a single item as done (from KDS card tap) */
  markItemDone: (orderId: string, itemId: string) => void;

  /** Mark ALL items in an order as done (from KDS bump) */
  markAllItemsDone: (orderId: string) => void;

  /** Send out an order from Expo (sets status to served) */
  sendOutOrder: (orderId: string) => void;

  /** Update order status */
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const OrderStoreContext = createContext<OrderStoreContextValue | null>(null);

/* ---------- helpers: derive ExpoTicket from Order ---------- */

function deriveStations(order: Order): ExpoStation[] {
  const stationMap = new Map<string, { total: number; done: number }>();
  for (const course of order.courses) {
    for (const item of course.items) {
      const station = item.station || 'Kitchen';
      const entry = stationMap.get(station) || { total: 0, done: 0 };
      entry.total += 1;
      if (item.isCompleted) entry.done += 1;
      stationMap.set(station, entry);
    }
  }
  const stations: ExpoStation[] = [];
  for (const [name, counts] of stationMap) {
    let status: ExpoStation['status'] = 'pending';
    if (counts.done === counts.total) status = 'done';
    else if (counts.done > 0) status = 'firing';
    stations.push({ name, status });
  }
  return stations;
}

function deriveExpoItems(order: Order): ExpoItem[] {
  const items: ExpoItem[] = [];
  for (const course of order.courses) {
    for (const item of course.items) {
      let status: ExpoItemStatus = 'pending';
      let statusLabel: string | undefined;
      if (item.isCompleted) {
        status = 'done';
      } else if (order.status === 'in-progress' || order.status === 'seen') {
        status = 'firing';
        statusLabel = item.station ? `At ${item.station}...` : undefined;
      }
      // Overtime check
      const elapsed = Math.round((Date.now() - order.timeReceived.getTime()) / 1000);
      if (!item.isCompleted && elapsed >= 900) {
        statusLabel = 'Overdue';
      }
      items.push({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        status,
        statusLabel,
      });
    }
  }
  return items;
}

function orderToExpoTicket(order: Order): ExpoTicket {
  const timerSeconds = Math.round((Date.now() - order.timeReceived.getTime()) / 1000);

  // Derive auto-fire from unfired courses with autoFireTargetSeconds
  let autoFireSeconds: number | undefined;
  for (const course of order.courses) {
    if (!course.isFired && course.autoFireTargetSeconds != null) {
      const elapsed = course._startedAt
        ? Math.round((Date.now() - course._startedAt.getTime()) / 1000)
        : 0;
      const remaining = Math.max(0, course.autoFireTargetSeconds - elapsed);
      if (autoFireSeconds === undefined || remaining < autoFireSeconds) {
        autoFireSeconds = remaining;
      }
    }
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    orderType: order.orderType === 'delivery' ? 'take-out'
      : order.orderType === 'banquet' ? 'banquet'
      : order.orderType === 'take-out' ? 'take-out'
      : 'dine-in',
    tableName: order.tableName,
    timerSeconds,
    stations: deriveStations(order),
    items: deriveExpoItems(order),
    autoFireSeconds,
  };
}

/* ---------- Provider ---------- */

export function OrderStoreProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const markItemDone = useCallback((orderId: string, itemId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const updated = {
        ...o,
        courses: o.courses.map(c => ({
          ...c,
          items: c.items.map(i =>
            i.id === itemId ? { ...i, isCompleted: true } : i
          ),
        })),
      };
      // Auto-calculate order readiness
      const allDone = updated.courses.every(c => c.items.every(i => i.isCompleted || i.isCancelled));
      if (allDone) updated.status = 'served';
      return updated;
    }));
  }, []);

  const markAllItemsDone = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status: 'served',
        courses: o.courses.map(c => ({
          ...c,
          items: c.items.map(i => ({ ...i, isCompleted: true })),
        })),
      };
    }));
  }, []);

  const sendOutOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'served' } : o
    ));
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status } : o
    ));
  }, []);

  const expoTickets = useMemo(() => {
    return orders
      .filter(o => o.status !== 'served')
      .map(orderToExpoTicket);
  }, [orders]);

  const value = useMemo<OrderStoreContextValue>(() => ({
    orders,
    setOrders,
    expoTickets,
    markItemDone,
    markAllItemsDone,
    sendOutOrder,
    updateOrderStatus,
  }), [orders, expoTickets, markItemDone, markAllItemsDone, sendOutOrder, updateOrderStatus]);

  return (
    <OrderStoreContext.Provider value={value}>
      {children}
    </OrderStoreContext.Provider>
  );
}

export function useOrderStore() {
  const ctx = useContext(OrderStoreContext);
  if (!ctx) throw new Error('useOrderStore must be used within OrderStoreProvider');
  return ctx;
}
