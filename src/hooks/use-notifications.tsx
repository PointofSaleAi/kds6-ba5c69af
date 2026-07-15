import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react';
import type { KDSNotification, NotificationType, StationTag } from '@/types/notification';

const MAX_LOG = 50;

// TODO: Replace with API data
const mockNotifications: KDSNotification[] = [
  { id: 'n1', type: 'table-transfer', message: 'Table 6 moved to Table 10', station: 'All', timestamp: new Date(Date.now() - 120000), acknowledged: false },
  { id: 'n2', type: 'new-order', message: 'New order #27 received (DINE IN, Table 9)', station: 'All', timestamp: new Date(Date.now() - 180000), acknowledged: false },
  { id: 'n3', type: 'item-moved', message: 'Grilled Salmon from Table 6 moved to Table 7', station: 'Grill', timestamp: new Date(Date.now() - 300000), acknowledged: false },
  { id: 'n4', type: 'course-fired', message: 'Course 2 fired for Table 12', station: 'All', timestamp: new Date(Date.now() - 600000), acknowledged: true, acknowledged_at: new Date(Date.now() - 540000), acknowledged_by: 'cook-1' },
  { id: 'n5', type: 'new-item-added', message: 'New product added to Table 4: 1x Caesar Salad', station: 'Salad', timestamp: new Date(Date.now() - 900000), acknowledged: true, acknowledged_at: new Date(Date.now() - 800000), acknowledged_by: 'cook-2' },
  { id: 'n6', type: 'general-alert', message: 'VIP guest arriving in 15 minutes', station: 'All', timestamp: new Date(Date.now() - 1500000), acknowledged: true, acknowledged_at: new Date(Date.now() - 1400000), acknowledged_by: 'cook-1' },
  { id: 'n7', type: 'overtime', message: 'Order #22 is 10+ minutes overtime', station: 'Grill', timestamp: new Date(Date.now() - 1800000), acknowledged: false },
  { id: 'n9', type: 'low-stock', message: 'Low stock: Atlantic Salmon (Seafood) — 3 portions left', station: 'Grill', timestamp: new Date(Date.now() - 240000), acknowledged: false },
  { id: 'n10', type: 'low-stock', message: 'Low stock: Truffle Oil (Pantry) — 1 bottle left', station: 'All', timestamp: new Date(Date.now() - 720000), acknowledged: false },
  { id: 'n11', type: 'pos-86d', message: "POS: Ribeye Steak (Mains) marked 86'd by Sarah M.", station: 'Grill', timestamp: new Date(Date.now() - 360000), acknowledged: false },
  { id: 'n12', type: 'pos-86d', message: "POS: Tiramisu (Desserts) marked 86'd by Alex P.", station: 'Dessert', timestamp: new Date(Date.now() - 1200000), acknowledged: true, acknowledged_at: new Date(Date.now() - 1100000), acknowledged_by: 'cook-2' },
  { id: 'n8', type: 'system', message: 'Printer "Kitchen HP" is offline', station: 'All', timestamp: new Date(Date.now() - 2100000), acknowledged: true, acknowledged_at: new Date(Date.now() - 2000000), acknowledged_by: 'cook-1' },
];

interface ActiveToast {
  notification: KDSNotification;
  timer: ReturnType<typeof setTimeout>;
}

interface NotificationsContextValue {
  /** Filtered log for current station */
  notifications: KDSNotification[];
  /** Currently visible toasts */
  activeToasts: KDSNotification[];
  /** Unread count for badge */
  unreadCount: number;
  /** Current station filter */
  currentStation: StationTag;
  setCurrentStation: (s: StationTag) => void;
  /** Acknowledge a notification */
  acknowledge: (id: string) => void;
  /** Dismiss a toast (also acknowledges) */
  dismissToast: (id: string) => void;
  /** Clear all acknowledged from log */
  clearAcknowledged: () => void;
  /** Push a new notification into the system */
  pushNotification: (type: NotificationType, message: string, station: StationTag) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [allNotifications, setAllNotifications] = useState<KDSNotification[]>(mockNotifications);
  const [currentStation, setCurrentStation] = useState<StationTag>('All');
  const [toastIds, setToastIds] = useState<string[]>([]);
  const toastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const prevCount = useRef(allNotifications.length);

  // Filter notifications by station
  const notifications = useMemo(() => {
    const filtered = allNotifications.filter(
      n => n.station === 'All' || n.station === currentStation || currentStation === 'All'
    );
    // Reverse chronological, cap at MAX_LOG
    return [...filtered].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, MAX_LOG);
  }, [allNotifications, currentStation]);

  const activeToasts = useMemo(
    () => notifications.filter(n => toastIds.includes(n.id)),
    [notifications, toastIds]
  );

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.acknowledged).length,
    [notifications]
  );

  const removeToast = useCallback((id: string) => {
    setToastIds(prev => prev.filter(t => t !== id));
    const timer = toastTimers.current.get(id);
    if (timer) { clearTimeout(timer); toastTimers.current.delete(id); }
  }, []);

  const acknowledge = useCallback((id: string) => {
    setAllNotifications(prev =>
      prev.map(n =>
        n.id === id && !n.acknowledged
          ? { ...n, acknowledged: true, acknowledged_at: new Date(), acknowledged_by: 'current-user' }
          : n
      )
    );
  }, []);

  const dismissToast = useCallback((id: string) => {
    acknowledge(id);
    removeToast(id);
  }, [acknowledge, removeToast]);

  const clearAcknowledged = useCallback(() => {
    setAllNotifications(prev => prev.filter(n => !n.acknowledged));
  }, []);

  const pushNotification = useCallback((type: NotificationType, message: string, station: StationTag) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const notif: KDSNotification = {
      id, type, message, station,
      timestamp: new Date(),
      acknowledged: false,
    };
    setAllNotifications(prev => [notif, ...prev].slice(0, MAX_LOG + 20));

    // Only show toast if relevant to current station
    // (check happens in the component via filtered notifications)
    setToastIds(prev => [...prev, id]);
  }, []);

  // Auto-dismiss toasts after 4s
  useEffect(() => {
    for (const id of toastIds) {
      if (!toastTimers.current.has(id)) {
        const timer = setTimeout(() => removeToast(id), 4000);
        toastTimers.current.set(id, timer);
      }
    }
  }, [toastIds, removeToast]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      toastTimers.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const value = useMemo<NotificationsContextValue>(() => ({
    notifications, activeToasts, unreadCount, currentStation,
    setCurrentStation, acknowledge, dismissToast, clearAcknowledged, pushNotification,
  }), [notifications, activeToasts, unreadCount, currentStation, acknowledge, dismissToast, clearAcknowledged, pushNotification]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
