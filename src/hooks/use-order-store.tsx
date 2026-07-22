// TODO: Replace with API endpoint - all data should come from backend
import { createContext, useContext, useState, useCallback, useMemo, useRef, type ReactNode } from 'react';
import { formatTime } from '@/lib/datetime';
import type { Order } from '@/types/kds';
import type { ExpoTicket, ExpoStation, ExpoItem, ExpoItemStatus, ExpoCourse, ExpoCourseStatus } from '@/data/mock-expo-orders';
import { mockOrders } from '@/data/mock-orders';

/** Seed the sequential counter above the highest number already in the mocks. */
const INITIAL_ORDER_NUMBER =
  (mockOrders.reduce((max, o) => (o.orderNumber > max ? o.orderNumber : max), 0) || 0) + 1;

/* ------------------------------------------------------------------ */
/*  Shared order store: single source of truth for Home + Expo views  */
/* ------------------------------------------------------------------ */

export type ItemLifecycle = 'seen' | 'preparing' | 'ready' | 'served';

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

  /** Set of order IDs that have been "seen" (eye icon tapped) */
  seenOrderIds: Set<string>;

  /** Toggle an order's seen/unseen state */
  toggleOrderSeen: (orderId: string) => void;

  /** Set isRushed on an order (from Expo Rush button) */
  rushOrder: (orderId: string) => void;

  /** Per-item lifecycle state shared between Kitchen KDS and Expo */
  itemLifecycles: Record<string, ItemLifecycle>;

  /** Update lifecycle for a single item (seen | preparing | ready | served) */
  setItemLifecycle: (orderId: string, itemId: string, state: ItemLifecycle | null) => void;

  /** Reserve the next sequential order number (monotonic; advances on each call). */
  getNextOrderNumber: () => number;

  /**
   * Add a brand-new order to the queue. If `orderNumber` is omitted the next
   * sequential number is assigned automatically.
   */
  addOrder: (order: Omit<Order, 'orderNumber'> & { orderNumber?: number }) => Order;
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

function deriveExpoItems(order: Order, lifecycles: Record<string, ItemLifecycle>): ExpoItem[] {
  const items: ExpoItem[] = [];
  for (const course of order.courses) {
    for (const item of course.items) {
      let status: ExpoItemStatus = 'pending';
      let statusLabel: string | undefined;
      const lc = lifecycles[item.id];
      if (item.isCompleted || lc === 'served') {
        // Expo shows served items as 'done' (sent icon handled via sentItemIds elsewhere);
        // for lifecycle 'ready' below we also map to 'done' visually.
        status = 'done';
      } else if (lc === 'ready') {
        status = 'done';
      } else if (lc === 'preparing') {
        status = 'firing';
        statusLabel = item.station ? `At ${item.station}...` : undefined;
      } else if (lc === 'seen') {
        status = 'pending';
      } else {
        // No lifecycle yet: default per spec = seen (eye) once ticket has arrived.
        status = 'pending';
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
        station: item.station,
        isNew: item.isNew,
        isToGo: item.isToGo,
        allergens: item.allergens.length > 0
          ? item.allergens.map(a => ({ type: a.type, label: a.label }))
          : undefined,
        modifiers: item.modifiers && item.modifiers.length > 0
          ? item.modifiers.map(m => ({ text: m.text, type: m.type }))
          : undefined,
      });
    }
  }
  return items;
}


function deriveExpoCourses(order: Order): ExpoCourse[] | undefined {
  // Dine-in & banquet always show courses even with a single course
  const alwaysShowCourses = order.orderType === 'dine-in' || order.orderType === 'banquet';
  if (order.courses.length <= 1 && !alwaysShowCourses) return undefined;
  if (order.courses.length === 0) return undefined;
  return order.courses.map(course => {
    const allDone = course.items.every(i => i.isCompleted || i.isCancelled);
    let status: ExpoCourseStatus;
    if (allDone) {
      status = 'served';
    } else if (course.isFired) {
      status = 'active';
    } else {
      status = 'queued';
    }
    // Build status label for queued courses
    let statusLabel: string | undefined;
    if (status === 'queued' && course._startedAt) {
      statusLabel = `Preparing at ${formatTime(course._startedAt)}`;
    }
    return {
      name: course.course,
      status,
      itemIds: course.items.map(i => i.id),
      statusLabel,
    };
  });
}

