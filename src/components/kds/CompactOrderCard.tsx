import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import type { Order, OrderType } from '@/types/kds';
import { OrderTypeBadge } from './OrderTypeBadge';
import { TimerBadge } from './TimerBadge';
import { CheckCircle } from 'lucide-react';

function getLocationLabel(orderType: OrderType, tableName?: string): string | undefined {
  if (!tableName) return undefined;
  const upper = tableName.toUpperCase();
  if (orderType === 'take-out' && (upper === 'PICKUP' || upper === 'TAKE OUT')) return undefined;
  if (orderType === 'delivery' && upper === 'DELIVERY') return undefined;
  return tableName;
}

const statusBodyMap: Record<string, string> = {
  new: '',
  'in-progress': '',
  seen: '',
  served: 'opacity-60 grayscale',
  overtime: 'bg-status-overtime/5',
  recalled: 'border-l-order-take-out',
};

interface CompactOrderCardProps {
  order: Order;
  liveElapsed: number;
  urgency: 'ok' | 'warning' | 'critical' | 'overtime';
  onBump?: (orderId: string) => void;
}

export function CompactOrderCard({ order, liveElapsed, urgency, onBump }: CompactOrderCardProps) {
  const { t, timeFormat } = useLanguage();
  const hasAllergens = order.courses.some(c => c.items.some(i => i.allergens.length > 0));

  return (
    <div className={`rounded-lg overflow-hidden bg-surface-card shadow-sm border border-border ${statusBodyMap[order.status] || ''}`}>
      <OrderTypeBadge
        type={order.orderType}
        time={formatTimeForKDS(order.timeReceived, timeFormat)}
        tableInfo={getLocationLabel(order.orderType, order.tableName)}
      />
      <div className="p-3 text-center">
        <div className="text-order-num text-text-primary">{order.orderNumber}</div>
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="text-modifier text-text-secondary">{order.itemCount} {t.products}</span>
        </div>
        {hasAllergens && (
          <div className="mt-1.5 text-[11px] font-bold text-allergen flex items-center justify-center gap-1">
            <span>{'\u{1F95C}'}</span> {t.hasAllergens}
          </div>
        )}
        <div className="mt-2">
          <TimerBadge seconds={liveElapsed} urgency={urgency} />
        </div>
      </div>
      <div className="px-2 pb-2">
        <button
          onClick={() => onBump?.(order.id)}
          className="w-full py-2 bg-btn-done text-primary-foreground rounded uppercase flex items-center justify-center gap-2"
          style={{ fontSize: '16px', fontWeight: 700 }}
        >
          <CheckCircle size={22} color="#FFFFFF" strokeWidth={2.5} />
          {t.done}
        </button>
      </div>
    </div>
  );
}
