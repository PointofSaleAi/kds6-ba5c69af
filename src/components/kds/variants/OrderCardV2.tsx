import { useState, useEffect, useRef } from 'react';
import type { Order, OrderItem } from '@/types/kds';
import { ArrowUp, Check, ChevronRight, Loader2, Eye } from 'lucide-react';
import { ClocheIcon } from '../icons/ClocheIcon';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, fmtElapsedAgo, orderTypeLabel, courseLabel } from './variant-utils';
import { useKDSSettings, DEFAULT_ORDER_TYPE_DETAILED_COLORS } from '@/hooks/use-kds-settings';
import { useStatusRules } from '@/hooks/use-status-rules';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import { formatTime } from '@/lib/datetime';
import { useLongPress } from '@/hooks/use-long-press';
import { useRowTap } from '@/hooks/use-row-tap';
import { RecipeReferenceModal } from '@/components/kds/RecipeReferenceModal';
import { OrderNotesSection } from '@/components/kds/OrderNotesSection';
import { OrderAllergenStrip } from '@/components/kds/OrderAllergenStrip';
import { KdsActionIcon } from '@/components/kds/KdsActionIcon';
import { Item86Modal } from '@/components/kds/Flag86Button';
import { useFlag86 } from '@/hooks/use-flag86';

const MODIFIER_CLASS = {
  extra: 'text-modifier-extra',
  remove: 'text-modifier-remove',
  neutral: 'text-modifier-neutral',
} as const;

type RowState = 'idle' | 'cooking' | 'loading' | 'done';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
  onMarkSeen?: (orderId: string) => void;
  onItemDone?: (orderId: string, itemId: string) => void;
  onItemDismiss?: (orderId: string, item: OrderItem) => void;
  isSeen?: boolean;
}

function V2ProductRow({
  product,
  state,
  onAdvance,
  onUndo,
  onOpenRecipe,
  onLongPress,
  compact = false,
}: {
  product: OrderItem;
  state: RowState;
  onAdvance: () => void;
  onUndo: () => void;
  onOpenRecipe: (p: OrderItem) => void;
  onLongPress: (p: OrderItem) => void;
  compact?: boolean;
}) {
  const done = state === 'done';
  const loading = state === 'loading';
  const hasDetails = product.modifiers.length > 0 || product.allergens.length > 0 || !!product.notes;
  const [expanded, setExpanded] = useState(false);
  const showDetails = !compact || expanded;
  const canExpand = compact && hasDetails && !loading;

  const longPress = useLongPress(() => onLongPress(product), { delay: 500 });
  const dispatchTap = useRowTap(
    () => { if (!loading) onOpenRecipe(product); },
    () => { if (!loading) onUndo(); },
    250,
  );

  return (
    <div
      role="button"
      tabIndex={loading ? -1 : 0}
      onClick={dispatchTap}
      onKeyDown={(e) => { if (!loading && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpenRecipe(product); } }}
      {...longPress}
      aria-pressed={done}
      aria-disabled={loading}
      className={`border-b border-border/40 last:border-b-0 cursor-pointer select-none transition-opacity ${loading ? 'opacity-70 pointer-events-none' : done ? 'opacity-50 hover:bg-black/[0.02]' : 'hover:bg-black/[0.02]'}`}
      style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 'var(--kds-row-py)', paddingBottom: 'var(--kds-row-py)' }}
    >
      <div className={`flex gap-1 ${showDetails && (product.modifiers.length > 0 || product.allergens.length > 0 || product.notes) ? 'items-start' : 'items-center'}`}>
        <span className="font-bold text-foreground shrink-0 text-center" style={{ fontSize: 'var(--kds-item-qty)', minWidth: 20, lineHeight: '14.4px' }}>
          {product.quantity}
        </span>
        <div className="flex-1 min-w-0">
          <div
            className="text-foreground"
            style={{ fontSize: 'var(--kds-item-name)', fontWeight: 700, lineHeight: 1.2, textDecoration: done ? 'line-through' : 'none' }}
          >
            {product.name}
          </div>
          {showDetails && product.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {product.allergens.map((a) => (
                <AllergenBadge key={a.type} allergen={a} variant="item" suffix="allergy" />
              ))}
            </div>
          )}
          {showDetails && product.modifiers.length > 0 && (
            <div className="mt-0">
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
          <span className="shrink-0 flex items-center justify-center" style={{ width: 22, height: 22 }} aria-label="Marking product done">
            <Loader2 size={14} className="animate-spin" color="#6C7A89" />
          </span>
        )}
        {done && (
          <span
            className="shrink-0 flex items-center justify-center rounded-full animate-scale-in"
            style={{ background: '#27AE60', width: 22, height: 22 }}
            aria-label="Product done"
          >
            <Check size={14} color="#fff" strokeWidth={3} />
          </span>
        )}
        {!loading && !done && state === 'cooking' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAdvance(); }}
            className="shrink-0 flex items-center justify-center rounded-[5px] active:scale-95 transition animate-scale-in"
            style={{ width: 22, height: 22, background: '#374151', color: '#fff' }}
            aria-label="Mark product done"
            title="Tap when ready"
          >
            <ClocheIcon size={14} strokeWidth={2.4} color="#fff" />
          </button>

        )}
        {!loading && !done && state !== 'cooking' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAdvance(); }}
            className="shrink-0 flex items-center justify-center rounded-md hover:bg-black/[0.04] active:scale-95 transition"
            style={{ width: 22, height: 22, color: '#6C7A89' }}
            aria-label="Start cooking"
          >
            <Eye size={18} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

