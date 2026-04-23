import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import type { Order, OrderType } from '@/types/kds';
import { TimerBadge } from './TimerBadge';
import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS } from '@/hooks/use-kds-settings';

const typeLabels: Record<OrderType, string> = {
  'dine-in': 'DINE IN',
  'take-out': 'TAKE OUT',
  'delivery': 'DELIVERY',
  'banquet': 'BANQUET',
  'drive-thru': 'DRIVE THRU',
  'curb-side': 'CURB SIDE',
  'scheduled': 'SCHEDULED',
  'phone-in': 'PHONE-IN',
  'custom': 'CUSTOM',
};

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

export function CompactOrderCard({ order, liveElapsed, urgency }: CompactOrderCardProps) {
  const { t, to, timeFormat } = useLanguage();
  const { orderTypeColors } = useKDSSettings();
  const hasAllergens = order.courses.some(c => c.items.some(i => i.allergens.length > 0));
  const stripeColor = orderTypeColors[order.orderType] || DEFAULT_ORDER_TYPE_COLORS[order.orderType];

  return (
    <div className={`rounded-lg overflow-hidden bg-surface-card shadow-sm border border-border ${statusBodyMap[order.status] || ''}`}>
      <div className="flex items-stretch">
        {/* Left color stripe */}
        <div
          className="shrink-0"
          style={{ width: '3px', backgroundColor: stripeColor, borderRadius: 0 }}
          aria-hidden="true"
        />
        {/* Header content */}
        <div className="flex-1 flex items-start justify-between gap-2 px-3 py-2 min-w-0">
          {/* Left: label + order number */}
          <div className="flex flex-col min-w-0">
            <span className="text-badge-type text-text-primary uppercase tracking-wider whitespace-nowrap">
              {to(typeLabels[order.orderType])}
            </span>
            <span className="text-order-num text-text-primary leading-none mt-1">
              {order.orderNumber}
            </span>
          </div>
          {/* Right: timer + placed-at time */}
          <div className="flex flex-col items-end shrink-0">
            <TimerBadge seconds={liveElapsed} urgency={urgency} />
            <span className="text-badge-type text-text-secondary mt-1">
              {formatTimeForKDS(order.timeReceived, timeFormat)}
            </span>
          </div>
        </div>
      </div>
      {hasAllergens && (
        <div className="px-3 pb-2 text-[11px] font-bold text-allergen flex items-center gap-1">
          <span>{'\u{1F95C}'}</span> {t.hasAllergens}
        </div>
      )}
    </div>
  );
}
