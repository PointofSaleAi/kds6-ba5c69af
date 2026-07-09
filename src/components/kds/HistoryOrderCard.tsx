import { useRef, useState, useCallback } from 'react';
import { Undo } from 'lucide-react';



import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import type { Order, OrderItem } from '@/types/kds';
import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS } from '@/hooks/use-kds-settings';
import { OrderTypeBadge } from './OrderTypeBadge';
import { OrderAllergenStrip } from './OrderAllergenStrip';
import { OrderNotesSection } from './OrderNotesSection';
import { AllergenBadge } from './AllergenBadge';
import { ModifierLine } from './ModifierLine';
import { getLocationLabel } from './station-utils';
import PersonSimpleRunBold from '@/assets/person-simple-run-bold.svg';
import UsersBold from '@/assets/users-bold.svg';

interface HistoryOrderCardProps {
  order: Order;
  compact?: boolean;
  onRecall?: (orderId: string) => void;
  onRecallItem?: (orderId: string, item: OrderItem) => void;
  /** When true, render the two-row Expo-style header (used in Expo View History). */
  expoHeader?: boolean;
}

const EXPO_ORDER_TYPE_LABEL: Record<string, string> = {
  'dine-in': 'DINE IN',
  'take-out': 'TAKE OUT',
  'delivery': 'DELIVERY',
  'banquet': 'BANQUET',
  'drive-thru': 'DRIVE THRU',
  'curb-side': 'CURB SIDE',
  'scheduled': 'SCHEDULED',
  'phone-in': 'PHONE-IN',
  'custom': 'CUSTOM',
};

interface HistoryItemRowProps {
  item: OrderItem;
  orderId: string;
  isLast: boolean;
  selected: boolean;
  selectionMode: boolean;
  onTap: () => void;
  onLongPress: () => void;
  tp: (s: string) => string;
}

function formatDuration(seconds: number): string {
  const min = Math.round(seconds / 60);
  return `${min} min total`;
}

function getDurationBadgeStyle(seconds: number) {
  const min = Math.round(seconds / 60);
  if (min <= 20) return { bg: '#DCFCE7', color: '#15803D' };
  if (min <= 30) return { bg: '#FEF9C3', color: '#A16207' };
  return { bg: '#FEE2E2', color: '#B91C1C' };
}

const DINE_IN_TYPES = new Set(['dine-in']);
const LONG_PRESS_MS = 450;

interface HistoryItemRowExtraProps extends HistoryItemRowProps {
  isCompactLayout: boolean;
}

