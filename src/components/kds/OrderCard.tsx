import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Order, CourseGroup, CourseType } from '@/types/kds';
import type { ItemStatus, StationStatus } from './CourseSection';
import { OrderTypeBadge } from './OrderTypeBadge';
import { CourseSection } from './CourseSection';
import { TimerBadge, getTimerUrgency } from './TimerBadge';
import { StatusChip } from './StatusChip';
import { useElapsedSeconds } from '@/hooks/use-elapsed';
import seenIcon from '@/assets/seen-icon.svg';
import preparingIcon from '@/assets/preparing-icon.svg';
import readyIcon from '@/assets/item-ready-icon.svg';
import undoIcon from '@/assets/undo-icon.svg';

interface OrderCardProps {
  order: Order;
  compact?: boolean;
  onBump?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
  onFireCourse?: (orderId: string, course: string) => void;
  /** When set, only matching course is highlighted; others are dimmed */
  stationCourse?: string;
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

/**
 * FIX 3: Normalize courses for station view.
 * Ensures every order shows a course before and after the station course.
 * Courses before station = fired, station = active, after = pending.
 */
function normalizeStationCourses(courses: CourseGroup[], stationCourse: string): CourseGroup[] {
  const result = courses.map(c => ({ ...c }));
  let stationIdx = result.findIndex(c => c.course === stationCourse);

  // If no course before station course, synthesize one
  if (stationIdx <= 0) {
    const hasSalad = result.some(c => c.course === 'SALAD');
    if (!hasSalad) {
      result.unshift({
        course: 'SALAD' as CourseType,
        items: [],
        isFired: true,
        firedAgoLabel: '4:20 ago',
      });
    }
  }

  // Refresh index
  stationIdx = result.findIndex(c => c.course === stationCourse);

  // If no course after station course, synthesize one
  if (stationIdx >= result.length - 1) {
    const hasDessert = result.some(c => c.course === 'DESSERT');
    if (!hasDessert) {
      result.push({
        course: 'DESSERT' as CourseType,
        items: [],
        autoFireLabel: 'Auto-fires in ~8 min',
      });
    }
  }

  // Refresh index
  stationIdx = result.findIndex(c => c.course === stationCourse);

  // Ensure courses before station have timer labels
  for (let i = 0; i < stationIdx; i++) {
    result[i] = {
      ...result[i],
      isFired: true,
      firedAgoLabel: result[i].firedAgoLabel || '4:20 ago',
    };
  }

  // Ensure station course has prep timer
  if (stationIdx >= 0 && !result[stationIdx].prepTimerLabel) {
    result[stationIdx] = { ...result[stationIdx], prepTimerLabel: '6:42' };
  }

  // Ensure courses after station have auto-fire label
  for (let i = stationIdx + 1; i < result.length; i++) {
    result[i] = {
      ...result[i],
      autoFireLabel: result[i].autoFireLabel || 'Auto-fires in ~8 min',
    };
  }

  return result;
}

export function OrderCard({ order, compact, onBump, onRecall, onFireCourse, stationCourse }: OrderCardProps) {
  const liveElapsed = useElapsedSeconds(order.timeReceived);
  const urgency = getTimerUrgency(liveElapsed, order.targetSeconds);
  const isServed = order.status === 'served';
  const [itemStatuses, setItemStatuses] = useState<Map<string, ItemStatus>>(new Map());

  const allItemIds = useMemo(() => 
    order.courses.flatMap(c => c.items.filter(i => !i.isCancelled).map(i => i.id)),
    [order.courses]
  );

  const handleAdvanceItem = useCallback((itemId: string, skipToDone?: boolean) => {
    setItemStatuses(prev => {
      const next = new Map(prev);
      if (skipToDone) {
        next.set(itemId, 'done');
        return next;
      }
      const current = next.get(itemId);
      if (!current) next.set(itemId, 'preparing');
      else if (current === 'preparing') next.set(itemId, 'ready');
      else if (current === 'ready') next.set(itemId, 'done');
      return next;
    });
  }, []);

  useEffect(() => {
    if (allItemIds.length > 0 && allItemIds.every(id => itemStatuses.get(id) === 'done')) {
      onBump?.(order.id);
    }
  }, [itemStatuses, allItemIds, onBump, order.id]);

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

  const buttonIcon = order.status === 'new' ? seenIcon :
    order.status === 'seen' ? preparingIcon : readyIcon;

  const buttonColorClass = order.status === 'new' ? 'bg-btn-seen' :
    order.status === 'seen' ? 'bg-btn-in-progress' : 'bg-btn-done';

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
            className="w-full py-2 bg-btn-done text-primary-foreground text-cta rounded uppercase flex items-center justify-center gap-2"
          >
            <img src={readyIcon} alt="" className="w-6 h-5 rounded-sm" />
            DONE
          </button>
        </div>
      </div>
    );
  }

  // FIX 3: Normalize courses for station view (ensure SALAD/ENTREE/DESSERT blocks)
  const displayCourses = stationCourse
    ? normalizeStationCourses(order.courses, stationCourse)
    : order.courses;

  // Compute station status per course based on position
  const stationIdx = stationCourse
    ? displayCourses.findIndex(c => c.course === stationCourse)
    : -1;

  // FIX 5: Auto-fire notification strip (show on ALL cards where prev course is fired)
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
      {/* FIX 1: Station badge in header without breaking layout */}
      <OrderTypeBadge
        type={order.orderType}
        time={formatTimeReceived(order.timeReceived)}
        tableInfo={order.tableName}
        stationBadge={stationCourse ? 'Entree station' : undefined}
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

      {/* FIX 5: Auto-fire notification strip on every card */}
      {stationNotification && (
        <div className="px-3 py-2 flex items-center gap-2 bg-success/10">
          <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
          <span className="text-[11px] font-medium text-success">
            {stationNotification}
          </span>
        </div>
      )}

      <div className="border-t border-border">
        {displayCourses.map((courseGroup, idx) => {
          // Compute station status based on position relative to station course
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
        })}
      </div>

      <div className="p-2 border-t border-border flex gap-2">
        {!isServed && order.status !== 'new' && (
          <button
            onClick={() => onRecall?.(order.id)}
            className="w-[44px] min-h-[44px] bg-muted rounded flex items-center justify-center hover:opacity-80 transition-colors shrink-0"
            title="Go back"
          >
            <img src={undoIcon} alt="Back" className="w-8 h-6" />
          </button>
        )}
        {!isServed && (
          <button
            onClick={() => onBump?.(order.id)}
            className={`flex-1 py-2.5 ${buttonColorClass} text-primary-foreground text-cta rounded flex items-center justify-center gap-2 uppercase hover:opacity-90 transition-colors min-h-[44px]`}
          >
            <img src={buttonIcon} alt="" className="w-6 h-5 rounded-sm" />
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
}
