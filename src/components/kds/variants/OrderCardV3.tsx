import { useState, useEffect, useRef, useMemo } from 'react';
import { OrderNotesSection } from '@/components/kds/OrderNotesSection';
import { OrderAllergenStrip } from '@/components/kds/OrderAllergenStrip';
import type { Order, OrderItem, CourseType, OrderType } from '@/types/kds';
import { Hash, User, Check, Utensils, ShoppingBag, Bike, PartyPopper, Phone, Loader2, ChevronRight } from 'lucide-react';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { fmtElapsed, orderTypeLabel, courseLabel, sortDoneLast } from './variant-utils';
import { useKDSSettings, DEFAULT_ORDER_TYPE_DETAILED_COLORS } from '@/hooks/use-kds-settings';
import { useStatusRules } from '@/hooks/use-status-rules';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import { useLongPress } from '@/hooks/use-long-press';
import { RecipeModalV1 } from './RecipeModalV1';
import { OrderCardActions, type TicketState } from '@/components/kds/OrderCardActions';
import PersonSimpleRunBold from '@/assets/person-simple-run-bold.svg';
import { formatTime } from '@/lib/datetime';
import dineInIcon from '@/assets/icons/order-types/dine-in.svg';
import takeOutIcon from '@/assets/icons/order-types/take-out.svg';
import deliveryIcon from '@/assets/icons/order-types/delivery.svg';
import banquetIcon from '@/assets/icons/order-types/banquet.svg';
import driveThruIcon from '@/assets/icons/order-types/drive-thru.svg';
import curbSideIcon from '@/assets/icons/order-types/curb-side.svg';
import scheduledIcon from '@/assets/icons/order-types/scheduled.svg';
import phoneInIcon from '@/assets/icons/order-types/phone-in.svg';
import customIcon from '@/assets/icons/order-types/custom.svg';

const MODIFIER_CLASS = {
  extra: 'text-modifier-extra',
  remove: 'text-modifier-remove',
  neutral: 'text-modifier-neutral',
} as const;

type RowState = 'idle' | 'loading' | 'done';

interface Props {
  order: Order;
  onBump?: (orderId: string) => void;
  onMarkSeen?: (orderId: string) => void;
  onItemDone?: (orderId: string, itemId: string) => void;
  onItemDismiss?: (orderId: string, item: OrderItem) => void;
  isSeen?: boolean;
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

function ProductRow({
  product,
  accent,
  state,
  onToggle,
  onReset,
  onRemove,
  onLongPress,
  compact = false,
  isNewBlink = false,
}: {
  product: OrderItem;
  accent: string;
  state: RowState;
  onToggle: () => void;
  onReset: () => void;
  onRemove: () => void;
  onLongPress: (p: OrderItem) => void;
  compact?: boolean;
  isNewBlink?: boolean;
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
      onClick={handleClick}
      onDoubleClick={(e) => { if (done) { e.stopPropagation(); setExpanded(false); onReset(); } }}
      onKeyDown={(e) => { if (!loading && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleClick(); } }}
      {...longPress}
      aria-pressed={done}
      aria-disabled={loading}
      className={`flex items-start border-b border-border/40 last:border-b-0 cursor-pointer select-none transition-opacity ${loading ? 'opacity-70 pointer-events-none' : done ? 'opacity-50 hover:bg-black/[0.02]' : 'hover:bg-black/[0.02]'} ${isNewBlink ? 'animate-row-blink' : ''}`}
      style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 6, paddingRight: 6, paddingTop: 'var(--kds-row-py)', paddingBottom: 'var(--kds-row-py)', gap: 4, ...(isNewBlink ? { ['--row-blink-rgb' as any]: '127 140 141' } : {}) }}
    >

      <span
        className="font-bold shrink-0 text-center"
        style={{ color: accent, fontSize: 'var(--kds-item-qty)', minWidth: 18, lineHeight: '14.3px' }}
      >
        {product.quantity}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span
            className="text-foreground"
            style={{ fontSize: 'var(--kds-item-name)', fontWeight: 700, lineHeight: 1.3, textDecoration: done ? 'line-through' : 'none' }}
          >
            {product.name}
          </span>
          {showDetails && product.allergens.map((a) => (
            <AllergenBadge key={a.type} allergen={a} variant="item" suffix="allergy" />
          ))}
        </div>
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
          style={{ width: 18, height: 18, color: '#6C7A89' }}
          aria-label={expanded ? 'Hide details' : 'Show details'}
          aria-expanded={expanded}
        >
          <ChevronRight
            size={11}
            strokeWidth={2.5}
            style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 120ms ease' }}
          />
        </button>
      )}
      {loading && (
        <span className="shrink-0 mt-0.5 flex items-center justify-center" style={{ width: 16, height: 16 }} aria-label="Marking Product Done">
          <Loader2 size={12} className="animate-spin" color="#6C7A89" />
        </span>
      )}
      {done && (
        <span
          className="shrink-0 mt-0.5 flex items-center justify-center rounded-full animate-scale-in"
          style={{ background: '#27AE60', width: 16, height: 16 }}
          aria-label="Product Done"
        >
          <Check size={10} color="#fff" strokeWidth={3} />
        </span>
      )}
    </div>
  );
}


