import type { Order } from '@/types/kds';
import { ArrowUp } from 'lucide-react';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, fmtElapsedAgo, orderTypeLabel } from './variant-utils';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
}

export function OrderCardV2({ order, onBump }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const headerName = order.guestName || order.customerName || order.serverName || 'Guest';
  const allItems = order.courses.flatMap((c) => c.items);

  return (
    <div className="bg-white rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* HEADER */}
      <div className="px-2.5 py-2" style={{ background: '#F3F4F6' }}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-[#1F2937] text-[14px] truncate">{headerName}</span>
          <span
            className="rounded-full px-2 py-0.5 text-white text-[10px] font-semibold uppercase shrink-0"
            style={{ background: '#E84C3D' }}
          >
            {orderTypeLabel(order.orderType)}
          </span>
        </div>
        <div className="text-[11px] text-[#6B7280] mt-0.5 truncate">
          #{order.orderNumber} · {order.tableName} · {fmtElapsed(elapsed)} · {order.serverName}
        </div>
      </div>

      {/* ITEMS (no course dividers) */}
      <div className="flex-1 bg-white">
        {allItems.map((item) => (
          <div key={item.id} className="px-2.5 py-1.5 border-b border-border/40 last:border-b-0">
            <div className="flex items-start gap-2">
              <span
                className="font-bold text-[#1F2937] shrink-0"
                style={{ fontSize: 15, minWidth: 20, lineHeight: 1.2 }}
              >
                {item.quantity}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[#1F2937]" style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>
                  {item.name}
                </div>
                {item.modifiers.length > 0 && (
                  <div className="mt-0.5">
                    {item.modifiers.map((m, i) => (
                      <div key={i} style={{ fontSize: 11, lineHeight: 1.3, color: '#E84C3D' }}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                )}
                {item.notes && (
                  <div className="italic text-[#6B7280] mt-0.5" style={{ fontSize: 11, lineHeight: 1.3 }}>
                    {item.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
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
