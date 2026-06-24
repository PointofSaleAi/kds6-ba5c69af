import { useState } from 'react';
import type { Order, CourseType, OrderType } from '@/types/kds';
import { Hash, User, Check, Utensils, ShoppingBag, Bike, PartyPopper, Phone, CookingPot } from 'lucide-react';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, orderTypeLabel, courseLabel } from './variant-utils';
import { useKDSSettings, DEFAULT_ORDER_TYPE_DETAILED_COLORS } from '@/hooks/use-kds-settings';

type ItemState = 'unseen' | 'preparing' | 'done';


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

function ItemRow({
  item,
  accent,
  state,
  onTap,
}: {
  item: import('@/types/kds').OrderItem;
  accent: string;
  state: ItemState;
  onTap: () => void;
}) {
  const isDone = state === 'done';
  const isPreparing = state === 'preparing';

  let btnStyle: React.CSSProperties = { borderColor: '#9CA3AF', background: 'transparent' };
  let btnIcon = <Check size={10} className="text-[#6B7280]" />;
  let ariaLabel = 'Mark item preparing';
  if (isPreparing) {
    btnStyle = { borderColor: '#E67E22', background: '#FDEBD0' };
    btnIcon = <CookingPot size={10} style={{ color: '#E67E22' }} />;
    ariaLabel = 'Mark item done';
  } else if (isDone) {
    btnStyle = { borderColor: '#16A085', background: '#16A085' };
    btnIcon = <Check size={10} className="text-white" strokeWidth={3} />;
    ariaLabel = 'Item done';
  }

  return (
    <div
      className="flex items-start gap-2 pl-2 pr-1.5 py-1 border-b border-border/40 last:border-b-0"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <span
        className="font-bold shrink-0"
        style={{ color: accent, fontSize: 11, minWidth: 16, lineHeight: 1.3 }}
      >
        {item.quantity}
      </span>
      <div className="flex-1 min-w-0">
        <div
          className={`text-[#1F2937] ${isDone ? 'line-through opacity-60' : ''}`}
          style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3 }}
        >
          {item.name}
        </div>
        {item.modifiers.length > 0 && (
          <div className={`mt-0.5 ${isDone ? 'opacity-60' : ''}`}>
            {item.modifiers.map((m, i) => (
              <div
                key={i}
                style={{
                  fontSize: 10,
                  lineHeight: 1.3,
                  color: m.type === 'extra' ? '#16A34A' : m.type === 'remove' ? '#D85A30' : '#6B7280',
                  textDecoration: isDone ? 'line-through' : undefined,
                }}
              >
                {m.text}
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={isDone ? undefined : onTap}
        disabled={isDone}
        className={`shrink-0 mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center ${isDone ? 'cursor-default' : 'hover:brightness-95'}`}
        style={btnStyle}
      >
        {btnIcon}
      </button>
    </div>
  );
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
  const { orderTypeDetailedColors } = useKDSSettings();
  const colorSet = orderTypeDetailedColors[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS.custom;
  const accentColor = colorSet.headerBg;
  const accentText = colorSet.headerText;
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
  const cycle = (id: string) =>
    setItemStates((prev) => {
      const cur = prev[id] ?? 'unseen';
      const next: ItemState = cur === 'unseen' ? 'preparing' : cur === 'preparing' ? 'done' : 'done';
      return { ...prev, [id]: next };
    });


  return (
    <div className="bg-white rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* ACCENT BAR coloured by order type */}
      <div style={{ height: 4, background: accentColor }} />

      {/* ORDER TYPE STRIP */}
      <div
        className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
        style={{ background: accentColor, color: accentText }}
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
                    <ItemRow key={item.id} item={item} accent={p.accent} state={itemStates[item.id] ?? 'unseen'} onTap={() => cycle(item.id)} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div>
            {order.courses.flatMap((c) => c.items).map((item) => (
              <ItemRow key={item.id} item={item} accent={accentColor} state={itemStates[item.id] ?? 'unseen'} onTap={() => cycle(item.id)} />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-end items-center px-2 py-1.5" style={{ background: '#F3F4F6' }}>
        <button
          type="button"
          onClick={() => onBump?.(order.id)}
          className="rounded px-3 py-1 text-[12px] font-semibold"
          style={{ background: accentColor, color: accentText }}
        >
          Bump all
        </button>
      </div>
    </div>
  );
}
