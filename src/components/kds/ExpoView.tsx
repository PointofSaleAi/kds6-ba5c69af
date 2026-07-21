import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, Hourglass, Flame, Check, ArrowUpRight, AlertTriangle, RotateCcw, ChevronRight, Eye } from 'lucide-react';
import { ClocheIcon } from './icons/ClocheIcon';
import { formatTime } from '@/lib/datetime';
import { useStatusRules } from '@/hooks/use-status-rules';
import { AllergenBadge } from './AllergenBadge';
import { OrderNotesSection } from './OrderNotesSection';
import type { ViewMode } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS, DEFAULT_ORDER_TYPE_DETAILED_COLORS, type OrderTypeColors } from '@/hooks/use-kds-settings';
import { getKdsScaleClasses } from '@/lib/kds-scale';
import { useOrderStore } from '@/hooks/use-order-store';
import {
  kitchenStations,
  type ExpoTicket,
  type ExpoStation,
  type ExpoItemStatus,
} from '@/data/mock-expo-orders';
import { createDemoTickets, type DemoExpoTicket } from '@/data/mock-expo-demo';
import runnerIcon from '@/assets/person-simple-run-bold.svg';

/* -- helpers -- */

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function allItemsDone(t: ExpoTicket) {
  return t.items.every(i => i.status === 'done');
}
function isOvertime(t: ExpoTicket) {
  return t.timerSeconds >= 900;
}

function ticketHeaderBg(t: ExpoTicket, colors: OrderTypeColors): { bg?: string; bgColor?: string; text: string } {
  const color = colors[t.orderType] || DEFAULT_ORDER_TYPE_COLORS[t.orderType] || DEFAULT_ORDER_TYPE_COLORS['dine-in'];
  return { bgColor: color, text: 'text-primary-foreground' };
}

/**
 * Expo urgency row uses a fixed 3-color scheme (green / amber / red) but
 * derives its thresholds from the configured status aging rules so it stays
 * in sync with the rest of the system.
 *  - Normal   (#2d8a4e) = below the warning threshold
 *  - Warning  (#d4820a) = between warning and overtime thresholds
 *  - Overtime (#c0392b) = at/above the overtime (open-ended) threshold
 */
function getUrgencyBg(
  timerSeconds: number,
  rules: { minMinutes: number; maxMinutes: number | null }[],
): string {
  const elapsedMin = timerSeconds / 60;
  const overtimeRule = rules.find(r => r.maxMinutes === null);
  const warningRule = [...rules]
    .filter(r => r.maxMinutes !== null)
    .sort((a, b) => b.minMinutes - a.minMinutes)[0];

  if (overtimeRule && elapsedMin >= overtimeRule.minMinutes) return '#c0392b';
  if (warningRule && elapsedMin >= warningRule.minMinutes) return '#d4820a';
  return '#2d8a4e';
}

const orderTypeLabel: Record<string, string> = {
  'dine-in': 'DINE IN',
  'take-out': 'TAKE OUT',
  banquet: 'BANQUET',
};

/**
 * Filter modifiers to only those relevant to the expediter:
 *   - Removals/substitutions ("No X", "Without X", "Sub", "Replace") -> red
 *   - Add-ons ("Extra X")                                            -> green
 * Cooking temperature, cooking style, and sauce preparations are hidden.
 * V3 parity: do not render leading + or - symbols.
 */
function getExpoRelevantModifiers(
  modifiers?: { text: string; type: 'extra' | 'remove' | 'neutral' }[],
): { text: string; kind: 'remove' | 'add' }[] {
  if (!modifiers || modifiers.length === 0) return [];
  const out: { text: string; kind: 'remove' | 'add' }[] = [];
  for (const m of modifiers) {
    const t = m.text.trim().replace(/^[-+]\s*/, '');
    if (m.type === 'remove' || /^(no |without |sub |replace )/i.test(t)) {
      out.push({ text: t, kind: 'remove' });
      continue;
    }
    if (m.type === 'extra' || /^extra /i.test(t)) {
      out.push({ text: t, kind: 'add' });
      continue;
    }
    // neutral cooking instructions / sauce prep -> hidden on expo
  }
  return out;
}

/* -- Item status icon -- */

