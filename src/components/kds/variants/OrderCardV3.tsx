import type { Order, CourseType, OrderType } from '@/types/kds';
import { Hash, User, Check, Utensils, ShoppingBag, Bike, PartyPopper, Phone } from 'lucide-react';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, orderTypeLabel, courseLabel } from './variant-utils';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
}

interface CoursePalette {
  bg: string;
  text: string;
  accent: string;
}

function paletteFor(course: CourseType): CoursePalette {
  switch (course) {
    case 'ENTREE':
    case 'APPETIZER':
    case 'SALAD':
      return { bg: '#EFF6FF', text: '#1D4ED8', accent: '#2563EB' };
    case 'DESSERT':
      return { bg: '#F5F3FF', text: '#6D28D9', accent: '#7C3AED' };
    default:
      return { bg: '#F3F4F6', text: '#374151', accent: '#6B7280' };
  }
}

const ORDER_TYPE_META: Record<OrderType, { color: string; Icon: typeof Hash }> = {
  'dine-in': { color: '#1A1A2E', Icon: Utensils },
  'take-out': { color: '#2980B9', Icon: ShoppingBag },
  'delivery': { color: '#16A085', Icon: Bike },
  'banquet': { color: '#F39C12', Icon: PartyPopper },
  'drive-thru': { color: '#2980B9', Icon: ShoppingBag },
  'curb-side': { color: '#2980B9', Icon: ShoppingBag },
  'scheduled': { color: '#6B7280', Icon: ShoppingBag },
  'phone-in': { color: '#7C3AED', Icon: Phone },
  'custom': { color: '#6B7280', Icon: ShoppingBag },
};

export function OrderCardV3({ order, onBump }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const typeMeta = ORDER_TYPE_META[order.orderType] || ORDER_TYPE_META['custom'];
  const TypeIcon = typeMeta.Icon;

  return (
    <div className="bg-white rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* ACCENT BAR coloured by order type */}
      <div style={{ height: 4, background: typeMeta.color }} />

      {/* ORDER TYPE STRIP */}
      <div
        className="flex items-center gap-1.5 px-2 py-1 text-white text-[10px] font-bold uppercase tracking-wide"
        style={{ background: typeMeta.color }}
      >
        <TypeIcon size={11} />
        <span>{orderTypeLabel(order.orderType)}</span>
      </div>

      {/* METADATA GRID 2x2 */}
      {(() => {
        const isDineIn = order.orderType === 'dine-in';
        const cell1Title = isDineIn
          ? order.tableName
          : (order.guestName || order.customerName || orderTypeLabel(order.orderType));
        const cell1Sub = isDineIn
          ? (order.guestName || order.customerName || 'Dine in')
          : (order.customerPhone || order.tableName);
        return (
          <div className="grid grid-cols-2 bg-white border-b border-border">
            <div className="flex items-start gap-1.5 px-2 py-1.5">
              <Hash size={12} className="mt-0.5 text-[#6B7280]" />
              <div className="min-w-0">
                <div className="font-bold text-[#1F2937] text-[13px] leading-tight truncate">#{order.orderNumber}</div>
                <div className="text-[10px] text-[#6B7280] truncate">{cell1Title}</div>
                {cell1Sub && cell1Sub !== cell1Title && (
                  <div className="text-[10px] text-[#9CA3AF] truncate">{cell1Sub}</div>
                )}
              </div>
            </div>
            <div className="flex items-start gap-1.5 px-2 py-1.5 border-l border-border">
              <User size={12} className="mt-0.5 text-[#6B7280]" />
              <div className="min-w-0">
                <div className="font-bold text-[#1F2937] text-[13px] leading-tight truncate">{order.serverName}</div>
                <div className="text-[10px] text-[#6B7280] truncate">
                  {orderTypeLabel(order.orderType)} · {fmtElapsed(elapsed)}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ITEMS  course bands for dine-in, flat list for everything else */}
      <div className="flex-1 bg-white">
        {order.orderType === 'dine-in' ? (
          order.courses.map((course, idx) => {
            const p = paletteFor(course.course);
            return (
              <div key={`${course.course}-${idx}`}>
                <div
                  className="flex items-center justify-between px-2 py-1"
                  style={{ background: p.bg, color: p.text }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide">{courseLabel(course.course)}</span>
                  <span className="text-[10px] font-semibold">Items: {course.items.length}</span>
                </div>
                <div>
                  {course.items.map((item) => (
                    <ItemRow key={item.id} item={item} accent={p.accent} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div>
            {order.courses.flatMap((c) => c.items).map((item) => (
              <ItemRow key={item.id} item={item} accent={typeMeta.color} />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-end items-center px-2 py-1.5" style={{ background: '#F3F4F6' }}>
        <button
          type="button"
          onClick={() => onBump?.(order.id)}
          className="rounded px-3 py-1 text-white text-[12px] font-semibold"
          style={{ background: '#1A1A2E' }}
        >
          Bump all
        </button>
      </div>
    </div>
  );
}
