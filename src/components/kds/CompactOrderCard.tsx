import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import type { Order, OrderType } from '@/types/kds';

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

const stripeColorMap: Record<OrderType, string> = {
  'dine-in': '#7b9cff',
  'take-out': '#f5a623',
  'delivery': '#6fcf97',
  'banquet': '#cc99ff',
  'drive-thru': '#f5a623',
  'curb-side': '#f5a623',
  'scheduled': '#7b9cff',
  'phone-in': '#7b9cff',
  'custom': '#7b9cff',
};

const statusBodyMap: Record<string, string> = {
  new: '',
  'in-progress': '',
  seen: '',
  served: 'opacity-60 grayscale',
  overtime: '',
  recalled: '',
};

function formatElapsed(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface CompactOrderCardProps {
  order: Order;
  liveElapsed: number;
  urgency: 'ok' | 'warning' | 'critical' | 'overtime';
  onBump?: (orderId: string) => void;
}

export function CompactOrderCard({ order, liveElapsed }: CompactOrderCardProps) {
  const { t, to, timeFormat } = useLanguage();
  const hasAllergens = order.courses.some(c => c.items.some(i => i.allergens.length > 0));
  const stripeColor = stripeColorMap[order.orderType];
  const label = order.tableName ? `${to('TABLE')} ${order.tableName}` : to(typeLabels[order.orderType]);

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
        <div
          className="flex-1 flex items-center justify-between gap-2 min-w-0"
          style={{ padding: '7px 12px', minHeight: '44px' }}
        >
          {/* Left: label + order number */}
          <div className="flex flex-col min-w-0">
            <span
              className="uppercase tracking-wider whitespace-nowrap text-text-secondary"
              style={{ fontSize: '9px', lineHeight: 1 }}
            >
              {label}
            </span>
            <span
              className="text-text-primary font-bold leading-none"
              style={{ fontSize: '22px', marginTop: '3px' }}
            >
              {order.orderNumber}
            </span>
          </div>
          {/* Right: timer + placed-at time */}
          <div className="flex flex-col items-end shrink-0">
            <span
              className="font-mono-timer text-text-secondary"
              style={{ fontSize: '11px', lineHeight: 1 }}
            >
              {formatElapsed(liveElapsed)}
            </span>
            <span
              className="text-text-muted"
              style={{ fontSize: '9px', marginTop: '3px', lineHeight: 1 }}
            >
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
