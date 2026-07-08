import { useState, useEffect, useRef } from 'react';
import { Check, ChevronRight, Loader2 } from 'lucide-react';
import type { Order, OrderItem } from '@/types/kds';
import { useLongPress } from '@/hooks/use-long-press';
import { RecipeModalV1 } from './RecipeModalV1';
import { OrderNotesSection } from '@/components/kds/OrderNotesSection';
import { OrderAllergenStrip } from '@/components/kds/OrderAllergenStrip';

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
  onMarkSeen?: (orderId: string) => void;
  onItemDone?: (orderId: string, itemId: string) => void;
  onItemDismiss?: (orderId: string, item: OrderItem) => void;
  isSeen?: boolean;
}

type RowState = 'idle' | 'loading' | 'done';

interface V1ProductRowProps {
  product: OrderItem;
  state: RowState;
  onToggle: () => void;
  onReset: () => void;
  onRemove: () => void;
  onLongPress: (p: OrderItem) => void;
  compact?: boolean;
}

function V1ProductRow({ product, state, onToggle, onReset, onRemove, onLongPress, compact = false }: V1ProductRowProps) {

  const done = state === 'done';
  const loading = state === 'loading';
  const disabled = loading || done;
  const hasDetails = product.modifiers.length > 0 || product.allergens.length > 0 || !!product.notes;
  const [expanded, setExpanded] = useState(false);
  const showDetails = !compact || expanded;
  const canExpand = compact && hasDetails && !loading;
  const handleRowClick = () => {
    if (loading) return;
    if (done) {
      onRemove();
      return;
    }
    onToggle();
  };
  const longPress = useLongPress(() => onLongPress(product), { delay: 500 });
  return (
    <div
      role="button"
      tabIndex={loading ? -1 : 0}
      onClick={handleRowClick}
      onDoubleClick={(e) => { if (done) { e.stopPropagation(); setExpanded(false); onReset(); } }}
      onKeyDown={(e) => { if (!loading && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleRowClick(); } }}
      {...longPress}
      aria-pressed={done}

      aria-disabled={loading}
      className={`w-full text-left border-b border-border/40 last:border-b-0 transition-opacity cursor-pointer select-none ${loading ? 'opacity-70 pointer-events-none' : done ? 'opacity-50 hover:bg-black/[0.02]' : 'hover:bg-black/[0.02]'}`}
      style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 'var(--kds-row-py)', paddingBottom: 'var(--kds-row-py)' }}
    >
      <div className="flex items-start" style={{ gap: 'var(--kds-item-gap)' }}>
        <span className="font-bold shrink-0 text-center text-foreground" style={{ fontSize: 'var(--kds-item-qty)', minWidth: 20, lineHeight: 1.2 }}>
          {product.quantity}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span
              className="text-foreground"
              style={{ fontSize: 'var(--kds-item-name)', fontWeight: 700, lineHeight: 1.2, textDecoration: done ? 'line-through' : 'none' }}
            >
              {product.name}
            </span>
            {showDetails && product.allergens.map((a) => (
              <AllergenBadge key={a.type} allergen={a} variant="item" suffix="allergy" />
            ))}
          </div>
          {showDetails && product.modifiers.length > 0 && (
            <div>
              {product.modifiers.map((m, i) => (
                <div
                  key={i}
                  className={`font-semibold ${MODIFIER_CLASS[m.type]}`}
                  style={{ fontSize: 'var(--kds-modifier)', lineHeight: 1.2, textDecoration: done ? 'line-through' : 'none' }}
                >
                  {m.type === 'extra' ? m.text.replace(/^\+\s*/, '') : m.text}
                </div>
              ))}
            </div>
          )}
          {showDetails && product.notes && (
            <div
              className={`italic leading-snug text-text-muted font-medium ${done ? 'line-through' : ''}`}
              style={{ fontSize: 'var(--kds-modifier)' }}
            >
              "{product.notes}"
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
    </div>
  );
}



