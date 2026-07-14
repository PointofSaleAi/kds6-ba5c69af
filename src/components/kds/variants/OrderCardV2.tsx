import { useState, useEffect, useRef, useMemo } from 'react';
import type { Order, OrderItem } from '@/types/kds';
import { Check, ChevronRight, Loader2, Eye, Undo, Clock } from 'lucide-react';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import { OrderCardActions, type TicketState } from '@/components/kds/OrderCardActions';
import { ClocheIcon } from '../icons/ClocheIcon';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, fmtElapsedAgo, orderTypeLabel, courseLabel, sortDoneLast } from './variant-utils';
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
import { ItemPrepTimerChip } from '@/hooks/use-item-prep-timers';


const MODIFIER_CLASS = {
  extra: 'text-modifier-extra',
  remove: 'text-modifier-remove',
  neutral: 'text-modifier-neutral',
} as const;

type RowState = 'idle' | 'cooking' | 'ready' | 'loading' | 'done';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
  onMarkSeen?: (orderId: string) => void;
  onItemDone?: (orderId: string, itemId: string) => void;
  onItemDismiss?: (orderId: string, item: OrderItem) => void;
  isSeen?: boolean;
  isHistory?: boolean;
}


function V2ProductRow({
  product,
  state,
  onAdvance,
  onUndo,
  onItemRecall,
  onOpenRecipe,
  onLongPress,
  compact = false,
  isHistory = false,
  productTimersEnabled = false,
}: {
  product: OrderItem;
  state: RowState;
  onAdvance: () => void;
  onUndo: () => void;
  onItemRecall?: () => void;
  onOpenRecipe: (p: OrderItem) => void;
  onLongPress: (p: OrderItem) => void;
  compact?: boolean;
  isHistory?: boolean;
  productTimersEnabled?: boolean;
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
  const iconTap = useRowTap(
    () => { if (!loading) onAdvance(); },
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
      data-onboarding="item-row"
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
            <div className="flex flex-wrap gap-1 mt-0.5" data-onboarding="item-allergen">
              {product.allergens.map((a) => (
                <AllergenBadge key={a.type} allergen={a} variant="item" suffix="allergy" />
              ))}
            </div>
          )}
          {showDetails && product.modifiers.length > 0 && (
            <div className="mt-0" data-onboarding="item-modifier">
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
        <ItemPrepTimerChip
          itemId={product.id}
          state={state === 'done' || state === 'ready' ? 'done' : (state === 'cooking' || state === 'loading') ? 'cooking' : 'idle'}
          enabled={productTimersEnabled}
        />
        {loading && (
          <span className="shrink-0 flex items-center justify-center" style={{ width: 22, height: 22 }} aria-label="Marking product served">
            <Loader2 size={14} className="animate-spin" color="#6C7A89" />
          </span>
        )}
        {done && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isHistory) {
                onItemRecall?.();
                return;
              }
              iconTap();
            }}
            data-onboarding="item-check"
            className="shrink-0 flex items-center justify-center rounded-full animate-scale-in active:scale-95 transition"
            style={{ background: isHistory ? '#E84C3D' : '#27AE60', width: 22, height: 22 }}
            aria-label={isHistory ? 'Recall product' : 'Product served (double-tap to undo)'}
            title={isHistory ? 'Tap to recall product' : 'Served. Double-tap to undo'}
          >
            {isHistory ? (
              <Undo size={14} color="#fff" strokeWidth={2.5} />
            ) : (
              <Check size={14} color="#fff" strokeWidth={3} />
            )}
          </button>
        )}
        {!loading && !done && state === 'ready' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); iconTap(); }}
            data-onboarding="item-ready"
            className="shrink-0 flex items-center justify-center rounded-full active:scale-95 transition animate-scale-in"
            style={{ width: 22, height: 22, background: '#DCFCE7', color: '#16A34A', border: '1.5px solid #16A34A' }}
            aria-label="Mark product served (double-tap to undo)"
            title="Ready. Tap to mark served. Double-tap to undo."
          >
            <Check size={14} strokeWidth={3} />
          </button>
        )}
        {!loading && !done && state === 'cooking' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); iconTap(); }}
            data-onboarding="item-bell"
            className="shrink-0 flex items-center justify-center rounded-[5px] active:scale-95 transition animate-scale-in"
            style={{ width: 22, height: 22, background: '#374151', color: '#fff' }}
            aria-label="Mark product ready (double-tap to undo)"
            title="Tap when ready. Double-tap to undo."
          >
            <ClocheIcon size={14} strokeWidth={2.4} color="#fff" />
          </button>

        )}
        {!loading && !done && state !== 'cooking' && state !== 'ready' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); iconTap(); }}
            data-onboarding="item-eye"
            className="shrink-0 flex items-center justify-center rounded-md hover:bg-black/[0.04] active:scale-95 transition"
            style={{ width: 22, height: 22, color: '#6C7A89' }}
            aria-label="Start cooking (double-tap to undo)"
          >
            <Eye size={18} strokeWidth={2} />
          </button>
        )}


      </div>
    </div>
  );
}

