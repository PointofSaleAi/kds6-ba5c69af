import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { SortMode } from '@/components/kds/BottomStatusBar';
import { KDSSidebar } from '@/components/kds/KDSSidebar';
import { OrderCard } from '@/components/kds/OrderCard';
import { ExpoOrderCard } from '@/components/kds/ExpoOrderCard';
import { PrepBoard } from '@/components/kds/PrepBoard';
import { HistoryOrderCard } from '@/components/kds/HistoryOrderCard';
import { ItemSummaryPanel } from '@/components/kds/ItemSummaryPanel';
import { BottomStatusBar } from '@/components/kds/BottomStatusBar';
import { EmptyState } from '@/components/kds/EmptyState';
import { ExpandedOrderCard } from '@/components/kds/ExpandedOrderCard';
import { SettingsPanel } from '@/components/kds/SettingsPanel';
import { mockOrders } from '@/data/mock-orders';
import { mockHistoryOrders } from '@/data/mock-history';
import { AnimatePresence, motion } from 'framer-motion';
import type { ViewMode, Order } from '@/types/kds';
import { useTheme } from '@/hooks/use-theme';
import { useKDSMode } from '@/hooks/use-kds-mode';
import { toast } from 'sonner';

interface MainOrderViewProps {
  onNavigate: (screen: string) => void;
  settingsOpen?: boolean;
  onCloseSettings?: () => void;
  onOpenSub?: (sub: string) => void;
  onLogOut?: () => void;
}

function distributeIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const safeColumnCount = Math.max(1, columnCount);
  const columns = Array.from({ length: safeColumnCount }, () => [] as T[]);
  items.forEach((item, i) => {
    columns[i % safeColumnCount].push(item);
  });
  return columns;
}

