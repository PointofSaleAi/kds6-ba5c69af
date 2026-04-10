import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import type { Order, StationName, OrderItem } from '@/types/kds';
import type { ItemStatus, StationStatus } from './CourseSection';
import { OrderTypeBadge } from './OrderTypeBadge';
import { CourseSection } from './CourseSection';
import { FlatItemList } from './FlatItemList';
import { TimerBadge, getTimerUrgency } from './TimerBadge';

import { useElapsedSeconds } from '@/hooks/use-elapsed';
import { CompactOrderCard } from './CompactOrderCard';
import { OrderAllergenStrip } from './OrderAllergenStrip';
import { OrderNotesSection } from './OrderNotesSection';
import { OrderCardActions } from './OrderCardActions';
import { normalizeStationCourses, getLocationLabel } from './station-utils';
import { ItemRoutingModal } from './ItemRoutingModal';
import { TicketRoutingModal } from './TicketRoutingModal';
import { useStatusRules } from '@/hooks/use-status-rules';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { UtensilsCrossed, UserRound } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  compact?: boolean;
  onBump?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
  onFireCourse?: (orderId: string, course: string) => void;
  onItemStatusChange?: (itemId: string, status: ItemStatus | undefined) => void;
  onAcknowledgeNotes?: (orderId: string) => void;
  stationCourse?: string;
  showAllergens?: boolean;
  highlightItemNames?: Set<string>;
}

const TEXT_SIZE_SCALE: Record<string, number> = {
  Compact: 0.85,
  Standard: 1,
  Large: 1.15,
};

const statusBodyMap: Record<string, string> = {
  new: '',
  'in-progress': '',
  seen: '',
  served: 'opacity-60 grayscale',
  overtime: 'bg-status-overtime/5',
  recalled: 'border-l-order-take-out',
};

