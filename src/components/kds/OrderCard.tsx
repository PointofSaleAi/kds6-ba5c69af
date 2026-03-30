import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Order } from '@/types/kds';
import type { ItemStatus } from './CourseSection';
import { OrderTypeBadge } from './OrderTypeBadge';
import { CourseSection } from './CourseSection';
import { TimerBadge, getTimerUrgency } from './TimerBadge';
import { StatusChip } from './StatusChip';
import { useElapsedSeconds } from '@/hooks/use-elapsed';

interface OrderCardProps {
  order: Order;
  compact?: boolean;
  onBump?: (orderId: string) => void;
  onFireCourse?: (orderId: string, course: string) => void;
}

function formatTimeReceived(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const urgencyBorderMap = {
  ok: 'border-l-success',
  warning: 'border-l-warning',
  critical: 'border-l-destructive',
  overtime: 'border-l-status-overtime',
};

const statusBodyMap: Record<string, string> = {
  new: '',
  'in-progress': '',
  seen: '',
  served: 'opacity-60 grayscale',
  overtime: 'bg-status-overtime/5',
  recalled: 'border-l-order-take-out',
};

export function OrderCard({ order, compact, onBump, onFireCourse }: OrderCardProps) {
  const liveElapsed = useElapsedSeconds(order.timeReceived);
  const urgency = getTimerUrgency(liveElapsed, order.targetSeconds);
  const isServed = order.status === 'served';
  const [itemStatuses, setItemStatuses] = useState<Map<string, ItemStatus>>(new Map());

  const handleAdvanceItem = useCallback((itemId: string) => {
    setItemStatuses(prev => {
      const next = new Map(prev);
      const current = next.get(itemId);
      if (!current) next.set(itemId, 'preparing');
      else if (current === 'preparing') next.set(itemId, 'ready');
      else if (current === 'ready') next.set(itemId, 'done');
      return next;
    });
  }, []);

  const handleUndoItem = useCallback((itemId: string) => {
    setItemStatuses(prev => {
      const next = new Map(prev);
      const current = next.get(itemId);
      if (current === 'ready') next.set(itemId, 'preparing');
      else next.delete(itemId);
      return next;
    });
  }, []);

  const buttonLabel = order.status === 'new' ? 'SEEN' :
    order.status === 'seen' ? 'IN PROGRESS' : 'DONE';

  if (compact) {
    const hasAllergens = order.courses.some(c => c.items.some(i => i.allergens.length > 0));
    return (
      <div className={`rounded-lg overflow-hidden bg-surface-card shadow-sm border border-border ${statusBodyMap[order.status] || ''}`}>
        <OrderTypeBadge
          type={order.orderType}
          time={formatTimeReceived(order.timeReceived)}
        />
        <div className="p-3 text-center">
          <div className="text-order-num text-text-primary">{order.orderNumber}</div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="text-modifier text-text-secondary">{order.itemCount} products</span>
          </div>
          {hasAllergens && (
            <div className="mt-1.5 text-[11px] font-bold text-allergen flex items-center justify-center gap-1">
              <span>{'\u{1F95C}'}</span> has allergens
            </div>
          )}
          <div className="mt-2">
            <TimerBadge seconds={liveElapsed} urgency={urgency} />
          </div>
        </div>
        <div className="px-2 pb-2">
          <button
            onClick={() => onBump?.(order.id)}
            className="w-full py-2 bg-brand-dark text-primary-foreground text-cta rounded uppercase"
          >
            DONE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg overflow-hidden bg-surface-card shadow-sm border-l-4 ${urgencyBorderMap[urgency]} ${statusBodyMap[order.status] || ''} transition-all duration-300`}
      style={{ minWidth: 220 }}
    >
      <OrderTypeBadge
        type={order.orderType}
        time={formatTimeReceived(order.timeReceived)}
        tableInfo={order.tableName}
      />

      <div className="px-3 pt-2 pb-1">
        <div className="flex items-start justify-between">
          <div className="text-order-num text-text-primary leading-none">
            {order.orderNumber}
          </div>
          <StatusChip status={order.status} />
        </div>

        <div className="flex items-center justify-between mt-1">
          <TimerBadge seconds={liveElapsed} urgency={urgency} />
          <span className="text-modifier text-text-secondary">{order.serverName}</span>
        </div>
      </div>

      <div className="border-t border-border">
        {order.courses.map((courseGroup) => (
          <CourseSection
            key={courseGroup.course}
            courseGroup={courseGroup}
            onFireCourse={onFireCourse ? (course) => onFireCourse(order.id, course) : undefined}
            itemStatuses={itemStatuses}
            onAdvanceItem={handleAdvanceItem}
            onUndoItem={handleUndoItem}
          />
        ))}
      </div>

      <div className="p-2 border-t border-border flex gap-2">
        {!isServed && (
          <button
            onClick={() => onBump?.(order.id)}
            className="flex-1 py-2.5 bg-brand-dark text-primary-foreground text-cta rounded flex items-center justify-center gap-2 uppercase hover:bg-brand-dark/90 transition-colors min-h-[44px]"
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
}
