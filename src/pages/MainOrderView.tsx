import { useState, useCallback, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { Search } from 'lucide-react';
import type { SortMode } from '@/components/kds/BottomStatusBar';
import type { ItemStatus } from '@/components/kds/CourseSection';
import { KDSSidebar } from '@/components/kds/KDSSidebar';
import { OrderCard } from '@/components/kds/OrderCard';

import { PrepBoard } from '@/components/kds/PrepBoard';
import ExpoView from '@/components/kds/ExpoView';
import { HistoryOrderCard } from '@/components/kds/HistoryOrderCard';
import { ItemSummaryPanel } from '@/components/kds/ItemSummaryPanel';
import { ExpoSummaryPanel } from '@/components/kds/ExpoSummaryPanel';
import { BottomStatusBar } from '@/components/kds/BottomStatusBar';
import { EmptyState } from '@/components/kds/EmptyState';
import { ExpandedOrderCard } from '@/components/kds/ExpandedOrderCard';
import { SettingsPanel } from '@/components/kds/SettingsPanel';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { Outlet } from 'react-router-dom';
import { mockHistoryOrders } from '@/data/mock-history';
import { AnimatePresence, motion } from 'framer-motion';
import type { ViewMode, Order, OrderItem } from '@/types/kds';
import { useTheme } from '@/hooks/use-theme';
import { useKDSMode } from '@/hooks/use-kds-mode';
import { useSound } from '@/hooks/use-sound';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { useOrderStore } from '@/hooks/use-order-store';
import { toast } from 'sonner';
import { usePortrait } from '@/hooks/use-portrait';
import { useKitchenMessages } from '@/hooks/use-kitchen-messages';
import { Megaphone } from 'lucide-react';
import { useDockLayout } from '@/hooks/use-dock-layout';
import SeenOrdersScreen from '@/pages/SeenOrdersScreen';
import UnseenOrdersScreen from '@/pages/UnseenOrdersScreen';


interface MainOrderViewProps {
  onNavigate: (screen: string) => void;
  settingsOpen?: boolean;
  onCloseSettings?: () => void;
  onOpenSub?: (sub: string) => void;
  onLogOut?: () => void;
  onDevModeChange?: (enabled: boolean) => void;
  /** When set, OrderCards dim non-matching courses */
  stationCourse?: string;
}

function distributeIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const safeColumnCount = Math.max(1, columnCount);
  const columns = Array.from({ length: safeColumnCount }, () => [] as T[]);
  items.forEach((item, i) => {
    columns[i % safeColumnCount].push(item);
  });
  return columns;
}