function orderToExpoTicket(order: Order, lifecycles: Record<string, ItemLifecycle>): ExpoTicket {
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

  // Determine if coursing is enabled
  const alwaysShowCourses = order.orderType === 'dine-in' || order.orderType === 'banquet';
  const hasCoursing = order.courses.length > 1 || alwaysShowCourses;

  // Find the current active course's firedAt for per-course timer reset
  let activeCourseFiredAt: Date | undefined;
  if (hasCoursing) {
    for (const course of order.courses) {
      if (course.isFired) {
        const allDone = course.items.every(i => i.isCompleted || i.isCancelled);
        if (!allDone) {
          activeCourseFiredAt = course.firedAt || course._startedAt;
          break;
        }
      }
    }
    if (!activeCourseFiredAt) {
      const firedCourses = order.courses.filter(c => c.isFired);
      if (firedCourses.length > 0) {
        const last = firedCourses[firedCourses.length - 1];
        activeCourseFiredAt = last.firedAt || last._startedAt;
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
    items: deriveExpoItems(order, lifecycles),
    autoFireSeconds,
    hasCoursing,
    activeCourseFiredAt,
    courses: deriveExpoCourses(order),
    orderNotes: order.orderNotes,
  };
}


/* ---------- Provider ---------- */

export function OrderStoreProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [seenOrderIds, setSeenOrderIds] = useState<Set<string>>(new Set());
  const [itemLifecycles, setItemLifecycles] = useState<Record<string, ItemLifecycle>>({});

  const toggleOrderSeen = useCallback((orderId: string) => {
    setSeenOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }, []);

  const markItemDone = useCallback((orderId: string, itemId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        courses: o.courses.map(c => ({
          ...c,
          items: c.items.map(i =>
            i.id === itemId ? { ...i, isCompleted: true } : i
          ),
        })),
      };
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

  const rushOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, isRushed: true } : o
    ));
  }, []);

  const setItemLifecycle = useCallback((orderId: string, itemId: string, state: ItemLifecycle | null) => {
    setItemLifecycles(prev => {
      const next = { ...prev };
      if (state === null) delete next[itemId];
      else next[itemId] = state;
      return next;
    });
    // Keep isCompleted in sync with the 'served' terminal state.
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const targetCompleted = state === 'served';
      let touched = false;
      const nextCourses = o.courses.map(c => ({
        ...c,
        items: c.items.map(i => {
          if (i.id !== itemId) return i;
          if (!!i.isCompleted === targetCompleted) return i;
          touched = true;
          return { ...i, isCompleted: targetCompleted };
        }),
      }));
      return touched ? { ...o, courses: nextCourses } : o;
    }));
  }, []);

  // Auto-clear isRushed when all items in a rushed order are done
  useMemo(() => {
    setOrders(prev => {
      let changed = false;
      const next = prev.map(o => {
        if (!o.isRushed) return o;
        const allDone = o.courses.every(c => c.items.every(i => i.isCompleted || i.isCancelled));
        if (allDone) {
          changed = true;
          return { ...o, isRushed: false };
        }
        return o;
      });
      return changed ? next : prev;
    });
  }, [orders]);

  const expoTickets = useMemo(() => {
    return orders
      .filter(o => o.status !== 'served')
      .map(o => orderToExpoTicket(o, itemLifecycles));
  }, [orders, itemLifecycles]);

  // Clean up seenOrderIds when orders are removed
  useMemo(() => {
    const activeIds = new Set(orders.map(o => o.id));
    setSeenOrderIds(prev => {
      const next = new Set<string>();
      for (const id of prev) {
        if (activeIds.has(id)) next.add(id);
      }
      if (next.size !== prev.size) return next;
      return prev;
    });
  }, [orders]);

  const value = useMemo<OrderStoreContextValue>(() => ({
    orders,
    setOrders,
    expoTickets,
    markItemDone,
    markAllItemsDone,
    sendOutOrder,
    updateOrderStatus,
    seenOrderIds,
    toggleOrderSeen,
    rushOrder,
    itemLifecycles,
    setItemLifecycle,
  }), [orders, expoTickets, markItemDone, markAllItemsDone, sendOutOrder, updateOrderStatus, seenOrderIds, toggleOrderSeen, rushOrder, itemLifecycles, setItemLifecycle]);


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
