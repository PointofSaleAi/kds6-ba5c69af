import { useState, useEffect } from 'react';
import { Search, ArrowLeft, RotateCcw } from 'lucide-react';
import { StatusChip } from '@/components/kds/StatusChip';
import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS } from '@/hooks/use-kds-settings';
import { getKdsScaleClasses } from '@/lib/kds-scale';
import { useLanguage } from '@/hooks/use-language';
import { useKDSMode } from '@/hooks/use-kds-mode';
import type { OrderType, OrderStatus } from '@/types/kds';

interface HistoryOrder {
  id: string;
  orderNumber: number;
  orderType: OrderType;
  status: OrderStatus;
  tableName: string;
  serverName: string;
  timePlaced: string;
  timeServed: string;
  itemCount: number;
  durationMin: number;
  targetMin: number;
}

// TODO: Replace with API call
const mockHistory: HistoryOrder[] = [
  { id: 'h-1', orderNumber: 20, orderType: 'dine-in', status: 'served', tableName: 'TABLE 2', serverName: 'Maria S.', timePlaced: '11:23 AM', timeServed: '11:41 AM', itemCount: 4, durationMin: 18, targetMin: 15 },
  { id: 'h-2', orderNumber: 19, orderType: 'take-out', status: 'served', tableName: 'PICKUP', serverName: 'James R.', timePlaced: '11:10 AM', timeServed: '11:22 AM', itemCount: 2, durationMin: 12, targetMin: 15 },
  { id: 'h-3', orderNumber: 18, orderType: 'delivery', status: 'served', tableName: 'DELIVERY', serverName: 'UberEats', timePlaced: '10:55 AM', timeServed: '11:27 AM', itemCount: 5, durationMin: 32, targetMin: 20 },
  { id: 'h-4', orderNumber: 17, orderType: 'dine-in', status: 'served', tableName: 'TABLE 8', serverName: 'Alex K.', timePlaced: '10:40 AM', timeServed: '10:54 AM', itemCount: 3, durationMin: 14, targetMin: 15 },
  { id: 'h-5', orderNumber: 16, orderType: 'banquet', status: 'served', tableName: 'BANQUET B', serverName: 'Sophie L.', timePlaced: '10:15 AM', timeServed: '10:48 AM', itemCount: 12, durationMin: 33, targetMin: 30 },
];

interface OrderHistoryScreenProps {
  onBack: () => void;
  onRecall: (orderId: string) => void;
}

const ORDER_TYPE_OPTIONS: { value: OrderType; label: string }[] = [
  { value: 'dine-in', label: 'Dine In' },
  { value: 'take-out', label: 'Take Out' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'banquet', label: 'Banquet' },
];

export default function OrderHistoryScreen({ onBack, onRecall }: OrderHistoryScreenProps) {
  const [dateFilter, setDateFilter] = useState('today');
  const [search, setSearch] = useState('');
  const { orderTypeColors, textSize, ticketSpacing } = useKDSSettings();
  const { t, tperson, tl, to } = useLanguage();
  const scaleClasses = getKdsScaleClasses(textSize, ticketSpacing);
  const { mode: kdsMode, stationCourse } = useKDSMode();
  const isStationView = kdsMode === 'Prep' && !!stationCourse;

  const tabs = [t.today, t.yesterday, t.last7Days, t.customRange];

  const filtered = mockHistory.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(o.orderNumber).includes(q) ||
      o.tableName.toLowerCase().includes(q) ||
      o.serverName.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`fixed inset-0 bg-surface-bg flex flex-col ${scaleClasses}`}>
      <div className="bg-surface-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Go Back">
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-xl font-bold text-text-primary">{t.orderHistoryTitle}</h1>
        </div>

        <div className="flex items-center gap-3 mb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setDateFilter(tab.toLowerCase())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
                dateFilter === tab.toLowerCase()
                  ? 'bg-brand-primary text-primary-foreground'
                  : 'bg-muted text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchHistoryPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2 max-w-4xl mx-auto">
          {isStationView && stationCourse && (
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-[12px] text-text-secondary">
              Showing all history. Station-scoped history requires per-item category data, which is not yet available in the History feed.
            </div>
          )}
          {filtered.map((order) => (
            <div key={order.id} className="bg-surface-card rounded-lg border border-border p-4 flex items-center gap-4">
              <div className="text-2xl font-black text-text-primary w-12 text-center">
                {order.orderNumber}
              </div>

              <div
                className="px-2 py-1 rounded text-badge-type uppercase tracking-wider text-primary-foreground"
                style={{ backgroundColor: orderTypeColors[order.orderType] || DEFAULT_ORDER_TYPE_COLORS[order.orderType] }}
              >
                {to(order.orderType.replace('-', ' ').toUpperCase())}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary">{tl(order.tableName)} - {tperson(order.serverName)}</div>
                <div className="text-xs text-text-muted">{order.timePlaced} &rarr; {order.timeServed}</div>
              </div>

              <div className="text-sm text-text-secondary">{order.itemCount} {t.itemsLabel}</div>

              <div className={`px-2.5 py-1 rounded text-sm font-bold ${
                order.durationMin <= order.targetMin ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              }`}>
                {order.durationMin} {t.minLabel}
              </div>

              <button
                onClick={() => onRecall(order.id)}
                className="px-4 py-2 bg-order-take-out text-primary-foreground text-cta rounded-lg uppercase hover:bg-order-take-out/90 transition-colors min-h-[44px] flex items-center gap-2"
              >
                <RotateCcw size={14} />
                {t.recall}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