export function OrderCardV1({ order, onBump, onMarkSeen, onItemDone, onItemDismiss, isSeen }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const { orderTypeDetailedColors, ticketLayout, ticketHeaderLayout, showAllergens, showHeaderAllergens } = useKDSSettings();
  const isCompact = ticketLayout === 'compact';
  const isHeaderOnly = ticketLayout === 'header';
  const { getStatusForElapsed } = useStatusRules();
  const colorSet = orderTypeDetailedColors[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS.custom;
  const headerBg = colorSet.headerBg;
  const headerText = colorSet.headerText;
  const status = getStatusForElapsed(elapsed);
  const pillBg = status.color;
  const pillText = status.textColor;
  const identifier = ticketHeaderLayout === 'guest'
    ? (order.guestName || order.customerName || order.serverName || 'Guest')
    : `${order.orderNumber}`;

  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [bumping, setBumping] = useState(false);
  const [recipeProduct, setRecipeProduct] = useState<OrderItem | null>(null);
  const timersRef = useRef<number[]>([]);


  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const setRow = (id: string, s: RowState) => setRowStates((p) => ({ ...p, [id]: s }));
  const getRowState = (product: OrderItem): RowState => product.isCompleted ? 'done' : (rowStates[product.id] ?? 'idle');

  const notifySeen = () => { if (!isSeen) onMarkSeen?.(order.id); };

  const toggleRow = (id: string) => {
    notifySeen();
    setRow(id, 'loading');
    const t = window.setTimeout(() => {
      setRow(id, 'done');
      onItemDone?.(order.id, id);
    }, 600);
    timersRef.current.push(t);
  };
  const removeRow = (id: string) => {
    if (order.status === 'served') return;
    const item = order.courses.flatMap((c) => c.items).find((i) => i.id === id);
    if (item && onItemDismiss) onItemDismiss(order.id, item);
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const allItems = order.courses.flatMap((c) => c.items).filter((p) => !removedIds.has(p.id));

  const handleBump = () => {
    if (bumping) return;
    notifySeen();
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
    <div className="bg-card rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* TABLE / LOCATION ROW */}
      <div
        onClick={handleBump}
        role="button"
        aria-label={`Bump order ${order.orderNumber}`}
        className={`text-center cursor-pointer select-none active:opacity-80 flex items-center justify-center gap-1.5 ${bumping ? 'opacity-70' : ''}`}
        style={{ fontSize: 16, fontWeight: 600, padding: '6px 8px', background: headerBg, color: headerText }}
      >
        {bumping && <Loader2 size={14} className="animate-spin" />}
        <span>{order.tableName || orderTypeLabel(order.orderType)}</span>
      </div>


      {/* HEADER */}
      <div
        className="flex items-center justify-between px-2 py-1 text-[12px] font-semibold bg-card text-foreground"
        style={{ borderBottom: '0.5px solid #E5E7EB' }}
      >
        <span className="inline-flex items-center gap-1.5 min-w-0">
          <span className="truncate" style={{ fontSize: 14, fontWeight: 800 }}>{identifier}</span>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 font-mono-timer text-[11px] font-semibold transition-colors shrink-0"
            style={{ background: pillBg, color: pillText }}
            aria-label={`Elapsed ${fmtElapsed(elapsed)} — ${status.label}`}
          >
            {fmtElapsed(elapsed)}
          </span>
        </span>
        <span className="ml-2 shrink-0">
          {formatTime(order.timeReceived)}
        </span>
      </div>

      {!isHeaderOnly && showAllergens && showHeaderAllergens && <OrderAllergenStrip order={order} compact={isCompact} />}
      {!isHeaderOnly && order.orderNotes && <OrderNotesSection notes={order.orderNotes} orderId={order.id} />}

      {/* COURSES */}
      {!isHeaderOnly && (
      <div className="flex-1">

        {order.orderType === 'dine-in' && !isCompact ? (
          order.courses.map((course, idx) => (
            <div key={`${course.course}-${idx}`}>
              <div
                className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide"
                style={{ background: '#F3F4F6', color: '#374151' }}
              >
                {courseLabel(course.course)}
              </div>
              <div className="bg-card">
                {course.items.filter((p) => !removedIds.has(p.id)).map((product) => (
                  <V1ProductRow
                    key={product.id}
                    product={product}
                    state={getRowState(product)}
                    onToggle={() => toggleRow(product.id)}
                    onReset={() => setRow(product.id, 'idle')}
                    onRemove={() => removeRow(product.id)}
                    onLongPress={setRecipeProduct}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card">
            {allItems.map((product) => (
              <V1ProductRow
                key={product.id}
                product={product}
                state={getRowState(product)}
                onToggle={() => toggleRow(product.id)}
                onReset={() => setRow(product.id, 'idle')}
                onRemove={() => removeRow(product.id)}
                onLongPress={setRecipeProduct}
                compact={isCompact}
              />

            ))}
          </div>
        )}
      </div>
      )}

      <RecipeModalV1 product={recipeProduct} onClose={() => setRecipeProduct(null)} />
    </div>
  );
}
