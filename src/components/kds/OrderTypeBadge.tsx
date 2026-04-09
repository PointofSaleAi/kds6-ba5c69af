import type { OrderType } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
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

interface OrderTypeBadgeProps {
  type: OrderType;
  time?: string;
  tableInfo?: string;
  stationBadge?: string;
}

export function OrderTypeBadge({ type, time, tableInfo, stationBadge }: OrderTypeBadgeProps) {
  const { to } = useLanguage();
  const { orderTypeColors } = useKDSSettings();
  const bgColor = orderTypeColors[type] || DEFAULT_ORDER_TYPE_COLORS[type];

  return (
    <div
      className="px-3 py-2 rounded-t-lg flex items-center justify-between gap-2"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-badge-type text-primary-foreground uppercase tracking-wider whitespace-nowrap">
          {to(typeLabels[type])}
        </span>
        {stationBadge && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0"
            style={{ backgroundColor: '#EEEDFE', color: '#3C3489' }}
          >
            {stationBadge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-primary-foreground/80 text-modifier shrink-0">
        {time && <span>{time}</span>}
        {tableInfo && <span>{tableInfo}</span>}
      </div>
    </div>
  );
}