function ExpoStatusIcon({ status }: { status: ExpoItemStatus | 'sent' }) {
  if (status === 'sent') {
    return (
      <span className="shrink-0 inline-flex items-center justify-center rounded-full" style={{ background: '#27AE60', width: 22, height: 22 }}>
        <Check size={14} color="#fff" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'done') {
    return (
      <span className="shrink-0 inline-flex items-center justify-center rounded-full" style={{ width: 22, height: 22, background: '#DCFCE7', color: '#16A34A', border: '1.5px solid #16A34A' }}>
        <Check size={14} strokeWidth={3} />
      </span>
    );
  }
  if (status === 'firing') {
    return (
      <span className="shrink-0 inline-flex items-center justify-center rounded-[5px]" style={{ width: 22, height: 22, background: '#374151' }}>
        <ClocheIcon size={14} strokeWidth={2.4} color="#fff" />
      </span>
    );
  }
  return (
    <span className="shrink-0 inline-flex items-center justify-center" style={{ width: 22, height: 22, color: '#6C7A89' }}>
      <Eye size={18} strokeWidth={2} />
    </span>
  );
}

/* -- Reusable item row renderer for ExpoTicketCard -- */

interface ExpoItemRowProps {
  item: import('@/data/mock-expo-orders').ExpoItem;
  ticket: ExpoTicket;
  sentItemIds: Set<string>;
  sentQuantities: Map<string, number>;
  tp: (s: string) => string;
  isDemo?: boolean;
  onDemoItemTap?: (ticketId: string, itemId: string) => void;
  onItemSend?: (ticketId: string, itemId: string, qty: number) => void;
  onItemRecall?: (ticketId: string, itemId: string) => void;
  onItemAdvance?: (ticketId: string, itemId: string) => void;
  onItemRevert?: (ticketId: string, itemId: string) => void;
  acknowledgedNewItemIds: Set<string>;
  onAcknowledgeNewItem?: (itemId: string) => void;
  runnerIconSrc: string;
  showSendAlways: boolean;
  isLast?: boolean;
}

function ExpoItemRow({
  item,
  ticket,
  sentItemIds,
  sentQuantities,
  tp,
  isDemo,
  onDemoItemTap,
  onItemSend,
  onItemAdvance,
  onItemRevert,
  onAcknowledgeNewItem,
  acknowledgedNewItemIds,
  runnerIconSrc,
  showSendAlways,
  isLast,
}: ExpoItemRowProps) {
  const sentQty = sentQuantities.get(item.id) ?? 0;
  const remainingQty = Math.max(0, item.quantity - sentQty);

  // Selected qty to send (default = full remaining)
  const [sendQty, setSendQty] = useState<number>(remainingQty);
  // Keep sendQty bounded if remainingQty changes from outside
  useEffect(() => {
    setSendQty(prev => Math.max(1, Math.min(prev, remainingQty || 1)));
  }, [remainingQty]);

  // Hide sent items entirely, they are removed from the card
  if (sentItemIds.has(item.id) || remainingQty <= 0) return null;

  const done = item.status === 'done';
  // Expo view: suppress new-item pulse, expo only handles already-cooked items.
  const isNewUnacked = false;
  const showToGoBadge = !!item.isToGo && ticket.orderType === 'dine-in';
  const showQtySelector = done && remainingQty > 1;

  const statusIcon = <ExpoStatusIcon status={item.status} />;
  const expoModifiers = getExpoRelevantModifiers(item.modifiers);
  const hasDetails = expoModifiers.length > 0 || (item.allergens?.length ?? 0) > 0 || !!item.notes;

  const toGoBadge = showToGoBadge ? (
    <span
      className="inline-flex items-center bg-text-primary text-white rounded-full uppercase leading-none"
      style={{ fontSize: '9px', fontWeight: 500, padding: '1px 6px' }}
      aria-label="To Go Product"
    >
      TO GO
    </span>
  ) : null;

  // Outer row with V3-style spacing + bottom divider (except last).
  // Single tap = advance status (queued -> in progress -> ready -> sent).
  // Double tap = revert one step.
  const isTapToSend = done && remainingQty > 0;
  const isInteractive = remainingQty > 0;
  const outerClass = `relative border-b border-border/40 last:border-b-0 select-none transition-opacity ${isLast ? '' : ''} ${done ? 'border-l-[3px] border-l-success opacity-60' : ''} ${isNewUnacked ? 'animate-new-item' : ''} ${(isDemo || isInteractive) ? 'cursor-pointer' : ''} ${isTapToSend ? 'active:bg-success/10 transition-colors' : ''}`;

  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (clickTimerRef.current) clearTimeout(clickTimerRef.current); }, []);

  const handleSingleTap = () => {
    if (done) {
      onItemSend?.(ticket.id, item.id, remainingQty);
    } else {
      onItemAdvance?.(ticket.id, item.id);
    }
  };
  const handleDoubleTap = () => {
    onItemRevert?.(ticket.id, item.id);
  };

  return (
    <div
      className={outerClass}
      style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 'var(--kds-row-py)', paddingBottom: 'var(--kds-row-py)' }}
      role={isInteractive ? 'button' : undefined}
      aria-label={isInteractive ? `Update status for ${tp(item.name)}` : undefined}
      onClick={() => {
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = null;
          handleDoubleTap();
          return;
        }
        clickTimerRef.current = setTimeout(() => {
          clickTimerRef.current = null;
          handleSingleTap();
        }, 240);
      }}
    >
      <div className="flex gap-1 items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 min-w-0">
            <span
              className="font-bold text-foreground shrink-0 text-right tabular-nums"
              style={{ fontSize: 'var(--kds-item-name)', width: 20, minWidth: 20, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}
            >
              {remainingQty}
            </span>
            <div className="flex-1 min-w-0">
              <div style={{ display: 'inline-block', maxWidth: '100%' }}>
                <div
                  className="text-foreground"
                  style={{ fontSize: 'var(--kds-item-name)', fontWeight: 700, lineHeight: 1.2, textDecoration: done ? 'line-through' : 'none' }}
                >
                  {tp(item.name)}
                </div>
              </div>
            </div>
          </div>

          {hasDetails && (
            <div style={{ paddingLeft: 24, marginTop: 0, lineHeight: 1.1 }}>
              {item.allergens && item.allergens.length > 0 && (
                <div className="flex flex-wrap gap-x-1 gap-y-0.5" style={{ lineHeight: 1 }}>
                  {item.allergens.map(a => (
                    <AllergenBadge key={a.type} allergen={{ type: a.type as any, label: a.label, icon: '' }} variant="item" suffix="allergy" />
                  ))}
                </div>
              )}

              {expoModifiers.length > 0 && (
                <div className="flex flex-wrap gap-x-1.5 gap-y-0" style={{ lineHeight: 1.1 }}>
                  {expoModifiers
                    .sort((a, b) => (a.kind === 'remove' ? -1 : 1) - (b.kind === 'remove' ? -1 : 1))
                    .map((m, idx) => (
                      <span
                        key={idx}
                        className={`font-semibold ${m.kind === 'remove' ? 'text-modifier-remove' : 'text-modifier-extra'}`}
                        style={{ fontSize: 'var(--kds-modifier)', lineHeight: 1.1, textDecoration: done ? 'line-through' : 'none' }}
                      >
                        {m.text}
                      </span>
                    ))}
                </div>
              )}

              {item.notes && item.notes.trim().length > 0 && (
                <div
                  className={`italic text-text-muted font-medium ${done ? 'line-through' : ''}`}
                  style={{ fontSize: 'var(--kds-modifier)', lineHeight: 1.1 }}
                >
                  "{item.notes}"
                </div>
              )}
            </div>
          )}
        </div>

        {toGoBadge}
        <span className="self-center inline-flex items-center" aria-label={`Status: ${item.status}`}>
          {statusIcon}
        </span>
      </div>
    </div>
  );
}

/* -- Station Chips with state-based coloring -- */

