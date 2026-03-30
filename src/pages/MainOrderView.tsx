import { useState, useCallback, useEffect, useRef } from 'react';
import { BellRing } from 'lucide-react';
import { KDSSidebar } from '@/components/kds/KDSSidebar';
import { OrderCard } from '@/components/kds/OrderCard';
import { ItemSummaryPanel } from '@/components/kds/ItemSummaryPanel';
import { BottomStatusBar } from '@/components/kds/BottomStatusBar';
import { EmptyState } from '@/components/kds/EmptyState';
import { ExpandedOrderCard } from '@/components/kds/ExpandedOrderCard';
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
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const prevOrderCount = useRef(orders.length);
  const servedTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
          {/* New order alert overlay */}
          <AnimatePresence>
            {newOrderAlert && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-primary text-primary-foreground text-xs font-bold shadow-lg"
              >
                <BellRing size={14} className="animate-bell-ring" />
                New Order
              </motion.div>
            )}
          </AnimatePresence>

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
                        onClick={() => setExpandedOrderId(order.id)}
                        className="cursor-pointer"
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

      {/* Expanded order card overlay for grid view */}
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

      <BottomStatusBar orderCount={activeOrderCount} viewMode={viewMode} onViewModeChange={setViewMode} theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
}
