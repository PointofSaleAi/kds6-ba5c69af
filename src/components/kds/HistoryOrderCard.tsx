import { RotateCcw } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import type { Order } from '@/types/kds';
import { OrderTypeBadge } from './OrderTypeBadge';
import { AllergenBadge } from './AllergenBadge';
import { ModifierLine } from './ModifierLine';

interface HistoryOrderCardProps {
  order: Order;
  compact?: boolean;
  onRecall?: (orderId: string) => void;
}

function formatTimeReceived(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDuration(seconds: number): string {
  const min = Math.round(seconds / 60);
  return `${min} min total`;
}

export function HistoryOrderCard({ order, compact, onRecall }: HistoryOrderCardProps) {
  const { tp } = useLanguage();
  const durationText = formatDuration(order.elapsedSeconds);
  const isOverTarget = order.elapsedSeconds > order.targetSeconds;

  if (compact) {
    const hasAllergens = order.courses.some(c => c.items.some(i => i.allergens.length > 0));
    return (
      <div className="rounded-lg overflow-hidden bg-surface-card shadow-sm border border-border opacity-70">
        <OrderTypeBadge
          type={order.orderType}
          time={formatTimeReceived(order.timeReceived)}
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
      <div className="relative">
        <OrderTypeBadge
          type={order.orderType}
          time={formatTimeReceived(order.timeReceived)}
          tableInfo={order.tableName}
        />
        <span className="absolute top-1.5 right-2 text-[10px] font-bold uppercase text-text-muted bg-muted/80 px-2 py-0.5 rounded">
          SERVED
        </span>
      </div>

      <div className="px-3 pt-2 pb-1">
        <div className="flex items-start justify-between">
          <div className="text-order-num text-text-muted leading-none line-through">
            {order.orderNumber}
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className={`text-[13px] font-mono ${isOverTarget ? 'text-destructive' : 'text-text-muted'}`}>
            {durationText}
          </span>
          <span className="text-modifier text-text-muted">{order.serverName}</span>
        </div>
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
                      {item.quantity}&times; {item.name}
                    </span>
                    {item.isCancelled && (
                      <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                        CANCELLED
                      </span>
                    )}
                  </div>
                  {item.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 pl-5">
                      <span className="text-[12px] font-bold text-allergen">Allergies</span>
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