export function OrderCard({ order, compact, onBump, onRecall, onFireCourse, onItemStatusChange, onAcknowledgeNotes, stationCourse, showAllergens = true, highlightItemNames }: OrderCardProps) {
  const { timeFormat } = useLanguage();
  const liveElapsed = useElapsedSeconds(order.timeReceived);
  const urgency = getTimerUrgency(liveElapsed, order.targetSeconds);
  const { getStatusForElapsed } = useStatusRules();
  const { textSize, ticketHeaderLayout } = useKDSSettings();
  const statusColor = getStatusForElapsed(liveElapsed);
  const scaleFactor = TEXT_SIZE_SCALE[textSize] || 1;
  const [itemStatuses, setItemStatuses] = useState<Map<string, ItemStatus>>(new Map());

  // Station overrides for re-routing
  const [stationOverrides, setStationOverrides] = useState<Map<string, StationName>>(new Map());

  // Modal state
  const [itemRouting, setItemRouting] = useState<OrderItem | null>(null);
  const [showTicketRouting, setShowTicketRouting] = useState(false);

  // Build order with station overrides applied
  const orderWithStations = useMemo(() => {
    if (stationOverrides.size === 0) return order;
    return {
      ...order,
      courses: order.courses.map(c => ({
        ...c,
        items: c.items.map(item => {
          const override = stationOverrides.get(item.id);
          return override ? { ...item, station: override } : item;
        }),
      })),
    };
  }, [order, stationOverrides]);

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

  const handleItemReRoute = useCallback((itemId: string, newStation: StationName) => {
    setStationOverrides(prev => {
      const next = new Map(prev);
      next.set(itemId, newStation);
      return next;
    });
  }, []);

  const handleTicketReRoute = useCallback((_orderId: string, newStation: StationName) => {
    setStationOverrides(prev => {
      const next = new Map(prev);
      order.courses.flatMap(c => c.items).filter(i => !i.isCancelled).forEach(item => {
        next.set(item.id, newStation);
      });
      return next;
    });
  }, [order.courses]);

  if (compact) {
    return <CompactOrderCard order={order} liveElapsed={liveElapsed} urgency={urgency} onBump={onBump} />;
  }

  const isDineIn = order.orderType === 'dine-in';

  const displayCourses = (stationCourse && isDineIn)
    ? normalizeStationCourses(orderWithStations.courses, stationCourse)
    : orderWithStations.courses;

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
    <>
      <div
        className={`rounded-lg overflow-hidden bg-surface-card shadow-sm ${statusBodyMap[order.status] || ''} transition-all duration-300`}
        style={{
          minWidth: 'min(220px, 100%)',
          fontSize: scaleFactor !== 1 ? `${scaleFactor}rem` : undefined,
        }}
      >
        {/* Tappable header area - opens ticket routing modal */}
        <div
          className="cursor-pointer active:brightness-110 transition-all"
          onClick={() => setShowTicketRouting(true)}
        >
          <OrderTypeBadge
            type={order.orderType}
            time={formatTimeForKDS(order.timeReceived, timeFormat)}
            tableInfo={getLocationLabel(order.orderType, order.tableName)}
            stationBadge={undefined}
          />

          <div
            className="px-3 py-3 flex items-stretch justify-between transition-all duration-200"
            style={{ backgroundColor: statusColor.color }}
          >
            {ticketHeaderLayout === 'kitchen' ? (
              <>
                <div className="text-order-num text-white leading-none">
                  {order.orderNumber}
                </div>
                <div className="flex flex-col items-end justify-end gap-0.5" style={{ paddingBottom: 6 }}>
                  <span className="flex items-center gap-1 text-[13px] font-medium text-white">
                    <UtensilsCrossed size={14} className="text-white" />
                    {order.serverName}
                  </span>
                  {order.guestName ? (
                    <span className="flex items-center gap-1 text-[13px] font-medium text-white">
                      <UserRound size={14} className="text-white" />
                      {order.guestName}
                    </span>
                  ) : (
                    <span className="h-[18px]" />
                  )}
                  <div>
                    <TimerBadge seconds={liveElapsed} urgency={urgency} invertColor />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-[28px] font-black text-white leading-tight flex items-center min-w-0 flex-1">
                  {order.guestName || order.orderNumber}
                </div>
                <div className="flex flex-col items-end justify-between self-stretch gap-0.5 shrink-0">
                  <span className="flex items-center gap-1 text-[13px] font-medium text-white whitespace-nowrap">
                    <UtensilsCrossed size={14} className="text-white shrink-0" />
                    {order.serverName}
                  </span>
                  <span className="text-[16px] font-semibold text-white">
                    {order.orderNumber}
                  </span>
                  <div className="mb-0.5">
                    <TimerBadge seconds={liveElapsed} urgency={urgency} invertColor />
                  </div>
                </div>
              </>
            )}
          </div>

          {showAllergens && <OrderAllergenStrip order={order} />}
        </div>

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
            [...displayCourses]
              .sort((a, b) => {
                const aFired = a.isFired ? 1 : 0;
                const bFired = b.isFired ? 1 : 0;
                return aFired - bFired;
              })
              .map((courseGroup) => {
                let forcedStatus: StationStatus | undefined;
                if (stationCourse && stationIdx >= 0) {
                  const originalIdx = displayCourses.indexOf(courseGroup);
                  if (originalIdx < stationIdx) forcedStatus = 'fired';
                  else if (originalIdx === stationIdx) forcedStatus = 'active';
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
                    onReRouteItem={(item) => setItemRouting(item)}
                    showAllergens={showAllergens}
                    highlightItemNames={highlightItemNames}
                  />
                );
              })
          ) : (
            <FlatItemList
              courses={orderWithStations.courses}
              itemStatuses={itemStatuses}
              onAdvanceItem={handleAdvanceItem}
              onUndoItem={handleUndoItem}
              onReRouteItem={(item) => setItemRouting(item)}
              showAllergens={showAllergens}
            />
          )}
        </div>

        <OrderCardActions
          orderId={order.id}
          status={order.status}
          isDineIn={isDineIn}
          onBump={onBump}
          onRecall={onRecall}
        />
      </div>

      {/* Item routing modal */}
      {itemRouting && (
        <ItemRoutingModal
          item={itemRouting}
          order={orderWithStations}
          onClose={() => setItemRouting(null)}
          onConfirm={handleItemReRoute}
        />
      )}

      {/* Ticket routing modal */}
      {showTicketRouting && (
        <TicketRoutingModal
          order={orderWithStations}
          onClose={() => setShowTicketRouting(false)}
          onConfirm={handleTicketReRoute}
        />
      )}
    </>
  );
}
