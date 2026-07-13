import type { Order } from '@/types/kds';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { useKDSSettings, DEFAULT_ORDER_TYPE_DETAILED_COLORS } from '@/hooks/use-kds-settings';
import { useStatusRules } from '@/hooks/use-status-rules';
import { fmtElapsed, orderTypeLabel } from '../variant-utils';
import { formatTime } from '@/lib/datetime';

interface Props {
  order: Order;
}

export function V2Header({ order }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const { orderTypeDetailedColors, ticketHeaderLayout } = useKDSSettings();
  const { getStatusForElapsed } = useStatusRules();
  const colorSet =
    orderTypeDetailedColors[order.orderType] ||
    DEFAULT_ORDER_TYPE_DETAILED_COLORS[order.orderType] ||
    DEFAULT_ORDER_TYPE_DETAILED_COLORS.custom;
  const timerStatus = getStatusForElapsed(elapsed);
  const isDineIn = order.orderType === 'dine-in';
  const showTableInstead = isDineIn && !!order.tableName;
  const guestName = order.guestName || order.customerName || order.serverName || 'Guest';
  const identifier = ticketHeaderLayout === 'guest' ? guestName : `${order.orderNumber}`;
  const secondaryName = ticketHeaderLayout === 'guest' ? `${order.orderNumber}` : guestName;
  const firedTime = order.timeReceived ? formatTime(order.timeReceived) : '';

  return (
    <div data-v2header className="v2-header px-2.5 py-2 bg-muted">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {showTableInstead ? (
            <span
              data-onboarding="ticket-header"
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
              style={{ background: '#1A1A2E', color: '#FFFFFF' }}
            >
              {order.tableName}
            </span>
          ) : (
            <span
              data-onboarding="ticket-header"
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
              style={{ background: colorSet.headerBg, color: colorSet.headerText }}
            >
              {orderTypeLabel(order.orderType)}
            </span>
          )}
          <span className="font-bold text-foreground text-[14px] shrink-0 truncate">{identifier}</span>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-bold font-mono-timer shrink-0 tabular-nums"
          style={{ background: timerStatus.color, color: timerStatus.textColor }}
        >
          {fmtElapsed(elapsed)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <span className="text-[12px] font-medium text-foreground truncate">{secondaryName}</span>
        <span className="text-[11px] text-muted-foreground shrink-0 truncate">
          {order.serverName}{firedTime ? ` · ${firedTime}` : ''}
        </span>
      </div>
    </div>
  );
}
