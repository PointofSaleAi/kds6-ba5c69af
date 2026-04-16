import { useMemo, useCallback } from 'react';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import type { Order, OrderType } from '@/types/kds';

function getLocationLabel(orderType: OrderType, tableName?: string): string | undefined {
  if (!tableName) return undefined;
  const upper = tableName.toUpperCase();
  if (orderType === 'take-out' && (upper === 'PICKUP' || upper === 'TAKE OUT')) return undefined;
  if (orderType === 'delivery' && upper === 'DELIVERY') return undefined;
  return tableName;
}
import { OrderTypeBadge } from './OrderTypeBadge';
import { TimerBadge, getTimerUrgency } from './TimerBadge';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { useStatusRules } from '@/hooks/use-status-rules';
import readyIcon from '@/assets/item-ready-icon.svg';

interface ExpoOrderCardProps {
  order: Order;
  onBump?: (orderId: string) => void;
}

// Using formatTimeForKDS from context

export function ExpoOrderCard({ order, onBump }: ExpoOrderCardProps) {
  const { timeFormat } = useLanguage();
  const liveElapsed = useElapsedSeconds(order.timeReceived);
  const urgency = getTimerUrgency(liveElapsed, order.targetSeconds);

  const totalItems = useMemo(() =>
    order.courses.reduce((sum, c) => sum + c.items.filter(i => !i.isCancelled).length, 0),
    [order.courses]
  );

  const completedItems = useMemo(() =>
    order.courses.reduce((sum, c) => sum + c.items.filter(i => i.isCompleted).length, 0),
    [order.courses]
  );

  const allCourses = useMemo(() =>
    order.courses.map(c => c.course).join(', '),
    [order.courses]
  );

  const urgencyBorder = {
    ok: 'border-l-success',
    warning: 'border-l-warning',
    critical: 'border-l-destructive',
    overtime: 'border-l-status-overtime',
  }[urgency];

  return (
    <div className={`rounded-lg overflow-hidden bg-surface-card shadow-sm border-l-4 ${urgencyBorder} transition-all duration-300`}>
      <OrderTypeBadge
        type={order.orderType}
        time={formatTimeForKDS(order.timeReceived, timeFormat)}
        tableInfo={getLocationLabel(order.orderType, order.tableName)}
      />

      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="text-order-num text-text-primary leading-none">
            {order.orderNumber}
          </div>
          <TimerBadge seconds={liveElapsed} urgency={urgency} />
        </div>

        <div className="text-modifier text-text-secondary mt-1">{order.serverName}</div>

        {/* Item progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Items</span>
            <span className="text-[11px] text-text-muted">{completedItems} / {totalItems}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full">
            <div
              className="h-full bg-success rounded-full transition-all"
              style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Courses summary */}
        <div className="mt-2 text-[11px] text-text-muted">{allCourses}</div>
      </div>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => onBump?.(order.id)}
          className="w-full py-2.5 bg-btn-done text-primary-foreground text-cta rounded flex items-center justify-center gap-2 uppercase hover:opacity-90 transition-colors min-h-[44px]"
        >
          <img src={readyIcon} alt="" className="w-6 h-5 rounded-sm" />
          BUMP
        </button>
      </div>
    </div>
  );
}
