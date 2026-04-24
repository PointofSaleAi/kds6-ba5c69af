import { useState } from 'react';
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
}

interface HistoryItemRowProps {
  item: OrderItem;
  orderId: string;
  isLast: boolean;
  onRecallItem?: (orderId: string, item: OrderItem) => void;
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

/**
 * History item row: tap anywhere on the row to recall the item.
 * Matches the Home screen item row spacing (`py-0.5`, `text-item-name`)
 * and supports the same allergen/modifier stack.
 */
function HistoryItemRow({ item, orderId, isLast, onRecallItem, tp }: HistoryItemRowProps) {
  const [recalled, setRecalled] = useState(false);
  const interactive = !!onRecallItem && !item.isCancelled && !recalled;

  const handleRecall = () => {
    if (!interactive) return;
    setRecalled(true);
    onRecallItem?.(orderId, item);
  };

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Recall ${item.name}` : undefined}
      onClick={handleRecall}
      onKeyDown={(e) => {
        if (!interactive) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRecall();
        }
      }}
      className={`-mx-1 px-1 select-none transition-colors ${
        isLast ? '' : 'border-b border-border/50'
      } ${item.isCancelled ? 'opacity-50' : ''} ${
        interactive ? 'cursor-pointer active:bg-muted/40 hover:bg-muted/30' : ''
      }`}
      style={{ paddingTop: '2px', paddingBottom: isLast ? '6px' : '2px' }}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-item-name ${
                recalled
                  ? 'text-text-primary'
                  : 'line-through text-text-muted'
              } ${item.isCancelled ? 'text-text-muted' : ''}`}
            >
              {item.quantity}&times; {tp(item.name)}
            </span>
            {item.isCancelled && (
              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                CANCELLED
              </span>
            )}
          </div>
          {item.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 pl-5">
              {item.allergens.map((a) => (
                <AllergenBadge key={a.type} allergen={a} />
              ))}
            </div>
          )}
          {item.modifiers.map((mod, idx) => (
            <ModifierLine key={idx} modifier={mod} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HistoryOrderCard({ order, compact, onRecall, onRecallItem }: HistoryOrderCardProps) {
  const { tp, tperson, tl, timeFormat } = useLanguage();
  const { orderTypeColors, ticketHeaderLayout, ticketLayout } = useKDSSettings();
  const headerBgColor = orderTypeColors[order.orderType] || DEFAULT_ORDER_TYPE_COLORS[order.orderType];
  const durationText = formatDuration(order.elapsedSeconds);
  const durationStyle = getDurationBadgeStyle(order.elapsedSeconds);
  const showCourses = DINE_IN_TYPES.has(order.orderType);
  const allItems = order.courses.flatMap(c => c.items);
  const isCompactLayout = ticketLayout === 'compact';

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
      <div style={{ opacity: 0.65 }}>
        <OrderTypeBadge
          type={order.orderType}
          time={formatTimeForKDS(order.timeReceived, timeFormat)}
          tableInfo={getLocationLabel(order.orderType, order.tableName)}
        />
      </div>

      {/* Header: tap to recall the entire ticket. Mirrors Home card header. */}
      <div className="relative">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: headerBgColor, opacity: 0.65 }}
        />
        <div
          role="button"
          tabIndex={0}
          aria-label={`Recall ticket ${order.orderNumber}`}
          title="Tap to recall ticket"
          onClick={() => onRecall?.(order.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRecall?.(order.id);
            }
          }}
          className="relative flex items-center justify-between cursor-pointer select-none active:brightness-95 transition-all"
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
                <span className="text-[12px] leading-none font-medium text-white/70 max-w-full text-right break-words">
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
                  <span className="text-right break-words min-w-0">{tperson(order.serverName)}</span>
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
                <span className="flex items-center gap-1 text-[16px] font-medium text-white whitespace-nowrap">
                  <img src={PersonSimpleRunBold} alt="" width={14} height={14} className="invert opacity-90 shrink-0" />
                  {tperson(order.serverName)}
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

      <OrderAllergenStrip order={order} compact={isCompactLayout} />

      {order.orderNotes && (
        <OrderNotesSection notes={order.orderNotes} orderId={order.id} />
      )}

      <div className="border-t border-border">
        {showCourses ? (
          order.courses.map((courseGroup) => (
            <div key={courseGroup.course}>
              <div
                className="flex items-center justify-between bg-muted"
                style={{ padding: '2px 8px' }}
              >
                <span
                  className="uppercase text-text-primary tracking-wider"
                  style={{ fontWeight: 600, fontSize: 'var(--kds-course-header)' }}
                >
                  {tl(courseGroup.course)}
                </span>
              </div>
              <div className="px-1">
                {courseGroup.items.map((item, idx, arr) => (
                  <HistoryItemRow
                    key={item.id}
                    item={item}
                    orderId={order.id}
                    isLast={idx === arr.length - 1}
                    onRecallItem={onRecallItem}
                    tp={tp}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="px-1">
            {allItems.map((item, idx, arr) => (
              <HistoryItemRow
                key={item.id}
                item={item}
                orderId={order.id}
                isLast={idx === arr.length - 1}
                onRecallItem={onRecallItem}
                tp={tp}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
