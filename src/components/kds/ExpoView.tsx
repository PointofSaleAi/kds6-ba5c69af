import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, Hourglass, Flame, Check, ArrowUpRight, AlertTriangle, RotateCcw, Minus, Plus } from 'lucide-react';
import noteIcon from '@/assets/note-bold.svg';
import { useStatusRules } from '@/hooks/use-status-rules';
import { AllergenBadge } from './AllergenBadge';
import { StationBadge, stationColors } from './StationBadge';
import type { ViewMode } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS, type OrderTypeColors } from '@/hooks/use-kds-settings';
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
 *   - Add-ons ("+ X", "Extra X")                                     -> green
 * Cooking temperature, cooking style, and sauce preparations are hidden.
 */
function getExpoRelevantModifiers(
  modifiers?: { text: string; type: 'extra' | 'remove' | 'neutral' }[],
): { text: string; kind: 'remove' | 'add' }[] {
  if (!modifiers || modifiers.length === 0) return [];
  const out: { text: string; kind: 'remove' | 'add' }[] = [];
  for (const m of modifiers) {
    const t = m.text.trim();
    const lower = t.toLowerCase();
    if (m.type === 'remove' || /^(no |without |sub |replace )/i.test(t)) {
      out.push({ text: t, kind: 'remove' });
      continue;
    }
    if (m.type === 'extra' || t.startsWith('+') || /^extra /i.test(t)) {
      out.push({ text: t.startsWith('+') ? t : `+ ${t}`, kind: 'add' });
      continue;
    }
    // neutral cooking instructions / sauce prep -> hidden on expo
  }
  return out;
}

/* -- Item status icon -- */