function ExpoStationChips({
  ticket,
  holdStations,
  onToggleHold,
}: {
  ticket: ExpoTicket;
  holdStations: Set<string>;
  onToggleHold: (ticketId: string, stationName: string) => void;
}) {
  const overtime = isOvertime(ticket);

  return (
    <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b border-border">
      {ticket.stations.map(s => {
        const holdKey = `${ticket.id}-${s.name}`;
        const isHolding = holdStations.has(holdKey);
        const showHoldToggle = !overtime && (s.status === 'done' || isHolding);

        let chipBg: string, chipText: string, chipBorder: string, indicator: string;
        if (isHolding) {
          chipBg = 'bg-warning/30';
          chipText = 'text-warning';
          chipBorder = '';
          indicator = ' Holding';
        } else if (s.status === 'done') {
          chipBg = 'bg-success/15';
          chipText = 'text-success';
          chipBorder = '';
          indicator = ' \u2713';
        } else if (s.status === 'firing') {
          chipBg = 'bg-warning/20';
          chipText = 'text-warning';
          chipBorder = '';
          indicator = ' \u00B7\u00B7\u00B7';
        } else {
          chipBg = 'bg-transparent';
          chipText = 'text-text-muted';
          chipBorder = 'border border-border';
          indicator = '';
        }

        return (
          <span
            key={s.name}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${chipBg} ${chipText} ${chipBorder} ${showHoldToggle ? 'cursor-pointer' : ''}`}
            onClick={showHoldToggle ? () => onToggleHold(ticket.id, s.name) : undefined}
          >
            {s.name}{indicator}
            {showHoldToggle && (
              <span className="ml-0.5 text-[8px] opacity-70 font-normal">
                {isHolding ? '(Release)' : '(Hold)'}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/* -- ExpoTicketCard -- */

interface ExpoTicketCardProps {
  ticket: ExpoTicket;
  onSendOut: (id: string) => void;
  onRush?: (id: string) => void;
  holdStations: Set<string>;
  onToggleHold: (ticketId: string, stationName: string) => void;
  isDemo?: boolean;
  onDemoItemTap?: (ticketId: string, itemId: string) => void;
  sentItemIds: Set<string>;
  sentQuantities: Map<string, number>;
  onItemSend?: (ticketId: string, itemId: string, qty: number) => void;
  onItemRecall?: (ticketId: string, itemId: string) => void;
  onItemAdvance?: (ticketId: string, itemId: string) => void;
  onItemRevert?: (ticketId: string, itemId: string) => void;
  acknowledgedNewItemIds: Set<string>;
  onAcknowledgeNewItem?: (itemId: string) => void;
  onFireNextCourse?: (ticketId: string) => void;
  /** If true, the entire ticket is sent out and shown in recall mode */
  isSentOut?: boolean;
  onRecallOrder?: (id: string) => void;
  /** Whether this ticket is in Rush state */
  isRushed?: boolean;
}

function ExpoTicketCard({ ticket, onSendOut, onRush, holdStations, onToggleHold, isDemo, onDemoItemTap, sentItemIds, sentQuantities, onItemSend, onItemRecall, onItemAdvance, onItemRevert, acknowledgedNewItemIds, onAcknowledgeNewItem, onFireNextCourse, isSentOut, onRecallOrder, isRushed }: ExpoTicketCardProps) {
  const { tp } = useLanguage();
  const { orderTypeColors, expoSendButtonMode } = useKDSSettings();
  const { rules } = useStatusRules();
  const showSendAlways = expoSendButtonMode === 'always';
  const demoTicket = isDemo ? (ticket as DemoExpoTicket) : null;
  // Filter to only unsent items for display and counting
  const visibleItems = ticket.items.filter(i => !sentItemIds.has(i.id));
  const doneCount = visibleItems.filter(i => i.status === 'done').length;
  const totalCount = visibleItems.length + (demoTicket?.coursing?.pending?.items?.length || 0);
  const isReady = visibleItems.length > 0 && visibleItems.every(i => i.status === 'done');
  const allItemsSent = visibleItems.length === 0 && ticket.items.length > 0;
  const overtime = isOvertime(ticket);
  const headerStyle = ticketHeaderBg(ticket, orderTypeColors);
  const realCourses = ticket.courses && ticket.courses.length > 0 ? ticket.courses : null;
  const hasCoursingData = !!demoTicket?.coursing || !!realCourses;

  // Track which served/prepared courses are collapsed (expanded by default)
  const [collapsedServedCourses, setCollapsedServedCourses] = useState<Set<string>>(new Set());
  const toggleServedCourse = useCallback((name: string) => {
    setCollapsedServedCourses(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }, []);

  // Determine if the active course is fully done (for "Fire next course" button)
  const activeCourseAllDone = hasCoursingData && visibleItems.every(i => i.status === 'done');
  const hasPendingCourse = !!demoTicket?.coursing?.pending || (realCourses?.some(c => c.status === 'queued') ?? false);

  // Urgency color from status rules
  const urgencyBgColor = getUrgencyBg(ticket.timerSeconds, rules);

  // Collect unique allergens across all items
  const ticketAllergens = useMemo(() => {
    const all = ticket.items.flatMap(i => i.allergens || []);
    return Array.from(new Map(all.map(a => [a.type, a])).values());
  }, [ticket.items]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.35 } }}
      className={`rounded-md overflow-hidden bg-card border border-border shadow-sm transition-all duration-300 relative`}
      style={isSentOut ? { opacity: 0.65 } : undefined}
    >

      {/* HEADER - V3 style: rounded badge + identifier + timer chip, secondary row */}
      <div
        role={isReady && !isSentOut ? 'button' : undefined}
        aria-label={isReady && !isSentOut ? `Send out order ${ticket.orderNumber}` : undefined}
        onClick={() => { if (isReady && !isSentOut) onSendOut(ticket.id); }}
        className={`px-2.5 py-2 bg-muted ${isReady && !isSentOut ? 'cursor-pointer active:opacity-90 transition-opacity' : ''}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {ticket.orderType === 'dine-in' && ticket.tableName ? (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
                style={{ background: '#1A1A2E', color: '#FFFFFF' }}
              >
                {ticket.tableName}
              </span>
            ) : (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
                style={{ background: headerStyle.bgColor, color: '#FFFFFF' }}
              >
                {orderTypeLabel[ticket.orderType] || ticket.orderType.toUpperCase()}
              </span>
            )}
            <span className="font-bold text-foreground text-[14px] shrink-0 truncate tabular-nums">
              {ticket.orderNumber}
            </span>
            {isRushed && (
              <span
                className="inline-flex items-center bg-destructive text-white rounded-full leading-none uppercase shrink-0"
                style={{ fontSize: '10px', fontWeight: 500, padding: '2px 8px' }}
                aria-label="Rush"
              >
                RUSH
              </span>
            )}
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-bold font-mono-timer shrink-0 tabular-nums"
            style={{ background: urgencyBgColor, color: '#FFFFFF' }}
          >
            {formatTimer(ticket.timerSeconds)}
          </span>
        </div>
        {isReady && !isSentOut && (
          <div className="flex items-center justify-end gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success shrink-0">
              <Check className="w-3 h-3" strokeWidth={3} />
              Tap to send
            </span>
          </div>
        )}
      </div>

      {/* Allergen badges */}
      {ticketAllergens.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 border-b border-border/40" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '4px', paddingBottom: '4px' }}>
          {ticketAllergens.map(a => (
            <AllergenBadge key={a.type} allergen={{ type: a.type as any, label: a.label, icon: '' }} variant="order" suffix="allergy" />
          ))}
        </div>
      )}

      {/* Order notes - V3 style */}
      {ticket.orderNotes && ticket.orderNotes.trim().length > 0 && (
        <OrderNotesSection notes={ticket.orderNotes} orderId={ticket.id} />
      )}

      {/* Station chips removed from header per design update */}

      {/* Coursing: Served course (collapsed) for demo ticket 6 */}
      {demoTicket?.coursing?.served && (
        <div className="w-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground flex items-center justify-between gap-2 border-t border-border">
          <div className="flex items-center gap-1.5 min-w-0">
            <ChevronRight size={12} strokeWidth={2.5} className="shrink-0" />
            <span className="truncate">{demoTicket.coursing.served.course}</span>
            <span className="text-success normal-case tracking-normal">· Prepared</span>
          </div>
          <span className="text-[10px] font-semibold tabular-nums shrink-0">
            {demoTicket.coursing.served.items.reduce((s, i) => s + i.quantity, 0)}/{demoTicket.coursing.served.items.reduce((s, i) => s + i.quantity, 0)}
          </span>
        </div>
      )}

      {/* Active course label for coursed demo tickets */}
      {demoTicket?.coursing?.active && (
        <div className="w-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground flex items-center justify-between gap-2 border-t border-border">
          <div className="flex items-center gap-1.5 min-w-0">
            <ChevronRight size={12} strokeWidth={2.5} className="shrink-0 rotate-90 transition-transform" />
            <span className="truncate">{demoTicket.coursing.active.course}</span>
            <span className="normal-case tracking-normal">· {demoTicket.coursing.active.label}</span>
          </div>
          <span className="text-[10px] font-semibold tabular-nums shrink-0">
            {ticket.items.filter(i => i.status === 'done').length}/{ticket.items.length}
          </span>
        </div>
      )}

      {/* Item rows - grouped by course for real multi-course orders */}
      {realCourses ? (
        <>
          {realCourses.map(course => {
            const courseItems = ticket.items.filter(i => course.itemIds.includes(i.id) && !sentItemIds.has(i.id));
            if (courseItems.length === 0) return null;
            const isServed = course.status === 'served';
            const isQueued = course.status === 'queued';
            const courseDone = courseItems.every(i => i.status === 'done');
            // Course-level overtime: only when the course itself is actively
            // cooking (not queued/served/done) AND the ticket is past overtime.
            const courseOvertime = !isQueued && !isServed && !courseDone && overtime;
            const courseStatusLabel = isServed
              ? 'PREPARED'
              : isQueued
                ? 'QUEUED'
                : courseDone
                  ? 'READY'
                  : courseOvertime
                    ? 'OVERTIME'
                    : 'PREPARING';
            // Color rules driven by the course's own status:
            // Queued = muted grey, Preparing = warning amber,
            // Ready/Prepared = success green, Overtime = destructive red.
            const courseColorClass = isQueued
              ? 'text-text-muted'
              : isServed || courseDone
                ? 'text-success'
                : courseOvertime
                  ? 'text-destructive'
                  : 'text-warning';
            const courseBgClass = isQueued
              ? 'bg-muted/50'
              : isServed
                ? 'bg-muted/50'
                : courseDone
                  ? 'bg-success/10'
                  : courseOvertime
                    ? 'bg-destructive/10'
                    : 'bg-warning/10';
            const isExpanded = !collapsedServedCourses.has(course.name);

            return (
              <div key={course.name}>
                {/* Course header - V3 style */}
                <button
                  type="button"
                  onClick={() => toggleServedCourse(course.name)}
                  className="w-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground flex items-center justify-between gap-2 select-none active:opacity-80 border-t border-border"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ChevronRight
                      size={12}
                      strokeWidth={2.5}
                      className="shrink-0 transition-transform duration-200"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}
                    />
                    <span className="truncate">{course.name}</span>
                    <span className={`normal-case tracking-normal ${courseColorClass}`}>· {courseStatusLabel}</span>
                  </div>
                  <span className="text-[10px] font-semibold tabular-nums shrink-0">
                    {courseItems.filter(i => i.status === 'done').length}/{courseItems.length}
                  </span>
                </button>

                {/* Course items (collapsible) */}
                {isExpanded && (
                  <div className={`${isQueued ? 'opacity-80' : ''}`}>
                    {courseItems.map((item, idx) => (
                      <ExpoItemRow
                        key={item.id}
                        item={item}
                        ticket={ticket}
                        sentItemIds={sentItemIds}
                        sentQuantities={sentQuantities}
                        tp={tp}
                        isDemo={isDemo}
                        onDemoItemTap={onDemoItemTap}
                        onItemSend={onItemSend}
                        onItemRecall={onItemRecall}
                        onItemAdvance={onItemAdvance}
                        onItemRevert={onItemRevert}
                        acknowledgedNewItemIds={acknowledgedNewItemIds}
                        onAcknowledgeNewItem={onAcknowledgeNewItem}
                        runnerIconSrc={runnerIcon}
                        showSendAlways={showSendAlways}
                        isLast={idx === courseItems.length - 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      ) : (
        <div>
          {ticket.items.map((item, idx) => (
            <ExpoItemRow
              key={item.id}
              item={item}
              ticket={ticket}
              sentItemIds={sentItemIds}
              sentQuantities={sentQuantities}
              tp={tp}
              isDemo={isDemo}
              onDemoItemTap={onDemoItemTap}
              onItemSend={onItemSend}
              onItemRecall={onItemRecall}
              onItemAdvance={onItemAdvance}
              onItemRevert={onItemRevert}
              acknowledgedNewItemIds={acknowledgedNewItemIds}
              onAcknowledgeNewItem={onAcknowledgeNewItem}
              runnerIconSrc={runnerIcon}
              showSendAlways={showSendAlways}
              isLast={idx === ticket.items.length - 1}
            />
          ))}
        </div>
      )}

      {/* Pending course for demo ticket 6 */}
      {demoTicket?.coursing?.pending && (
        <>
          <div className="w-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground flex items-center gap-1.5 border-t border-border">
            <ChevronRight size={12} strokeWidth={2.5} className="shrink-0" />
            <span className="truncate">{demoTicket.coursing.pending.course}</span>
            <span className="text-warning normal-case tracking-normal">· {demoTicket.coursing.pending.label}</span>
          </div>
          <div className="opacity-80" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '4px', paddingBottom: '4px' }}>
            {demoTicket.coursing.pending.items.map(pi => (
              <div key={pi.id} className="flex items-center gap-1.5 py-0.5">
                <span className="text-[13px] font-semibold text-foreground">
                  {pi.quantity}&times; {pi.name}
                </span>
                <span className="inline-flex items-center justify-center px-3 rounded-full text-[11px] font-semibold min-h-[24px] min-w-[64px] bg-warning/15 text-warning border border-warning/40">
                  Queued
                </span>
                <span className="text-[10px] text-text-muted">{pi.timeLabel}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer: Recall (when sent out) and Fire next course only. Send out is via header tap. */}
      {(isSentOut || (hasCoursingData && activeCourseAllDone && hasPendingCourse)) && (
        <div className="border-t border-border" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '8px', paddingBottom: '8px' }}>
          {hasCoursingData && activeCourseAllDone && hasPendingCourse && !isSentOut && (
            <div className="flex items-center px-1">
              <button
                onClick={() => onFireNextCourse?.(ticket.id)}
                className="px-2.5 py-1.5 border border-text-secondary text-text-secondary text-[11px] font-bold rounded hover:bg-muted/50 transition-colors min-h-[36px]"
              >
                Fire next course
              </button>
            </div>
          )}
          {isSentOut && (
            <div className="flex gap-1.5">
              <button
                onClick={() => onRecallOrder?.(ticket.id)}
                className="flex-1 py-2.5 bg-order-take-out text-primary-foreground text-[13px] font-bold uppercase rounded flex items-center justify-center gap-2 hover:bg-order-take-out/90 transition-colors min-h-[44px]"
              >
                <RotateCcw size={14} />
                RECALL
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* -- Expo-specific station color palette (avoids clashing with status & order-type colors) -- */

const expoStationPalette: Record<string, { bg: string; text: string; border: string }> = {
  Grill:   { bg: '#5C2010', text: '#FAECE7', border: '#7A2C16' },
  Fry:     { bg: '#2A2675', text: '#EEEDFE', border: '#3A3590' },
  Salad:   { bg: '#0B4736', text: '#E1F5EE', border: '#0F5E48' },
  Dessert: { bg: '#5C1F33', text: '#FBEAF0', border: '#7A2A44' },
  Bar:     { bg: '#523108', text: '#FAEEDA', border: '#6E420B' },
};

function ExpoStationBadge({ station }: { station: string }) {
  const palette = expoStationPalette[station] || { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
  return (
    <span
      className="inline-flex items-center rounded shrink-0"
      style={{
        fontSize: '9px',
        fontWeight: 600,
        padding: '1px 5px',
        borderRadius: '4px',
        backgroundColor: palette.bg,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        lineHeight: '1.4',
      }}
    >
      {station}
    </span>
  );
}

/* -- Station Status Bar (with legend) -- */

function ExpoStationBar() {
  const stationsBlock = (
    <div className="flex items-center flex-wrap gap-2">
      <span className="text-[10px] font-bold uppercase text-text-muted tracking-widest mr-1">Stations</span>
      {kitchenStations.map(s => {
        const palette = expoStationPalette[s.name] || { bg: 'hsl(var(--muted))', text: 'hsl(var(--text-secondary))', border: 'hsl(var(--border))' };
        return (
          <span
            key={s.name}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{
              backgroundColor: palette.bg,
              color: palette.text,
              border: `1px solid ${palette.border}`,
            }}
          >
            {s.name}
          </span>
        );
      })}
    </div>
  );

  const legendBlock = (
    <div className="flex items-center flex-wrap gap-2">
      <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
        <span className="inline-flex items-center justify-center" style={{ width: 16, height: 16, color: '#6C7A89' }}>
          <Eye size={13} strokeWidth={2} />
        </span>
        Seen
      </span>
      <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
        <span className="inline-flex items-center justify-center rounded-[4px]" style={{ width: 16, height: 16, background: '#374151' }}>
          <ClocheIcon size={10} strokeWidth={2.4} color="#fff" />
        </span>
        Preparing
      </span>
      <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
        <span className="inline-flex items-center justify-center rounded-full" style={{ width: 16, height: 16, background: '#DCFCE7', color: '#16A34A', border: '1.5px solid #16A34A' }}>
          <Check size={10} strokeWidth={3} />
        </span>
        Ready
      </span>
      <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
        <span className="inline-flex items-center justify-center rounded-full" style={{ width: 16, height: 16, background: '#27AE60' }}>
          <Check size={10} color="#fff" strokeWidth={3} />
        </span>
        Served
      </span>
    </div>
  );

  return (
    <div className="bg-surface-card border-b border-border shrink-0">
      <div className="hidden md:flex items-center gap-3 px-3 py-2">
        {stationsBlock}
        <div className="h-5 mx-1" style={{ width: '0.5px', backgroundColor: 'hsl(var(--border))' }} />
        <div className="ml-auto flex items-center gap-3">
          {legendBlock}
        </div>
      </div>
      <div className="flex md:hidden flex-col gap-2 px-3 py-2">
        {stationsBlock}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {legendBlock}
        </div>
      </div>
    </div>
  );
}

/* -- Top Bar Filter Buttons -- */

type ExpoFilter = 'all' | 'ready' | 'recalled';

function ExpoTopControls({
  filter,
  onFilterChange,
  fulfilledTickets,
  onRecallLast,
  hasRecallable,
}: {
  filter: ExpoFilter;
  onFilterChange: (f: ExpoFilter) => void;
  fulfilledTickets: number[];
  onRecallLast?: () => void;
  hasRecallable?: boolean;
}) {
  const handleRecalledClick = () => {
    if (fulfilledTickets.length === 0) {
      toast('No recently fulfilled tickets.');
    } else {
      toast(`Recently fulfilled: ${fulfilledTickets.map(n => `${n}`).join(', ')}`);
    }
    onFilterChange('recalled');
  };

  const filters: { key: ExpoFilter; label: string }[] = [
    { key: 'all', label: 'All tickets' },
    { key: 'ready', label: 'Ready only' },
    { key: 'recalled', label: 'Recalled' },
  ];

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-surface-card border-b border-border shrink-0">
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: '#7c3aed', color: '#ede9fe' }}
      >
        Expediter
      </span>

      <div className="flex-1" />

      <div className="flex items-center bg-muted rounded-full p-0.5">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => f.key === 'recalled' ? handleRecalledClick() : onFilterChange(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors min-h-[36px] ${
              filter === f.key
                ? 'bg-brand-dark text-primary-foreground'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          if (onRecallLast) onRecallLast();
          else toast('No recently sent tickets.');
        }}
        className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-colors min-h-[36px] ${
          hasRecallable
            ? 'border-warning text-warning bg-warning/10 animate-pulse'
            : 'border-border text-text-secondary hover:bg-muted'
        }`}
      >
        Recall last
      </button>
    </div>
  );
}

/* -- Main ExpoView -- */

interface ExpoViewProps {
  viewMode: ViewMode;
  pinnedTicketIds?: string[];
  onFilterChange?: () => void;
  onTicketSentOut?: (id: string) => void;
  onAllTicketsChange?: (tickets: ExpoTicket[]) => void;
  selectedProducts?: string[];
  controlledFilter?: ExpoFilter;
  hideTopControls?: boolean;
}

export default function ExpoView({ viewMode, pinnedTicketIds = [], onFilterChange, onTicketSentOut, onAllTicketsChange, selectedProducts = [], controlledFilter, hideTopControls }: ExpoViewProps) {
  const { expoTickets: rawTickets, sendOutOrder, orders, setOrders, updateOrderStatus, rushOrder, setItemLifecycle } = useOrderStore();
  const { textSize, ticketSpacing } = useKDSSettings();
  const [internalFilter, setInternalFilter] = useState<ExpoFilter>('all');
  const filter = controlledFilter ?? internalFilter;
  const setFilter = setInternalFilter;
  const [sentItemIds, setSentItemIds] = useState<Set<string>>(new Set());
  const [sentQuantities, setSentQuantities] = useState<Map<string, number>>(new Map());
  const [acknowledgedNewItemIds, setAcknowledgedNewItemIds] = useState<Set<string>>(new Set());

  // Track recently sent-out orders for recall
  const [sentOutOrders, setSentOutOrders] = useState<ExpoTicket[]>([]);

  const handleAcknowledgeNewItem = useCallback((itemId: string) => {
    setAcknowledgedNewItemIds(prev => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  }, []);

  const handleItemSend = useCallback((ticketId: string, itemId: string, qty: number) => {
    // Look up total quantity from current rawTickets to know when fully sent
    const item = rawTickets.flatMap(t => t.items).find(i => i.id === itemId);
    const totalQty = item?.quantity ?? qty;

    let willBeFullySent = false;
    setSentQuantities(prev => {
      const next = new Map(prev);
      const current = next.get(itemId) ?? 0;
      const updated = Math.min(totalQty, current + qty);
      next.set(itemId, updated);
      willBeFullySent = updated >= totalQty;
      return next;
    });

    if (willBeFullySent) {
      setSentItemIds(prev => {
        const next = new Set(prev);
        next.add(itemId);
        return next;
      });
      toast.success('Item sent');
    } else {
      toast.success(`Sent ${qty} of ${totalQty}`);
    }
  }, [rawTickets]);

  const handleItemRecall = useCallback((ticketId: string, itemId: string) => {
    setSentItemIds(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    setSentQuantities(prev => {
      const next = new Map(prev);
      next.delete(itemId);
      return next;
    });
    toast.success('Item recalled');
  }, []);

  const handleFilterChange = useCallback((f: ExpoFilter) => {
    setFilter(f);
    onFilterChange?.();
  }, [onFilterChange]);

  // ResizeObserver for stagger column count
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(0);
  useEffect(() => {
    const node = boardRef.current;
    if (!node) return;
    const observer = new ResizeObserver(entries => {
      const [entry] = entries;
      if (entry) setBoardWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const staggerColumnCount = useMemo(() => {
    if (boardWidth <= 0) return 3;
    if (boardWidth < 520) return 1;
    if (boardWidth < 760) return 2;
    if (boardWidth < 1160) return 3;
    if (boardWidth < 1480) return 4;
    return 5;
  }, [boardWidth]);

  // Demo tickets - always present alongside real tickets
  const [demoTickets, setDemoTickets] = useState<DemoExpoTicket[]>(() => createDemoTickets());
  const [sentDemoIds, setSentDemoIds] = useState<Set<string>>(new Set());
  const lastSentDemo = useRef<DemoExpoTicket | null>(null);

  // Per-item status overrides for real tickets (manual advance/revert).
  const [itemStatusOverrides, setItemStatusOverrides] = useState<Map<string, ExpoItemStatus>>(new Map());

  const advanceStatus = (s: ExpoItemStatus): ExpoItemStatus =>
    s === 'pending' ? 'firing' : 'done';
  const revertStatus = (s: ExpoItemStatus): ExpoItemStatus =>
    s === 'done' ? 'firing' : 'pending';

  // Demo item helper: cycle status in either direction
  const cycleDemoItem = useCallback((ticketId: string, itemId: string, dir: 'advance' | 'revert') => {
    setDemoTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const now = new Date();
      const timeStr = formatTime(now);
      const updatedItems = t.items.map(item => {
        if (item.id !== itemId) return item;
        const next = dir === 'advance' ? advanceStatus(item.status) : revertStatus(item.status);
        if (next === item.status) return item;
        const label =
          next === 'firing' ? `Since ${timeStr}` :
          next === 'done' ? `Done ${timeStr}` : undefined;
        return { ...item, status: next, statusLabel: label };
      });
      const anyFiring = updatedItems.some(i => i.status === 'firing');
      const allDoneItems = updatedItems.every(i => i.status === 'done');
      const smartStations = t.stations.map((s, idx) => {
        if (allDoneItems) return { ...s, status: 'done' as const };
        if (anyFiring && s.status === 'pending' && idx === t.stations.findIndex(st => st.status === 'pending')) {
          return { ...s, status: 'firing' as const };
        }
        return s;
      });
      return { ...t, items: updatedItems, stations: smartStations };
    }));
  }, []);

  // Legacy demo handler (advance only) kept for compatibility
  const handleDemoItemTap = useCallback((ticketId: string, itemId: string) => {
    cycleDemoItem(ticketId, itemId, 'advance');
  }, [cycleDemoItem]);

  const handleItemAdvance = useCallback((ticketId: string, itemId: string) => {
    if (ticketId.startsWith('demo-')) {
      cycleDemoItem(ticketId, itemId, 'advance');
      return;
    }
    const ticket = rawTickets.find(t => t.id === ticketId);
    const item = ticket?.items.find(i => i.id === itemId);
    if (!item) return;
    // Expo can only mark ready (status === 'done') → served.
    if (item.status === 'done') {
      setItemLifecycle(ticketId, itemId, 'served');
      setSentItemIds(prev => {
        const next = new Set(prev);
        next.add(itemId);
        return next;
      });
    }
  }, [cycleDemoItem, rawTickets, setItemLifecycle]);

  const handleItemRevert = useCallback((ticketId: string, itemId: string) => {
    if (ticketId.startsWith('demo-')) {
      cycleDemoItem(ticketId, itemId, 'revert');
      return;
    }
    // Real tickets: expo cannot revert kitchen states; only undo a local send-out.
    setSentItemIds(prev => {
      if (!prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    setItemLifecycle(ticketId, itemId, 'ready');
  }, [cycleDemoItem, setItemLifecycle]);


  // Demo send out
  const handleDemoSendOut = useCallback((id: string) => {
    const ticket = demoTickets.find(t => t.id === id);
    if (!ticket) return;
    lastSentDemo.current = ticket;
    setSentDemoIds(prev => new Set(prev).add(id));
    toast.success('Demo ticket sent out');
  }, [demoTickets]);

  // Demo recall last
  const handleDemoRecallLast = useCallback(() => {
    if (!lastSentDemo.current) return;
    const ticket = lastSentDemo.current;
    setSentDemoIds(prev => {
      const next = new Set(prev);
      next.delete(ticket.id);
      return next;
    });
    lastSentDemo.current = null;
    toast.success(`Demo ticket ${ticket.orderNumber} recalled`);
  }, []);

  // Demo fire next course: promote pending course to active
  const handleDemoFireNextCourse = useCallback((ticketId: string) => {
    setDemoTickets(prev => prev.map(t => {
      if (t.id !== ticketId || !t.coursing?.pending) return t;
      const now = new Date();
      const timeStr = formatTime(now);
      const newServed = t.coursing.active
        ? { course: t.coursing.active.course, doneAt: timeStr, items: t.items.map(i => ({ name: i.name, quantity: i.quantity })) }
        : t.coursing.served;
      const pendingItems = t.coursing.pending.items.map(pi => ({
        id: pi.id,
        name: pi.name,
        quantity: pi.quantity,
        status: 'firing' as const,
        statusLabel: `Since ${timeStr}`,
      }));
      return {
        ...t,
        items: pendingItems,
        stations: t.stations.map(s => ({ ...s, status: 'firing' as const })),
        coursing: {
          served: newServed,
          active: { course: t.coursing.pending.course, label: 'ACTIVE' },
          pending: undefined,
        },
      };
    }));
    toast.success('Next course fired');
  }, []);

  // Live tick every second to drive elapsed timers
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Recompute timerSeconds live from order.timeReceived or active course firedAt
  const tickets = useMemo(() => {
    const now = Date.now();
    return rawTickets.map(t => {
      const order = orders.find(o => o.id === t.id);
      if (!order) return t;

      // Timer logic by order type:
      // FSR coursed (dine-in with coursing): timer from active course firedAt
      // FSR non-coursed (dine-in without coursing): timer from order placement
      // QSR (take-out, delivery): timer from order placement
      let timerSeconds: number;
      if (t.hasCoursing && t.activeCourseFiredAt) {
        timerSeconds = Math.round((now - t.activeCourseFiredAt.getTime()) / 1000);
      } else {
        timerSeconds = Math.round((now - order.timeReceived.getTime()) / 1000);
      }

      // Apply manual item status overrides
      const items = itemStatusOverrides.size > 0
        ? t.items.map(it => itemStatusOverrides.has(it.id) ? { ...it, status: itemStatusOverrides.get(it.id)! } : it)
        : t.items;

      return { ...t, timerSeconds, items };
    });
  }, [rawTickets, orders, tick, itemStatusOverrides]);
  const [fulfilledTickets, setFulfilledTickets] = useState<number[]>([]);
  const [holdStations, setHoldStations] = useState<Set<string>>(new Set());

  const handleToggleHold = useCallback((ticketId: string, stationName: string) => {
    const key = `${ticketId}-${stationName}`;
    setHoldStations(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        toast(`Released ${stationName}`);
      } else {
        next.add(key);
        toast(`Holding ${stationName}`);
      }
      return next;
    });
  }, []);

  const handleSendOut = useCallback((id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    // Save ticket snapshot for recall
    setSentOutOrders(prev => [ticket, ...prev]);
    setFulfilledTickets(prev => [ticket.orderNumber, ...prev]);
    sendOutOrder(id);
    setHoldStations(prev => {
      const next = new Set(prev);
      for (const key of prev) {
        if (key.startsWith(id + '-')) next.delete(key);
      }
      return next;
    });
    toast.success(`Ticket ${ticket.orderNumber} sent out`);
  }, [tickets, sendOutOrder]);

  const handleRecallOrder = useCallback((id: string) => {
    const ticket = sentOutOrders.find(t => t.id === id);
    if (!ticket) return;
    // Restore order status to preparing
    updateOrderStatus(id, 'preparing');
    setSentOutOrders(prev => prev.filter(t => t.id !== id));
    setFulfilledTickets(prev => prev.filter(n => n !== ticket.orderNumber));
    toast.success(`Ticket ${ticket.orderNumber} recalled`);
  }, [sentOutOrders, updateOrderStatus]);

  const handleRush = useCallback((id: string) => {
    const ticket = [...tickets, ...demoTickets].find(t => t.id === id);
    if (!ticket) return;
    // Set rush state in shared store (real orders only)
    if (!id.startsWith('demo-')) {
      rushOrder(id);
    }
    toast(`Rush alert sent for Ticket ${ticket.orderNumber}`);
  }, [tickets, demoTickets, rushOrder]);

  // Auto-send-out tickets when all items are individually sent
  useEffect(() => {
    const allCombined = [...rawTickets, ...demoTickets.filter(t => !sentDemoIds.has(t.id))];
    for (const ticket of allCombined) {
      if (ticket.items.length > 0 && ticket.items.every(i => sentItemIds.has(i.id))) {
        if (ticket.id.startsWith('demo-')) {
          handleDemoSendOut(ticket.id);
        } else {
          handleSendOut(ticket.id);
        }
      }
    }
  }, [sentItemIds, rawTickets, demoTickets, sentDemoIds, handleDemoSendOut, handleSendOut]);

  // Combine real + demo tickets
  const visibleDemoTickets = useMemo(() => {
    return demoTickets.filter(t => !sentDemoIds.has(t.id));
  }, [demoTickets, sentDemoIds]);

  const allTickets = useMemo(() => {
    return [...tickets, ...visibleDemoTickets];
  }, [tickets, visibleDemoTickets]);

  // Report allTickets to parent for summary panel
  useEffect(() => {
    onAllTicketsChange?.(allTickets);
  }, [allTickets, onAllTicketsChange]);

  // Reorder by pinned IDs, product selection, then elapsed time
  const selectedProductSet = useMemo(() => new Set(selectedProducts), [selectedProducts]);

  const sentOutOrderIds = useMemo(() => new Set(sentOutOrders.map(t => t.id)), [sentOutOrders]);

  const sortedTickets = useMemo(() => {
    const base = filter === 'ready'
      ? allTickets.filter(t => allItemsDone(t))
      : filter === 'recalled'
      ? allTickets.filter(t => {
          const order = orders.find(o => o.id === t.id);
          return order?.status === 'recalled';
        })
      : allTickets;

    // Product filtering: tickets matching ALL selected products go to top
    let result = base;
    if (selectedProductSet.size > 0) {
      const matching: typeof base = [];
      const nonMatching: typeof base = [];
      for (const t of base) {
        const itemNames = new Set(t.items.map(i => i.name));
        const hasAny = [...selectedProductSet].some(p => itemNames.has(p));
        if (hasAny) matching.push(t);
        else nonMatching.push(t);
      }
      result = [...matching, ...nonMatching];
    }

    if (pinnedTicketIds.length > 0) {
      const pinnedSet = new Set(pinnedTicketIds);
      const pinned: typeof result = [];
      const unpinned: typeof result = [];

      for (const t of result) {
        if (pinnedSet.has(t.id)) pinned.push(t);
        else unpinned.push(t);
      }

      pinned.sort((a, b) => pinnedTicketIds.indexOf(a.id) - pinnedTicketIds.indexOf(b.id));
      result = [...pinned, ...unpinned];
    }

    return result;
  }, [allTickets, filter, pinnedTicketIds, selectedProductSet, orders]);

  const stats = useMemo(() => {
    const open = tickets.length;
    const ready = tickets.filter(t => allItemsDone(t)).length;
    const overtime = tickets.filter(isOvertime).length;
    const avgTime = tickets.length > 0
      ? Math.round(tickets.reduce((sum, t) => sum + t.timerSeconds, 0) / tickets.length)
      : 0;
    return { open, ready, overtime, avgTime };
  }, [tickets]);

  const staggerColumns = useMemo(() => {
    const cols = Math.max(1, staggerColumnCount);
    const columns: typeof sortedTickets[] = Array.from({ length: cols }, () => []);
    sortedTickets.forEach((t, i) => columns[i % cols].push(t));
    return columns;
  }, [sortedTickets, staggerColumnCount]);

  const handleSendOutAny = useCallback((id: string) => {
    if (id.startsWith('demo-')) {
      handleDemoSendOut(id);
    } else {
      handleSendOut(id);
    }
    onTicketSentOut?.(id);
  }, [handleDemoSendOut, handleSendOut, onTicketSentOut]);

  // Fire next course handler (demo or real)
  const handleFireNextCourseAny = useCallback((ticketId: string) => {
    if (ticketId.startsWith('demo-')) {
      handleDemoFireNextCourse(ticketId);
    } else {
      // For real tickets: find the next unfired course and fire it
      const order = orders.find(o => o.id === ticketId);
      if (!order) return;
      const nextCourse = order.courses.find(c => !c.isFired);
      if (nextCourse) {
        setOrders(prev => prev.map(o => {
          if (o.id !== ticketId) return o;
          return {
            ...o,
            courses: o.courses.map(c =>
              c.course === nextCourse.course ? { ...c, isFired: true, firedAt: new Date(), _startedAt: new Date() } : c
            ),
          };
        }));
        toast.success(`${nextCourse.course} fired`);
      }
    }
  }, [handleDemoFireNextCourse, orders, setOrders]);

  // Highlight pulse state for recently pinned tickets
  const [pulsingIds, setPulsingIds] = useState<Set<string>>(new Set());
  const prevPinnedRef = useRef<string[]>([]);
  useEffect(() => {
    const prevSet = new Set(prevPinnedRef.current);
    const newlyPinned = pinnedTicketIds.filter(id => !prevSet.has(id));
    prevPinnedRef.current = pinnedTicketIds;
    if (newlyPinned.length === 0) return;

    setPulsingIds(prev => {
      const next = new Set(prev);
      newlyPinned.forEach(id => next.add(id));
      return next;
    });
    const timer = setTimeout(() => {
      setPulsingIds(prev => {
        const next = new Set(prev);
        newlyPinned.forEach(id => next.delete(id));
        return next;
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [pinnedTicketIds]);

  const renderTicketCard = (ticket: ExpoTicket) => {
    const isPulsing = pulsingIds.has(ticket.id);
    const ticketIsSentOut = sentOutOrderIds.has(ticket.id);
    const order = orders.find(o => o.id === ticket.id);
    const ticketIsRushed = order?.isRushed ?? false;
    // Dim tickets not matching selected products
    let isDimmed = false;
    if (selectedProductSet.size > 0 && !ticketIsSentOut) {
      const itemNames = new Set(ticket.items.map(i => i.name));
      isDimmed = ![...selectedProductSet].some(p => itemNames.has(p));
    }
    return (
      <div className={`${isPulsing ? 'animate-expo-pin-pulse' : ''} ${isDimmed ? 'opacity-40' : ''} transition-opacity duration-300`}>
        <ExpoTicketCard
          key={ticket.id}
          ticket={ticket}
          onSendOut={handleSendOutAny}
          onRush={handleRush}
          holdStations={holdStations}
          onToggleHold={handleToggleHold}
          isDemo={ticket.id.startsWith('demo-')}
          onDemoItemTap={ticket.id.startsWith('demo-') ? handleDemoItemTap : undefined}
          sentItemIds={sentItemIds}
          sentQuantities={sentQuantities}
          onItemSend={handleItemSend}
          onItemRecall={handleItemRecall}
          onItemAdvance={handleItemAdvance}
          onItemRevert={handleItemRevert}
          acknowledgedNewItemIds={acknowledgedNewItemIds}
          onAcknowledgeNewItem={handleAcknowledgeNewItem}
          onFireNextCourse={handleFireNextCourseAny}
          isSentOut={ticketIsSentOut}
          onRecallOrder={handleRecallOrder}
          isRushed={ticketIsRushed}
        />
      </div>
    );
  };

  const hasRecallable = (!!lastSentDemo.current && sentDemoIds.has(lastSentDemo.current.id)) || sentOutOrders.length > 0;
  const handleRecallLast = () => {
    if (lastSentDemo.current && sentDemoIds.has(lastSentDemo.current.id)) {
      handleDemoRecallLast();
      return;
    }
    if (sentOutOrders.length > 0) {
      handleRecallOrder(sentOutOrders[0].id);
    } else {
      toast('No recently sent tickets.');
    }
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${getKdsScaleClasses(textSize, ticketSpacing)}`}>
      {!hideTopControls && (
        <ExpoTopControls
          filter={filter}
          onFilterChange={handleFilterChange}
          fulfilledTickets={fulfilledTickets}
          onRecallLast={handleRecallLast}
          hasRecallable={hasRecallable}
        />
      )}
      <ExpoStationBar />

      <div ref={boardRef} className="flex-1 overflow-auto p-3">
        {sortedTickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full gap-3">
            <CheckCircle size={48} className="text-success/60" />
            <div className="text-center">
              <p className="text-success/80 text-lg font-bold">Kitchen clear</p>
              <p className="text-success/50 text-sm mt-1">All tickets fulfilled, waiting for new orders</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {sortedTickets.map(ticket => (
                <motion.div key={ticket.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ layout: { duration: 0.2, ease: 'easeInOut' } }}>
                  {renderTicketCard(ticket)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : viewMode === 'horizontal' ? (
          <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
            <AnimatePresence mode="popLayout">
              {sortedTickets.map(ticket => (
                <motion.div key={ticket.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="shrink-0 w-[280px]">
                  {renderTicketCard(ticket)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex gap-1.5 sm:gap-2 lg:gap-2.5 items-start">
            {staggerColumns.map((col, colIdx) => (
              <div key={colIdx} className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2 lg:gap-2.5">
                <AnimatePresence mode="popLayout">
                  {col.map(ticket => (
                    <motion.div key={ticket.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
                      {renderTicketCard(ticket)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}