import { useState, useEffect, useRef } from 'react';
import type { Order, OrderItem } from '@/types/kds';
import { ArrowUp, Check, ChevronRight, Loader2 } from 'lucide-react';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, fmtElapsedAgo, orderTypeLabel, courseLabel } from './variant-utils';
import { useKDSSettings, DEFAULT_ORDER_TYPE_DETAILED_COLORS } from '@/hooks/use-kds-settings';
import { useStatusRules } from '@/hooks/use-status-rules';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import { formatTime } from '@/lib/datetime';

const MODIFIER_CLASS = {
  extra: 'text-modifier-extra',
  remove: 'text-modifier-remove',
  neutral: 'text-modifier-neutral',
} as const;

type RowState = 'idle' | 'loading' | 'done';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
}

function V2ProductRow({
  product,
  state,
  onToggle,
  onReset,
  compact = false,
}: {
  product: OrderItem;
  state: RowState;
  onToggle: () => void;
  onReset: () => void;
  compact?: boolean;
}) {
  const done = state === 'done';
  const loading = state === 'loading';
  const hasDetails = product.modifiers.length > 0 || product.allergens.length > 0 || !!product.notes;
  const [expanded, setExpanded] = useState(false);
  const showDetails = !compact || expanded;
  const canExpand = compact && hasDetails && !loading;

  const handleClick = () => {
    if (loading) return;
    if (done) {
      if (canExpand) setExpanded((v) => !v);
      return;
    }
    onToggle();
  };

  return (
    <div
      role="button"
      tabIndex={loading ? -1 : 0}
      onClick={handleClick}
      onDoubleClick={(e) => { if (done) { e.stopPropagation(); setExpanded(false); onReset(); } }}
      onKeyDown={(e) => { if (!loading && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleClick(); } }}
      aria-pressed={done}
      aria-disabled={loading}
      className={`px-2.5 py-1.5 border-b border-border/40 last:border-b-0 cursor-pointer select-none transition-opacity ${loading ? 'opacity-70 pointer-events-none' : done ? 'opacity-50 hover:bg-black/[0.02]' : 'hover:bg-black/[0.02]'}`}
    >
      <div className="flex items-start gap-1">
        <span className="font-bold text-foreground shrink-0 text-center" style={{ fontSize: 15, minWidth: 20, lineHeight: 1.2 }}>
          {product.quantity}
        </span>
        <div className="flex-1 min-w-0">
          <div
            className="text-foreground"
            style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2, textDecoration: done ? 'line-through' : 'none' }}
          >
            {product.name}
          </div>
          {showDetails && product.modifiers.length > 0 && (
            <div className="mt-0">
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
          {showDetails && product.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {product.allergens.map((a) => (
                <AllergenBadge key={a.type} allergen={a} variant="item" />
              ))}
            </div>
          )}
          {showDetails && product.notes && (
            <div className="italic text-[#6B7280] mt-0" style={{ fontSize: 11, lineHeight: 1.2 }}>
              {product.notes}
            </div>
          )}
        </div>
        {canExpand && !done && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className="shrink-0 inline-flex items-center justify-center"
            style={{ width: 20, height: 20, color: '#6C7A89' }}
            aria-label={expanded ? 'Hide details' : 'Show details'}
            aria-expanded={expanded}
          >
            <ChevronRight
              size={12}
              strokeWidth={2.5}
              style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 120ms ease' }}
            />
          </button>
        )}
        {loading && (
          <span className="shrink-0 flex items-center justify-center" style={{ width: 18, height: 18 }} aria-label="Marking product done">
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
    </div>
  );
}

export function OrderCardV2({ order, onBump }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const headerName = order.guestName || order.customerName || order.serverName || 'Guest';
  const isDineIn = order.orderType === 'dine-in';
  const { orderTypeDetailedColors } = useKDSSettings();
  const colorSet = orderTypeDetailedColors[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS.custom;
  const { getStatusForElapsed } = useStatusRules();
  const timerStatus = getStatusForElapsed(elapsed);
  const firedTime = order.timeReceived ? formatTime(order.timeReceived) : '';
  const showTableInstead = isDineIn && !!order.tableName;

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
    setRowStates((prev) => {
      const next = { ...prev };
      allItems.forEach((p) => { if (next[p.id] !== 'done') next[p.id] = 'loading'; });
      return next;
    });
    allItems.forEach((p, idx) => {
      const t = window.setTimeout(() => setRow(p.id, 'done'), 250 + idx * 120);
      timersRef.current.push(t);
    });
    const total = 250 + allItems.length * 120 + 350;
    const finish = window.setTimeout(() => onBump?.(order.id), total);
    timersRef.current.push(finish);
  };

  return (
    <div className="bg-card rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* HEADER */}
      <div className="px-2.5 py-2" style={{ background: '#F3F4F6' }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {showTableInstead ? (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
                style={{ background: '#1A1A2E', color: '#FFFFFF' }}
              >
                {order.tableName}
              </span>
            ) : (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
                style={{ background: colorSet.headerBg, color: colorSet.headerText }}
              >
                {orderTypeLabel(order.orderType)}
              </span>
            )}
            <span className="font-bold text-foreground text-[14px] shrink-0">#{order.orderNumber}</span>
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-bold font-mono-timer shrink-0 tabular-nums"
            style={{ background: timerStatus.color, color: timerStatus.textColor }}
            aria-label={`Elapsed ${fmtElapsed(elapsed)} — ${timerStatus.label}`}
          >
            {fmtElapsed(elapsed)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-[12px] font-medium text-foreground truncate">{headerName}</span>
          <span className="text-[11px] text-[#6B7280] shrink-0 truncate">
            {order.serverName}{firedTime ? ` · ${firedTime}` : ''}
          </span>
        </div>
      </div>

      {/* PRODUCTS  course bands for dine-in, flat list for everything else */}
      <div className="flex-1 bg-card">
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
                <V2ProductRow
                  key={product.id}
                  product={product}
                  state={rowStates[product.id] ?? 'idle'}
                  onToggle={() => toggleRow(product.id)}
                  onReset={() => setRow(product.id, 'idle')}
                />
              ))}
            </div>
          ))
        ) : (
          allItems.map((product) => (
            <V2ProductRow
              key={product.id}
              product={product}
              state={rowStates[product.id] ?? 'idle'}
              onToggle={() => toggleRow(product.id)}
              onReset={() => setRow(product.id, 'idle')}
            />
          ))
        )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-card border-t border-border">
        <span className="text-[11px] text-[#9CA3AF]">{fmtElapsedAgo(elapsed)}</span>
        <button
          type="button"
          onClick={handleBump}
          disabled={bumping}
          className="flex items-center gap-1 text-[12px] font-semibold disabled:opacity-70"
          style={{ color: '#2563EB' }}
        >
          {bumping ? <Loader2 size={12} className="animate-spin" /> : <ArrowUp size={12} strokeWidth={2.5} />}
          {bumping ? 'Bumping...' : 'Bump'}
        </button>
      </div>
    </div>
  );
}