export default function MainOrderView({ onNavigate, settingsOpen, onCloseSettings, onOpenSub, onLogOut }: MainOrderViewProps) {
  const { theme, toggleTheme } = useTheme();
  const { mode: kdsMode } = useKDSMode();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeNav, setActiveNav] = useState('home');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [historyOrders, setHistoryOrders] = useState<Order[]>(mockHistoryOrders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('time');

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
    if (boardContentWidth <= 0) return 3;
    if (boardContentWidth < 520) return 1;
    if (boardContentWidth < 760) return 2;
    if (boardContentWidth < 1160) return 3;
    if (boardContentWidth < 1480) return 4;
    return 5;
  }, [boardContentWidth]);

  // Move served orders to history immediately
  useEffect(() => {
    const servedOrders = orders.filter(o => o.status === 'served');
    if (servedOrders.length > 0) {
      setHistoryOrders(prev => [...servedOrders.map(o => ({ ...o, elapsedSeconds: Math.round((Date.now() - o.timeReceived.getTime()) / 1000) })), ...prev]);
      setOrders(prev => prev.filter(o => o.status !== 'served'));
    }
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const filtered = orders.filter((o) => {
      if (activeFilter === 'new') return o.status === 'new';
      if (activeFilter === 'in-progress') return o.status === 'in-progress' || o.status === 'seen';
      if (activeFilter === 'completed') return o.status !== 'served';
      return true;
    });

    const sorted = [...filtered];
    if (sortMode === 'table') {
      sorted.sort((a, b) => a.tableName.localeCompare(b.tableName));
    } else if (sortMode === 'type') {
      sorted.sort((a, b) => a.orderType.localeCompare(b.orderType));
    } else {
      sorted.sort((a, b) => a.timeReceived.getTime() - b.timeReceived.getTime());
    }
    return sorted;
  }, [orders, activeFilter, sortMode]);

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

  const handleBump = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const nextStatus =
          o.status === 'new' ? 'seen' as const :
          o.status === 'seen' ? 'in-progress' as const : 'served' as const;
        return { ...o, status: nextStatus };
      })
    );
  }, []);

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

  const handleRecall = useCallback((orderId: string) => {
    const historyOrder = historyOrders.find(o => o.id === orderId);
    if (!historyOrder) return;
    const recalledOrder: Order = {
      ...historyOrder,
      status: 'recalled',
      timeReceived: new Date(),
      elapsedSeconds: 0,
    };
    setOrders((prev) => [recalledOrder, ...prev]);
    setHistoryOrders((prev) => prev.filter(o => o.id !== orderId));
    toast.success(`Order #${historyOrder.orderNumber} recalled and added to queue`);
    setActiveNav('home');
  }, [historyOrders]);

  const handleNavigate = useCallback((target: string) => {
    if (target === 'home' || target === 'history') {
      setActiveNav(target);
      onCloseSettings?.();
    } else {
      onNavigate(target);
    }
  }, [onNavigate, onCloseSettings]);

  const activeOrderCount = orders.filter((o) => o.status !== 'served').length;

  const cardVariants = {
    initial: { opacity: 0, x: 80, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 200 } },
    exit: { opacity: 0, scale: 0.9, filter: 'grayscale(1)', transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

  const dateTabs = ['Today', 'Yesterday', 'Last 7 Days'];

  const isHistory = activeNav === 'history';

  return (
    <div className="fixed inset-0 flex flex-col bg-surface-bg">
      <div className="flex flex-1 overflow-hidden">
        <KDSSidebar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onNavigate={handleNavigate}
          activeNav={activeNav}
          settingsOpen={settingsOpen}
        />

        {settingsOpen ? (
          <SettingsPanel
            onClose={() => onCloseSettings?.()}
            onOpenSub={(sub) => onOpenSub?.(sub)}
            onLogOut={onLogOut}
          />
        ) : (
        <div ref={boardContentRef} className="flex-1 flex flex-col overflow-hidden relative">
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
                <div className="flex-1 overflow-auto p-3">
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredHistory.map((order) => (
                        <motion.div key={order.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <HistoryOrderCard order={order} onRecall={handleRecall} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {viewMode === 'horizontal' && (
                    <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
                      {filteredHistory.map((order) => (
                        <motion.div key={order.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="shrink-0 w-[320px]">
                          <HistoryOrderCard order={order} onRecall={handleRecall} />
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
                              <HistoryOrderCard order={order} onRecall={handleRecall} />
                            </motion.div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {filteredOrders.length === 0 ? (
                <EmptyState />
              ) : kdsMode === 'Prep' ? (
                <PrepBoard orders={filteredOrders} onBump={handleBump} />
              ) : (
                <div className="flex-1 overflow-auto p-3">
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      <AnimatePresence mode="popLayout">
                        {filteredOrders.map((order) => (
                          <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit">
                            {kdsMode === 'Expo' ? (
                              <ExpoOrderCard order={order} onBump={handleBump} />
                            ) : (
                              <OrderCard order={order} onBump={handleBump} onRecall={handleStepBack} onFireCourse={handleFireCourse} />
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                  {viewMode === 'horizontal' && (
                    <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
                      <AnimatePresence mode="popLayout">
                        {filteredOrders.map((order) => (
                          <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit" className="shrink-0 w-[320px]">
                            {kdsMode === 'Expo' ? (
                              <ExpoOrderCard order={order} onBump={handleBump} />
                            ) : (
                              <OrderCard order={order} onBump={handleBump} onRecall={handleStepBack} onFireCourse={handleFireCourse} />
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                  {viewMode === 'stagger' && (
                    <div className="flex gap-1.5 sm:gap-2 lg:gap-2.5 items-start">
                      {staggerOrderColumns.map((col, colIdx) => (
                        <div key={colIdx} className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2 lg:gap-2.5">
                          <AnimatePresence mode="popLayout">
                            {col.map((order) => (
                              <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit" className="min-w-0">
                                {kdsMode === 'Expo' ? (
                                  <ExpoOrderCard order={order} onBump={handleBump} />
                                ) : (
                                  <OrderCard order={order} onBump={handleBump} onRecall={handleStepBack} onFireCourse={handleFireCourse} />
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        )}

        {!settingsOpen && <ItemSummaryPanel orders={orders} />}
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

      <BottomStatusBar orderCount={activeOrderCount} viewMode={viewMode} onViewModeChange={setViewMode} theme={theme} onToggleTheme={toggleTheme} sortMode={sortMode} onSortModeChange={setSortMode} />
    </div>
  );
}