function HistoryItemRow({ item, isLast, selected, selectionMode, onTap, onLongPress, tp, isCompactLayout }: HistoryItemRowExtraProps) {
  const { tn } = useLanguage();
  const qtyColWidth = isCompactLayout ? '1.5ch' : '2.25ch';
  const detailIndent = isCompactLayout ? '16px' : '0px';
  const interactive = !item.isCancelled;
  const timerRef = useRef<number | null>(null);
  const longPressedRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startPress = () => {
    if (!interactive) return;
    longPressedRef.current = false;
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      longPressedRef.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  };

  const endPress = (fire: boolean) => {
    clearTimer();
    if (!interactive) return;
    if (fire && !longPressedRef.current) {
      onTap();
    }
    longPressedRef.current = false;
  };

  const baseClass = `-mx-1 px-1 select-none transition-colors ${
    isLast ? '' : 'border-b border-border/50'
  } ${item.isCancelled ? 'opacity-50' : ''} ${
    interactive ? 'cursor-pointer' : ''
  }`;

  const selectedStyle = selected
    ? { backgroundColor: 'hsl(var(--primary) / 0.18)', boxShadow: 'inset 3px 0 0 hsl(var(--primary))' }
    : undefined;

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={selected}
      aria-label={interactive ? `${selected ? 'Deselect' : 'Select'} ${item.name}` : undefined}
      onPointerDown={startPress}
      onPointerUp={() => endPress(true)}
      onPointerLeave={() => endPress(false)}
      onPointerCancel={() => endPress(false)}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (!interactive) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTap();
        }
      }}
      className={`${baseClass} ${!selected && interactive ? 'hover:bg-muted/30 active:bg-muted/40' : ''}`}
      style={{
        paddingTop: 'var(--kds-row-py, 4px)',
        paddingBottom: isLast ? 'calc(var(--kds-row-py, 4px) + 4px)' : 'var(--kds-row-py, 4px)',
        ...selectedStyle,
      }}
    >
      <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-nowrap min-w-0" style={{ gap: '4px', lineHeight: 1.1 }}>

          <span
            className="font-normal shrink-0 line-through"
            style={{
              fontSize: 'var(--kds-item-qty)',
              color: 'hsl(var(--text-secondary))',
              lineHeight: 1.1,
              width: qtyColWidth,
              textAlign: 'right',
              display: 'inline-block',
            }}
          >
            {item.quantity}x
          </span>
          <span
            className={`font-bold uppercase min-w-0 flex-1 break-words ${
              selected
                ? 'text-text-primary'
                : selectionMode
                  ? 'text-text-secondary line-through'
                  : 'line-through text-text-muted'
            } ${item.isCancelled ? 'line-through text-text-muted' : ''}`}
            style={{ fontSize: 'var(--kds-item-name)', lineHeight: 1.1, wordBreak: 'break-word' }}
          >
            {tp(item.name)}
          </span>
          {item.isCancelled && (
            <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1 py-px rounded shrink-0">
              CANCELLED
            </span>
          )}
        </div>
        {item.allergens.length > 0 && (
          <div className="flex items-start" style={{ gap: '4px', marginTop: 'var(--kds-child-gap, 1px)', lineHeight: 1 }}>
            <span
              className="invisible shrink-0 font-normal"
              aria-hidden="true"
              style={{ fontSize: 'var(--kds-item-qty)', lineHeight: 1, width: qtyColWidth, display: 'inline-block' }}
            >
              0x
            </span>
            <div className="flex flex-wrap items-start" style={{ gap: '4px', rowGap: '2px', lineHeight: 1 }}>
              {item.allergens.map((a) => (
                <AllergenBadge key={a.type} allergen={a} variant="item" suffix="allergy" />
              ))}
            </div>
          </div>
        )}
        {item.modifiers.length > 0 && (
          <div
            className="line-through"
            style={{
              opacity: 0.5,
              display: 'flex',
              flexDirection: 'column',
              marginTop: '-2px',
              gap: 'var(--kds-child-gap, 1px)',
              paddingLeft: detailIndent,
            }}
          >
            {item.modifiers.map((mod, idx) => (
              <ModifierLine
                key={mod.id || idx}
                modifier={mod}
                parentQuantity={item.quantity}
                compactQtyCol={isCompactLayout}
              />
            ))}
          </div>
        )}
        {item.notes && !item.isCancelled && (
          <div className="flex items-start" style={{ gap: '4px', marginTop: 'var(--kds-child-gap, 1px)', paddingLeft: detailIndent }}>
            <span
              className="invisible shrink-0 font-normal"
              aria-hidden="true"
              style={{ fontSize: 'var(--kds-item-qty)', width: qtyColWidth, display: 'inline-block' }}
            >
              0x
            </span>
            <div
              className="italic leading-snug min-w-0 text-text-muted line-through font-medium"
              style={{ fontSize: 'var(--kds-modifier)' }}
            >
              "{tn(item.notes)}"
            </div>
          </div>
        )}
      </div>
      {interactive && (
        <span
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{ background: '#E84C3D', width: 22, height: 22 }}
          aria-hidden="true"
          title="Tap to recall product"
        >
          <Undo size={14} color="#fff" strokeWidth={2.5} />
        </span>
      )}
      </div>
    </div>
  );
}


