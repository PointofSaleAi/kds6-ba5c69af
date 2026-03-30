import { useState, useCallback, useEffect, useRef } from 'react';
import { LayoutGrid, LayoutList, Columns3, BellRing, Sun, Moon } from 'lucide-react';
import { KDSSidebar } from '@/components/kds/KDSSidebar';
import { OrderCard } from '@/components/kds/OrderCard';
import { ItemSummaryPanel } from '@/components/kds/ItemSummaryPanel';
import { BottomStatusBar } from '@/components/kds/BottomStatusBar';
import { EmptyState } from '@/components/kds/EmptyState';
import { mockOrders } from '@/data/mock-orders';
import { AnimatePresence, motion } from 'framer-motion';
import type { ViewMode, Order } from '@/types/kds';
import { useTheme } from '@/hooks/use-theme';

interface MainOrderViewProps {
  onNavigate: (screen: string) => void;
}

export default function MainOrderView({ onNavigate }: MainOrderViewProps) {
  const { theme, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeFilter, setActiveFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const prevOrderCount = useRef(orders.length);
  const servedTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const touchStartX = useRef(0);
  const swipeThreshold = 50;

  const cardsPerPage = viewMode === 'grid' ? 16 : viewMode === 'horizontal' ? 4 : 8;

  // Reset page on filter/view change
  useEffect(() => {
    setCurrentPage(0);
  }, [activeFilter, viewMode]);

  // Flash indicator when new orders arrive
  useEffect(() => {
    const newCount = orders.filter((o) => o.status === 'new').length;
    if (newCount > 0 && orders.length > prevOrderCount.current) {
      setNewOrderAlert(true);
      const timer = setTimeout(() => setNewOrderAlert(false), 4000);
      return () => clearTimeout(timer);
    }
    prevOrderCount.current = orders.length;
  }, [orders]);

  // Auto-collapse served orders after 30s
  useEffect(() => {
    orders.forEach((o) => {
      if (o.status === 'served' && !servedTimers.current.has(o.id)) {
        const timer = setTimeout(() => {
          setOrders((prev) => prev.filter((order) => order.id !== o.id));
          servedTimers.current.delete(o.id);
        }, 30000);
        servedTimers.current.set(o.id, timer);
      }
    });
    return () => {
      // cleanup on unmount only
    };
  }, [orders]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      servedTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'new') return o.status === 'new';
    if (activeFilter === 'in-progress') return o.status === 'in-progress' || o.status === 'seen';
    if (activeFilter === 'completed') return o.status !== 'served';
    return true;
  });

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

  const viewModes: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
    { mode: 'list', icon: LayoutList, label: 'List' },
    { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
    { mode: 'horizontal', icon: Columns3, label: 'Horizontal' },
  ];

  const activeOrderCount = orders.filter((o) => o.status !== 'served').length;

  const cardVariants = {
    initial: { opacity: 0, x: 80, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 200 } },
    exit: { opacity: 0, scale: 0.9, filter: 'grayscale(1)', transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-surface-bg">
      <div className="flex flex-1 overflow-hidden">
        <KDSSidebar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onNavigate={onNavigate}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View mode toggle + date header */}
          <div className="flex items-center justify-between px-4 py-2 bg-surface-bg">
            <div className="flex items-center gap-3">
              <div className="text-sm text-text-secondary font-medium">
                Today, {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <AnimatePresence>
                {newOrderAlert && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary text-primary-foreground text-xs font-bold animate-timer-pulse"
                  >
                    <BellRing size={14} className="animate-bell-ring" />
                    New Order
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-surface-card rounded-lg border border-border p-0.5">
                {viewModes.map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors min-h-[44px] ${
                      viewMode === mode
                        ? 'bg-brand-primary text-primary-foreground'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    aria-label={`Switch to ${label} view`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-11 h-11 rounded-lg border border-border bg-surface-card hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon size={18} className="text-text-secondary" /> : <Sun size={18} className="text-warning" />}
              </button>
            </div>
          </div>

          {/* Order cards area */}
          {filteredOrders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex-1 overflow-auto p-3">
              {viewMode === 'list' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <OrderCard order={order} onBump={handleBump} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <OrderCard order={order} compact onBump={handleBump} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              {viewMode === 'horizontal' && (
                <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="shrink-0 w-[280px]"
                      >
                        <OrderCard order={order} onBump={handleBump} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>

        <ItemSummaryPanel orders={orders} />
      </div>

      <BottomStatusBar orderCount={activeOrderCount} />
    </div>
  );
}
