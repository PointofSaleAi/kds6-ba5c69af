import type { Order, OrderItem } from '@/types/kds';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, orderTypeLabel, courseLabel, courseFireTime } from './variant-utils';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
}

function V1ItemRow({ item }: { item: OrderItem }) {
  return (
    <div className="px-2 py-1 border-b border-border/40 last:border-b-0">
      <div className="flex items-start gap-2">
        <span className="font-bold shrink-0" style={{ color: '#E84C3D', fontSize: 13, minWidth: 18 }}>
          {item.quantity}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[#2C3E50]" style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.25 }}>
            {item.name}
          </div>
          {item.modifiers.length > 0 && (
            <div className="pl-2 mt-0.5">
              {item.modifiers.map((m, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    lineHeight: 1.3,
                    color: m.type === 'extra' ? '#16A34A' : m.type === 'remove' ? '#D85A30' : '#6C7A89',
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>
          )}
          {item.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 pl-2">
              {item.allergens.map((a) => (
                <span
                  key={a.type}
                  className="px-1.5 py-px rounded-full text-[10px] font-semibold"
                  style={{ background: '#FEE2E2', color: '#B91C1C' }}
                >
                  {a.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function OrderCardV1({ order, onBump }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);

  return (
    <div className="bg-white rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-2 py-1 text-white text-[12px] font-semibold"
        style={{ background: '#E84C3D' }}
      >
        <span>#{order.orderNumber} · {fmtElapsed(elapsed)}</span>
        <span className="truncate ml-2">{order.tableName}</span>
      </div>

      {/* ORDER TYPE ROW */}
      <div
        className="text-center bg-white text-[#2C3E50]"
        style={{ fontSize: 16, fontWeight: 600, padding: '6px 8px', borderBottom: '0.5px solid #E5E7EB' }}
      >
        {orderTypeLabel(order.orderType)}
      </div>

      {/* COURSES */}
      <div className="flex-1">
        {order.orderType === 'dine-in' ? (
          order.courses.map((course, idx) => {
            const fire = courseFireTime(order, idx);
            return (
              <div key={`${course.course}-${idx}`}>
                <div
                  className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide"
                  style={{ background: '#F3F4F6', color: '#374151' }}
                >
                  {courseLabel(course.course)}{fire ? ` · Fire ${fire}` : ''}
                </div>
                <div className="bg-white">
                  {course.items.map((item) => (
                    <V1ItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white">
            {order.courses.flatMap((c) => c.items).map((item) => (
              <V1ItemRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-end items-center px-2 py-1.5" style={{ background: '#F3F4F6' }}>
        <button
          type="button"
          onClick={() => onBump?.(order.id)}
          className="rounded-full px-3 py-1 text-white text-[12px] font-semibold"
          style={{ background: '#E84C3D' }}
        >
          Bump
        </button>
      </div>
    </div>
  );
}
