import type { OrderType } from '@/types/kds';
import { useBadgeVisibility } from '@/hooks/use-badge-visibility';

const typeConfig: Record<OrderType, { bg: string; label: string }> = {
  'dine-in': { bg: 'bg-order-dine-in', label: 'DINE IN' },
  'take-out': { bg: 'bg-order-take-out', label: 'TAKE OUT' },
  'delivery': { bg: 'bg-order-delivery', label: 'DELIVERY' },
  'banquet': { bg: 'bg-order-banquet', label: 'BANQUET' },
};

interface OrderTypeBadgeProps {
  type: OrderType;
  time?: string;
  tableInfo?: string;
}

export function OrderTypeBadge({ type, time, tableInfo }: OrderTypeBadgeProps) {
  const { showBadge } = useBadgeVisibility();
  const config = typeConfig[type];

  if (!showBadge) return null;

  return (
    <div className={`${config.bg} px-3 py-2 rounded-t-lg flex items-center justify-between`}>
      <span className="text-badge-type text-primary-foreground uppercase tracking-wider">
        {config.label}
      </span>
      <div className="flex items-center gap-2 text-primary-foreground/80 text-modifier">
        {time && <span>{time}</span>}
        {tableInfo && <span>{tableInfo}</span>}
      </div>
    </div>
  );
}
