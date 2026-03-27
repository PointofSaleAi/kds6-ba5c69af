import { useState, useCallback } from 'react';
import { LayoutGrid, LayoutList, Columns3 } from 'lucide-react';
import { KDSSidebar } from '@/components/kds/KDSSidebar';
import { OrderCard } from '@/components/kds/OrderCard';
import { ItemSummaryPanel } from '@/components/kds/ItemSummaryPanel';
import { BottomStatusBar } from '@/components/kds/BottomStatusBar';
import { EmptyState } from '@/components/kds/EmptyState';
import { mockOrders } from '@/data/mock-orders';
import type { ViewMode, Order } from '@/types/kds';

interface MainOrderViewProps {
  onNavigate: (screen: string) => void;
}

export default function MainOrderView({ onNavigate }: MainOrderViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeFilter, setActiveFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>(mockOrders);

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
            <div className="text-sm text-text-secondary font-medium">
              Today, {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center bg-surface-card rounded-lg border border-border p-0.5">
              {viewModes.map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors min-h-[36px] ${
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
          </div>

          {/* Order cards area */}
          {filteredOrders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex-1 overflow-auto p-3">
              {viewMode === 'list' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} onBump={handleBump} />
                  ))}
                </div>
              )}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} compact onBump={handleBump} />
                  ))}
                </div>
              )}
              {viewMode === 'horizontal' && (
                <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="shrink-0 w-[280px]">
                      <OrderCard order={order} onBump={handleBump} />
                    </div>
                  ))}
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
