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
  overtime: '',
  recalled: '',
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
  const headerColor = orderTypeColors[order.orderType] || DEFAULT_ORDER_TYPE_COLORS[order.orderType];
  const label = order.tableName ? `${to('TABLE')} ${order.tableName}` : to(typeLabels[order.orderType]);

  return (
    <div className={`rounded-lg overflow-hidden bg-surface-card shadow-sm ${statusBodyMap[order.status] || ''}`}>
      <div
        className="flex items-start justify-between gap-2"
        style={{ backgroundColor: headerColor, padding: '12px' }}
      >
        {/* Left: label + order number */}
        <div className="flex flex-col min-w-0">
          <span className="text-badge-type uppercase tracking-wider whitespace-nowrap text-white/80">
            {label}
          </span>
          <span className="text-order-num text-white leading-none mt-1 font-black">
            {order.orderNumber}
          </span>
        </div>
        {/* Right: timer + placed-at time */}
        <div className="flex flex-col items-end shrink-0">
          <TimerBadge seconds={liveElapsed} urgency={urgency} invertColor />
          <span className="text-badge-type text-white/70 mt-1">
            {formatTimeForKDS(order.timeReceived, timeFormat)}
          </span>
        </div>
      </div>
      {hasAllergens && (
        <div className="px-3 py-2 text-[11px] font-bold text-allergen flex items-center gap-1">
          <span>{'\u{1F95C}'}</span> {t.hasAllergens}
        </div>
      )}
    </div>
  );
}