export function OrderCardV2({ order, onBump, onMarkSeen, onItemDone, onItemDismiss, isSeen }: Props) {
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
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [bumping, setBumping] = useState(false);
  const timersRef = useRef<number[]>([]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const notifySeen = () => { if (!isSeen) onMarkSeen?.(order.id); };
  const setRow = (id: string, s: RowState) => setRowStates((p) => ({ ...p, [id]: s }));
  const getRowState = (product: OrderItem): RowState => product.isCompleted ? 'done' : (rowStates[product.id] ?? 'idle');
  const toggleRow = (id: string) => {
    setRowStates((p) => {
      const current = p[id] ?? 'idle';
      let next = p;
      if (current === 'idle') next = { ...p, [id]: 'cooking' };
      else if (current === 'cooking') {
        onItemDone?.(order.id, id);
        next = { ...p, [id]: 'done' };
      }
      // Mark ticket seen only when every item has been touched (viewed)
      const allTouched = allItems.every(pr => pr.isCompleted || (next[pr.id] ?? 'idle') !== 'idle');
      if (allTouched && !isSeen) onMarkSeen?.(order.id);
      return next;
    });
  };
  const undoRow = (id: string) => {
    setRowStates((p) => {
      const current = p[id] ?? 'idle';
      if (current === 'done') return { ...p, [id]: 'cooking' };
      if (current === 'cooking') return { ...p, [id]: 'idle' };
      return p;
    });
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

  const { ticketLayout, ticketHeaderLayout, showAllergens, showHeaderAllergens } = useKDSSettings();
  const isCompact = ticketLayout === 'compact';
  const isHeaderOnly = ticketLayout === 'header';
  const identifier = ticketHeaderLayout === 'guest'
    ? (order.guestName || order.customerName || order.serverName || 'Guest')
    : `${order.orderNumber}`;

  const allItems = order.courses.flatMap((c) => c.items).filter((p) => !removedIds.has(p.id));
  const [recipeProduct, setRecipeProduct] = useState<OrderItem | null>(null);
  const [flagProduct, setFlagProduct] = useState<OrderItem | null>(null);
  const { clear: clear86, confirm: confirm86 } = useFlag86();

  const handleBump = () => {
    if (bumping) return;
    notifySeen();
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
      <div
        className={`px-2.5 py-2 ${isCompact ? 'cursor-pointer select-none active:opacity-80' : ''} ${isCompact && bumping ? 'opacity-70' : ''}`}
        style={{ background: '#F3F4F6' }}
        onClick={isCompact ? handleBump : undefined}
        role={isCompact ? 'button' : undefined}
        aria-label={isCompact ? `Bump order ${order.orderNumber}` : undefined}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {isCompact && bumping && <Loader2 size={12} className="animate-spin shrink-0" />}
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
            <span className="font-bold text-foreground text-[14px] shrink-0 truncate">{identifier}</span>
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

      {!isHeaderOnly && showAllergens && showHeaderAllergens && <OrderAllergenStrip order={order} compact={isCompact} />}
      {!isHeaderOnly && order.orderNotes && <OrderNotesSection notes={order.orderNotes} orderId={order.id} />}

      {/* PRODUCTS  course bands for dine-in (standard only), flat list otherwise */}

      {!isHeaderOnly && (
      <div className="flex-1 bg-card">
        {isDineIn && !isCompact ? (
          order.courses.map((course, idx) => {
            const visibleItems = course.items.filter((p) => !removedIds.has(p.id));
            if (visibleItems.length === 0) return null;
            return (
              <div key={`${course.course}-${idx}`}>
                <div
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: '#F3F4F6', color: '#4B5563' }}
                >
                  {courseLabel(course.course)}
                </div>
                {visibleItems.map((product) => (
                  <V2ProductRow
                    key={product.id}
                    product={product}
                    state={getRowState(product)}
                    onAdvance={() => toggleRow(product.id)}
                    onUndo={() => undoRow(product.id)}
                    onOpenRecipe={setRecipeProduct}
                    onLongPress={setFlagProduct}
                  />
                ))}
              </div>
            );
          })
        ) : (
          allItems.map((product) => (
            <V2ProductRow
              key={product.id}
              product={product}
              state={getRowState(product)}
              onAdvance={() => toggleRow(product.id)}
              onUndo={() => undoRow(product.id)}
              onOpenRecipe={setRecipeProduct}
              onLongPress={setFlagProduct}
              compact={isCompact}
            />
          ))
        )}
      </div>
      )}

      <RecipeReferenceModal product={recipeProduct} order={order} onClose={() => setRecipeProduct(null)} variant="v3" />
      <Item86Modal
        open={!!flagProduct}
        onClose={() => { if (flagProduct) clear86(flagProduct.id); setFlagProduct(null); }}
        onConfirm={() => { if (flagProduct) confirm86(flagProduct.id); setFlagProduct(null); }}
        productName={flagProduct?.name ?? ''}
        currentQuantity={flagProduct?.quantity ?? 1}
      />

      {/* FOOTER */}
      {!isCompact && !isHeaderOnly && (
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
      )}
    </div>
  );
}
