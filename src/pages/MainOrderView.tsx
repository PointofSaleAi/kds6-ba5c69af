import { useState, useCallback, useEffect, useRef, useMemo, lazy, Suspense, type ReactNode } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { DEFAULT_ORDER_TYPE_COLORS } from '@/hooks/use-kds-settings';
import type { OrderType } from '@/types/kds';
import type { SortMode } from '@/components/kds/BottomStatusBar';
import type { ItemStatus } from '@/components/kds/CourseSection';
import { KDSSidebar } from '@/components/kds/KDSSidebar';
import { getKdsScaleClasses } from '@/lib/kds-scale';
import { OrderCard } from '@/components/kds/OrderCard';
import { HistoryOrderCard } from '@/components/kds/HistoryOrderCard';
import { OrderCardV1 } from '@/components/kds/variants/OrderCardV1';
import { OrderCardV2 } from '@/components/kds/variants/OrderCardV2';
import { OrderCardV3 } from '@/components/kds/variants/OrderCardV3';
import { OrderCardV4 } from '@/components/kds/variants/OrderCardV4';
import { OrderCardV5 } from '@/components/kds/variants/OrderCardV5';

import { PrepBoard } from '@/components/kds/PrepBoard';
import ExpoView from '@/components/kds/ExpoView';
import { ItemSummaryPanel } from '@/components/kds/ItemSummaryPanel';
import { ExpoSummaryPanel } from '@/components/kds/ExpoSummaryPanel';
import { BottomStatusBar } from '@/components/kds/BottomStatusBar';
import { AIAssistantPanel } from '@/components/kds/AIAssistantPanel';
import { EmptyState } from '@/components/kds/EmptyState';
import { ExpandedOrderCard } from '@/components/kds/ExpandedOrderCard';
import { SettingsPanel } from '@/components/kds/SettingsPanel';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { mockHistoryOrders } from '@/data/mock-history';
import { AnimatePresence, motion } from 'framer-motion';
import type { ViewMode, Order, OrderItem } from '@/types/kds';
import { useTheme } from '@/hooks/use-theme';
import { useKDSMode } from '@/hooks/use-kds-mode';
import { useSound } from '@/hooks/use-sound';
import { KDSSettingsPreviewScope, useKDSSettings } from '@/hooks/use-kds-settings';
import { useOrderStore } from '@/hooks/use-order-store';
import { toast } from 'sonner';
import { usePortrait } from '@/hooks/use-portrait';
import { useKitchenMessages } from '@/hooks/use-kitchen-messages';
import { Megaphone } from 'lucide-react';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { useActiveKDSView } from '@/hooks/use-active-kds-view';
import SeenOrdersScreen from '@/pages/SeenOrdersScreen';
import UnseenOrdersScreen from '@/pages/UnseenOrdersScreen';
import { OnboardingWalkthrough } from '@/components/onboarding/OnboardingWalkthrough';
import { ONBOARDING_SAMPLE_ORDER_ID } from '@/data/onboarding-sample-order';
import { useOnboarding } from '@/hooks/use-onboarding';
import {
  getCardVariantForTicketsRoute,
  getTicketsRouteForCardVariant,
  readStoredTicketsRoute,
  TICKETS_ROUTE_CHANGE_EVENT,
  type CardVariant,
} from '@/lib/ticket-card-variant';


interface MainOrderViewProps {
  onNavigate: (screen: string) => void;
  settingsOpen?: boolean;
  onCloseSettings?: () => void;
  onOpenSub?: (sub: string) => void;
  onLogOut?: () => void;
  onDevModeChange?: (enabled: boolean) => void;
  /** When set, OrderCards dim non-matching courses */
  stationCourse?: string;
  historyCategories?: string[];
  historyCenters?: string[];
  onClearHistoryCategories?: () => void;
  onClearHistoryCenters?: () => void;
  onSetHistoryCategories?: (cats: string[]) => void;
  onSetHistoryCenters?: (cs: string[]) => void;
  /** Selects an alternate ticket card layout. */
  cardVariant?: CardVariant;
  /** When true, restore legacy per-product icon actions on product rows. */
  legacyActions?: boolean;
}

function distributeIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const safeColumnCount = Math.max(1, columnCount);
  const columns = Array.from({ length: safeColumnCount }, () => [] as T[]);
  items.forEach((item, i) => {
    columns[i % safeColumnCount].push(item);
  });
  return columns;
}

