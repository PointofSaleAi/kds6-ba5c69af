import type { Order } from '@/types/kds';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, orderTypeLabel, courseLabel, courseFireTime } from './variant-utils';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
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
