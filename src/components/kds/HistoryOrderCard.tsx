import { RotateCcw } from 'lucide-react';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import type { Order } from '@/types/kds';
import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS } from '@/hooks/use-kds-settings';
import { OrderTypeBadge } from './OrderTypeBadge';
import { AllergenBadge } from './AllergenBadge';
import { ModifierLine } from './ModifierLine';
import { getLocationLabel } from './station-utils';
import PersonSimpleRunBold from '@/assets/person-simple-run-bold.svg';
import UsersBold from '@/assets/users-bold.svg';

interface HistoryOrderCardProps {
  order: Order;
  compact?: boolean;
  onRecall?: (orderId: string) => void;
}

function formatDuration(seconds: number): string {
  const min = Math.round(seconds / 60);
  return `${min} min total`;
}

export function HistoryOrderCard({ order, compact, onRecall }: HistoryOrderCardProps) {
  const { tp, timeFormat } = useLanguage();
  const { orderTypeColors, ticketHeaderLayout } = useKDSSettings();
  const headerBgColor = orderTypeColors[order.orderType] || DEFAULT_ORDER_TYPE_COLORS[order.orderType];
  const durationText = formatDuration(order.elapsedSeconds);
  const isOverTarget = order.elapsedSeconds > order.targetSeconds;

  // Served status color - light grey per brand spec
  const servedColor = '#95A5A6';

  if (compact) {
    const hasAllergens = order.courses.some(c => c.items.some(i => i.allergens.length > 0));
    return (
      <div className="rounded-lg overflow-hidden bg-surface-card shadow-sm border border-border opacity-70">
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
          <div className="mt-2">
            <span className={`text-[13px] font-mono ${isOverTarget ? 'text-destructive' : 'text-text-muted'}`}>
              {durationText}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-[10px] font-bold uppercase text-text-muted bg-muted px-2 py-0.5 rounded">SERVED</span>
          </div>
        </div>
        <div className="px-2 pb-2">
          <button
            onClick={() => onRecall?.(order.id)}
            className="w-full py-2 bg-order-take-out text-primary-foreground text-cta rounded uppercase flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            RECALL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden bg-surface-card shadow-sm border-l-4 border-l-text-muted opacity-80 transition-all duration-300"
      style={{ minWidth: 'min(220px, 100%)' }}
    >
      {/* Header - matches home screen layout */}
      <OrderTypeBadge
        type={order.orderType}
        time={formatTimeForKDS(order.timeReceived, timeFormat)}
        tableInfo={getLocationLabel(order.orderType, order.tableName)}
      />

      <div
        className="px-3 py-3 flex items-stretch justify-between transition-all duration-200 relative"
        style={{ backgroundColor: servedColor }}
      >
        {ticketHeaderLayout === 'kitchen' ? (
          <>
            <div className="text-order-num text-white leading-none line-through">
              {order.orderNumber}
            </div>
            <div className="flex flex-col items-end justify-end gap-0.5" style={{ paddingBottom: 6 }}>
              <span className="flex items-center gap-1 text-[13px] font-medium text-white">
                <img src={PersonSimpleRunBold} alt="" width={14} height={14} className="invert" />
                {order.serverName}
              </span>
              {order.guestName ? (
                <span className="flex items-center gap-1 text-[13px] font-medium text-white">
                  <img src={UsersBold} alt="" width={14} height={14} className="invert" />
                  {order.guestName}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[13px] font-medium text-white/60">
                  <img src={UsersBold} alt="" width={14} height={14} className="invert opacity-60" />
                  -
                </span>
              )}
              <div>
                <span className={`text-[13px] font-mono ${isOverTarget ? 'text-destructive' : 'text-white/80'}`}>
                  {durationText}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-[28px] font-black text-white leading-tight flex items-center min-w-0 flex-1 line-through">
              {order.guestName || order.orderNumber}
            </div>
            <div className="flex flex-col items-end justify-between self-stretch gap-0.5 shrink-0">
              <span className="flex items-center gap-1 text-[13px] font-medium text-white whitespace-nowrap">
                <img src={PersonSimpleRunBold} alt="" width={14} height={14} className="invert" />
                {order.serverName}
              </span>
              <span className="text-[16px] font-semibold text-white line-through">
                {order.orderNumber}
              </span>
              <span className={`text-[13px] font-mono ${isOverTarget ? 'text-destructive' : 'text-white/80'}`}>
                {durationText}
              </span>
            </div>
          </>
        )}

        <span className="absolute top-1.5 right-2 text-[10px] font-bold uppercase text-white bg-white/20 px-2 py-0.5 rounded">
          SERVED
        </span>
      </div>

      <div className="border-t border-border">
        {order.courses.map((courseGroup) => (
          <div key={courseGroup.course}>
            <div className="flex items-center justify-between bg-muted px-3 py-1.5 mt-1">
              <span className="text-section-label uppercase text-text-muted tracking-widest">
                {courseGroup.course}
              </span>
            </div>
            <div className="px-3 py-1">
              {courseGroup.items.map((item) => (
                <div key={item.id} className={`py-1.5 ${item.isCancelled ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-item-name line-through ${item.isCancelled ? 'text-text-muted' : 'text-text-muted'}`}>
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
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => onRecall?.(order.id)}
          className="flex-1 w-full py-2.5 bg-order-take-out text-primary-foreground text-cta rounded flex items-center justify-center gap-2 uppercase hover:bg-order-take-out/90 transition-colors min-h-[44px]"
        >
          <RotateCcw size={14} />
          RECALL
        </button>
      </div>
    </div>
  );
}
