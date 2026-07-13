import type { Order, OrderType } from '@/types/kds';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { useKDSSettings, DEFAULT_ORDER_TYPE_DETAILED_COLORS } from '@/hooks/use-kds-settings';
import { useStatusRules } from '@/hooks/use-status-rules';
import { fmtElapsed, orderTypeLabel } from '../variant-utils';
import { formatTime } from '@/lib/datetime';
import PersonSimpleRunBold from '@/assets/person-simple-run-bold.svg';
import dineInIcon from '@/assets/icons/order-types/dine-in.svg';
import takeOutIcon from '@/assets/icons/order-types/take-out.svg';
import deliveryIcon from '@/assets/icons/order-types/delivery.svg';
import banquetIcon from '@/assets/icons/order-types/banquet.svg';
import driveThruIcon from '@/assets/icons/order-types/drive-thru.svg';
import curbSideIcon from '@/assets/icons/order-types/curb-side.svg';
import scheduledIcon from '@/assets/icons/order-types/scheduled.svg';
import phoneInIcon from '@/assets/icons/order-types/phone-in.svg';
import customIcon from '@/assets/icons/order-types/custom.svg';

const ORDER_TYPE_ICON: Record<OrderType, string> = {
  'dine-in': dineInIcon,
  'take-out': takeOutIcon,
  'delivery': deliveryIcon,
  'banquet': banquetIcon,
  'drive-thru': driveThruIcon,
  'curb-side': curbSideIcon,
  'scheduled': scheduledIcon,
  'phone-in': phoneInIcon,
  'custom': customIcon,
};

interface Props {
  order: Order;
}

export function V3Header({ order }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const { orderTypeDetailedColors } = useKDSSettings();
  const { getStatusForElapsed } = useStatusRules();
  const colorSet =
    orderTypeDetailedColors[order.orderType] ||
    DEFAULT_ORDER_TYPE_DETAILED_COLORS[order.orderType] ||
    DEFAULT_ORDER_TYPE_DETAILED_COLORS.custom;
  const accentColor = colorSet.headerBg;
  const accentText = colorSet.headerText;
  const agingStatus = getStatusForElapsed(elapsed);
  const typeIcon = ORDER_TYPE_ICON[order.orderType] || customIcon;
  const isDineIn = order.orderType === 'dine-in';
  const guest = order.guestName || order.customerName || '';
  const cell1Sub = isDineIn ? '' : (order.customerPhone || '');

  return (
    <div>
      <div style={{ height: 4, background: accentColor }} />
      <div
        data-onboarding="ticket-header"
        className="relative flex items-center justify-start gap-1.5 px-2 py-1 pr-16 text-[13px] font-bold uppercase tracking-wide"
        style={{ background: accentColor, color: accentText }}
      >
        <img
          src={typeIcon}
          alt=""
          width={14}
          height={14}
          className="shrink-0"
          style={{ filter: accentText.toLowerCase() === '#ffffff' ? 'brightness(0) invert(1)' : 'brightness(0)' }}
        />
        <span>{isDineIn ? (order.tableName || orderTypeLabel(order.orderType)) : orderTypeLabel(order.orderType)}</span>
        <span
          className="absolute right-2 inline-flex items-center rounded-full px-2 py-0.5 font-mono-timer text-[11px] font-semibold normal-case tracking-normal"
          style={{ background: agingStatus.color, color: agingStatus.textColor }}
        >
          {fmtElapsed(elapsed)}
        </span>
      </div>
      <div className="grid grid-cols-2 bg-card border-b border-border">
        <div className="flex items-start gap-1.5 px-2 py-1.5">
          <div className="min-w-0">
            <div className="font-bold text-foreground text-[13px] leading-tight truncate">{order.orderNumber}</div>
            {guest && <div className="text-[10px] text-[#6B7280] truncate">{guest}</div>}
            {cell1Sub && cell1Sub !== guest && (
              <div className="text-[10px] text-[#9CA3AF] truncate">{cell1Sub}</div>
            )}
          </div>
        </div>
        <div className="flex items-start gap-0.5 px-2 py-1.5 border-l border-border">
          <img src={PersonSimpleRunBold} alt="" width={12} height={12} className="mt-0.5 opacity-70 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-foreground text-[13px] leading-tight truncate">{order.serverName}</div>
            <div className="text-[10px] text-[#6B7280] truncate">{formatTime(order.timeReceived)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