export default function MainOrderView({ onNavigate, settingsOpen, onCloseSettings, onOpenSub, onLogOut, onDevModeChange, stationCourse: stationCourseProp }: MainOrderViewProps) {
  const { theme, toggleTheme } = useTheme();
  const { mode: kdsMode, stationCourse: contextStationCourse, setStationCourse } = useKDSMode();
  const resolvedStationCourse = stationCourseProp || contextStationCourse || undefined;
  const { playSound } = useSound();
  const { cardsPerRow, textSize, showAllergens, sortDefault, staggerMode, ticketSpacing } = useKDSSettings();
  const { orders, setOrders, expoTickets, markItemDone, markAllItemsDone, seenOrderIds, toggleOrderSeen } = useOrderStore();
  const { isPortrait } = usePortrait();
  const { layout: dockLayout } = useDockLayout();
  const { pendingCount: kitchenMessagePendingCount, messages: kitchenMessages } = useKitchenMessages();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeNav, setActiveNav] = useState('home');
  const [historyOrders, setHistoryOrders] = useState<Order[]>(mockHistoryOrders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const sortDefaultMap: Record<string, SortMode> = { 'By Time': 'newest', 'By Table': 'table', 'By Type': 'type' };
  const [sortMode, setSortMode] = useState<SortMode>(sortDefaultMap[sortDefault] || 'newest');
  const [settingsSection, setSettingsSection] = useState<string>('display');
  const prevOrderCountRef = useRef(orders.length);
  const prevMessageCountRef = useRef(kitchenMessages.length);
  const [messageFlash, setMessageFlash] = useState<{ text: string; from: string } | null>(null);
  const [globalItemStatuses, setGlobalItemStatuses] = useState<Map<string, ItemStatus>>(new Map());
  const [selectedSummaryItems, setSelectedSummaryItems] = useState<Set<string>>(new Set());
  const [selectedSummaryCategories, setSelectedSummaryCategories] = useState<Set<string>>(new Set());

  // Expo pinned ticket state
  const [expoPinnedIds, setExpoPinnedIds] = useState<string[]>([]);
  const [expoAllTickets, setExpoAllTickets] = useState<import('@/data/mock-expo-orders').ExpoTicket[]>([]);
  const [expoSelectedProducts, setExpoSelectedProducts] = useState<string[]>([]);

  const handleExpoTogglePin = useCallback((ticketId: string) => {
    setExpoPinnedIds(prev => {
      if (prev.includes(ticketId)) return prev.filter(id => id !== ticketId);
      return [...prev, ticketId];
    });
  }, []);

  const handleExpoClearAllPins = useCallback(() => {
    setExpoPinnedIds([]);
  }, []);

  const handleExpoFilterChange = useCallback(() => {
    setExpoPinnedIds([]);
  }, []);

  const handleExpoTicketSentOut = useCallback((id: string) => {
    setExpoPinnedIds(prev => prev.filter(pid => pid !== id));
  }, []);

  const handleExpoAllTicketsChange = useCallback((tickets: import('@/data/mock-expo-orders').ExpoTicket[]) => {
    setExpoAllTickets(tickets);
  }, []);

  const handleExpoProductToggle = useCallback((productName: string) => {
    setExpoSelectedProducts(prev =>
      prev.includes(productName) ? prev.filter(p => p !== productName) : [...prev, productName]
    );
  }, []);

  const handleExpoSendAllProduct = useCallback((productName: string) => {
    setExpoAllTickets(prev => prev.map(t => ({
      ...t,
      items: t.items.map(i => i.name === productName ? { ...i, status: 'done' as const } : i),
      stations: t.stations.map(s => {
        const ticketHasProduct = t.items.some(i => i.name === productName);
        if (!ticketHasProduct) return s;
        const allDoneAfter = t.items.every(i => i.name === productName ? true : i.status === 'done');
        return allDoneAfter ? { ...s, status: 'done' as const } : s;
      }),
    })));
  }, []);

  const handleSummaryItemToggle = useCallback((itemName: string) => {
    setSelectedSummaryItems(prev => {
      const next = new Set(prev);
      if (next.has(itemName)) next.delete(itemName);
      else next.add(itemName);
      return next;
    });
  }, []);

  const handleSummaryCategoryToggle = useCallback((category: string) => {
    setSelectedSummaryCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const handleSummaryClearAll = useCallback(() => {
    setSelectedSummaryItems(new Set());
    setSelectedSummaryCategories(new Set());
  }, []);

  const handleItemStatusChange = useCallback((itemId: string, status: ItemStatus | undefined) => {
    setGlobalItemStatuses(prev => {
      const next = new Map(prev);
      if (status === undefined) next.delete(itemId);
      else next.set(itemId, status);
      return next;
    });
    // Do NOT sync 'done' to shared store here - that would auto-remove the ticket.
    // The ticket is only removed when the DONE button is explicitly tapped (handleBump).
  }, []);

  // History state
  const [historyDateFilter, setHistoryDateFilter] = useState('today');
  const [historySearch, setHistorySearch] = useState('');
  const boardContentRef = useRef<HTMLDivElement | null>(null);
  const [boardContentWidth, setBoardContentWidth] = useState(0);

  useEffect(() => {
    if (settingsOpen) return;
    const node = boardContentRef.current;
    if (!node) return;

    const updateWidth = () => setBoardContentWidth(node.clientWidth);
    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (!entry) return;
      setBoardContentWidth(entry.contentRect.width);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [settingsOpen]);

  const staggerColumnCount = useMemo(() => {
    // Portrait orientation locks Stagger to 2 columns so cards stay legible on narrow tablets.
    if (isPortrait) return 2;
    if (boardContentWidth <= 0) return 4;
    if (boardContentWidth < 480) return 2;
    if (boardContentWidth < 760) return 3;
    if (boardContentWidth < 1100) return 4;
    return 5;
  }, [boardContentWidth, isPortrait]);

  // Move served orders to history immediately
  useEffect(() => {
    const servedOrders = orders.filter(o => o.status === 'served');
    if (servedOrders.length > 0) {
      setHistoryOrders(prev => [...servedOrders.map(o => ({ ...o, elapsedSeconds: Math.round((Date.now() - o.timeReceived.getTime()) / 1000) })), ...prev]);
      setOrders(prev => prev.filter(o => o.status !== 'served'));
    }
  }, [orders]);

  // Play sound when new orders arrive
  useEffect(() => {
    const currentCount = orders.length;
    if (currentCount > prevOrderCountRef.current) {
      playSound('newOrder');
    }
    prevOrderCountRef.current = currentCount;
  }, [orders.length, playSound]);

  // Play urgent sound when an order is rushed from Expo
  const prevRushedIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const currentRushed = new Set(orders.filter(o => o.isRushed).map(o => o.id));
    for (const id of currentRushed) {
      if (!prevRushedIdsRef.current.has(id)) {
        playSound('urgent');
        break; // one sound per batch
      }
    }
    prevRushedIdsRef.current = currentRushed;
  }, [orders, playSound]);

  // Flash notification when new kitchen messages arrive
  useEffect(() => {
    const currentCount = kitchenMessages.length;
    if (currentCount > prevMessageCountRef.current) {
      const newest = kitchenMessages[kitchenMessages.length - 1];
      if (newest) {
        setMessageFlash({
          text: newest.message_text,
          from: newest.terminal_name || newest.employee_name,
        });
        playSound('newOrder');
        const timer = setTimeout(() => setMessageFlash(null), 4000);
        return () => clearTimeout(timer);
      }
    }
    prevMessageCountRef.current = currentCount;
  }, [kitchenMessages.length, kitchenMessages, playSound]);

  // Station view: determine if we're in station-filtered mode
  const isStationView = kdsMode === 'Prep' && !!resolvedStationCourse;

  // Helper: filter order courses/items to only show station-matching items
  const getStationDisplayOrder = useCallback((order: Order): Order => {
    if (!isStationView || !resolvedStationCourse) return order;
    const filteredCourses = order.courses
      .map(c => ({ ...c, items: c.items.filter(i => i.category === resolvedStationCourse) }))
      .filter(c => c.items.length > 0);
    return { ...order, courses: filteredCourses };
  }, [isStationView, resolvedStationCourse]);

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter((o) => {
      if (activeFilter === 'new') return o.status === 'new';
      if (activeFilter === 'in-progress') return o.status === 'in-progress' || o.status === 'seen';
      if (activeFilter === 'completed') return o.status !== 'served';
      return true;
    });

    // Station view: only show orders that have items matching the active station's category
    if (isStationView && resolvedStationCourse) {
      filtered = filtered.filter(o =>
        o.courses.some(c => c.items.some(i => !i.isCompleted && !i.isCancelled && i.category === resolvedStationCourse))
      );
    }

    const sorted = [...filtered];
    if (sortMode === 'table') {
      sorted.sort((a, b) => a.tableName.localeCompare(b.tableName));
    } else if (sortMode === 'type') {
      sorted.sort((a, b) => a.orderType.localeCompare(b.orderType));
    } else if (sortMode === 'oldest') {
      sorted.sort((a, b) => a.timeReceived.getTime() - b.timeReceived.getTime());
    } else {
      sorted.sort((a, b) => b.timeReceived.getTime() - a.timeReceived.getTime());
    }

    // Reorder based on selected summary items + categories
    const hasFilters = selectedSummaryItems.size > 0 || selectedSummaryCategories.size > 0;
    if (hasFilters) {
      const matching: Array<{ order: Order; matchCount: number }> = [];
      const nonMatching: Order[] = [];
      for (const o of sorted) {
        const matchCount = o.courses.reduce((acc, c) => acc + c.items.filter(i => {
          if (i.isCompleted || i.isCancelled) return false;
          return selectedSummaryItems.has(i.name) || (i.category && selectedSummaryCategories.has(i.category));
        }).length, 0);
        if (matchCount > 0) matching.push({ order: o, matchCount });
        else nonMatching.push(o);
      }
      matching.sort((a, b) => b.matchCount - a.matchCount);
      return [...matching.map(m => m.order), ...nonMatching];
    }

    // Rush override: rushed orders jump to position 1
    const rushed = sorted.filter(o => o.isRushed);
    const nonRushed = sorted.filter(o => !o.isRushed);
    return [...rushed, ...nonRushed];
  }, [orders, activeFilter, sortMode, selectedSummaryItems, selectedSummaryCategories, isStationView, resolvedStationCourse]);

  const filteredHistory = historyOrders.filter((o) => {
    if (!historySearch) return true;
    const q = historySearch.toLowerCase();
    return (
      String(o.orderNumber).includes(q) ||
      o.tableName.toLowerCase().includes(q) ||
      o.serverName.toLowerCase().includes(q)
    );
  });

  const staggerOrderColumns = useMemo(
    () => distributeIntoColumns(filteredOrders, staggerColumnCount),
    [filteredOrders, staggerColumnCount]
  );

  const staggerHistoryColumns = useMemo(
    () => distributeIntoColumns(filteredHistory, staggerColumnCount),
    [filteredHistory, staggerColumnCount]
  );

  // Enrich orders with global item statuses for Cooking Summary
  const ordersWithItemStatuses = useMemo(() => {
    if (globalItemStatuses.size === 0) return orders;
    return orders.map(order => ({
      ...order,
      courses: order.courses.map(cg => ({
        ...cg,
        items: cg.items.map(item => ({
          ...item,
          isCompleted: item.isCompleted || globalItemStatuses.get(item.id) === 'done',
        })),
      })),
    }));
  }, [orders, globalItemStatuses]);

  const handleBump = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const nextStatus =
      order.status === 'new' ? 'seen' as const :
      order.status === 'seen' ? 'in-progress' as const : 'served' as const;
    if (nextStatus === 'served') {
      // Mark all items done so Expo view reflects completion before removal
      markAllItemsDone(orderId);
    } else {
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o)
      );
    }
  }, [orders, markAllItemsDone, setOrders]);

  const handleStepBack = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const prevStatus =
          o.status === 'in-progress' ? 'seen' as const :
          o.status === 'seen' ? 'new' as const : o.status;
        return { ...o, status: prevStatus };
      })
    );
  }, []);

  const handleFireCourse = useCallback((orderId: string, course: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          courses: o.courses.map((c) =>
            c.course === course ? { ...c, isFired: true } : c
          ),
        };
      })
    );
    toast.success(`${course} fired!`);
  }, []);

  /**
   * Insert recalled items into the correct (active, not-served) course of an existing order.
   * Avoids dropping recalled items into a fired/served course block.
   */
  const insertRecalledIntoActiveCourse = (existing: Order, newItems: OrderItem[]): Order['courses'] => {
    if (newItems.length === 0) return existing.courses;
    if (existing.courses.length === 0) {
      return [{ course: 'ENTREE', isFired: false, items: newItems }];
    }
    // Pick the first non-fired course that still has at least one not-completed item
    const activeIdx = existing.courses.findIndex(c =>
      !c.isFired && c.items.some(i => !i.isCompleted && !i.isCancelled)
    );
    // Fallback: first non-fired course
    const targetIdx = activeIdx >= 0
      ? activeIdx
      : existing.courses.findIndex(c => !c.isFired);

    if (targetIdx >= 0) {
      return existing.courses.map((c, idx) =>
        idx === targetIdx ? { ...c, items: [...newItems, ...c.items] } : c
      );
    }
    // All existing courses are fired/served — create a fresh ENTREE course at the front
    return [{ course: 'ENTREE' as const, isFired: false, items: newItems }, ...existing.courses];
  };

  const handleRecall = useCallback((orderId: string) => {
    const historyOrder = historyOrders.find(o => o.id === orderId);
    if (!historyOrder) return;

    const recalledItems = historyOrder.courses.flatMap(c =>
      c.items.map(item => ({
        ...item,
        isCompleted: false,
        isRecalled: true,
      }))
    );

    setOrders((prev) => {
      // SCENARIO 1: original ticket still active on home — merge into it
      const activeIndex = prev.findIndex(o => o.orderNumber === historyOrder.orderNumber);
      if (activeIndex >= 0) {
        const existing = prev[activeIndex];
        const existingItemIds = new Set(existing.courses.flatMap(c => c.items.map(i => i.id)));
        const newRecalled = recalledItems.filter(i => !existingItemIds.has(i.id));
        if (newRecalled.length === 0) return prev;
        const updatedCourses = insertRecalledIntoActiveCourse(existing, newRecalled);
        const merged: Order = {
          ...existing,
          courses: updatedCourses,
          itemCount: updatedCourses.reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0),
        };
        return prev.map((o, i) => i === activeIndex ? merged : o);
      }

      // SCENARIO 2: original ticket is gone — re-open it as a single ticket
      const recalledOrder: Order = {
        ...historyOrder,
        status: 'recalled',
        timeReceived: new Date(),
        elapsedSeconds: 0,
        sourceHistoryOrderId: orderId,
        courses: [{
          course: 'ENTREE',
          isFired: false,
          items: recalledItems,
        }],
        itemCount: recalledItems.reduce((sum, item) => sum + item.quantity, 0),
      };
      return [recalledOrder, ...prev];
    });

    setHistoryOrders((prev) => prev.filter(o => o.id !== orderId));
    toast.success(`Order #${historyOrder.orderNumber} recalled and added to queue`);
    setActiveNav('home');
  }, [historyOrders]);

  const handleRecallItem = useCallback((orderId: string, item: OrderItem) => {
    const historyOrder = historyOrders.find(o => o.id === orderId);
    if (!historyOrder) return;

    const recalledItem = { ...item, isCompleted: false, isRecalled: true };

    setOrders((prev) => {
      // SCENARIO 1: original ticket still active on home — merge into it
      const activeIndex = prev.findIndex(o => o.orderNumber === historyOrder.orderNumber);
      if (activeIndex >= 0) {
        const existing = prev[activeIndex];
        const existingItemIds = new Set(existing.courses.flatMap(c => c.items.map(i => i.id)));
        if (existingItemIds.has(recalledItem.id)) return prev;
        const updatedCourses = insertRecalledIntoActiveCourse(existing, [recalledItem]);
        const merged: Order = {
          ...existing,
          courses: updatedCourses,
          itemCount: updatedCourses.reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0),
        };
        return prev.map((o, i) => i === activeIndex ? merged : o);
      }

      // SCENARIO 2: original ticket is gone — re-open as single-item ticket using original order number
      const newOrder: Order = {
        id: `recalled-item-${item.id}-${Date.now()}`,
        orderNumber: historyOrder.orderNumber,
        orderType: historyOrder.orderType,
        status: 'recalled',
        tableName: historyOrder.tableName,
        serverName: historyOrder.serverName,
        guestName: historyOrder.guestName,
        timeReceived: new Date(),
        elapsedSeconds: 0,
        targetSeconds: historyOrder.targetSeconds,
        itemCount: item.quantity,
        sourceHistoryOrderId: orderId,
        courses: [{ course: 'ENTREE', isFired: false, items: [recalledItem] }],
      };
      return [newOrder, ...prev];
    });

    // Remove the recalled item from the history entry
    setHistoryOrders((prev) => prev.map(o => {
      if (o.id !== orderId) return o;
      const updatedCourses = o.courses.map(c => ({
        ...c,
        items: c.items.filter(i => i.id !== item.id),
      })).filter(c => c.items.length > 0);
      return { ...o, courses: updatedCourses, itemCount: updatedCourses.reduce((sum, c) => sum + c.items.reduce((itemSum, currentItem) => itemSum + currentItem.quantity, 0), 0) };
    }).filter(o => o.courses.length > 0));

    toast.success('Item recalled to kitchen', { duration: 2000 });
    setActiveNav('home');
  }, [historyOrders]);

  /** Move a single done item from active order into history (preserving order metadata) */
  const handleItemDismiss = useCallback((orderId: string, item: OrderItem) => {
    const sourceOrder = orders.find(o => o.id === orderId);
    if (!sourceOrder) return;

    const dismissedItem: OrderItem = { ...item, isCompleted: true };

    // 1) Append/merge into history under a stable per-active-order history id
    const historyId = `dismiss-${orderId}`;
    setHistoryOrders(prev => {
      const idx = prev.findIndex(o => o.id === historyId);
      if (idx >= 0) {
        const existing = prev[idx];
        const existingItemIds = new Set(existing.courses.flatMap(c => c.items.map(i => i.id)));
        if (existingItemIds.has(dismissedItem.id)) return prev;
        const mergedCourses = existing.courses.length > 0
          ? [{ ...existing.courses[0], items: [...existing.courses[0].items, dismissedItem] }]
          : [{ course: 'ENTREE' as const, isFired: true, items: [dismissedItem] }];
        const mergedItemCount = mergedCourses.reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0);
        const updated: Order = { ...existing, courses: mergedCourses, itemCount: mergedItemCount };
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      const elapsedSeconds = Math.round((Date.now() - sourceOrder.timeReceived.getTime()) / 1000);
      const newHistoryEntry: Order = {
        ...sourceOrder,
        id: historyId,
        status: 'served',
        elapsedSeconds,
        sourceHistoryOrderId: undefined,
        itemCount: dismissedItem.quantity,
        courses: [{ course: 'ENTREE', isFired: true, items: [dismissedItem] }],
      };
      return [newHistoryEntry, ...prev];
    });

    // 2) Remove the item from the active order; if order becomes empty, drop it
    setOrders(prev => prev.flatMap(o => {
      if (o.id !== orderId) return [o];
      const updatedCourses = o.courses
        .map(c => ({ ...c, items: c.items.filter(i => i.id !== item.id) }))
        .filter(c => c.items.length > 0);
      if (updatedCourses.length === 0) return [];
      const newItemCount = updatedCourses.reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0);
      return [{ ...o, courses: updatedCourses, itemCount: newItemCount }];
    }));

    toast.success(`${item.name} sent to history`, { duration: 1800 });
  }, [orders, setOrders]);

  const handleNavigate = useCallback((target: string) => {
    if (target === 'home' || target === 'history' || target === 'seen-orders' || target === 'unseen-orders') {
      setActiveNav(target);
      onCloseSettings?.();
    } else {
      onNavigate(target);
    }
  }, [onNavigate, onCloseSettings]);

  const activeOrderCount = orders.filter((o) => o.status !== 'served').length;
  const activeOrders = useMemo(() => orders.filter(o => o.status !== 'served'), [orders]);
  const seenCount = useMemo(() => activeOrders.filter(o => seenOrderIds.has(o.id)).length, [activeOrders, seenOrderIds]);
  const unseenCount = useMemo(() => activeOrders.filter(o => !seenOrderIds.has(o.id)).length, [activeOrders, seenOrderIds]);

  // FIX 7: Convert expo tickets to synthetic Orders for Cooking Summary
  const expoSyntheticOrders: Order[] = useMemo(() => {
    if (kdsMode !== 'Expo') return [];
    return expoTickets.map(t => ({
      id: t.id,
      orderNumber: t.orderNumber,
      orderType: t.orderType as Order['orderType'],
      status: 'in-progress' as const,
      tableName: t.tableName,
      serverName: '',
      timeReceived: new Date(Date.now() - t.timerSeconds * 1000),
      elapsedSeconds: t.timerSeconds,
      targetSeconds: 900,
      itemCount: t.items.reduce((sum, i) => sum + i.quantity, 0),
      courses: [{
        course: 'ENTREE' as const,
        items: t.items.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          modifiers: [],
          allergens: [],
          isCompleted: i.status === 'done',
          isCancelled: false,
        })),
      }],
    }));
  }, [kdsMode, expoTickets]);

  // Build combined highlight set (explicit items + all items from selected categories)
  const highlightItemNames = useMemo(() => {
    const hasFilters = selectedSummaryItems.size > 0 || selectedSummaryCategories.size > 0;
    if (!hasFilters) return new Set<string>();
    const set = new Set(selectedSummaryItems);
    if (selectedSummaryCategories.size > 0) {
      const sourceOrders = kdsMode === 'Expo' ? expoSyntheticOrders : ordersWithItemStatuses;
      for (const o of sourceOrders) {
        for (const c of o.courses) {
          for (const i of c.items) {
            if (i.category && selectedSummaryCategories.has(i.category) && !i.isCompleted && !i.isCancelled) {
              set.add(i.name);
            }
          }
        }
      }
    }
    return set;
  }, [selectedSummaryItems, selectedSummaryCategories, kdsMode, expoSyntheticOrders, ordersWithItemStatuses]);

  const orderHasSelectedItem = useCallback((order: Order): boolean => {
    if (highlightItemNames.size === 0) return true;
    return order.courses.some(c => c.items.some(i => highlightItemNames.has(i.name) && !i.isCompleted && !i.isCancelled));
  }, [highlightItemNames]);

  const matchingTicketCount = useMemo(() => {
    if (highlightItemNames.size === 0) return 0;
    return filteredOrders.filter(o => orderHasSelectedItem(o)).length;
  }, [filteredOrders, highlightItemNames, orderHasSelectedItem]);

  const cardVariants = {
    initial: { opacity: 0, x: 80, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 200 } },
    exit: { opacity: 0, scale: 0.9, filter: 'grayscale(1)', transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

  const dateTabs = ['Today', 'Yesterday', 'Last 7 Days'];

  const isHistory = activeNav === 'history';
  const isSeenScreen = activeNav === 'seen-orders';
  const isUnseenScreen = activeNav === 'unseen-orders';
  const isSubScreen = isHistory || isSeenScreen || isUnseenScreen;

  return (
    <div className="fixed inset-0 flex flex-col bg-surface-bg">
      {/* Kitchen message flash notification */}
      <AnimatePresence>
        {messageFlash && (
          <motion.div
            key="msg-flash"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg"
            style={{ backgroundColor: 'hsl(263 70% 50%)', color: '#fff', minWidth: 280, maxWidth: 520 }}
          >
            <Megaphone size={18} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold opacity-80 truncate">Message from {messageFlash.from}</p>
              <p className="text-[13px] font-medium truncate">{messageFlash.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-1 overflow-hidden">
        <KDSSidebar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onNavigate={handleNavigate}
          activeNav={activeNav}
          settingsOpen={settingsOpen}
          seenCount={seenCount}
          unseenCount={unseenCount}
        />

        {settingsOpen ? (
          <div
            className="flex flex-1 overflow-hidden p-4 gap-4"
            style={{ background: 'hsl(var(--surface-bg))' }}
          >
            <div
              className="w-[280px] shrink-0 rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: 'hsl(var(--surface-card))',
                boxShadow: '0 1px 2px hsl(0 0% 0% / 0.04)',
              }}
            >
              <SettingsSidebar />
            </div>
            <main
              className="flex-1 overflow-y-auto scrollbar-hide"
              style={{ background: 'transparent' }}
            >
              <div className="w-full p-0" style={{ background: 'transparent' }}>
                <Outlet />
              </div>
            </main>
          </div>
        ) : (
        <div ref={boardContentRef} className={`flex-1 flex flex-col overflow-hidden relative ${textSize === 'Compact' ? 'text-scale-compact' : textSize === 'Large' ? 'text-scale-large' : ''} ${ticketSpacing === 'Standard' ? 'ticket-spacing-standard' : ticketSpacing === 'Spacious' ? 'ticket-spacing-spacious' : 'ticket-spacing-compact'}`}>
          {isHistory ? (
            <>
              {/* History filter bar */}
              <div className="flex items-center gap-3 px-3 pt-3 pb-2 shrink-0">
                <span className="text-[11px] font-bold uppercase text-text-muted bg-muted px-2.5 py-1 rounded tracking-wider">
                  HISTORY
                </span>
                <div className="flex items-center bg-muted rounded-full p-0.5">
                  {dateTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setHistoryDateFilter(tab.toLowerCase())}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px] ${
                        historyDateFilter === tab.toLowerCase()
                          ? 'bg-brand-dark text-primary-foreground'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex-1" />
                <div className="relative max-w-[260px]">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search order, table, server..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-input bg-surface-card text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-ring min-h-[36px]"
                  />
                </div>
              </div>

              {/* History cards */}
              {filteredHistory.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-text-muted text-sm">No orders served yet today</p>
                </div>
              ) : (
                <div className="flex-1 overflow-auto p-1.5">
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5">
                      {filteredHistory.map((order) => (
                        <motion.div key={order.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <HistoryOrderCard order={order} onRecall={handleRecall} onRecallItem={handleRecallItem} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {viewMode === 'horizontal' && (
                    <div className="flex gap-1.5 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
                      {filteredHistory.map((order) => (
                        <motion.div key={order.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="shrink-0 w-[180px] sm:w-[190px] lg:w-[200px] xl:w-[210px]">
                          <HistoryOrderCard order={order} onRecall={handleRecall} onRecallItem={handleRecallItem} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {viewMode === 'stagger' && (
                    <div className="flex gap-1.5 sm:gap-2 lg:gap-2.5 items-start">
                      {staggerHistoryColumns.map((col, colIdx) => (
                        <div key={colIdx} className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2 lg:gap-2.5">
                          {col.map((order) => (
                            <motion.div key={order.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
                              <HistoryOrderCard order={order} onRecall={handleRecall} onRecallItem={handleRecallItem} />
                            </motion.div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : isSeenScreen ? (
            <SeenOrdersScreen viewMode={viewMode} showAllergens={showAllergens} onBump={handleBump} onStepBack={handleStepBack} onFireCourse={handleFireCourse} onItemStatusChange={handleItemStatusChange} onMarkSeen={toggleOrderSeen} onItemDismiss={handleItemDismiss} />
          ) : isUnseenScreen ? (
            <UnseenOrdersScreen viewMode={viewMode} showAllergens={showAllergens} onBump={handleBump} onStepBack={handleStepBack} onFireCourse={handleFireCourse} onItemStatusChange={handleItemStatusChange} onMarkSeen={toggleOrderSeen} onItemDismiss={handleItemDismiss} />
          ) : (
            <>
              {isStationView && resolvedStationCourse && (
                <div className="flex items-center justify-between px-4 shrink-0" style={{ height: 40, backgroundColor: '#111827' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold uppercase" style={{ fontSize: 11, letterSpacing: '0.06em', backgroundColor: '#4F46E5', borderRadius: 20, padding: '3px 10px' }}>
                      {resolvedStationCourse}
                    </span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>Station View</span>
                  </div>
                  <button
                    onClick={() => setStationCourse(null)}
                    style={{ fontSize: 12, color: '#818CF8' }}
                    className="hover:underline"
                  >
                    Exit Station View
                  </button>
                </div>
              )}

              {filteredOrders.length === 0 && kdsMode !== 'Expo' ? (
                isStationView && resolvedStationCourse ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-text-primary text-lg font-bold">No {resolvedStationCourse} orders right now</p>
                      <p className="text-text-muted text-sm mt-1">You are all caught up. New {resolvedStationCourse} orders will appear here automatically.</p>
                    </div>
                  </div>
                ) : (
                  <EmptyState />
                )
              ) : kdsMode === 'Prep' && !resolvedStationCourse ? (
                <PrepBoard orders={filteredOrders} />
              ) : kdsMode === 'Expo' ? (
                <ExpoView viewMode={viewMode} pinnedTicketIds={expoPinnedIds} onFilterChange={handleExpoFilterChange} onTicketSentOut={handleExpoTicketSentOut} onAllTicketsChange={handleExpoAllTicketsChange} selectedProducts={expoSelectedProducts} />
              ) : (
                <div className="flex-1 overflow-auto p-1.5">
                  {(staggerMode || viewMode === 'stagger') ? (
                    <div className="flex gap-1.5 sm:gap-2 lg:gap-2.5 items-start">
                      {staggerOrderColumns.map((col, colIdx) => (
                        <div key={colIdx} className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2 lg:gap-2.5">
                          <AnimatePresence mode="popLayout">
                            {col.map((order) => {
                              const displayOrder = getStationDisplayOrder(order);
                              return (
                                <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate={{ opacity: highlightItemNames.size > 0 && !orderHasSelectedItem(order) ? 0.4 : 1, x: 0, scale: 1 }} exit="exit" transition={{ opacity: { duration: 0.3 }, layout: { type: 'spring', damping: 25, stiffness: 200 } }} className="min-w-0">
                                  <OrderCard order={displayOrder} onBump={handleBump} onRecall={handleStepBack} onFireCourse={handleFireCourse} onItemStatusChange={handleItemStatusChange} showAllergens={showAllergens} highlightItemNames={highlightItemNames} onMarkSeen={toggleOrderSeen} onItemDismiss={handleItemDismiss} />
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className={`grid gap-1.5 items-start ${isPortrait ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'}`}>
                      <AnimatePresence mode="popLayout">
                        {filteredOrders.map((order) => {
                          const displayOrder = getStationDisplayOrder(order);
                          return (
                            <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate={{ opacity: highlightItemNames.size > 0 && !orderHasSelectedItem(order) ? 0.4 : 1, x: 0, scale: 1 }} exit="exit" transition={{ opacity: { duration: 0.3 }, layout: { type: 'spring', damping: 25, stiffness: 200 } }} className="min-w-0">
                              <OrderCard order={displayOrder} onBump={handleBump} onRecall={handleStepBack} onFireCourse={handleFireCourse} onItemStatusChange={handleItemStatusChange} showAllergens={showAllergens} highlightItemNames={highlightItemNames} onMarkSeen={toggleOrderSeen} onItemDismiss={handleItemDismiss} compactRows />
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
                      <AnimatePresence mode="popLayout">
                        {filteredOrders.map((order) => {
                          const displayOrder = getStationDisplayOrder(order);
                          return (
                            <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate={{ opacity: highlightItemNames.size > 0 && !orderHasSelectedItem(order) ? 0.4 : 1, x: 0, scale: 1 }} exit="exit" transition={{ opacity: { duration: 0.3 }, layout: { type: 'spring', damping: 25, stiffness: 200 } }} className={`shrink-0 ${isPortrait ? 'w-[220px]' : 'w-[180px] sm:w-[190px] lg:w-[200px] xl:w-[210px]'}`}>
                              <OrderCard order={displayOrder} onBump={handleBump} onRecall={handleStepBack} onFireCourse={handleFireCourse} onItemStatusChange={handleItemStatusChange} showAllergens={showAllergens} highlightItemNames={highlightItemNames} onMarkSeen={toggleOrderSeen} onItemDismiss={handleItemDismiss} />
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        )}

        {!settingsOpen && !isSubScreen && (kdsMode === 'Expo'
          ? <ExpoSummaryPanel tickets={expoAllTickets.length > 0 ? expoAllTickets : expoTickets} pinnedTicketIds={expoPinnedIds} onTogglePin={handleExpoTogglePin} onClearAllPins={handleExpoClearAllPins} selectedProducts={expoSelectedProducts} onProductToggle={handleExpoProductToggle} onSendAllProduct={handleExpoSendAllProduct} />
          : <ItemSummaryPanel orders={ordersWithItemStatuses} stationCourse={resolvedStationCourse} selectedItems={selectedSummaryItems} onItemToggle={handleSummaryItemToggle} selectedCategories={selectedSummaryCategories} onCategoryToggle={handleSummaryCategoryToggle} onClearAll={handleSummaryClearAll} matchingTicketCount={matchingTicketCount} />
        )}
      </div>

      <AnimatePresence>
        {expandedOrderId && (() => {
          const expandedOrder = orders.find(o => o.id === expandedOrderId);
          if (!expandedOrder) return null;
          return (
            <ExpandedOrderCard
              order={expandedOrder}
              onClose={() => setExpandedOrderId(null)}
              onBump={handleBump}
            />
          );
        })()}
      </AnimatePresence>

      <BottomStatusBar orderCount={activeOrderCount} viewMode={viewMode} onViewModeChange={setViewMode} theme={theme} onToggleTheme={toggleTheme} sortMode={sortMode} onSortModeChange={setSortMode} hideViewControls={false} onOpenLanguageSettings={() => { window.location.assign('/kds/full/settings/display#language'); }} onOpenCategoryFilter={() => onOpenSub?.('category-filter')} onOpenRevenueFilter={() => onOpenSub?.('revenue-filter')} />
    </div>
  );
}
