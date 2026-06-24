import type { Order, CourseType } from '@/types/kds';
import { Hash, User, Check } from 'lucide-react';
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

export function OrderCardV3({ order, onBump }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);

  return (
    <div className="bg-white rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* ACCENT BAR */}
      <div style={{ height: 4, background: '#2563EB' }} />

      {/* METADATA GRID 2x2 */}
      <div className="grid grid-cols-2 bg-white border-b border-border">
        <div className="flex items-start gap-1.5 px-2 py-1.5">
          <Hash size={12} className="mt-0.5 text-[#6B7280]" />
          <div className="min-w-0">
            <div className="font-bold text-[#1F2937] text-[13px] leading-tight truncate">#{order.orderNumber}</div>
            <div className="text-[10px] text-[#6B7280] truncate">{order.tableName}</div>
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

      {/* COURSES */}
      <div className="flex-1 bg-white">
        {order.courses.map((course, idx) => {
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
                  <div
                    key={item.id}
                    className="flex items-start gap-2 pl-2 pr-1.5 py-1 border-b border-border/40 last:border-b-0"
                    style={{ borderLeft: `3px solid ${p.accent}` }}
                  >
                    <span
                      className="font-bold shrink-0"
                      style={{ color: p.accent, fontSize: 11, minWidth: 16, lineHeight: 1.3 }}
                    >
                      {item.quantity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#1F2937]" style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3 }}>
                        {item.name}
                      </div>
                      {item.modifiers.length > 0 && (
                        <div className="mt-0.5">
                          {item.modifiers.map((m, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: 10,
                                lineHeight: 1.3,
                                color: m.type === 'extra'
                                  ? '#16A34A'
                                  : m.type === 'remove'
                                    ? '#D85A30'
                                    : '#6B7280',
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
                      aria-label="Bump item"
                      className="shrink-0 mt-0.5 w-4 h-4 rounded-sm border border-[#9CA3AF] flex items-center justify-center hover:bg-[#F3F4F6]"
                    >
                      <Check size={10} className="text-[#6B7280]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
