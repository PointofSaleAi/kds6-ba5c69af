import { useState, useEffect, useRef } from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { Order, OrderItem } from '@/types/kds';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, orderTypeLabel, courseLabel } from './variant-utils';
import { useKDSSettings, DEFAULT_ORDER_TYPE_DETAILED_COLORS } from '@/hooks/use-kds-settings';
import { useStatusRules } from '@/hooks/use-status-rules';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import { formatTime } from '@/lib/datetime';

const MODIFIER_CLASS = {
  extra: 'text-modifier-extra',
  remove: 'text-modifier-remove',
  neutral: 'text-modifier-neutral',
} as const;

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
}

type RowState = 'idle' | 'loading' | 'done';

interface V1ProductRowProps {
  product: OrderItem;
  state: RowState;
  onToggle: () => void;
}

function V1ProductRow({ product, state, onToggle }: V1ProductRowProps) {
  const done = state === 'done';
  const loading = state === 'loading';
  const disabled = loading || done;
  return (
    <button
      type="button"
      onClick={() => { if (!disabled) onToggle(); }}
      disabled={disabled}
      className={`w-full text-left px-2 py-1 border-b border-border/40 last:border-b-0 transition-opacity ${done ? 'opacity-50' : loading ? 'opacity-70' : 'hover:bg-black/[0.02]'}`}
      aria-pressed={done}
    >
      <div className="flex items-start gap-1">
        <span className="font-bold shrink-0 text-center" style={{ color: '#1F2937', fontSize: 13, minWidth: 20 }}>
          {product.quantity}
        </span>
        <div className="flex-1 min-w-0">
          <div
            className="text-[#2C3E50]"
            style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2, textDecoration: done ? 'line-through' : 'none' }}
          >
            {product.name}
          </div>
          {product.modifiers.length > 0 && (
            <div>
              {product.modifiers.map((m, i) => (
                <div
                  key={i}
                  className={`font-semibold ${MODIFIER_CLASS[m.type]}`}
                  style={{ fontSize: 11, lineHeight: 1.2, textDecoration: done ? 'line-through' : 'none' }}
                >
                  {m.type === 'extra' ? m.text.replace(/^\+\s*/, '') : m.text}
                </div>
              ))}
            </div>
          )}
          {product.allergens.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {product.allergens.map((a) => (
                <AllergenBadge key={a.type} allergen={a} variant="item" />
              ))}
            </div>
          )}
        </div>
        {loading && (
          <span
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{ width: 18, height: 18 }}
            aria-label="Marking product done"
          >
            <Loader2 size={14} className="animate-spin" color="#6C7A89" />
          </span>
        )}
        {done && (
          <span
            className="shrink-0 flex items-center justify-center rounded-full animate-scale-in"
            style={{ background: '#27AE60', width: 18, height: 18 }}
            aria-label="Product done"
          >
            <Check size={12} color="#fff" strokeWidth={3} />
          </span>
        )}
      </div>
    </button>
  );
}


export function OrderCardV1({ order, onBump }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const { orderTypeDetailedColors } = useKDSSettings();
  const { getStatusForElapsed } = useStatusRules();
  const colorSet = orderTypeDetailedColors[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS.custom;
  const headerBg = colorSet.headerBg;
  const headerText = colorSet.headerText;
  const status = getStatusForElapsed(elapsed);
  const pillBg = status.color;
  const pillText = status.textColor;

  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [bumping, setBumping] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const setRow = (id: string, s: RowState) => setRowStates((p) => ({ ...p, [id]: s }));

  const toggleRow = (id: string) => {
    setRow(id, 'loading');
    const t = window.setTimeout(() => setRow(id, 'done'), 600);
    timersRef.current.push(t);
  };

  const allItems = order.courses.flatMap((c) => c.items);

  const handleBump = () => {
    if (bumping) return;
    setBumping(true);
    // Set all not-yet-done rows to loading immediately
    setRowStates((prev) => {
      const next = { ...prev };
      allItems.forEach((p) => { if (next[p.id] !== 'done') next[p.id] = 'loading'; });
      return next;
    });
    // Stagger flip each to done
    allItems.forEach((p, idx) => {
      const t = window.setTimeout(() => setRow(p.id, 'done'), 250 + idx * 120);
      timersRef.current.push(t);
    });
    const total = 250 + allItems.length * 120 + 350;
    const finish = window.setTimeout(() => onBump?.(order.id), total);
    timersRef.current.push(finish);
  };

  return (
    <div className="bg-white rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-2 py-1 text-[12px] font-semibold"
        style={{ background: headerBg, color: headerText }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span>#{order.orderNumber}</span>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 font-mono-timer text-[11px] font-semibold transition-colors"
            style={{ background: pillBg, color: '#FFFFFF' }}
            aria-label={`Elapsed ${fmtElapsed(elapsed)} — ${status.label}`}
          >
            {fmtElapsed(elapsed)}
          </span>
        </span>
        <span className="ml-2 shrink-0">
          {formatTime(order.timeReceived)}
        </span>
      </div>

      {/* TABLE / LOCATION ROW */}
      <div
        className="text-center bg-white text-[#2C3E50]"
        style={{ fontSize: 16, fontWeight: 600, padding: '6px 8px', borderBottom: '0.5px solid #E5E7EB' }}
      >
        {order.tableName || orderTypeLabel(order.orderType)}
      </div>

      {/* COURSES */}
      <div className="flex-1">
        {order.orderType === 'dine-in' ? (
          order.courses.map((course, idx) => (
            <div key={`${course.course}-${idx}`}>
              <div
                className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide"
                style={{ background: '#F3F4F6', color: '#374151' }}
              >
                {courseLabel(course.course)}
              </div>
              <div className="bg-white">
                {course.items.map((product) => (
                  <V1ProductRow
                    key={product.id}
                    product={product}
                    state={rowStates[product.id] ?? 'idle'}
                    onToggle={() => toggleRow(product.id)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white">
            {allItems.map((product) => (
              <V1ProductRow
                key={product.id}
                product={product}
                state={rowStates[product.id] ?? 'idle'}
                onToggle={() => toggleRow(product.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-end items-center px-2 py-1.5" style={{ background: '#F3F4F6' }}>
        <button
          type="button"
          onClick={handleBump}
          disabled={bumping}
          className="rounded-full px-3 py-1 text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-70"
          style={{ background: headerBg, color: headerText }}
        >
          {bumping && <Loader2 size={12} className="animate-spin" />}
          {bumping ? 'Bumping...' : 'Bump'}
        </button>
      </div>
    </div>
  );
}