const ORDER_TYPE_META: Record<OrderType, { color: string; icon: string }> = {
  'dine-in': { color: '#1A1A2E', icon: dineInIcon },
  'take-out': { color: '#2980B9', icon: takeOutIcon },
  'delivery': { color: '#16A085', icon: deliveryIcon },
  'banquet': { color: '#F39C12', icon: banquetIcon },
  'drive-thru': { color: '#2980B9', icon: driveThruIcon },
  'curb-side': { color: '#2980B9', icon: curbSideIcon },
  'scheduled': { color: '#6B7280', icon: scheduledIcon },
  'phone-in': { color: '#7C3AED', icon: phoneInIcon },
  'custom': { color: '#6B7280', icon: customIcon },
};

export function OrderCardV3({ order, onBump, onMarkSeen, onItemDone, onItemDismiss, isSeen }: Props) {
  const elapsed = useElapsedSeconds(order.timeReceived);
  const typeMeta = ORDER_TYPE_META[order.orderType] || ORDER_TYPE_META['custom'];
  const typeIcon = typeMeta.icon;
  const { orderTypeDetailedColors, ticketLayout, ticketHeaderLayout, showAllergens, showHeaderAllergens } = useKDSSettings();
  const isCompact = ticketLayout === 'compact';
  const isHeaderOnly = ticketLayout === 'header';
  const guestName = order.guestName || order.customerName || order.serverName || 'Guest';
  const identifierPrimary = ticketHeaderLayout === 'guest' ? guestName : order.orderNumber;
  const identifierSub = ticketHeaderLayout === 'guest' ? `${order.orderNumber}` : (order.guestName || order.customerName || '');
  const colorSet = orderTypeDetailedColors[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS[order.orderType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS.custom;
  const accentColor = colorSet.headerBg;
  const accentText = colorSet.headerText;
  const { getStatusForElapsed } = useStatusRules();
  const agingStatus = getStatusForElapsed(elapsed);

  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [bumping, setBumping] = useState(false);
  const [recipeProduct, setRecipeProduct] = useState<OrderItem | null>(null);
  const timersRef = useRef<number[]>([]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const notifySeen = () => { if (!isSeen) onMarkSeen?.(order.id); };
  const setRow = (id: string, s: RowState) => setRowStates((p) => ({ ...p, [id]: s }));
  const getRowState = (product: OrderItem): RowState => product.isCompleted ? 'done' : (rowStates[product.id] ?? 'idle');
  const toggleRow = (id: string) => {
    setRow(id, 'loading');
    const t = window.setTimeout(() => {
      setRow(id, 'done');
      onItemDone?.(order.id, id);
      setRowStates((current) => {
        const allTouched = allItems.every(p => p.isCompleted || (current[p.id] ?? 'idle') !== 'idle');
        if (allTouched && !isSeen) onMarkSeen?.(order.id);
        return current;
      });
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


  const allDone = allItems.length > 0 && allItems.every((p) => getRowState(p) === 'done');
  const anyStarted = allItems.some((p) => getRowState(p) !== 'idle');
  const [phaseOverride, setPhaseOverride] = useState<TicketState | null>(null);
  const ticketState: TicketState = useMemo(() => {
    if (phaseOverride) return phaseOverride;
    if (allDone) return 'done';
    if (isSeen || anyStarted) return 'preparing';
    return 'seen';
  }, [phaseOverride, allDone, isSeen, anyStarted]);

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
    // done
    onBump?.(order.id);
  };

  const handleTicketRecall = () => {
    if (ticketState === 'done') {
      // Reset all rows back to idle (preparing phase)
      setRowStates({});
      setPhaseOverride('preparing');
      return;
    }
    if (ticketState === 'preparing') {
      setRowStates({});
      setPhaseOverride('seen');
    }
  };

  // Backwards-compat alias for the compact header strip advance.
  const handleBump = handleTicketAdvance;

  const showCourses = !isCompact && order.orderType === 'dine-in';

  return (
    <div className="bg-card rounded-md overflow-hidden border border-border shadow-sm flex flex-col">
      {/* ACCENT BAR coloured by order type */}
      <div style={{ height: 4, background: accentColor }} />

      {/* ORDER TYPE STRIP - also bump trigger in compact */}
      <div
        role={isCompact ? 'button' : undefined}
        tabIndex={isCompact ? 0 : -1}
        onClick={isCompact ? handleBump : undefined}
        onKeyDown={isCompact ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBump(); } } : undefined}
        aria-disabled={isCompact ? bumping : undefined}
        data-onboarding="ticket-header"
        className={`relative flex items-center justify-start gap-1.5 px-2 py-1 pr-16 text-[13px] font-bold uppercase tracking-wide ${isCompact ? 'cursor-pointer select-none' : ''} ${isCompact && bumping ? 'opacity-70 pointer-events-none' : ''}`}
        style={{ background: accentColor, color: accentText }}
      >
        <img src={typeIcon} alt="" width={14} height={14} className="shrink-0" style={{ filter: accentText === '#FFFFFF' || accentText === '#ffffff' ? 'brightness(0) invert(1)' : 'brightness(0)' }} />
        <span>{order.orderType === 'dine-in' ? (order.tableName || orderTypeLabel(order.orderType)) : orderTypeLabel(order.orderType)}</span>
        <span
          className="absolute right-2 inline-flex items-center rounded-full px-2 py-0.5 font-mono-timer text-[11px] font-semibold normal-case tracking-normal"
          style={{ background: agingStatus.color, color: agingStatus.textColor }}
          aria-label={`Elapsed ${fmtElapsed(elapsed)} — ${agingStatus.label}`}
        >
          {fmtElapsed(elapsed)}
        </span>
        {isCompact && bumping && <Loader2 size={14} className="absolute right-2 animate-spin" />}
      </div>


      {/* METADATA GRID 2x2 */}
      {(() => {
        const isDineIn = order.orderType === 'dine-in';
        const cell1Sub = isDineIn ? '' : (order.customerPhone || '');
        return (
          <div className="grid grid-cols-2 bg-card border-b border-border">
            <div className="flex items-start gap-1.5 px-2 py-1.5">
              <div className="min-w-0">
                <div className="font-bold text-foreground text-[13px] leading-tight truncate">{identifierPrimary}</div>
                {identifierSub && <div className="text-[10px] text-[#6B7280] truncate">{identifierSub}</div>}
                {cell1Sub && cell1Sub !== identifierSub && cell1Sub !== identifierPrimary && (
                  <div className="text-[10px] text-[#9CA3AF] truncate">{cell1Sub}</div>
                )}
              </div>
            </div>
            <div className="flex items-start gap-0.5 px-2 py-1.5 border-l border-border">
              <img src={PersonSimpleRunBold} alt="" width={12} height={12} className="mt-0.5 opacity-70 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-foreground text-[13px] leading-tight truncate">{order.serverName}</div>
                <div className="text-[10px] text-[#6B7280] truncate">{formatTime(order.timeReceived)}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {!isHeaderOnly && showAllergens && showHeaderAllergens && <OrderAllergenStrip order={order} compact={isCompact} showBottomRule={!order.orderNotes} />}
      {!isHeaderOnly && order.orderNotes && <OrderNotesSection notes={order.orderNotes} orderId={order.id} />}

      {/* PRODUCTS  course bands for dine-in (standard only), flat list otherwise */}

      {!isHeaderOnly && (
      <div className="flex-1 bg-card">
        {showCourses ? (
          <>
            {order.courses.map((course, idx) => {
              const p = paletteFor(course.course);
              const visibleItems = course.items.filter((pr) => !removedIds.has(pr.id) && getRowState(pr) !== 'done');
              if (visibleItems.length === 0) return null;
              return (
                <div key={`${course.course}-${idx}`}>
                  <div
                    className="flex items-center justify-between px-2 py-1"
                    style={{ background: p.bg, color: p.text }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide">{courseLabel(course.course)}</span>
                    <span className="text-[10px] font-semibold">Products: {course.items.length}</span>
                  </div>
                  <div>
                    {visibleItems.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        accent={p.accent}
                        state={getRowState(product)}
                        onToggle={() => toggleRow(product.id)}
                        onReset={() => setRow(product.id, 'idle')}
                        onRemove={() => removeRow(product.id)}
                        onLongPress={setRecipeProduct}
                        isNewBlink={!!product.isNew && getRowState(product) === 'idle'}
                      />
                    ))}

                  </div>
                </div>
              );
            })}
            <div>
              {order.courses.flatMap((course) =>
                course.items
                  .filter((p) => !removedIds.has(p.id) && getRowState(p) === 'done')
                  .map((product) => (
                    <div key={product.id}>
                      <div className="px-2 pt-1 pb-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                        {courseLabel(course.course)}
                      </div>
                      <ProductRow
                        product={product}
                        accent={accentColor}
                        state={getRowState(product)}
                        onToggle={() => toggleRow(product.id)}
                        onReset={() => setRow(product.id, 'idle')}
                        onRemove={() => removeRow(product.id)}
                        onLongPress={setRecipeProduct}
                      />
                    </div>
                  ))
              )}
            </div>
          </>
        ) : (
          <div>
            {sortDoneLast(allItems, (p) => getRowState(p) === 'done').map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                accent={accentColor}
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




      {/* FOOTER: SEEN → PREPARING → DONE (matches /default) */}
      {!isCompact && !isHeaderOnly && (
        <OrderCardActions
          orderId={order.id}
          ticketState={ticketState}
          onTicketAdvance={handleTicketAdvance}
          onTicketRecall={handleTicketRecall}
        />
      )}

      <RecipeModalV1 product={recipeProduct} onClose={() => setRecipeProduct(null)} />
    </div>
  );
}
