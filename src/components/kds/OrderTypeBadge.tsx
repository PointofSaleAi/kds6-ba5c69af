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
  hasRecalled?: boolean;
}

export function OrderTypeBadge({ type, time, tableInfo, stationBadge, hasRecalled }: OrderTypeBadgeProps) {
  const { to, tl, t } = useLanguage();
  const { orderTypeColors } = useKDSSettings();
  const bgColor = orderTypeColors[type] || DEFAULT_ORDER_TYPE_COLORS[type];

  // Translate the leading word ("TABLE", "BAR", "BANQUET") of tableInfo while keeping the number/identifier.
  // Single-token labels (e.g. "PICKUP", "DELIVERY") are translated whole.
  const translateTableInfo = (raw: string): string => {
    const trimmed = raw.trim();
    // Try whole-string match first (covers PICKUP, DELIVERY, BANQUET A, etc.)
    const whole = tl(trimmed);
    if (whole !== trimmed) return whole;
    const spaceIdx = trimmed.indexOf(' ');
    if (spaceIdx === -1) return trimmed;
    const head = trimmed.slice(0, spaceIdx);
    const tail = trimmed.slice(spaceIdx + 1);
    const translatedHead = tl(head);
    const translatedTail = tl(tail);
    return `${translatedHead} ${translatedTail !== tail ? translatedTail : tail}`;
  };

  const translatedTableInfo = tableInfo ? translateTableInfo(tableInfo) : undefined;

  // For dine-in and banquet, the table/banquet name takes the place of the
  // type label and is NOT repeated next to the time.
  const useTableAsTitle = (type === 'dine-in' || type === 'banquet') && !!translatedTableInfo;
  const titleText = useTableAsTitle ? translatedTableInfo! : to(typeLabels[type]);
  const showTrailingTable = !useTableAsTitle && !!translatedTableInfo;

  return (
    <div
      className="px-3 py-2 rounded-t-lg flex items-center justify-between gap-2"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span data-onboarding="ticket-header" className="text-badge-type text-primary-foreground uppercase tracking-wider whitespace-nowrap">
          {titleText}
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
      <div className="flex items-center gap-2 text-primary-foreground/80 text-badge-type shrink-0">
        {time && <span>{time}</span>}
        {showTrailingTable && <span>{translatedTableInfo}</span>}
        {hasRecalled && (
          <span
            className="uppercase tracking-wide whitespace-nowrap"
            style={{
              color: '#E24B4A',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {tl('RECALLED')}
          </span>
        )}
      </div>
    </div>
  );
}