const FOOTER_STATE_CONFIG = {
  seen: { label: 'Seen', Icon: Eye, color: '#6C7A89' },
  'preparing': { label: 'Preparing', Icon: ClocheIcon, color: '#374151' },
  ready: { label: 'Ready', Icon: Check, color: '#16A34A' },
  done: { label: 'Served', Icon: Check, color: '#27AE60' },
} as const;

function FooterBumpButton({
  ticketState,
  bumping,
  elapsed,
  onAdvance,
  onUndo,
  isHistory = false,
}: {
  ticketState: TicketState;
  bumping: boolean;
  elapsed: number;
  onAdvance: () => void;
  onUndo: () => void;
  isHistory?: boolean;
}) {
  const baseConfig = FOOTER_STATE_CONFIG[ticketState];
  const isRecall = isHistory && ticketState === 'done';
  const config = isRecall
    ? { label: 'Recall', Icon: Undo, color: '#E84C3D' }
    : baseConfig;
  const { label, Icon, color } = config;
  const tap = useRowTap(onAdvance, onUndo, 250);
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 bg-card border-t border-border">
      <span className="text-[11px] text-[#9CA3AF]">{fmtElapsedAgo(elapsed)}</span>
      <button
        type="button"
        onClick={tap}
        disabled={bumping}
        data-onboarding="ticket-footer-btn"
        className="flex items-center gap-1 text-[12px] font-semibold disabled:opacity-70"
        style={{ color }}
        title={isRecall ? 'Tap to recall ticket' : 'Tap to advance. Double-tap to undo.'}
        aria-label={`${label} (double-tap to undo)`}
      >
        {bumping ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} strokeWidth={2.5} color={color} />}
        {bumping ? 'Processing...' : label}
      </button>
      {/* Hidden anchor used by the onboarding walkthrough to rewind ticket state. */}
      <button
        type="button"
        onClick={onUndo}
        data-onboarding="ticket-footer-undo"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', border: 0 }}
      />
    </div>
  );
}




