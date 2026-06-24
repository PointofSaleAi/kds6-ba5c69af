import type { Order, OrderItem } from '@/types/kds';
import { ArrowUp } from 'lucide-react';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, fmtElapsedAgo, orderTypeLabel, courseLabel } from './variant-utils';
import { useKDSSettings, DEFAULT_ORDER_TYPE_DETAILED_COLORS } from '@/hooks/use-kds-settings';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
}

function V2ProductRow({ product }: { product: OrderItem }) {
  return (
    <div className="px-2.5 py-1.5 border-b border-border/40 last:border-b-0">
      <div className="flex items-start gap-2">
        <span className="font-bold text-[#1F2937] shrink-0" style={{ fontSize: 15, minWidth: 20, lineHeight: 1.2 }}>
          {product.quantity}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[#1F2937]" style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>
            {product.name}
          </div>
          {product.modifiers.length > 0 && (
            <div className="mt-0.5">
              {product.modifiers.map((m, i) => (
                <div key={i} style={{ fontSize: 11, lineHeight: 1.3, color: '#E84C3D' }}>
                  {m.text}
                </div>
              ))}
            </div>
          )}
          {product.notes && (
            <div className="italic text-[#6B7280] mt-0.5" style={{ fontSize: 11, lineHeight: 1.3 }}>
              {product.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function OrderCardV2({ order, onBump }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const headerName = order.guestName || order.customerName || order.serverName || 'Guest';
  const isDineIn = order.orderType === 'dine-in';
  const { orderTypeDetailedColors } = useKDSSettings();
  const colorSet = orderTypeDetailedColors[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS.custom;

  return (
    <div className="bg-white rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* HEADER */}
      <div className="px-2.5 py-2" style={{ background: '#F3F4F6' }}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-[#1F2937] text-[14px] truncate">{headerName}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
            style={{ background: colorSet.headerBg, color: colorSet.headerText }}
          >
            {orderTypeLabel(order.orderType)}
          </span>
        </div>
        <div className="text-[11px] text-[#6B7280] mt-0.5 truncate">
          #{order.orderNumber} · {order.tableName} · {fmtElapsed(elapsed)} · {order.serverName}
        </div>
      </div>

      {/* PRODUCTS  course bands for dine-in, flat list for everything else */}
      <div className="flex-1 bg-white">
        {isDineIn ? (
          order.courses.map((course, idx) => (
            <div key={`${course.course}-${idx}`}>
              <div
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: '#F3F4F6', color: '#4B5563' }}
              >
                {courseLabel(course.course)}
              </div>
              {course.items.map((product) => (
                <V2ProductRow key={product.id} product={product} />
              ))}
            </div>
          ))
        ) : (
          order.courses.flatMap((c) => c.items).map((product) => (
            <V2ProductRow key={product.id} product={product} />
          ))
        )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-white border-t border-border">
        <span className="text-[11px] text-[#9CA3AF]">{fmtElapsedAgo(elapsed)}</span>
        <button
          type="button"
          onClick={() => onBump?.(order.id)}
          className="flex items-center gap-1 text-[12px] font-semibold"
          style={{ color: '#2563EB' }}
        >
          <ArrowUp size={12} strokeWidth={2.5} />
          Bump
        </button>
      </div>
    </div>
  );
}
