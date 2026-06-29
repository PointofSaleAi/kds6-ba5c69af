import type { Order } from '@/types/kds';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { useKDSSettings, DEFAULT_ORDER_TYPE_DETAILED_COLORS } from '@/hooks/use-kds-settings';
import { useStatusRules } from '@/hooks/use-status-rules';
import { fmtElapsed, orderTypeLabel } from '../variant-utils';
import { formatTime } from '@/lib/datetime';

interface Props {
  order: Order;
  emphasized?: boolean;
}

export function V1Header({ order, emphasized = false }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const { orderTypeDetailedColors } = useKDSSettings();
  const { getStatusForElapsed } = useStatusRules();
  const colorSet =
    orderTypeDetailedColors[order.orderType] ||
    DEFAULT_ORDER_TYPE_DETAILED_COLORS[order.orderType] ||
    DEFAULT_ORDER_TYPE_DETAILED_COLORS.custom;
  const status = getStatusForElapsed(elapsed);

  if (emphasized) {
    return (
      <div>
        <div
          className="text-center uppercase tracking-wide"
          style={{
            fontSize: 22,
            fontWeight: 800,
            padding: '14px 12px',
            background: colorSet.headerBg,
            color: colorSet.headerText,
            letterSpacing: '0.04em',
          }}
        >
          {order.tableName || orderTypeLabel(order.orderType)}
        </div>
        <div
          className="flex items-center justify-between px-3"
          style={{
            background: status.color,
            color: status.textColor,
            padding: '10px 14px',
          }}
        >
          <span className="inline-flex items-center gap-2.5">
            <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>
              #{order.orderNumber}
            </span>
            <span
              className="inline-flex items-center rounded-full font-mono-timer tabular-nums"
              style={{
                background: '#1A1A2E',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                padding: '4px 12px',
              }}
            >
              {fmtElapsed(elapsed)}
            </span>
          </span>
          <span
            className="shrink-0"
            style={{ fontSize: 15, fontWeight: 500, opacity: 0.95 }}
          >
            {formatTime(order.timeReceived)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="text-center"
        style={{
          fontSize: 16,
          fontWeight: 600,
          padding: '6px 8px',
          background: colorSet.headerBg,
          color: colorSet.headerText,
        }}
      >
        {order.tableName || orderTypeLabel(order.orderType)}
      </div>
      <div
        className="flex items-center justify-between px-2 py-1 text-[12px] font-semibold bg-card text-foreground"
        style={{ borderBottom: '0.5px solid #E5E7EB' }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span style={{ fontSize: 14, fontWeight: 800 }}>#{order.orderNumber}</span>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 font-mono-timer text-[11px] font-semibold"
            style={{ background: status.color, color: status.textColor }}
          >
            {fmtElapsed(elapsed)}
          </span>
        </span>
        <span className="ml-2 shrink-0">{formatTime(order.timeReceived)}</span>
      </div>
    </div>
  );
}