export function OrderCardV2({ order, onBump, onMarkSeen, onItemDone, onItemDismiss, isSeen, isHistory = false }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const { timeFormat } = useLanguage();
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

  // Onboarding walkthrough hook: advance/undo the first sample item on cue.
  useEffect(() => {
    if (order.id !== 'onboarding-sample') return;
    const firstId = order.courses[0]?.items[0]?.id;
    if (!firstId) return;
    const onAdvance = () => setRowStates((p) => {
      const cur = p[firstId] ?? 'idle';
      if (cur === 'idle') return { ...p, [firstId]: 'cooking' };
      if (cur === 'cooking') return { ...p, [firstId]: 'done' };
      return p;
    });
    const onUndo = () => setRowStates((p) => {
      const cur = p[firstId] ?? 'idle';
      if (cur === 'done') return { ...p, [firstId]: 'cooking' };
      if (cur === 'cooking') return { ...p, [firstId]: 'idle' };
      return p;
    });
    window.addEventListener('kds:onboarding-item-advance', onAdvance);
    window.addEventListener('kds:onboarding-item-undo', onUndo);
    return () => {
      window.removeEventListener('kds:onboarding-item-advance', onAdvance);
      window.removeEventListener('kds:onboarding-item-undo', onUndo);
    };
  }, [order.id, order.courses]);

  const notifySeen = () => { if (!isSeen) onMarkSeen?.(order.id); };
  const setRow = (id: string, s: RowState) => setRowStates((p) => ({ ...p, [id]: s }));
  const getRowState = (product: OrderItem): RowState => rowStates[product.id] ?? (product.isCompleted ? 'done' : isSeen ? 'cooking' : 'idle');
  const toggleRow = (id: string) => {
    setRowStates((p) => {
      const current = p[id] ?? 'idle';
      let next = p;
      if (current === 'idle') next = { ...p, [id]: 'cooking' };
      else if (current === 'cooking') next = { ...p, [id]: 'ready' };
      else if (current === 'ready') {
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
      if (current === 'done') return { ...p, [id]: 'ready' };
      if (current === 'ready') return { ...p, [id]: 'cooking' };
      if (current === 'cooking') return { ...p, [id]: 'idle' };
      return p;
    });
  };
  const recallRow = (id: string) => {
    if (!isHistory && order.status === 'served') return;
    const item = order.courses.flatMap((c) => c.items).find((i) => i.id === id);
    if (item && onItemDismiss) onItemDismiss(order.id, item);
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };


  const { ticketLayout, ticketHeaderLayout, showAllergens, showHeaderAllergens, productTimers } = useKDSSettings();
  const isCompact = ticketLayout === 'compact';
  const isHeaderOnly = ticketLayout === 'header';
  const identifier = ticketHeaderLayout === 'guest'
    ? (order.guestName || order.customerName || order.serverName || 'Guest')
    : `${order.orderNumber}`;

  const allItems = order.courses.flatMap((c) => c.items).filter((p) => !removedIds.has(p.id));
  const [recipeProduct, setRecipeProduct] = useState<OrderItem | null>(null);
  const [flagProduct, setFlagProduct] = useState<OrderItem | null>(null);
  const { clear: clear86, confirm: confirm86 } = useFlag86();

  const allDone = allItems.length > 0 && allItems.every((p) => getRowState(p) === 'done');
  const allStarted = allItems.length > 0 && allItems.every((p) => {
    const s = getRowState(p);
    return s === 'cooking' || s === 'done';
  });
  const [phaseOverride, setPhaseOverride] = useState<TicketState | null>(null);
  const ticketState: TicketState = useMemo(() => {
    if (phaseOverride) return phaseOverride;
    if (allDone) return 'done';
    if (allStarted) return 'preparing';
    return 'seen';
  }, [phaseOverride, allDone, allStarted]);

  const runBumpAnimation = (onComplete?: () => void) => {
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
    const finish = window.setTimeout(() => { onComplete?.(); }, total);
    timersRef.current.push(finish);
  };

  const handleTicketAdvance = () => {
    if (bumping) return;
    if (ticketState === 'seen') {
      notifySeen();
      setPhaseOverride('preparing');
      return;
    }
    if (ticketState === 'preparing') {
      notifySeen();
      setBumping(true);
      runBumpAnimation(() => { setBumping(false); setPhaseOverride('done'); });
      return;
    }
    onBump?.(order.id);
  };

  const handleTicketRecall = () => {
    if (ticketState === 'done') {
      setRowStates({});
      setPhaseOverride('preparing');
      return;
    }
    if (ticketState === 'preparing') {
      setRowStates({});
      setPhaseOverride('seen');
    }
  };

  const handleBump = handleTicketAdvance;

  return (
    <div className="bg-card rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* HEADER */}
      <div
        className={`px-2.5 py-2 bg-muted ${isCompact ? 'cursor-pointer select-none active:opacity-80' : ''} ${isCompact && bumping ? 'opacity-70' : ''}`}
        onClick={isCompact ? handleBump : undefined}
        role={isCompact ? 'button' : undefined}
        aria-label={isCompact ? `Bump order ${order.orderNumber}` : undefined}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {isCompact && bumping && <Loader2 size={12} className="animate-spin shrink-0" />}
            {showTableInstead ? (
              <span
                data-onboarding="ticket-header"
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
                style={{ background: '#1A1A2E', color: '#FFFFFF' }}
              >
                {order.tableName}
              </span>
            ) : (
              <span
                data-onboarding="ticket-header"
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
                style={{ background: colorSet.headerBg, color: colorSet.headerText }}
              >
                {orderTypeLabel(order.orderType)}
              </span>
            )}
            <span data-onboarding="ticket-orderno" className="font-bold text-foreground text-[14px] shrink-0 truncate">{identifier}</span>
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-bold font-mono-timer shrink-0 tabular-nums"
            style={{ background: timerStatus.color, color: timerStatus.textColor }}
            aria-label={`Elapsed ${fmtElapsed(elapsed)} — ${timerStatus.label}`}
            data-onboarding="ticket-timer"
          >
            {fmtElapsed(elapsed)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-[12px] font-medium text-foreground truncate">{headerName}</span>
          <span className="text-[11px] text-muted-foreground shrink-0 truncate">
            {order.serverName}{firedTime ? ` · ${firedTime}` : ''}
          </span>
        </div>
      </div>

      {!isHeaderOnly && showAllergens && showHeaderAllergens && <OrderAllergenStrip order={order} compact={isCompact} showBottomRule={!order.orderNotes} />}
      {!isHeaderOnly && order.orderNotes && <OrderNotesSection notes={order.orderNotes} orderId={order.id} />}

      {/* PRODUCTS  course bands for dine-in (standard only), flat list otherwise */}

      {!isHeaderOnly && (
      <div className="flex-1 bg-card">
        {isDineIn && !isCompact ? (
          <>
            {order.courses.map((course, idx) => {
              const visibleItems = course.items.filter((p) => !removedIds.has(p.id) && getRowState(p) !== 'done');
              if (visibleItems.length === 0) return null;
              let firingAt: string | null = null;
              if (!course.isFired) {
                if (course.autoFireTargetSeconds !== undefined && course._startedAt) {
                  const t = new Date(course._startedAt.getTime() + course.autoFireTargetSeconds * 1000);
                  firingAt = formatTimeForKDS(t, timeFormat as 0 | 1);
                } else if (course.autoFireLabel) {
                  const m = course.autoFireLabel.match(/(\d+):(\d+)/) || course.autoFireLabel.match(/~(\d+)\s*min/);
                  if (m) {
                    const totalSec = m[2] !== undefined ? parseInt(m[1]) * 60 + parseInt(m[2]) : parseInt(m[1]) * 60;
                    firingAt = formatTimeForKDS(new Date(Date.now() + totalSec * 1000), timeFormat as 0 | 1);
                  }
                }
              }
              return (
                <div key={`${course.course}-${idx}`}>
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground flex items-center justify-between gap-2">
                    <span>{courseLabel(course.course)}</span>
                    {firingAt && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold normal-case text-muted-foreground">
                        <Clock size={12} />
                        <span>{firingAt.toLowerCase()}</span>
                      </span>
                    )}
                  </div>
                  {visibleItems.map((product) => (
                    <V2ProductRow
                      key={product.id}
                      product={product}
                      state={getRowState(product)}
                      onAdvance={() => toggleRow(product.id)}
                      onUndo={() => undoRow(product.id)}
                      onItemRecall={() => recallRow(product.id)}
                      onOpenRecipe={setRecipeProduct}
                      onLongPress={setFlagProduct}
                      isHistory={isHistory}
                      productTimersEnabled={productTimers}
                    />
                  ))}
                </div>
              );
            })}
            {order.courses.flatMap((course) =>
              course.items
                .filter((p) => !removedIds.has(p.id) && getRowState(p) === 'done')
                .map((product) => (
                  <div key={product.id}>
                    <div className="px-2.5 pt-1 pb-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/70 bg-card">
                      {courseLabel(course.course)}
                    </div>
                    <V2ProductRow
                      product={product}
                      state={getRowState(product)}
                      onAdvance={() => toggleRow(product.id)}
                      onUndo={() => undoRow(product.id)}
                      onItemRecall={() => recallRow(product.id)}
                      onOpenRecipe={setRecipeProduct}
                      onLongPress={setFlagProduct}
                      isHistory={isHistory}
                      productTimersEnabled={productTimers}
                    />
                  </div>
                ))
            )}
          </>
        ) : (
          sortDoneLast(allItems, (p) => getRowState(p) === 'done').map((product) => (
            <V2ProductRow
              key={product.id}
              product={product}
              state={getRowState(product)}
              onAdvance={() => toggleRow(product.id)}
              onUndo={() => undoRow(product.id)}
              onItemRecall={() => recallRow(product.id)}
              onOpenRecipe={setRecipeProduct}
              onLongPress={setFlagProduct}
              compact={isCompact}
              isHistory={isHistory}
              productTimersEnabled={productTimers}
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

      {/* FOOTER — single bump-style button; double-tap to undo */}
      {!isCompact && !isHeaderOnly && (
        <FooterBumpButton
          ticketState={ticketState}
          bumping={bumping}
          elapsed={elapsed}
          onAdvance={handleTicketAdvance}
          onUndo={handleTicketRecall}
          isHistory={isHistory}
        />

      )}
    </div>
  );
}
