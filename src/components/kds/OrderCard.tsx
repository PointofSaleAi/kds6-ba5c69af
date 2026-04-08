import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import type { Order } from '@/types/kds';
import type { ItemStatus, StationStatus } from './CourseSection';
import { OrderTypeBadge } from './OrderTypeBadge';
import { CourseSection } from './CourseSection';
import { FlatItemList } from './FlatItemList';
import { TimerBadge, getTimerUrgency } from './TimerBadge';
import { StatusChip } from './StatusChip';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { CompactOrderCard } from './CompactOrderCard';
import { OrderAllergenStrip } from './OrderAllergenStrip';
import { OrderNotesSection } from './OrderNotesSection';
import { OrderCardActions } from './OrderCardActions';
import { normalizeStationCourses, getLocationLabel } from './station-utils';

interface OrderCardProps {
  order: Order;
  compact?: boolean;
  onBump?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
  onFireCourse?: (orderId: string, course: string) => void;
  onItemStatusChange?: (itemId: string, status: ItemStatus | undefined) => void;
  onAcknowledgeNotes?: (orderId: string) => void;
  /** When set, only matching course is highlighted; others are dimmed */
  stationCourse?: string;
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

export function OrderCard({ order, compact, onBump, onRecall, onFireCourse, onItemStatusChange, onAcknowledgeNotes, stationCourse }: OrderCardProps) {
  const { timeFormat } = useLanguage();
  const liveElapsed = useElapsedSeconds(order.timeReceived);
  const urgency = getTimerUrgency(liveElapsed, order.targetSeconds);
  const [itemStatuses, setItemStatuses] = useState<Map<string, ItemStatus>>(new Map());

  const allItemIds = useMemo(() =>
    order.courses.flatMap(c => c.items.filter(i => !i.isCancelled).map(i => i.id)),
    [order.courses]
  );

  const handleAdvanceItem = useCallback((itemId: string, skipToDone?: boolean) => {
    setItemStatuses(prev => {
      const next = new Map(prev);
      let newStatus: ItemStatus;
      if (skipToDone) {
        newStatus = 'done';
      } else {
        const current = next.get(itemId);
        if (!current) newStatus = 'preparing';
        else if (current === 'preparing') newStatus = 'ready';
        else newStatus = 'done';
      }
      next.set(itemId, newStatus);
      onItemStatusChange?.(itemId, newStatus);
      return next;
    });
  }, [onItemStatusChange]);

  useEffect(() => {
    if (allItemIds.length > 0 && allItemIds.every(id => itemStatuses.get(id) === 'done')) {
      onBump?.(order.id);
    }
  }, [itemStatuses, allItemIds, onBump, order.id]);

  const handleUndoItem = useCallback((itemId: string) => {
    setItemStatuses(prev => {
      const next = new Map(prev);
      const current = next.get(itemId);
      if (current === 'ready') {
        next.set(itemId, 'preparing');
        onItemStatusChange?.(itemId, 'preparing');
      } else {
        next.delete(itemId);
        onItemStatusChange?.(itemId, undefined);
      }
      return next;
    });
  }, [onItemStatusChange]);

  if (compact) {
    return <CompactOrderCard order={order} liveElapsed={liveElapsed} urgency={urgency} onBump={onBump} />;
  }

  const isDineIn = order.orderType === 'dine-in';

  const displayCourses = (stationCourse && isDineIn)
    ? normalizeStationCourses(order.courses, stationCourse)
    : order.courses;

  const stationIdx = stationCourse
    ? displayCourses.findIndex(c => c.course === stationCourse)
    : -1;

  const stationNotification = stationCourse && stationIdx > 0 ? (() => {
    const prevCourse = displayCourses[stationIdx - 1];
    const prevName = prevCourse.course.charAt(0) + prevCourse.course.slice(1).toLowerCase();
    const stationName = stationCourse.charAt(0) + stationCourse.slice(1).toLowerCase();
    return `${prevName} fired ${prevCourse.firedAgoLabel || 'recently'}, ${stationName.toLowerCase()} prep triggered automatically`;
  })() : null;

  return (
    <div
      className={`rounded-lg overflow-hidden bg-surface-card shadow-sm border-l-4 ${urgencyBorderMap[urgency]} ${statusBodyMap[order.status] || ''} transition-all duration-300`}
      style={{ minWidth: 'min(220px, 100%)' }}
    >
      <OrderTypeBadge
        type={order.orderType}
        time={formatTimeForKDS(order.timeReceived, timeFormat)}
        tableInfo={getLocationLabel(order.orderType, order.tableName)}
        stationBadge={undefined}
      />

      <div className="px-2 pt-1.5 pb-1">
        <div className="flex items-start justify-between">
          <div className="text-order-num text-text-primary leading-none">
            {order.orderNumber}
          </div>
          <StatusChip status={order.status} />
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <TimerBadge seconds={liveElapsed} urgency={urgency} />
          <span className="text-modifier text-text-secondary">{order.serverName}</span>
        </div>
      </div>

      <OrderAllergenStrip order={order} />

      {order.orderNotes && (
        <OrderNotesSection
          notes={order.orderNotes}
          orderId={order.id}
          onAcknowledgeNotes={onAcknowledgeNotes}
        />
      )}

      {isDineIn && stationNotification && (
        <div className="px-2 py-1 flex items-center gap-1.5 bg-success/10">
          <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
          <span className="text-[10px] font-medium text-success">
            {stationNotification}
          </span>
        </div>
      )}

      <div className="border-t border-border">
        {isDineIn ? (
          displayCourses.map((courseGroup, idx) => {
            let forcedStatus: StationStatus | undefined;
            if (stationCourse && stationIdx >= 0) {
              if (idx < stationIdx) forcedStatus = 'fired';
              else if (idx === stationIdx) forcedStatus = 'active';
              else forcedStatus = 'pending';
            }
            return (
              <CourseSection
                key={courseGroup.course}
                courseGroup={courseGroup}
                onFireCourse={onFireCourse ? (course) => onFireCourse(order.id, course) : undefined}
                itemStatuses={itemStatuses}
                onAdvanceItem={handleAdvanceItem}
                onUndoItem={handleUndoItem}
                stationCourse={stationCourse}
                forcedStationStatus={forcedStatus}
              />
            );
          })
        ) : (
          <FlatItemList
            courses={order.courses}
            itemStatuses={itemStatuses}
            onAdvanceItem={handleAdvanceItem}
            onUndoItem={handleUndoItem}
          />
        )}
      </div>

      <OrderCardActions
        orderId={order.id}
        status={order.status}
        onBump={onBump}
        onRecall={onRecall}
      />
    </div>
  );
}