export function HistoryOrderCard({ order, compact, onRecall, onRecallItem, expoHeader }: HistoryOrderCardProps) {
  const { tp, tperson, tl, timeFormat } = useLanguage();
  const { orderTypeColors, ticketHeaderLayout, ticketLayout } = useKDSSettings();
  const headerBgColor = orderTypeColors[order.orderType] || DEFAULT_ORDER_TYPE_COLORS[order.orderType];
  const durationText = formatDuration(order.elapsedSeconds);
  const durationStyle = getDurationBadgeStyle(order.elapsedSeconds);
  const showCourses = DINE_IN_TYPES.has(order.orderType);
  const allItems = order.courses.flatMap(c => c.items);
  const isCompactLayout = ticketLayout === 'compact';

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [collapsedCourses, setCollapsedCourses] = useState<Set<string>>(new Set());
  const selectionMode = selectedIds.size > 0;

  const toggleCourse = useCallback((course: string) => {
    setCollapsedCourses(prev => {
      const next = new Set(prev);
      if (next.has(course)) next.delete(course);
      else next.add(course);
      return next;
    });
  }, []);

  const toggleSelect = useCallback((itemId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const handleItemTap = useCallback((item: OrderItem) => {
    if (selectionMode) {
      toggleSelect(item.id);
      return;
    }
    // Single tap (no selection in progress): recall immediately
    onRecallItem?.(order.id, item);
  }, [selectionMode, toggleSelect, onRecallItem, order.id]);

  const handleItemLongPress = useCallback((item: OrderItem) => {
    toggleSelect(item.id);
  }, [toggleSelect]);

  const handleBulkRecall = () => {
    const itemsById = new Map(allItems.map(i => [i.id, i]));
    selectedIds.forEach(id => {
      const it = itemsById.get(id);
      if (it) onRecallItem?.(order.id, it);
    });
    setSelectedIds(new Set());
  };

  if (compact) {
    const hasAllergens = order.courses.some(c => c.items.some(i => i.allergens.length > 0));
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Recall order ${order.orderNumber}`}
        onClick={() => onRecall?.(order.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onRecall?.(order.id);
          }
        }}
        className="rounded-lg overflow-hidden bg-surface-card shadow-sm border border-border opacity-70 cursor-pointer active:brightness-95 transition-all select-none"
      >
        <OrderTypeBadge
          type={order.orderType}
          time={formatTimeForKDS(order.timeReceived, timeFormat)}
        />
        <div className="p-3 text-center">
          <div className="text-order-num text-text-muted line-through">{order.orderNumber}</div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="text-modifier text-text-muted">{order.itemCount} products</span>
          </div>
          {hasAllergens && (
            <div className="mt-1.5 text-[11px] font-bold text-allergen flex items-center justify-center gap-1">
              <span>{'\u{1F95C}'}</span> has allergens
            </div>
          )}
          <div className="mt-2 flex justify-center">
            <span
              className="text-[11px] font-medium rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: durationStyle.bg, color: durationStyle.color }}
            >
              {durationText}
            </span>
          </div>
          <div className="mt-1">
            <span
              className="text-[10px] font-medium uppercase rounded px-2 py-0.5"
              style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
            >
              SERVED
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden bg-surface-card shadow-sm transition-all duration-300"
      style={{ minWidth: 'min(220px, 100%)' }}
    >
      {expoHeader ? (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Recall ticket ${order.orderNumber}`}
          onClick={() => { if (!selectionMode) onRecall?.(order.id); }}
          onKeyDown={(e) => {
            if (selectionMode) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRecall?.(order.id);
            }
          }}
          className={`select-none ${selectionMode ? 'cursor-default' : 'cursor-pointer active:brightness-95'}`}
        >
          {/* Row 1: Order type strip */}
          <div
            className="flex items-center px-2"
            style={{ backgroundColor: headerBgColor, height: '28px' }}
          >
            <span className="text-[11px] font-medium uppercase tracking-wide text-white leading-none">
              {(EXPO_ORDER_TYPE_LABEL[order.orderType] || order.orderType.toUpperCase())}
              {order.tableName ? <> &middot; {order.tableName}</> : null}
            </span>
          </div>
          {/* Row 2: Ticket info row (neutral dark, no urgency) */}
          <div
            className="flex items-center justify-between px-2"
            style={{ backgroundColor: '#2A2D36', height: '36px' }}
          >
            <span
              className="text-[18px] font-extrabold text-white leading-none tabular-nums"
              style={{ letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums' }}
            >
              {order.orderNumber}
            </span>
            <span
              className="text-[12px] font-medium leading-none"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              Sent {formatTimeForKDS(new Date(order.timeReceived.getTime() + order.elapsedSeconds * 1000), timeFormat)}
            </span>
          </div>
        </div>
      ) : (
      <>
      <div style={{ opacity: 0.65 }}>
        <OrderTypeBadge
          type={order.orderType}
          time={formatTimeForKDS(order.timeReceived, timeFormat)}
          tableInfo={getLocationLabel(order.orderType, order.tableName)}
        />
      </div>

      {/* Header: tap to recall the entire ticket. Disabled in selection mode. */}
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: headerBgColor, opacity: 0.65 }}
        />
        <div
          role="button"
          tabIndex={0}
          aria-label={`Recall ticket ${order.orderNumber}`}
          title={selectionMode ? 'Selection active' : 'Tap to recall ticket'}
          onClick={() => { if (!selectionMode) onRecall?.(order.id); }}
          onKeyDown={(e) => {
            if (selectionMode) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRecall?.(order.id);
            }
          }}
          className={`relative flex items-center justify-between select-none transition-all ${selectionMode ? 'cursor-default' : 'cursor-pointer active:brightness-95'}`}
          style={{ padding: '12px' }}
        >
          {isCompactLayout ? (
            <>
              {(() => {
                const useGuest = ticketHeaderLayout === 'guest' && !!order.guestName;
                if (useGuest) {
                  const translatedGuest = tperson(order.guestName!);
                  const parts = translatedGuest.trim().split(/\s+/);
                  const firstName = parts[0];
                  const restName = parts.slice(1).join(' ');
                  const longest = Math.max(firstName.length, restName.length);
                  const fontSize = longest > 12 ? 11 : longest > 9 ? 13 : longest > 6 ? 14 : 16;
                  return (
                    <div
                      className="text-white font-black min-w-0 leading-tight break-words line-through"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      <div>{firstName}</div>
                      {restName && <div>{restName}</div>}
                    </div>
                  );
                }
                return (
                  <div className="text-white font-black shrink-0 leading-none min-w-0 truncate line-through" style={{ fontSize: '28px' }}>
                    {order.orderNumber}
                  </div>
                );
              })()}
              <div className="flex flex-col items-end justify-center shrink-0 ml-2" style={{ gap: '4px' }}>
                <span
                  className="text-[11px] font-medium rounded-full inline-block"
                  style={{ backgroundColor: durationStyle.bg, color: durationStyle.color, padding: '2px 8px', borderRadius: 20 }}
                >
                  {durationText}
                </span>
                <span className="text-[12px] leading-none font-medium text-white/70 max-w-full text-right truncate">
                  {tperson(order.serverName)}
                </span>
              </div>
            </>
          ) : ticketHeaderLayout === 'kitchen' ? (
            <>
              <div className="text-white font-black shrink-0 line-through" style={{ fontSize: 'var(--kds-order-num)', lineHeight: '0.75' }}>
                {order.orderNumber}
              </div>
              <div className="flex flex-col items-end justify-center min-w-0 ml-2" style={{ gap: '6px' }}>
                <span className="flex items-center gap-1 text-[16px] leading-none font-medium text-white max-w-full">
                  <img src={PersonSimpleRunBold} alt="" width={14} height={14} className="invert opacity-90 shrink-0" />
                  <span className="text-right truncate min-w-0">{tperson(order.serverName)}</span>
                </span>
                {order.guestName ? (
                  <span className="flex items-center gap-1 text-[15px] leading-tight font-medium text-white max-w-full">
                    <img src={UsersBold} alt="" width={14} height={14} className="invert opacity-90 shrink-0" />
                    <span className="text-right break-words min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">{tperson(order.guestName)}</span>
                  </span>
                ) : (
                  <span className="h-[14px]" />
                )}
                <span
                  className="text-[11px] font-medium rounded-full inline-block"
                  style={{ backgroundColor: durationStyle.bg, color: durationStyle.color, padding: '3px 10px', borderRadius: 20 }}
                >
                  {durationText}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-[28px] font-black text-white leading-tight flex items-center min-w-0 flex-1 line-through">
                {order.guestName ? tperson(order.guestName) : order.orderNumber}
              </div>
              <div className="flex flex-col items-end justify-between self-stretch gap-1.5 shrink-0">
                <span className="flex items-center gap-1 text-[16px] font-medium text-white whitespace-nowrap min-w-0 max-w-full">
                  <img src={PersonSimpleRunBold} alt="" width={14} height={14} className="invert opacity-90 shrink-0" />
                  <span className="truncate min-w-0">{tperson(order.serverName)}</span>
                </span>
                <span className="text-[16px] font-semibold text-white line-through">
                  {order.orderNumber}
                </span>
                <span
                  className="text-[11px] font-medium rounded-full inline-block"
                  style={{ backgroundColor: durationStyle.bg, color: durationStyle.color, padding: '3px 10px', borderRadius: 20 }}
                >
                  {durationText}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      </>
      )}

      <OrderAllergenStrip order={order} compact={isCompactLayout} />

      {order.orderNotes && (
        <OrderNotesSection notes={order.orderNotes} orderId={order.id} />
      )}

      <div className="border-t border-border">
        {showCourses ? (
          order.courses.map((courseGroup) => {
            const collapsed = collapsedCourses.has(courseGroup.course);
            return (
              <div key={courseGroup.course}>
                <button
                  type="button"
                  onClick={() => toggleCourse(courseGroup.course)}
                  aria-expanded={!collapsed}
                  className="w-full flex items-center bg-muted hover:bg-muted/80 transition-colors select-none"
                  style={{ padding: '2px 8px', gap: '6px' }}
                >
                  <span
                    className={`text-text-muted transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`}
                    style={{ fontSize: 'var(--kds-course-header)', lineHeight: 1 }}
                  >
                    {'\u25B6'}
                  </span>
                  <span
                    className="uppercase text-text-primary tracking-wider"
                    style={{ fontWeight: 600, fontSize: 'var(--kds-course-header)' }}
                  >
                    {tl(courseGroup.course)}
                  </span>
                  {(() => {
                    const doneAt = new Date(order.timeReceived.getTime() + order.elapsedSeconds * 1000);
                    return (
                      <span
                        className="ml-auto text-text-muted"
                        style={{ fontSize: 'var(--kds-course-header)', fontWeight: 600 }}
                      >
                        Done at {formatTimeForKDS(doneAt, timeFormat)}
                      </span>
                    );
                  })()}
                </button>
                {!collapsed && (
                  <div className="px-1">
                    {courseGroup.items.map((item, idx, arr) => (
                      <HistoryItemRow
                        key={item.id}
                        item={item}
                        orderId={order.id}
                        isLast={idx === arr.length - 1}
                        selected={selectedIds.has(item.id)}
                        selectionMode={selectionMode}
                        onTap={() => handleItemTap(item)}
                        onLongPress={() => handleItemLongPress(item)}
                        tp={tp}
                        isCompactLayout={isCompactLayout}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-1">
            {allItems.map((item, idx, arr) => (
              <HistoryItemRow
                key={item.id}
                item={item}
                orderId={order.id}
                isLast={idx === arr.length - 1}
                selected={selectedIds.has(item.id)}
                selectionMode={selectionMode}
                onTap={() => handleItemTap(item)}
                onLongPress={() => handleItemLongPress(item)}
                tp={tp}
                isCompactLayout={isCompactLayout}
              />
            ))}
          </div>
        )}
      </div>

      {selectionMode && (
        <div className="border-t border-border bg-muted/40 p-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-[12px] font-semibold uppercase px-3 py-2 rounded bg-surface-card border border-border text-text-secondary hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBulkRecall}
            className="flex-1 text-[13px] font-bold uppercase px-3 py-2 rounded bg-primary text-primary-foreground hover:brightness-110 active:brightness-95 transition-all"
          >
            Recall {selectedIds.size}
          </button>
        </div>
      )}
    </div>
  );
}
