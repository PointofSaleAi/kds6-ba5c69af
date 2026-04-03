import type { OrderType } from '@/types/kds';

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
  /** Station identity badge label (e.g. "Entree station") */
  stationBadge?: string;
}

export function OrderTypeBadge({ type, time, tableInfo, stationBadge }: OrderTypeBadgeProps) {
  const config = typeConfig[type];

  return (
    <div className={`${config.bg} px-3 py-2 rounded-t-lg flex items-center justify-between gap-2`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-badge-type text-primary-foreground uppercase tracking-wider whitespace-nowrap">
          {config.label}
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