export default function MainOrderView({ onNavigate, settingsOpen, onCloseSettings, onOpenSub, onLogOut, onDevModeChange, stationCourse: stationCourseProp, historyCategories = [], historyCenters = [], onClearHistoryCategories, onClearHistoryCenters, onSetHistoryCategories, onSetHistoryCenters, cardVariant = 'default', legacyActions = false }: MainOrderViewProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { mode: kdsMode, stationCourse: contextStationCourse, setStationCourse } = useKDSMode();
  const resolvedStationCourse = stationCourseProp || contextStationCourse || undefined;
  const { playSound } = useSound();
  const { cardsPerRow, textSize, showAllergens, sortDefault, staggerMode, ticketSpacing, orderTypeColors, getRouteSetting } = useKDSSettings();
  const { orders, setOrders, expoTickets, markItemDone, markAllItemsDone, seenOrderIds, toggleOrderSeen } = useOrderStore();
  const { isPortrait } = usePortrait();
  const { layout: dockLayout } = useDockLayout();
  const { active: onboardingActive } = useOnboarding();
  const { pendingCount: kitchenMessagePendingCount, messages: kitchenMessages } = useKitchenMessages();
  const [viewMode, setViewMode] = useState<ViewMode>('stagger');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeNav, setActiveNav] = useState('home');
  const { setView: setActiveKDSView } = useActiveKDSView();
  useEffect(() => {
    if (activeNav === 'home' || activeNav === 'history' || activeNav === 'seen-orders' || activeNav === 'unseen-orders') {
      setActiveKDSView(activeNav as any);
    }
  }, [activeNav, setActiveKDSView]);
  const [expoFilter, setExpoFilter] = useState<'all' | 'ready' | 'recalled'>('all');
  const [historyOrders, setHistoryOrders] = useState<Order[]>(mockHistoryOrders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const sortDefaultMap: Record<string, SortMode> = { 'By time': 'newest', 'By table': 'table', 'By type': 'type' };
  const [sortMode, setSortMode] = useState<SortMode>(sortDefaultMap[sortDefault] || 'newest');
  const [settingsSection, setSettingsSection] = useState<string>('display');
  const prevOrderCountRef = useRef(orders.length);
  const prevMessageCountRef = useRef(kitchenMessages.length);
  const [messageFlash, setMessageFlash] = useState<{ text: string; from: string } | null>(null);
  const [globalItemStatuses, setGlobalItemStatuses] = useState<Map<string, ItemStatus>>(new Map());
  const [selectedSummaryItems, setSelectedSummaryItems] = useState<Set<string>>(new Set());
  const [selectedSummaryCategories, setSelectedSummaryCategories] = useState<Set<string>>(new Set());
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const fallbackTicketsRoute = useMemo(() => getTicketsRouteForCardVariant(cardVariant, legacyActions), [cardVariant, legacyActions]);
  const [selectedTicketsRoute, setSelectedTicketsRoute] = useState(() => readStoredTicketsRoute(fallbackTicketsRoute));
  const effectiveCardVariant = getCardVariantForTicketsRoute(selectedTicketsRoute);
  const effectiveLegacyActions = selectedTicketsRoute === 'Default';
  const effectiveTextSize = getRouteSetting(selectedTicketsRoute, 'textSize') || textSize;
  const effectiveTicketSpacing = getRouteSetting(selectedTicketsRoute, 'ticketSpacing') || ticketSpacing;

  useEffect(() => {
    setSelectedTicketsRoute(readStoredTicketsRoute(fallbackTicketsRoute));
  }, [fallbackTicketsRoute]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncTicketsRoute = (event?: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === 'string') {
        setSelectedTicketsRoute(readStoredTicketsRoute(fallbackTicketsRoute));
        return;
      }
      setSelectedTicketsRoute(readStoredTicketsRoute(fallbackTicketsRoute));
    };
    window.addEventListener(TICKETS_ROUTE_CHANGE_EVENT, syncTicketsRoute);
    window.addEventListener('storage', syncTicketsRoute);
    return () => {
      window.removeEventListener(TICKETS_ROUTE_CHANGE_EVENT, syncTicketsRoute);
      window.removeEventListener('storage', syncTicketsRoute);
    };
  }, [fallbackTicketsRoute]);

  useEffect(() => {
    const handler = () => setAiAssistantOpen(true);
    window.addEventListener('kds:open-ai-assistant', handler);
    return () => window.removeEventListener('kds:open-ai-assistant', handler);
  }, []);

  // Per-order acknowledgment of order notes (lifted out of OrderNotesSection so MainOrderView can gate ticket removal).
  const [notesAcknowledgedIds, setNotesAcknowledgedIds] = useState<Set<string>>(new Set());
  const acknowledgeOrderNotes = useCallback((orderId: string) => {
    setNotesAcknowledgedIds(prev => {
      if (prev.has(orderId)) return prev;
      const next = new Set(prev);
      next.add(orderId);
      return next;
    });
  }, []);
  const unacknowledgeOrderNotes = useCallback((orderId: string) => {
    setNotesAcknowledgedIds(prev => {
      if (!prev.has(orderId)) return prev;
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
  }, []);

  /**
   * Returns true if the order still has unacknowledged kitchen messages
   * or unseen order notes, blocking removal from Home.
   */
  const isAcknowledgmentPending = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    const pendingMessages = kitchenMessages.some(
      m => m.linked_order_id === orderId && m.status === 'pending'
    );
    const hasUnseenNotes = !!order.orderNotes && !notesAcknowledgedIds.has(orderId);
    return pendingMessages || hasUnseenNotes;
  }, [orders, kitchenMessages, notesAcknowledgedIds]);

  // Track tickets where the kitchen tried to clear (final 3rd-tap) but was blocked
  // because messages/notes were still pending. We auto-finish them once acks clear.
  const [pendingBumpIds, setPendingBumpIds] = useState<Set<string>>(new Set());
  const handleBumpBlocked = useCallback((orderId: string) => {
    setPendingBumpIds(prev => {
      if (prev.has(orderId)) return prev;
      const next = new Set(prev);
      next.add(orderId);
      return next;
    });
  }, []);

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

  const markOrderSeen = useCallback((orderId: string) => {
    if (!seenOrderIds.has(orderId)) toggleOrderSeen(orderId);
  }, [seenOrderIds, toggleOrderSeen]);

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
  const [historyFilterOpen, setHistoryFilterOpen] = useState(false);
  
  const [historyActiveTypes, setHistoryActiveTypes] = useState<OrderType[]>([]);
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

  const [viewportWidth, setViewportWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 0);
  useEffect(() => {
    const handler = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const staggerColumnCount = useMemo(() => {
    // Portrait: match Grid breakpoints (Tailwind min-[960px] uses viewport width).
    // 2 cols on iPad Mini/Air, 3 cols on iPad Pro (viewport >= 960px).
    if (isPortrait) return viewportWidth >= 960 ? 3 : 2;
    if (boardContentWidth <= 0) return 4;
    if (effectiveCardVariant === 'v1' || effectiveCardVariant === 'v4') {
      // V1/V4: 4 / 5 / 6 by viewport width
      if (boardContentWidth < 480) return 3;
      if (boardContentWidth < 1100) return 4;
      if (boardContentWidth < 1400) return 5;
      return 6;
    }
    if (effectiveCardVariant === 'v5') {
      // V5: 4 on small screens, 5 on wide screens
      if (boardContentWidth < 1100) return 4;
      return 5;
    }

    if (boardContentWidth < 480) return 2;
    if (boardContentWidth < 760) return 3;
    if (boardContentWidth < 1100) return 4;
    return 5;
  }, [boardContentWidth, isPortrait, viewportWidth, effectiveCardVariant]);


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
    const norm = (s: string) => s.toUpperCase().replace(/S$/, '');
    const catSet = new Set(historyCategories.map(norm));
    const centerSet = new Set(historyCenters.map((c) => c.toUpperCase()));
    const centerStationMap: Record<string, string[]> = {
      'BAR': ['Bar'],
      'GRILL': ['Grill'],
      'COLD KITCHEN': ['Salad'],
      'KITCHEN': ['Grill', 'Fry', 'Dessert'],
      'PASS': ['Grill', 'Fry', 'Salad', 'Dessert', 'Bar'],
      'EXPO': ['Grill', 'Fry', 'Salad', 'Dessert', 'Bar'],
    };
    const categoryToCenters: Record<string, string[]> = {
      'SALAD': ['COLD KITCHEN', 'KITCHEN'],
      'APPETIZER': ['KITCHEN'],
      'MEAT': ['GRILL', 'KITCHEN'],
      'POULTRY': ['GRILL', 'KITCHEN'],
      'SEAFOOD': ['GRILL', 'KITCHEN'],
      'PASTA': ['KITCHEN'],
      'VEGETARIAN': ['KITCHEN'],
      'DESSERT': ['KITCHEN'],
      'BEVERAGE': ['BAR'],
      'COCKTAIL': ['BAR'],
      'BAR COCKTAIL': ['BAR'],
    };
    const allowedStations = new Set<string>();
    centerSet.forEach((c) => (centerStationMap[c] || []).forEach((s) => allowedStations.add(s)));

    let filtered = orders.filter((o) => {
      if (activeFilter === 'new') { if (o.status !== 'new') return false; }
      else if (activeFilter === 'in-progress') { if (!(o.status === 'in-progress' || o.status === 'seen')) return false; }
      else if (activeFilter === 'completed') { if (o.status === 'served') return false; }

      if (catSet.size > 0) {
        const courseMatch = o.courses.some((c) => catSet.has(norm(String(c.course))));
        const itemCatMatch = o.courses.some((c) => c.items.some((i) => i.category && catSet.has(norm(i.category))));
        if (!courseMatch && !itemCatMatch) return false;
      }
      if (centerSet.size > 0) {
        const stationMatch = o.courses.some((c) =>
          c.items.some((i) => {
            if (i.station && allowedStations.has(i.station)) return true;
            const cat = i.category ? norm(i.category) : '';
            const mapped = categoryToCenters[cat] || [];
            return mapped.some((m) => centerSet.has(m));
          }),
        );
        if (!stationMatch) return false;
      }
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

    // Keep the onboarding training ticket in the first visible slot so its app cues
    // always point at the correct sample card, regardless of live-ticket sorting.
    const sample = sorted.filter(o => o.id === ONBOARDING_SAMPLE_ORDER_ID);
    const withoutSample = sorted.filter(o => o.id !== ONBOARDING_SAMPLE_ORDER_ID);
    if (sample.length > 0) return [...sample, ...withoutSample];

    // Rush override: rushed orders jump to position 1
    const rushed = sorted.filter(o => o.isRushed);
    const nonRushed = sorted.filter(o => !o.isRushed);
    return [...rushed, ...nonRushed];
  }, [orders, activeFilter, sortMode, selectedSummaryItems, selectedSummaryCategories, isStationView, resolvedStationCourse, historyCategories, historyCenters]);

  const filteredHistory = useMemo(() => {
    const norm = (s: string) => s.toUpperCase().replace(/S$/, '');
    const catSet = new Set(historyCategories.map(norm));
    const centerSet = new Set(historyCenters.map((c) => c.toUpperCase()));
    const centerStationMap: Record<string, string[]> = {
      'BAR': ['Bar'],
      'GRILL': ['Grill'],
      'COLD KITCHEN': ['Salad'],
      'KITCHEN': ['Grill', 'Fry', 'Dessert'],
      'PASS': ['Grill', 'Fry', 'Salad', 'Dessert', 'Bar'],
      'EXPO': ['Grill', 'Fry', 'Salad', 'Dessert', 'Bar'],
    };
    const categoryToCenters: Record<string, string[]> = {
      'SALAD': ['COLD KITCHEN', 'KITCHEN'],
      'APPETIZER': ['KITCHEN'],
      'MEAT': ['GRILL', 'KITCHEN'],
      'POULTRY': ['GRILL', 'KITCHEN'],
      'SEAFOOD': ['GRILL', 'KITCHEN'],
      'PASTA': ['KITCHEN'],
      'VEGETARIAN': ['KITCHEN'],
      'DESSERT': ['KITCHEN'],
      'BEVERAGE': ['BAR'],
      'COCKTAIL': ['BAR'],
      'BAR COCKTAIL': ['BAR'],
    };
    const allowedStations = new Set<string>();
    centerSet.forEach((c) => (centerStationMap[c] || []).forEach((s) => allowedStations.add(s)));

    let list = historyOrders.filter((o) => {
      if (historyActiveTypes.length > 0 && !historyActiveTypes.includes(o.orderType)) return false;
      if (catSet.size > 0) {
        const courseMatch = o.courses.some((c) => catSet.has(norm(String(c.course))));
        const itemCatMatch = o.courses.some((c) => c.items.some((i) => i.category && catSet.has(norm(i.category))));
        if (!courseMatch && !itemCatMatch) return false;
      }
      if (centerSet.size > 0) {
        const stationMatch = o.courses.some((c) =>
          c.items.some((i) => {
            if (i.station && allowedStations.has(i.station)) return true;
            const cat = i.category ? norm(i.category) : '';
            const mapped = categoryToCenters[cat] || [];
            return mapped.some((m) => centerSet.has(m));
          }),
        );
        if (!stationMatch) return false;
      }
      if (!historySearch) return true;
      const q = historySearch.toLowerCase();
      return (
        String(o.orderNumber).includes(q) ||
        o.tableName.toLowerCase().includes(q) ||
        o.serverName.toLowerCase().includes(q)
      );
    });

    if (isStationView && resolvedStationCourse) {
      list = list
        .map((o) => {
          const courses = o.courses
            .map((c) => ({
              ...c,
              items: c.items.filter((i) => i.category === resolvedStationCourse),
            }))
            .filter((c) => c.items.length > 0);
          const itemCount = courses.reduce(
            (sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0),
            0,
          );
          return { ...o, courses, itemCount };
        })
        .filter((o) => o.courses.length > 0);
    }

    const sorted = [...list];
    if (sortMode === 'table') {
      sorted.sort((a, b) => a.tableName.localeCompare(b.tableName));
    } else if (sortMode === 'type') {
      sorted.sort((a, b) => a.orderType.localeCompare(b.orderType));
    } else if (sortMode === 'oldest') {
      sorted.sort((a, b) => a.timeReceived.getTime() - b.timeReceived.getTime());
    } else {
      sorted.sort((a, b) => b.timeReceived.getTime() - a.timeReceived.getTime());
    }

    // Reorder/filter based on selected summary items + categories (tap-to-filter from Summary panel)
    const hasFilters = selectedSummaryItems.size > 0 || selectedSummaryCategories.size > 0;
    if (hasFilters) {
      const matching: Array<{ order: Order; matchCount: number }> = [];
      const nonMatching: Order[] = [];
      for (const o of sorted) {
        const matchCount = o.courses.reduce((acc, c) => acc + c.items.filter(i => {
          if (i.isCancelled) return false;
          return selectedSummaryItems.has(i.name) || (i.category && selectedSummaryCategories.has(i.category));
        }).length, 0);
        if (matchCount > 0) matching.push({ order: o, matchCount });
        else nonMatching.push(o);
      }
      matching.sort((a, b) => b.matchCount - a.matchCount);
      return [...matching.map(m => m.order), ...nonMatching];
    }
    return sorted;
  }, [historyOrders, historySearch, historyActiveTypes, historyCategories, historyCenters, sortMode, isStationView, resolvedStationCourse, selectedSummaryItems, selectedSummaryCategories]);

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
    // OrderCard only calls onBump after the user has fully advanced the ticket
    // through DONE locally. Always mark the order served so the served-orders
    // effect moves it to History on the next render. Previously we stepped the
    // global status one step at a time (new → seen → in-progress → served),
    // which required up to 3 taps to actually remove a card whose local state
    // was already "done" - the source of the "needs multiple taps" glitch.
    markAllItemsDone(orderId);
  }, [orders, markAllItemsDone]);

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
    toast.success(`Order ${historyOrder.orderNumber} recalled and added to queue`);
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

    toast.success('Product recalled to kitchen', { duration: 2000 });
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
    // Capture pending state at dismissal time so we can keep the ticket as a stub
    // when the kitchen still owes acknowledgment of messages or order notes.
    const pendingAck = isAcknowledgmentPending(orderId);
    setOrders(prev => prev.flatMap(o => {
      if (o.id !== orderId) return [o];
      const updatedCourses = o.courses
        .map(c => ({ ...c, items: c.items.filter(i => i.id !== item.id) }))
        .filter(c => c.items.length > 0);
      const newItemCount = updatedCourses.reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0);
      if (updatedCourses.length === 0 && !pendingAck) return [];
      return [{ ...o, courses: updatedCourses, itemCount: newItemCount }];
    }));

    toast.success(`${item.name} sent to history`, { duration: 1800 });
  }, [orders, setOrders, isAcknowledgmentPending]);

  // Auto-clear stub tickets that were retained on Home only because of pending
  // messages/notes once the kitchen acknowledges everything.
  useEffect(() => {
    const stubs = orders.filter(o => o.courses.length === 0);
    if (stubs.length === 0) return;
    const toRemove = stubs.filter(o => !isAcknowledgmentPending(o.id));
    if (toRemove.length === 0) return;
    const removeIds = new Set(toRemove.map(o => o.id));
    setOrders(prev => prev.filter(o => !removeIds.has(o.id)));
  }, [orders, kitchenMessages, notesAcknowledgedIds, isAcknowledgmentPending, setOrders]);

  // Auto-finish coursed/normal tickets that the kitchen tried to clear while
  // acknowledgments were pending. Once message and notes are acknowledged, run
  // the deferred bump so the ticket leaves Home.
  useEffect(() => {
    if (pendingBumpIds.size === 0) return;
    const ready: string[] = [];
    pendingBumpIds.forEach(id => {
      if (!isAcknowledgmentPending(id)) ready.push(id);
    });
    if (ready.length === 0) return;
    ready.forEach(id => markAllItemsDone(id));
    setPendingBumpIds(prev => {
      const next = new Set(prev);
      ready.forEach(id => next.delete(id));
      return next;
    });
  }, [pendingBumpIds, kitchenMessages, notesAcknowledgedIds, isAcknowledgmentPending, markAllItemsDone]);

  const handleNavigate = useCallback((target: string) => {
    if (target === 'home' || target === 'history' || target === 'seen-orders' || target === 'unseen-orders') {
      if (kdsMode === 'Expo' && target === 'home') setExpoFilter('all');
      if (kdsMode === 'Expo' && target === 'seen-orders') setExpoFilter('ready');
      if (kdsMode === 'Expo' && target === 'unseen-orders') setExpoFilter('recalled');
      setActiveNav(target);
      if (target === 'home') {
        // Route to the layout the user selected in Settings > Ticket Layout.
        onNavigate('home');
      } else {
        onCloseSettings?.();
      }
    } else {
      onNavigate(target);
    }
  }, [onNavigate, onCloseSettings, kdsMode]);

  const activeOrderCount = orders.filter((o) => o.status !== 'served').length;
  const activeOrders = useMemo(() => orders.filter(o => o.status !== 'served'), [orders]);
  const seenCount = useMemo(() => activeOrders.filter(o => seenOrderIds.has(o.id)).length, [activeOrders, seenOrderIds]);
  const unseenCount = useMemo(() => activeOrders.filter(o => !seenOrderIds.has(o.id)).length, [activeOrders, seenOrderIds]);

  // Per-screen ticket sources used to feed both the screen body AND the right Summary panel
  // so the panel always reflects exactly what the user is currently looking at.
  const seenScreenOrders = useMemo(() => {
    let list = ordersWithItemStatuses.filter(o => o.status !== 'served' && seenOrderIds.has(o.id));
    if (isStationView && resolvedStationCourse) {
      list = list
        .filter(o => o.courses.some(c => c.items.some(i => !i.isCompleted && !i.isCancelled && i.category === resolvedStationCourse)))
        .map(o => ({
          ...o,
          courses: o.courses
            .map(c => ({ ...c, items: c.items.filter(i => i.category === resolvedStationCourse) }))
            .filter(c => c.items.length > 0),
        }));
    }
    return list;
  }, [ordersWithItemStatuses, seenOrderIds, isStationView, resolvedStationCourse]);

  const unseenScreenOrders = useMemo(() => {
    let list = filteredOrders.filter(o => o.status !== 'served' && !seenOrderIds.has(o.id));
    if (isStationView && resolvedStationCourse) {
      list = list
        .filter(o => o.courses.some(c => c.items.some(i => !i.isCompleted && !i.isCancelled && i.category === resolvedStationCourse)))
        .map(o => ({
          ...o,
          courses: o.courses
            .map(c => ({ ...c, items: c.items.filter(i => i.category === resolvedStationCourse) }))
            .filter(c => c.items.length > 0),
        }));
    }
    return list;
  }, [filteredOrders, seenOrderIds, isStationView, resolvedStationCourse]);

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

  const dateTabs = ['Today', 'Yesterday', 'Last 7 days'];

  const isHistory = activeNav === 'history';
  const isSeenScreen = activeNav === 'seen-orders';
  const isUnseenScreen = activeNav === 'unseen-orders';
  const isSubScreen = isHistory || isSeenScreen || isUnseenScreen;

  const V1_AGING_SPREAD_MIN = [1, 4, 7, 9, 13, 17, 24, 32];
  const renderOrderCard = (displayOrder: Order, opts?: { compactRows?: boolean }) => {
    if (isHistory && effectiveCardVariant === 'default') {
      return (
        <KDSSettingsPreviewScope route={selectedTicketsRoute}>
          <HistoryOrderCard
            order={displayOrder}
            onRecall={handleRecall}
            onRecallItem={handleRecallItem}
          />
        </KDSSettingsPreviewScope>
      );
    }
    if (displayOrder.id === ONBOARDING_SAMPLE_ORDER_ID) {
      return (
        <OrderCard
          order={displayOrder}
          onBump={handleBump}
          onRecall={handleStepBack}
          onFireCourse={handleFireCourse}
          onItemStatusChange={handleItemStatusChange}
          showAllergens={showAllergens}
          highlightItemNames={highlightItemNames}
          onMarkSeen={markOrderSeen}
          onItemDismiss={handleItemDismiss}
          onAcknowledgeNotes={acknowledgeOrderNotes}
          onUnacknowledgeNotes={unacknowledgeOrderNotes}
          isAcknowledgmentPending={isAcknowledgmentPending}
          onBumpBlocked={handleBumpBlocked}
          compactRows={false}
          layoutOverride="standard"
          legacyActions
        />
      );
    }
    const withSelectedTicketSettings = (node: ReactNode) => (
      <KDSSettingsPreviewScope route={selectedTicketsRoute}>{node}</KDSSettingsPreviewScope>
    );
    const sharedVariantProps = {
      onBump: isHistory ? handleRecall : handleBump,
      onMarkSeen: markOrderSeen,
      onItemDone: markItemDone,
      onItemDismiss: isHistory ? handleRecallItem : handleItemDismiss,
      isSeen: seenOrderIds.has(displayOrder.id),
    };

    if (effectiveCardVariant === 'v1') {
      const idx = Math.abs(displayOrder.orderNumber) % V1_AGING_SPREAD_MIN.length;
      const mins = V1_AGING_SPREAD_MIN[idx];
      let flatIdx = 0;
      const v1Order: Order = {
        ...displayOrder,
        timeReceived: new Date(Date.now() - mins * 60_000),
        elapsedSeconds: mins * 60,
        courses: (displayOrder.courses ?? []).map((c) => ({
          ...c,
          items: (c.items ?? []).map((it) => {
            const keep = flatIdx % 3 === 0;
            flatIdx++;
            return keep ? it : { ...it, modifiers: [], allergens: [] };
          }),
        })),
      };
      return withSelectedTicketSettings(<OrderCardV1 order={v1Order} {...sharedVariantProps} />);
    }
    if (effectiveCardVariant === 'v2') {
      let flatIdx2 = 0;
      const v2Order: Order = {
        ...displayOrder,
        courses: (displayOrder.courses ?? []).map((c) => ({
          ...c,
          items: (c.items ?? []).map((it) => {
            const keep = flatIdx2 % 3 === 0;
            flatIdx2++;
            return keep ? it : { ...it, modifiers: [], allergens: [], notes: undefined };
          }),
        })),
      };
      return withSelectedTicketSettings(<OrderCardV2 order={v2Order} {...sharedVariantProps} />);
    }
    if (effectiveCardVariant === 'v3') {
      let flatIdx3 = 0;
      const v3Order: Order = {
        ...displayOrder,
        courses: (displayOrder.courses ?? []).map((c) => ({
          ...c,
          items: (c.items ?? []).map((it) => {
            const keep = flatIdx3 % 3 === 0;
            flatIdx3++;
            return keep ? it : { ...it, modifiers: [], allergens: [], notes: undefined };
          }),
        })),
      };
      return withSelectedTicketSettings(<OrderCardV3 order={v3Order} {...sharedVariantProps} />);
    }
    if (effectiveCardVariant === 'v4') {
      const idx = Math.abs(displayOrder.orderNumber) % V1_AGING_SPREAD_MIN.length;
      const mins = V1_AGING_SPREAD_MIN[idx];
      let flatIdx4 = 0;
      const v4Order: Order = {
        ...displayOrder,
        timeReceived: new Date(Date.now() - mins * 60_000),
        elapsedSeconds: mins * 60,
        courses: (displayOrder.courses ?? []).map((c) => ({
          ...c,
          items: (c.items ?? []).map((it) => {
            const keep = flatIdx4 % 3 === 0;
            flatIdx4++;
            return keep ? it : { ...it, modifiers: [], allergens: [] };
          }),
        })),
      };
      return withSelectedTicketSettings(<OrderCardV4 order={v4Order} {...sharedVariantProps} />);
    }
    if (effectiveCardVariant === 'v5') {
      const idx = Math.abs(displayOrder.orderNumber) % V1_AGING_SPREAD_MIN.length;
      const mins = V1_AGING_SPREAD_MIN[idx];
      const v5Order: Order = {
        ...displayOrder,
        timeReceived: new Date(Date.now() - mins * 60_000),
        elapsedSeconds: mins * 60,
      };
      return withSelectedTicketSettings(<OrderCardV5 order={v5Order} {...sharedVariantProps} />);
    }
    const isTrainingSample = displayOrder.id.startsWith('training-sample-');
    return withSelectedTicketSettings(
      <OrderCard
        order={displayOrder}
        onBump={handleBump}
        onRecall={handleStepBack}
        onFireCourse={handleFireCourse}
        onItemStatusChange={handleItemStatusChange}
        showAllergens={showAllergens}
        highlightItemNames={highlightItemNames}
        onMarkSeen={markOrderSeen}
        onItemDismiss={handleItemDismiss}
        onAcknowledgeNotes={acknowledgeOrderNotes}
        onUnacknowledgeNotes={unacknowledgeOrderNotes}
        isAcknowledgmentPending={isAcknowledgmentPending}
        onBumpBlocked={handleBumpBlocked}
        compactRows={opts?.compactRows}
        layoutOverride={isTrainingSample ? 'standard' : undefined}
        legacyActions={effectiveLegacyActions || onboardingActive || isTrainingSample}
      />
    );
  };


  return (
    <div
      className={`fixed inset-0 flex bg-surface-bg ${effectiveCardVariant === 'v5' ? 'v5-route' : ''} ${dockLayout.bottomBar === 'top' ? 'flex-col-reverse' : 'flex-col'}`}
      style={{ top: 'var(--training-bar-h, 0px)' }}
    >
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
        <div className="flex shrink-0" style={{ order: dockLayout.mainSidebar === 'left' ? 0 : 4 }}>
          <KDSSidebar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onNavigate={handleNavigate}
            activeNav={activeNav}
            settingsOpen={settingsOpen}
            seenCount={seenCount}
            unseenCount={unseenCount}
          />
        </div>

        {settingsOpen ? (
          <div
            className="flex flex-1 overflow-hidden p-4 gap-4"
            style={{ background: 'hsl(var(--surface-bg))', order: 2 }}
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
        <div ref={boardContentRef} style={{ order: 2 }} className={`flex-1 flex flex-col overflow-hidden relative ${getKdsScaleClasses(effectiveTextSize, effectiveTicketSpacing)}`}>
          {isHistory ? (
            <>
              {/* History filter bar */}
              <div className="flex items-center gap-3 px-3 pt-3 pb-2 shrink-0">
                <span className="text-[11px] font-bold uppercase text-text-muted bg-muted px-2.5 py-1 rounded tracking-wider">
                  HISTORY
                </span>
                {isStationView && resolvedStationCourse && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-[#4F46E5] px-2 py-0.5 rounded">
                    {resolvedStationCourse} station
                  </span>
                )}
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

                <Popover
                  open={historyFilterOpen}
                  onOpenChange={setHistoryFilterOpen}
                >
                  <PopoverTrigger asChild>
                    <button
                      className="relative p-2 rounded-lg border border-input bg-surface-card hover:bg-muted min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Filter orders"
                    >
                      <SlidersHorizontal size={14} className="text-text-primary" />
                      {historyActiveTypes.length > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                          {historyActiveTypes.length}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={8} className="w-72 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-3">
                      Order type
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {([
                        { value: 'dine-in', label: 'Dine In' },
                        { value: 'take-out', label: 'Take Out' },
                        { value: 'delivery', label: 'Delivery' },
                        { value: 'banquet', label: 'Banquet' },
                      ] as { value: OrderType; label: string }[]).map((opt) => {
                        const selected = historyActiveTypes.includes(opt.value);
                        const color = orderTypeColors[opt.value] || DEFAULT_ORDER_TYPE_COLORS[opt.value];
                        return (
                          <button
                            key={opt.value}
                            onClick={() =>
                              setHistoryActiveTypes((prev) =>
                                prev.includes(opt.value)
                                  ? prev.filter((t) => t !== opt.value)
                                  : [...prev, opt.value]
                              )
                            }
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors"
                            style={{
                              borderColor: color,
                              backgroundColor: selected ? color : 'transparent',
                              color: selected ? '#FFFFFF' : 'hsl(var(--text-primary))',
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: selected ? '#FFFFFF' : color }}
                            />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-end pt-3 border-t border-border">
                      <button
                        onClick={() => setHistoryActiveTypes([])}
                        className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
                      >
                        Clear
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {(historyActiveTypes.length > 0 || historyCategories.length > 0 || historyCenters.length > 0) && (
                <div className="flex items-center flex-wrap gap-2 px-3 pb-2 shrink-0">
                  {historyActiveTypes.map((type) => {
                    const color = orderTypeColors[type] || DEFAULT_ORDER_TYPE_COLORS[type];
                    const label = type === 'dine-in' ? 'Dine In' : type === 'take-out' ? 'Take Out' : type === 'delivery' ? 'Delivery' : 'Banquet';
                    return (
                      <span
                        key={`t-${type}`}
                        className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-semibold text-primary-foreground"
                        style={{ backgroundColor: color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                        {label}
                        <button
                          onClick={() => setHistoryActiveTypes((prev) => prev.filter((t) => t !== type))}
                          className="ml-0.5 w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center"
                          aria-label={`Remove ${label} filter`}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    );
                  })}
                  {historyCategories.map((cat) => (
                    <span
                      key={`c-${cat}`}
                      className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-text-primary"
                    >
                      {cat}
                      <button
                        onClick={() => onSetHistoryCategories?.(historyCategories.filter((c) => c !== cat))}
                        className="ml-0.5 w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center"
                        aria-label={`Remove ${cat} filter`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {historyCenters.map((center) => (
                    <span
                      key={`r-${center}`}
                      className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-text-primary"
                    >
                      {center}
                      <button
                        onClick={() => onSetHistoryCenters?.(historyCenters.filter((c) => c !== center))}
                        className="ml-0.5 w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center"
                        aria-label={`Remove ${center} filter`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      setHistoryActiveTypes([]);
                      onClearHistoryCategories?.();
                      onClearHistoryCenters?.();
                    }}
                    className="text-[11px] font-semibold text-text-secondary hover:text-text-primary underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* History cards */}
              {filteredHistory.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-text-muted text-sm">
                    {isStationView && resolvedStationCourse
                      ? `No ${resolvedStationCourse} history yet today`
                      : 'No orders served yet today'}
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-auto p-1.5">
                  {viewMode === 'grid' && (
                    <div className={`grid gap-1.5 items-start ${isPortrait ? 'grid-cols-2 min-[960px]:grid-cols-3' : effectiveCardVariant === 'v5' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 min-[1400px]:grid-cols-5' : (effectiveCardVariant === 'v1' || effectiveCardVariant === 'v4') ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 min-[1100px]:grid-cols-5 min-[1400px]:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'}`}>
                      {filteredHistory.map((order) => (
                        <motion.div key={order.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          {renderOrderCard(order)}
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {viewMode === 'horizontal' && (
                    <div className="flex gap-1.5 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
                      {filteredHistory.map((order) => (
                        <motion.div key={order.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`shrink-0 ${isPortrait ? 'w-[220px]' : 'w-[180px] sm:w-[190px] lg:w-[200px] xl:w-[210px]'}`}>
                          {renderOrderCard(order)}
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
                              {renderOrderCard(order)}
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
            kdsMode === 'Expo' ? (
              <ExpoView viewMode={viewMode} pinnedTicketIds={expoPinnedIds} onFilterChange={handleExpoFilterChange} onTicketSentOut={handleExpoTicketSentOut} onAllTicketsChange={handleExpoAllTicketsChange} selectedProducts={expoSelectedProducts} controlledFilter="ready" hideTopControls />
            ) : (
              <SeenOrdersScreen orders={seenScreenOrders} viewMode={viewMode} showAllergens={showAllergens} onBump={handleBump} onStepBack={handleStepBack} onFireCourse={handleFireCourse} onItemStatusChange={handleItemStatusChange} onMarkSeen={markOrderSeen} onItemDismiss={handleItemDismiss} renderCard={renderOrderCard} cardVariant={effectiveCardVariant} />
            )
          ) : isUnseenScreen ? (
            kdsMode === 'Expo' ? (
              <ExpoView viewMode={viewMode} pinnedTicketIds={expoPinnedIds} onFilterChange={handleExpoFilterChange} onTicketSentOut={handleExpoTicketSentOut} onAllTicketsChange={handleExpoAllTicketsChange} selectedProducts={expoSelectedProducts} controlledFilter="recalled" hideTopControls />
            ) : (
              <UnseenOrdersScreen orders={unseenScreenOrders} viewMode={viewMode} showAllergens={showAllergens} onBump={handleBump} onStepBack={handleStepBack} onFireCourse={handleFireCourse} onItemStatusChange={handleItemStatusChange} onMarkSeen={markOrderSeen} onItemDismiss={handleItemDismiss} renderCard={renderOrderCard} cardVariant={effectiveCardVariant} />
            )
          ) : (
            <>
              {isStationView && resolvedStationCourse && (
                <div className="flex items-center justify-between px-4 shrink-0" style={{ height: 40, backgroundColor: '#1F2128' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold uppercase" style={{ fontSize: 11, letterSpacing: '0.06em', backgroundColor: '#4F46E5', borderRadius: 20, padding: '3px 10px' }}>
                      {resolvedStationCourse}
                    </span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>Station view</span>
                  </div>
                  <button
                    onClick={() => setStationCourse(null)}
                    style={{ fontSize: 12, color: '#818CF8' }}
                    className="hover:underline"
                  >
                    Exit Station view
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
                <ExpoView viewMode={viewMode} pinnedTicketIds={expoPinnedIds} onFilterChange={handleExpoFilterChange} onTicketSentOut={handleExpoTicketSentOut} onAllTicketsChange={handleExpoAllTicketsChange} selectedProducts={expoSelectedProducts} controlledFilter="all" hideTopControls />
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
                                  {renderOrderCard(displayOrder)}
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className={`grid gap-1.5 items-start ${isPortrait ? 'grid-cols-2 min-[960px]:grid-cols-3' : effectiveCardVariant === 'v5' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 min-[1400px]:grid-cols-5' : (effectiveCardVariant === 'v1' || effectiveCardVariant === 'v4') ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 min-[1100px]:grid-cols-5 min-[1400px]:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'}`}>
                      <AnimatePresence mode="popLayout">
                        {filteredOrders.map((order) => {
                          const displayOrder = getStationDisplayOrder(order);
                          return (
                            <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate={{ opacity: highlightItemNames.size > 0 && !orderHasSelectedItem(order) ? 0.4 : 1, x: 0, scale: 1 }} exit="exit" transition={{ opacity: { duration: 0.3 }, layout: { type: 'spring', damping: 25, stiffness: 200 } }} className="min-w-0">
                              {renderOrderCard(displayOrder, { compactRows: true })}
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
                              {renderOrderCard(displayOrder)}
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

        {!settingsOpen && (
          <div className="flex shrink-0" style={{ order: dockLayout.summaryPanel === 'left' ? 1 : 3 }}>
            {kdsMode === 'Expo' && !isSubScreen
              ? <ExpoSummaryPanel tickets={expoAllTickets.length > 0 ? expoAllTickets : expoTickets} pinnedTicketIds={expoPinnedIds} onTogglePin={handleExpoTogglePin} onClearAllPins={handleExpoClearAllPins} selectedProducts={expoSelectedProducts} onProductToggle={handleExpoProductToggle} onSendAllProduct={handleExpoSendAllProduct} />
              : <ItemSummaryPanel orders={isHistory ? filteredHistory : isSeenScreen ? seenScreenOrders : isUnseenScreen ? unseenScreenOrders : ordersWithItemStatuses} stationCourse={resolvedStationCourse} selectedItems={selectedSummaryItems} onItemToggle={handleSummaryItemToggle} selectedCategories={selectedSummaryCategories} onCategoryToggle={handleSummaryCategoryToggle} onClearAll={handleSummaryClearAll} matchingTicketCount={isSubScreen ? undefined : matchingTicketCount} mode={isHistory ? 'completed' : 'active'} />}
          </div>
        )}
        <AIAssistantPanel open={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />
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

      <BottomStatusBar orderCount={activeOrderCount} viewMode={viewMode} onViewModeChange={setViewMode} theme={theme} onToggleTheme={toggleTheme} sortMode={sortMode} onSortModeChange={setSortMode} hideViewControls={false} onOpenLanguageSettings={() => navigate('/kds/v1/settings/display#language')} onOpenCategoryFilter={() => onOpenSub?.('category-filter')} onOpenRevenueFilter={() => onOpenSub?.('revenue-filter')} aiAssistantOpen={aiAssistantOpen} onToggleAiAssistant={() => setAiAssistantOpen(v => !v)} />
      <OnboardingWalkthrough />
    </div>
  );
}