function ExpoStatusIcon({ status }: { status: ExpoItemStatus | 'sent' }) {
  if (status === 'done') return <Check className="w-3.5 h-3.5 text-success" />;
  if (status === 'firing') return <Flame className="w-3.5 h-3.5 text-warning" />;
  if (status === 'sent') return <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />;
  return <Hourglass className="w-3.5 h-3.5 text-text-muted" />;
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

  // Hide sent items entirely — they are removed from the card
  if (sentItemIds.has(item.id) || remainingQty <= 0) return null;

  const isPrepared = item.status === 'done';
  const isNewUnacked = !!(item.isNew && !acknowledgedNewItemIds.has(item.id));
  const showToGoBadge = !!item.isToGo && ticket.orderType === 'dine-in';
  const showQtySelector = isPrepared && remainingQty > 1;

  const stationChip = item.station && stationColors[item.station as keyof typeof stationColors] ? (
    <ExpoStationBadge station={item.station} />
  ) : null;
  const statusIcon = <ExpoStatusIcon status={item.status} />;
  const expoModifiers = getExpoRelevantModifiers(item.modifiers);

  // Indented column matches FlatItemList: invisible "0x" placeholder of width 2.25ch + 4px gap
  const indentPlaceholder = (
    <span
      className="invisible shrink-0 font-normal"
      aria-hidden="true"
      style={{ fontSize: '13px', lineHeight: 1, width: '2.25ch', display: 'inline-block' }}
    >
      0x
    </span>
  );

  const modifierRow = expoModifiers.length > 0 ? (
    <div className="flex items-start" style={{ gap: '4px', marginTop: '1px', lineHeight: 1 }}>
      {indentPlaceholder}
      <div className="flex flex-wrap items-center" style={{ gap: '4px', rowGap: '2px' }}>
        {expoModifiers
          .sort((a, b) => (a.kind === 'remove' ? -1 : 1) - (b.kind === 'remove' ? -1 : 1))
          .map((m, idx) => (
            <span
              key={idx}
              className={`text-[12px] font-medium leading-tight ${m.kind === 'remove' ? 'text-destructive' : 'text-success'}`}
            >
              {m.text}
            </span>
          ))}
      </div>
    </div>
  ) : null;

  const allergenRow = item.allergens && item.allergens.length > 0 ? (
    <div className="flex items-start" style={{ gap: '4px', marginTop: '1px', lineHeight: 1 }}>
      {indentPlaceholder}
      <div className="flex flex-wrap items-start" style={{ gap: '4px', rowGap: '2px', lineHeight: 1 }}>
        {item.allergens.map(a => (
          <AllergenBadge key={a.type} allergen={{ type: a.type as any, label: a.label, icon: '' }} variant="item" />
        ))}
      </div>
    </div>
  ) : null;

  const toGoBadge = showToGoBadge ? (
    <span
      className="inline-flex items-center bg-text-primary text-white rounded-full uppercase leading-none"
      style={{ fontSize: '9px', fontWeight: 500, padding: '1px 6px' }}
      aria-label="To go item"
    >
      TO GO
    </span>
  ) : null;

  // Outer row with Home-style dense spacing + bottom divider (except last).
  // Tap-to-send pattern: when prepared, tapping the row sends the item out.
  const isTapToSend = isPrepared && remainingQty > 0;
  const outerClass = `-mx-2 px-2 ${isLast ? '' : 'border-b border-border/50'} ${isPrepared ? 'border-l-[3px] border-l-success' : ''} ${isNewUnacked ? 'animate-new-item' : ''} ${(isDemo || isTapToSend) ? 'cursor-pointer' : ''} ${isTapToSend ? 'active:bg-success/10 transition-colors' : ''}`;

  return (
    <div
      className={outerClass}
      style={{ paddingTop: '2px', paddingBottom: isLast ? '6px' : '2px' }}
      role={isTapToSend ? 'button' : undefined}
      aria-label={isTapToSend ? `Send ${tp(item.name)}` : undefined}
      onClick={() => {
        if (isNewUnacked) onAcknowledgeNewItem?.(item.id);
        if (isDemo && onDemoItemTap) onDemoItemTap(ticket.id, item.id);
        if (isTapToSend) onItemSend?.(ticket.id, item.id, remainingQty);
      }}
    >
      <div className="flex items-start" style={{ gap: '4px' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-start flex-wrap min-w-0" style={{ gap: '4px', lineHeight: 1.1 }}>
            <span
              className="font-normal shrink-0"
              style={{ fontSize: '13px', lineHeight: 1.1, width: '2.25ch', textAlign: 'right', display: 'inline-block' }}
            >
              {remainingQty}x
            </span>
            <span
              className="font-bold uppercase text-text-primary min-w-0 break-words"
              style={{ fontSize: '13px', lineHeight: 1.1, wordBreak: 'break-word' }}
            >
              {tp(item.name)}
            </span>
            {toGoBadge}
            {stationChip}
            {isPrepared && (
              <span className="self-center inline-flex items-center" aria-label="Ready">
                <Check className="w-3.5 h-3.5 text-success" strokeWidth={3} />
              </span>
            )}
          </div>
        </div>
      </div>
      {modifierRow}
      {allergenRow}
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
  acknowledgedNewItemIds: Set<string>;
  onAcknowledgeNewItem?: (itemId: string) => void;
  onFireNextCourse?: (ticketId: string) => void;
  /** If true, the entire ticket is sent out and shown in recall mode */
  isSentOut?: boolean;
  onRecallOrder?: (id: string) => void;
  /** Whether this ticket is in Rush state */
  isRushed?: boolean;
}

function ExpoTicketCard({ ticket, onSendOut, onRush, holdStations, onToggleHold, isDemo, onDemoItemTap, sentItemIds, sentQuantities, onItemSend, onItemRecall, acknowledgedNewItemIds, onAcknowledgeNewItem, onFireNextCourse, isSentOut, onRecallOrder, isRushed }: ExpoTicketCardProps) {
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
      className={`rounded-lg overflow-hidden bg-surface-card shadow-sm transition-all duration-300 relative`}
      style={isSentOut ? { opacity: 0.65 } : undefined}
    >

      {/* Header (Rows 1 + 2). Tap-to-send when whole ticket is ready. */}
      <div
        role={isReady && !isSentOut ? 'button' : undefined}
        aria-label={isReady && !isSentOut ? `Send out order ${ticket.orderNumber}` : undefined}
        onClick={() => { if (isReady && !isSentOut) onSendOut(ticket.id); }}
        className={isReady && !isSentOut ? 'cursor-pointer active:opacity-90 transition-opacity' : ''}
      >
        {/* Row 1: Order type strip */}
        <div
          className="flex items-center px-2"
          style={{ backgroundColor: headerStyle.bgColor, height: '28px' }}
        >
          <span className="text-[11px] font-medium uppercase tracking-wide text-white leading-none">
            {orderTypeLabel[ticket.orderType] || ticket.orderType.toUpperCase()} &middot; {ticket.tableName}
          </span>
          {isReady && !isSentOut && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/90">
              <Check className="w-3 h-3" strokeWidth={3} />
              Tap to send
            </span>
          )}
        </div>

        {/* Row 2: Urgency row */}
        <div
          className="flex items-center justify-between px-2"
          style={{ backgroundColor: urgencyBgColor, height: '36px' }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-medium text-white leading-none">
              #{ticket.orderNumber}
            </span>
            {isRushed && (
              <span
                className="inline-flex items-center bg-destructive text-white rounded-full leading-none uppercase"
                style={{ fontSize: '10px', fontWeight: 500, padding: '2px 10px' }}
                aria-label="Rush"
              >
                RUSH
              </span>
            )}
          </div>
          <span className="text-[13px] font-medium font-mono text-white leading-none">
            {formatTimer(ticket.timerSeconds)}
          </span>
        </div>
      </div>

      {/* Allergen badges */}
      {ticketAllergens.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 border-b border-border/40" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '4px', paddingBottom: '4px', marginBottom: '6px' }}>
          {ticketAllergens.map(a => (
            <AllergenBadge key={a.type} allergen={{ type: a.type as any, label: a.label, icon: '' }} variant="order" />
          ))}
        </div>
      )}

      {/* Order notes (expo packaging + special instructions) — Home screen style */}
      {ticket.orderNotes && ticket.orderNotes.trim().length > 0 && (
        <div className="border-t border-border">
          <div
            className="flex items-start select-none"
            style={{ padding: '2px 8px', gap: '3px' }}
          >
            <img
              src={noteIcon}
              width={11}
              height={11}
              className="shrink-0"
              style={{ marginTop: '1px', filter: 'brightness(0) saturate(100%) invert(45%) sepia(8%) saturate(541%) hue-rotate(182deg) brightness(94%) contrast(86%)' }}
              alt=""
              aria-hidden="true"
            />
            <div
              className="flex-1 min-w-0 text-[11px] text-text-primary"
              style={{ lineHeight: 1.2 }}
            >
              {ticket.orderNotes}
            </div>
          </div>
        </div>
      )}

      {/* Station chips removed from header per design update */}

      {/* Coursing: Served course (collapsed) for demo ticket 6 */}
      {demoTicket?.coursing?.served && (
        <div className="border-b border-border bg-muted/50" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', marginBottom: '2px' }}>
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <span>&#9654;</span>
            <span className="font-bold uppercase tracking-wider">{demoTicket.coursing.served.course} &middot; PREPARED</span>
            <span className="ml-auto text-[10px] text-text-muted">
              {demoTicket.coursing.served.items.reduce((s, i) => s + i.quantity, 0)} of {demoTicket.coursing.served.items.reduce((s, i) => s + i.quantity, 0)} ready
            </span>
          </div>
        </div>
      )}

      {/* Active course label for coursed demo tickets */}
      {demoTicket?.coursing?.active && (
        <div className="border-b border-border" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              {demoTicket.coursing.active.course} &middot; {demoTicket.coursing.active.label}
            </span>
            <span className="text-[10px] text-text-muted">
              {ticket.items.filter(i => i.status === 'done').length} of {ticket.items.length} ready
            </span>
          </div>
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
            const courseStatusLabel = isServed ? 'PREPARED' : isQueued ? 'QUEUED' : 'ACTIVE';
            const isExpanded = !collapsedServedCourses.has(course.name);

            return (
              <div key={course.name} style={{ marginBottom: '2px' }}>
                {/* Course header — collapsible */}
                <div
                  className={`border-b border-border cursor-pointer ${isServed ? 'bg-muted/50' : ''}`}
                  style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px' }}
                  onClick={() => toggleServedCourse(course.name)}
                  role="button"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] text-text-muted inline-block"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}
                      aria-hidden="true"
                    >
                      &#9654;
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      {course.name} &middot; {courseStatusLabel}
                    </span>
                    <span className="ml-auto text-[10px] text-text-muted">
                      {courseItems.filter(i => i.status === 'done').length} of {courseItems.length} ready
                    </span>
                  </div>
                </div>

                {/* Course items (collapsible) */}
                {isExpanded && (
                  <div className={`${isQueued ? 'opacity-40' : ''}`} style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '2px', paddingBottom: '2px' }}>
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
        <div style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '4px', paddingBottom: '2px' }}>
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
          <div className="border-t border-border" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              {demoTicket.coursing.pending.course} &middot; {demoTicket.coursing.pending.label}
            </span>
          </div>
          <div className="opacity-40" style={{ paddingLeft: '10px', paddingRight: '10px', paddingTop: '4px', paddingBottom: '4px' }}>
            {demoTicket.coursing.pending.items.map(pi => (
              <div key={pi.id} className="flex items-center gap-1.5 py-0.5">
                <span className="text-[13px] font-medium text-text-primary">
                  {pi.quantity}&times; {pi.name}
                </span>
                <span className="inline-flex items-center justify-center px-3 rounded-full text-[11px] font-medium min-h-[24px] min-w-[64px] bg-muted text-text-muted">
                  Queued
                </span>
                <span className="text-[10px] text-text-muted">{pi.timeLabel}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer: Recall (when sent out) and Fire next course only. Send out is now via header tap. */}
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

    </div>
  );
}