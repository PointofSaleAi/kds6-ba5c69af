import { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { KitchenMessageSection } from '@/components/kds/KitchenMessageSection';
import { useKitchenMessages } from '@/hooks/use-kitchen-messages';
import { KdsActionIcon } from '@/components/kds/KdsActionIcon';
import { Item86Modal } from '@/components/kds/Flag86Button';
import { useFlag86 } from '@/hooks/use-flag86';
import { ItemPrepTimerChip } from '@/hooks/use-item-prep-timers';
import { useOrderStore, type ItemLifecycle } from '@/hooks/use-order-store';



const MODIFIER_CLASS = {
  extra: 'text-modifier-extra',
  remove: 'text-modifier-remove',
  neutral: 'text-modifier-neutral',
} as const;

type RowState = 'idle' | 'cooking' | 'ready' | 'loading' | 'done';

function ProductCuePopover({
  anchorRef,
  onClose,
  on86,
  onRecipe,
}: {
  anchorRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  on86: () => void;
  onRecipe: () => void;
}) {
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(96);

  useLayoutEffect(() => {
    const measure = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [rect]);

  const firedRef = useRef(false);
  const handleAction = (fn: () => void) => (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if ('preventDefault' in e) e.preventDefault();
    if (firedRef.current) return;
    firedRef.current = true;
    fn();
  };

  if (!rect) return null;
  const pad = 6;
  const spot = { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 };
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const GAP = 12;
  const cardW = Math.min(160, vw - 24);
  const spaceBelow = vh - (spot.top + spot.height);
  const placeBelow = spaceBelow >= cardH + GAP + 12;
  let top = placeBelow ? spot.top + spot.height + GAP : spot.top - cardH - GAP;
  let left = rect.left + rect.width / 2 - cardW / 2;
  left = Math.max(12, Math.min(left, vw - cardW - 12));
  top = Math.max(12, Math.min(top, vh - cardH - 12));


  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998]"
        aria-hidden="true"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <svg width="100%" height="100%" style={{ display: 'block', pointerEvents: 'none' }}>
          <defs>
            <mask id="product-cue-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect x={spot.left} y={spot.top} width={spot.width} height={spot.height} rx={10} ry={10} fill="black" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#product-cue-mask)" />
        </svg>
      </div>
      <div
        className="fixed z-[9999] pointer-events-none rounded-[10px]"
        style={{
          top: spot.top,
          left: spot.left,
          width: spot.width,
          height: spot.height,
          boxShadow: '0 0 0 2px #F59E0B, 0 0 24px 4px rgba(245,158,11,0.35)',
        }}
      />
      <div
        ref={cardRef}
        role="menu"
        className="fixed z-[10001] rounded-2xl shadow-2xl p-2 bg-white text-black border border-black/10"
        style={{ top, left, width: cardW }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          role="menuitem"
          onPointerUp={handleAction(on86)}
          onClick={handleAction(on86)}
          className="w-full text-left px-2 py-2 rounded-lg text-[13px] font-bold text-black hover:bg-black/5 transition-colors touch-manipulation"
        >
          86 it
        </button>
        <button
          type="button"
          role="menuitem"
          onPointerUp={handleAction(onRecipe)}
          onClick={handleAction(onRecipe)}
          className="w-full text-left px-2 py-2 rounded-lg text-[13px] font-bold text-black hover:bg-black/5 transition-colors touch-manipulation"
        >
          View Recipe
        </button>
      </div>
    </>,
    document.body,
  );
}


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

  const { tp, tpSecondary, tm, tmSecondary, tn, tnSecondary, displayMode, showSecondaryMenu, secondaryLang } = useLanguage();
  const secondaryDir = secondaryLang === 'ar' ? 'rtl' : 'ltr';
  const showSecondary = displayMode === 'dual' && showSecondaryMenu && !product.isCancelled;

  const done = state === 'done';
  const loading = state === 'loading';
  const hasDetails = product.modifiers.length > 0 || product.allergens.length > 0 || !!product.notes;
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const showDetails = !compact || expanded;
  const canExpand = compact && hasDetails && !loading;


  const readOnly = typeof window !== 'undefined' && window.location.pathname.startsWith('/kds/v7');

  const longPress = useLongPress(() => { if (!loading) setMenuOpen(true); }, { delay: 500 });
  const dispatchTap = useRowTap(
    () => {},
    () => { if (!loading && !readOnly) onUndo(); },
    250,
  );
  const iconTap = useRowTap(
    () => { if (!loading) onAdvance(); },
    () => { if (!loading) onUndo(); },
    250,
  );

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <div
      ref={rowRef}
      role="button"
      tabIndex={loading ? -1 : 0}
      onClick={dispatchTap}
      onKeyDown={(e) => { if (!loading && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setMenuOpen(true); } }}
      {...longPress}
      aria-pressed={done}
      aria-disabled={loading}
      aria-haspopup="menu"
      aria-expanded={menuOpen}
      data-onboarding="item-row"
      className={`relative border-b border-border/40 last:border-b-0 cursor-pointer select-none transition-opacity ${loading ? 'opacity-70 pointer-events-none' : done ? 'opacity-50 hover:bg-black/[0.02]' : 'hover:bg-black/[0.02]'}`}
      style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 'var(--kds-row-py)', paddingBottom: 'var(--kds-row-py)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1 min-w-0">
          <div className="flex items-baseline gap-1 min-w-0 flex-1">
            <span className="font-bold text-foreground shrink-0 text-right tabular-nums" style={{ fontSize: 'var(--kds-item-name)', width: 20, minWidth: 20, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
              {product.quantity}
            </span>
            <div className="flex-1 min-w-0">
              <div style={{ display: 'inline-block', maxWidth: '100%' }}>
                <div
                  className="text-foreground"
                  style={{ fontSize: 'var(--kds-item-name)', fontWeight: 700, lineHeight: 1.2, textDecoration: done ? 'line-through' : 'none' }}
                >
                  {tp(product.name)}
                </div>
                {showSecondary && (
                  <div
                    className="text-text-muted"
                    style={{
                      fontSize: 'var(--kds-item-name)',
                      fontWeight: 700,
                      lineHeight: 1.2,
                      textDecoration: done ? 'line-through' : 'none',
                      unicodeBidi: 'plaintext',
                      textAlign: secondaryDir === 'rtl' ? 'right' : 'left',
                    }}
                    dir={secondaryDir}
                  >
                    {tpSecondary(product.name)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-1 shrink-0" style={{ height: 'calc(var(--kds-item-name) * 1.2)', lineHeight: 'calc(var(--kds-item-name) * 1.2)', transform: 'translateY(4px)' }}>
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
              <span className="shrink-0 flex items-center justify-center" style={{ width: 22, height: 22 }} aria-label="Marking Product Served">
                <Loader2 size={14} className="animate-spin" color="#6C7A89" />
              </span>
            )}
            {done && (
              readOnly ? (
                <span
                  className="shrink-0 flex items-center justify-center rounded-full animate-scale-in"
                  style={{ background: '#27AE60', width: 22, height: 22 }}
                  aria-label="Product Served"
                  title="Served"
                >
                  <Check size={14} color="#fff" strokeWidth={3} />
                </span>
              ) : (
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
              )
            )}
            {!readOnly && !loading && !done && state === 'ready' && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); iconTap(); }}
                data-onboarding="item-ready"
                className="shrink-0 flex items-center justify-center rounded-full active:scale-95 transition animate-scale-in"
                style={{ width: 22, height: 22, background: '#DCFCE7', color: '#16A34A', border: '1.5px solid #16A34A' }}
                aria-label="Mark Product Served (Double-Tap to Undo)"
                title="Ready. Tap to mark served. Double-tap to undo."
              >
                <Check size={14} strokeWidth={3} />
              </button>
            )}
            {!readOnly && !loading && !done && state === 'cooking' && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); iconTap(); }}
                data-onboarding="item-bell"
                className="shrink-0 flex items-center justify-center rounded-[5px] active:scale-95 transition animate-scale-in"
                style={{ width: 22, height: 22, background: '#374151', color: '#fff' }}
                aria-label="Mark Product Ready (Double-Tap to Undo)"
                title="Tap when ready. Double-tap to undo."
              >
                <ClocheIcon size={14} strokeWidth={2.4} color="#fff" />
              </button>
            )}
            {!readOnly && !loading && !done && state !== 'cooking' && state !== 'ready' && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); iconTap(); }}
                data-onboarding="item-eye"
                className="shrink-0 flex items-center justify-center rounded-md hover:bg-black/[0.04] active:scale-95 transition"
                style={{ width: 22, height: 22, color: '#6C7A89' }}
                aria-label="Start Cooking (Double-Tap to Undo)"
              >
                <Eye size={18} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

          {showDetails && (product.allergens.length > 0 || product.modifiers.length > 0 || product.notes) && (
            <div style={{ paddingLeft: 24 }}>
              {product.allergens.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5" data-onboarding="item-allergen">
                  {product.allergens.map((a) => (
                    <AllergenBadge key={a.type} allergen={a} variant="item" suffix="allergy" />
                  ))}
                </div>
              )}
              {product.modifiers.length > 0 && (
                <div className="mt-0" data-onboarding="item-modifier">
                  {product.modifiers.map((m, i) => {
                    const raw = m.type === 'extra' ? m.text.replace(/^\+\s*/, '') : m.text;
                    return (
                      <div key={i}>
                        <div style={{ display: 'inline-block', maxWidth: '100%' }}>
                          <div
                            className={`font-semibold ${MODIFIER_CLASS[m.type]}`}
                            style={{ fontSize: 'var(--kds-modifier)', lineHeight: 1.2, textDecoration: done ? 'line-through' : 'none' }}
                          >
                            {tm(raw)}
                          </div>
                          {showSecondary && (
                            <div
                              className={`font-medium ${MODIFIER_CLASS[m.type]} opacity-70`}
                              style={{ fontSize: 'var(--kds-modifier)', lineHeight: 1.2, textDecoration: done ? 'line-through' : 'none', unicodeBidi: 'plaintext', textAlign: secondaryDir === 'rtl' ? 'right' : 'left' }}
                              dir={secondaryDir}
                            >
                              {tmSecondary(raw)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {product.notes && (
                <div style={{ display: 'inline-block', maxWidth: '100%' }}>
                  <div
                    className={`italic leading-snug text-text-muted font-medium ${done ? 'line-through' : ''}`}
                    style={{ fontSize: 'var(--kds-modifier)' }}
                  >
                    "{tn(product.notes)}"
                  </div>
                  {showSecondary && (
                    <div
                      className={`italic leading-snug text-text-muted font-medium opacity-70 ${done ? 'line-through' : ''}`}
                      style={{ fontSize: 'var(--kds-modifier)', unicodeBidi: 'plaintext', textAlign: secondaryDir === 'rtl' ? 'right' : 'left' }}
                      dir={secondaryDir}
                    >
                      "{tnSecondary(product.notes)}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      {menuOpen && !loading && (
        <ProductCuePopover
          anchorRef={rowRef}
          onClose={() => setMenuOpen(false)}
          on86={() => { setMenuOpen(false); onLongPress(product); }}
          onRecipe={() => { setMenuOpen(false); onOpenRecipe(product); }}
        />
      )}
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
  const renderIcon = () => {
    if (bumping) return <Loader2 size={12} className="animate-spin" />;
    if (!isRecall && ticketState === 'ready') {
      return (
        <span
          className="inline-flex items-center justify-center rounded-full"
          style={{ width: 18, height: 18, background: '#DCFCE7', color: '#16A34A', border: '1.5px solid #16A34A' }}
        >
          <Check size={11} strokeWidth={3} />
        </span>
      );
    }
    if (!isRecall && ticketState === 'done') {
      return (
        <span
          className="inline-flex items-center justify-center rounded-full"
          style={{ width: 18, height: 18, background: '#27AE60' }}
        >
          <Check size={11} strokeWidth={3} color="#fff" />
        </span>
      );
    }
    return <Icon size={12} strokeWidth={2.5} color={color} />;
  };
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 bg-card border-t border-border">
      <span className="text-[11px] text-[#9CA3AF]">{fmtElapsedAgo(elapsed)}</span>
      <button
        type="button"
        onClick={tap}
        disabled={bumping}
        data-onboarding="ticket-footer-btn"
        className="flex items-center gap-1.5 text-[12px] font-semibold disabled:opacity-70"
        style={{ color }}
        title={isRecall ? 'Tap to recall ticket' : 'Tap to advance. Double-tap to undo.'}
        aria-label={`${label} (double-tap to undo)`}
      >
        {renderIcon()}
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
  const { getStatusForElapsed, rules } = useStatusRules();
  const timerStatus = getStatusForElapsed(elapsed);
  const isOvertimeElapsed = timerStatus.ruleId === 'overtime' || (elapsed / 60) >= 21;
  const hexToRgbTriplet = (hex: string) => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(full, 16);
    return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
  };
  const firedTime = order.timeReceived ? formatTime(order.timeReceived) : '';
  const showTableInstead = isDineIn && !!order.tableName;

  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [bumping, setBumping] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const timersRef = useRef<number[]>([]);
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  // Shared lifecycle store: propagates per-item status between Kitchen KDS & Expo.
  const { itemLifecycles, setItemLifecycle } = useOrderStore();
  const { getMessagesForOrder, getRepliesForMessage, acknowledgeMessage, sendReply, replies } = useKitchenMessages();
  const orderMessages = getMessagesForOrder(order.id);
  const rowStateToLifecycle = (s: RowState): ItemLifecycle | null => {
    if (s === 'cooking' || s === 'loading') return 'preparing';
    if (s === 'ready') return 'ready';
    if (s === 'done') return 'served';
    return 'seen';
  };
  const lifecycleToRowState = (lc: ItemLifecycle | undefined, isCompleted?: boolean): RowState => {
    if (isCompleted || lc === 'served') return 'done';
    if (lc === 'ready') return 'ready';
    if (lc === 'preparing') return 'cooking';
    return 'idle';
  };
  const syncLifecycle = (orderId: string, itemId: string, s: RowState) => {
    const target = rowStateToLifecycle(s);
    setItemLifecycle(orderId, itemId, target);
  };

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

  // QR sticker scan → mark the matching row as SERVED (done).
  useEffect(() => {
    const onQr = (e: Event) => {
      const detail = (e as CustomEvent<{ orderId: string; itemId: string }>).detail;
      if (!detail || detail.orderId !== order.id) return;
      const exists = order.courses.some(c => c.items.some(i => i.id === detail.itemId));
      if (!exists) return;
      setRowStates((p) => {
        const cur = p[detail.itemId] ?? 'idle';
        if (cur === 'done') return p;
        return { ...p, [detail.itemId]: 'done' };
      });
      onItemDone?.(order.id, detail.itemId);
      syncLifecycle(order.id, detail.itemId, 'done');
      if (!isSeen) onMarkSeen?.(order.id);
    };
    window.addEventListener('kds:qr-mark-ready', onQr);
    return () => window.removeEventListener('kds:qr-mark-ready', onQr);
  }, [order.id, order.courses, isSeen, onMarkSeen, onItemDone]);


  const notifySeen = () => { if (!isSeen) onMarkSeen?.(order.id); };
  const setRow = (id: string, s: RowState) => setRowStates((p) => ({ ...p, [id]: s }));
  const getRowState = (product: OrderItem): RowState => {
    const local = rowStates[product.id];
    if (local) return local;
    // Fall back to shared lifecycle so Expo → Kitchen updates (e.g. Served) reflect here.
    return lifecycleToRowState(itemLifecycles[product.id], product.isCompleted);
  };
  const toggleRow = (id: string) => {
    setRowStates((p) => {
      const current = p[id] ?? lifecycleToRowState(itemLifecycles[id]);
      let next = p;
      let nextState: RowState = current;
      if (current === 'idle') { nextState = 'cooking'; next = { ...p, [id]: 'cooking' }; }
      else if (current === 'cooking') { nextState = 'ready'; next = { ...p, [id]: 'ready' }; }
      else if (current === 'ready') {
        onItemDone?.(order.id, id);
        nextState = 'done';
        next = { ...p, [id]: 'done' };
      }
      if (nextState !== current) syncLifecycle(order.id, id, nextState);
      // Mark ticket seen only when every item has been touched (viewed)
      const allTouched = allItems.every(pr => pr.isCompleted || (next[pr.id] ?? 'idle') !== 'idle');
      if (allTouched && !isSeen) onMarkSeen?.(order.id);
      return next;
    });
  };
  const undoRow = (id: string) => {
    setRowStates((p) => {
      const current = p[id] ?? lifecycleToRowState(itemLifecycles[id]);
      let nextState: RowState | null = null;
      if (current === 'done') nextState = 'ready';
      else if (current === 'ready') nextState = 'cooking';
      else if (current === 'cooking') nextState = 'idle';
      if (nextState === null) return p;
      syncLifecycle(order.id, id, nextState);
      return { ...p, [id]: nextState };
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


  // For dine-in table tickets: determine the active course (first course with
  // remaining items) and keep it expanded by default while collapsing upcoming courses.
  const activeCourseIndex = useMemo(() => {
    if (!isDineIn) return -1;
    for (let i = 0; i < order.courses.length; i++) {
      const hasVisible = order.courses[i].items.some(
        (p) => !removedIds.has(p.id) && getRowState(p) !== 'done'
      );
      if (hasVisible) return i;
    }
    return -1;
  }, [isDineIn, order.courses, removedIds, rowStates]);

  useEffect(() => {
    if (activeCourseIndex < 0) return;
    setExpandedCourses((prev) => {
      if (prev.has(activeCourseIndex)) return prev;
      const next = new Set(prev);
      next.add(activeCourseIndex);
      return next;
    });
  }, [activeCourseIndex]);


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
  const allReady = allItems.length > 0 && allItems.every((p) => {
    const s = getRowState(p);
    return s === 'ready' || s === 'done';
  });
  const allStarted = allItems.length > 0 && allItems.every((p) => {
    const s = getRowState(p);
    return s === 'cooking' || s === 'ready' || s === 'done';
  });
  const [phaseOverride, setPhaseOverride] = useState<TicketState | null>(null);
  const ticketState: TicketState = useMemo(() => {
    if (phaseOverride) return phaseOverride;
    if (allDone) return 'done';
    if (allReady) return 'ready';
    if (allStarted) return 'preparing';
    return 'seen';
  }, [phaseOverride, allDone, allReady, allStarted]);

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

  const setAllRows = (target: RowState, from?: (s: RowState) => boolean) => {
    setRowStates((prev) => {
      const next = { ...prev };
      allItems.forEach((p) => {
        const cur = (next[p.id] ?? 'idle') as RowState;
        if (!from || from(cur)) next[p.id] = target;
      });
      return next;
    });
  };

  const handleTicketAdvance = () => {
    if (bumping) return;
    if (ticketState === 'seen') {
      notifySeen();
      setAllRows('cooking', (s) => s === 'idle');
      setPhaseOverride('preparing');
      return;
    }
    if (ticketState === 'preparing') {
      notifySeen();
      setAllRows('ready', (s) => s !== 'done');
      setPhaseOverride('ready');
      return;
    }
    if (ticketState === 'ready') {
      setBumping(true);
      runBumpAnimation(() => { setBumping(false); setPhaseOverride('done'); });
      return;
    }
    onBump?.(order.id);
  };

  const handleTicketRecall = () => {
    if (ticketState === 'done') {
      setRowStates({});
      setPhaseOverride('ready');
      return;
    }
    if (ticketState === 'ready') {
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
    <div
      className={`bg-card rounded-md overflow-hidden border border-border shadow-sm flex flex-col ${blinkColor ? 'animate-ticket-blink' : ''}`}
      style={blinkColor ? ({ ['--ticket-blink-rgb' as string]: hexToRgbTriplet(blinkColor) } as React.CSSProperties) : undefined}
    >
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
            aria-label={`Elapsed ${fmtElapsed(elapsed)} - ${timerStatus.label}`}
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
      {!isHeaderOnly && orderMessages.length > 0 && (
        <KitchenMessageSection
          messages={orderMessages}
          replies={replies.filter(r => orderMessages.some(m => m.message_id === r.message_id))}
          onAcknowledge={acknowledgeMessage}
          onReply={sendReply}
          variant="v3"
        />
      )}

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
                } else if ((course as any).prepTimerLabel) {
                  const m = String((course as any).prepTimerLabel).match(/(\d+):(\d+)/) || String((course as any).prepTimerLabel).match(/(\d+)\s*min/);
                  if (m) {
                    const totalSec = m[2] !== undefined ? parseInt(m[1]) * 60 + parseInt(m[2]) : parseInt(m[1]) * 60;
                    firingAt = formatTimeForKDS(new Date(Date.now() + totalSec * 1000), timeFormat as 0 | 1);
                  }
                }
              }
              const isExpanded = expandedCourses.has(idx);
              return (
                <div key={`${course.course}-${idx}`} className={idx > 0 ? 'border-t border-border' : ''}>
                  <button
                    type="button"
                    onClick={() => setExpandedCourses((prev) => {
                      const next = new Set(prev);
                      if (next.has(idx)) next.delete(idx);
                      else next.add(idx);
                      return next;
                    })}
                    className="w-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground flex items-center justify-between gap-2 select-none active:opacity-80"
                    aria-expanded={isExpanded}
                    aria-label={`${courseLabel(course.course)} (${visibleItems.length} items)`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ChevronRight
                        size={12}
                        strokeWidth={2.5}
                        className="shrink-0 transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}
                      />
                      <span className="truncate">{courseLabel(course.course)}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isExpanded && visibleItems.length > 0 && (
                        <span className="text-[10px] font-semibold tabular-nums">{visibleItems.length}</span>
                      )}
                      {firingAt && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold normal-case text-muted-foreground">
                          <Clock size={12} />
                          <span>{firingAt.toLowerCase()}</span>
                        </span>
                      )}
                    </div>
                  </button>

                  {isExpanded && visibleItems.map((product) => (
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

      {/* FOOTER - single bump-style button; double-tap to undo */}
      {!isCompact && !isHeaderOnly && !(typeof window !== 'undefined' && window.location.pathname.startsWith('/kds/v7')) && (
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
