import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import type { Order, StationName, OrderItem } from '@/types/kds';
import type { ItemStatus, StationStatus } from './CourseSection';
import type { ModifierStatus } from './ModifierLine';
import type { TicketState } from './OrderCardActions';
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
import { KitchenMessageSection } from './KitchenMessageSection';
import { useStatusRules } from '@/hooks/use-status-rules';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { useKitchenMessages } from '@/hooks/use-kitchen-messages';
import PersonSimpleRunBold from '@/assets/person-simple-run-bold.svg';
import UsersBold from '@/assets/users-bold.svg';

interface OrderCardProps {
  order: Order;
  compact?: boolean;
  onBump?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
  onFireCourse?: (orderId: string, course: string) => void;
  onItemStatusChange?: (itemId: string, status: ItemStatus | undefined) => void;
  onAcknowledgeNotes?: (orderId: string) => void;
  onMarkSeen?: (orderId: string) => void;
  onItemDismiss?: (orderId: string, item: OrderItem) => void;
  stationCourse?: string;
  showAllergens?: boolean;
  highlightItemNames?: Set<string>;
  /** When true (grid view), apply tighter row spacing inside courses. */
  compactRows?: boolean;
  /** Override the global ticketLayout setting (used by previews). */
  layoutOverride?: 'standard' | 'compact';
}

// Text size scaling is now handled via CSS custom properties (--kds-*)

const statusBodyMap: Record<string, string> = {
  new: '',
  'in-progress': '',
  seen: '',
  served: 'opacity-60 grayscale',
  overtime: 'bg-status-overtime/5',
  recalled: 'border-l-order-take-out',
};

/** Format a Date to HH:MM for timestamps */
function formatStaticTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function OrderCard({ order, compact, onBump, onRecall, onFireCourse, onItemStatusChange, onAcknowledgeNotes, onMarkSeen, onItemDismiss, stationCourse, showAllergens = true, highlightItemNames, compactRows, layoutOverride }: OrderCardProps) {
  const { timeFormat, tperson, tl } = useLanguage();
  const { servableModifiers: servableModifiersEnabled } = useKDSSettings();
  const { getMessagesForOrder, getRepliesForMessage, acknowledgeMessage, sendReply, replies } = useKitchenMessages();
  const orderMessages = getMessagesForOrder(order.id);
  const liveElapsed = useElapsedSeconds(order.timeReceived);
  const urgency = getTimerUrgency(liveElapsed, order.targetSeconds);
  const { getStatusForElapsed, courseLevelAging } = useStatusRules();
  const { ticketHeaderLayout, ticketLayout } = useKDSSettings();
  const resolvedTicketLayout: 'standard' | 'compact' = layoutOverride ?? ticketLayout;
  const isCompactLayout = resolvedTicketLayout === 'compact';
  const statusColor = getStatusForElapsed(liveElapsed);
  const [itemStatuses, setItemStatuses] = useState<Map<string, ItemStatus>>(new Map());
  const [itemTimestamps, setItemTimestamps] = useState<Map<string, { seenAt?: string; doneAt?: string }>>(new Map());
  const [dismissedItemIds, setDismissedItemIds] = useState<Set<string>>(new Set());
  // FIX 3: Track the order in which items were first marked seen within this ticket.
  // Even index (0, 2, ...) = green tint, odd index (1, 3, ...) = teal tint.
  const [seenOrderIndex, setSeenOrderIndex] = useState<Map<string, number>>(new Map());
  const seenOrderCounterRef = (useMemo(() => ({ current: 0 }), []) as { current: number });

  const assignSeenIndex = useCallback((ids: string[]) => {
    setSeenOrderIndex(prev => {
      const next = new Map(prev);
      let changed = false;
      for (const id of ids) {
        if (!next.has(id)) {
          next.set(id, seenOrderCounterRef.current);
          seenOrderCounterRef.current += 1;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [seenOrderCounterRef]);

  const clearSeenIndex = useCallback((id: string) => {
    setSeenOrderIndex(prev => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleDismissItem = useCallback((itemId: string) => {
    setDismissedItemIds(prev => {
      if (prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
    // Find the OrderItem and notify parent so it can move to history
    for (const c of order.courses) {
      const found = c.items.find(i => i.id === itemId);
      if (found) {
        onItemDismiss?.(order.id, found);
        break;
      }
    }
  }, [order, onItemDismiss]);

  // Servable modifier statuses
  const [modifierStatuses, setModifierStatuses] = useState<Map<string, ModifierStatus>>(new Map());

  const handleAdvanceModifier = useCallback((modId: string) => {
    setModifierStatuses(prev => {
      const next = new Map(prev);
      const current = next.get(modId);
      if (!current) next.set(modId, 'preparing');
      else if (current === 'preparing') next.set(modId, 'done');
      else next.set(modId, 'done');
      return next;
    });
  }, []);

  const handleUndoModifier = useCallback((modId: string) => {
    setModifierStatuses(prev => {
      const next = new Map(prev);
      const current = next.get(modId);
      if (current === 'done') next.set(modId, 'preparing');
      else next.delete(modId);
      return next;
    });
  }, []);

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

  const isDineIn = order.orderType === 'dine-in';

  const displayCourses = (stationCourse && isDineIn)
    ? normalizeStationCourses(orderWithStations.courses, stationCourse)
    : orderWithStations.courses;

  // Track "Done at" timestamps per course
  const [courseDoneTimestamps, setCourseDoneTimestamps] = useState<Map<string, string>>(new Map());

  // Track which courses have been explicitly confirmed done via ticket button
  const [confirmedCourses, setConfirmedCourses] = useState<Set<string>>(new Set());

  // Compute lifecycle status for each course
  // A course only becomes 'served' if all items are done AND the course is confirmed
  const courseLifecycleMap = useMemo(() => {
    if (!isDineIn) return new Map<string, 'active' | 'pending' | 'served'>();
    const map = new Map<string, 'active' | 'pending' | 'served'>();
    let foundActive = false;
    for (const c of displayCourses) {
      const ids = c.items.filter(i => !i.isCancelled).map(i => i.id);
      const allDone = ids.length > 0 && ids.every(id => itemStatuses.get(id) === 'done');
      const isConfirmed = confirmedCourses.has(c.course);
      if (c.isFired || (allDone && isConfirmed)) {
        map.set(c.course, 'served');
      } else if (!foundActive) {
        map.set(c.course, 'active');
        foundActive = true;
      } else {
        map.set(c.course, 'pending');
      }
    }
    return map;
  }, [isDineIn, displayCourses, itemStatuses, confirmedCourses]);

  // Track when each course became "active" for course-level aging.
  // Prefers the shared `_startedAt` field on the course (so the Summary panel
  // reads the same value); falls back to local tracking if not provided.
  const [courseActivatedAt, setCourseActivatedAt] = useState<Map<string, Date>>(() => {
    const map = new Map<string, Date>();
    if (isDineIn) {
      for (const c of displayCourses) {
        if (c._startedAt) map.set(c.course, c._startedAt);
      }
      // Ensure first course has a starting time
      if (displayCourses.length > 0 && !map.has(displayCourses[0].course)) {
        map.set(displayCourses[0].course, order.timeReceived);
      }
    }
    return map;
  });

  // When a course transitions to active, record activation time (fallback path).
  useEffect(() => {
    if (!isDineIn || !courseLevelAging) return;
    setCourseActivatedAt(prev => {
      let changed = false;
      const next = new Map(prev);
      for (const [course, status] of courseLifecycleMap) {
        if (status === 'active' && !next.has(course)) {
          // Prefer course._startedAt from shared data, else stamp now
          const cg = displayCourses.find(c => c.course === course);
          next.set(course, cg?._startedAt ?? new Date());
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [courseLifecycleMap, isDineIn, courseLevelAging, displayCourses]);

  // Compute per-course status colors when course-level aging is enabled
  // Depends on liveElapsed to force recalculation every second
  const courseStatusColors = useMemo(() => {
    if (!courseLevelAging || !isDineIn) return new Map<string, { color: string; textColor: string }>();
    const now = Date.now();
    const map = new Map<string, { color: string; textColor: string }>();
    for (const c of displayCourses) {
      const activatedAt = courseActivatedAt.get(c.course) ?? c._startedAt;
      if (activatedAt) {
        const elapsed = Math.max(0, Math.floor((now - activatedAt.getTime()) / 1000));
        const status = getStatusForElapsed(elapsed);
        map.set(c.course, { color: status.color, textColor: status.textColor });
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseLevelAging, isDineIn, displayCourses, courseActivatedAt, getStatusForElapsed, liveElapsed]);

  // Determine the effective header status color
  const effectiveStatusColor = useMemo(() => {
    if (!courseLevelAging || !isDineIn) return statusColor;
    // Use active course's aging color for the header
    for (const [course, status] of courseLifecycleMap) {
      if (status === 'active') {
        const courseColor = courseStatusColors.get(course);
        if (courseColor) return { ...statusColor, color: courseColor.color, textColor: courseColor.textColor };
      }
    }
    return statusColor;
  }, [courseLevelAging, isDineIn, courseLifecycleMap, courseStatusColors, statusColor]);

  // 3-step advance: unseen → preparing → done (no 'ready' intermediate)
  const handleAdvanceItem = useCallback((itemId: string, skipToDone?: boolean) => {
    const now = formatStaticTime(new Date());
    setItemStatuses(prev => {
      const next = new Map(prev);
      let newStatus: ItemStatus;
      if (skipToDone) {
        newStatus = 'done';
      } else {
        const current = next.get(itemId);
        if (!current) newStatus = 'preparing';
        else if (current === 'preparing') newStatus = 'done';
        else newStatus = 'done';
      }
      next.set(itemId, newStatus);
      onItemStatusChange?.(itemId, newStatus);
      return next;
    });
    // Assign seen index on first transition (unseen → preparing/done)
    const prevStatus = itemStatuses.get(itemId);
    if (!prevStatus) {
      assignSeenIndex([itemId]);
    }
    // Record timestamp
    setItemTimestamps(prev => {
      const next = new Map(prev);
      const existing = next.get(itemId) || {};
      const currentStatus = itemStatuses.get(itemId);
      if (!currentStatus) {
        // Moving to preparing - record seenAt
        next.set(itemId, { ...existing, seenAt: existing.seenAt || now });
      } else if (currentStatus === 'preparing' || skipToDone) {
        // Moving to done - record doneAt
        next.set(itemId, { ...existing, seenAt: existing.seenAt || now, doneAt: now });
      }
      return next;
    });
  }, [onItemStatusChange, itemStatuses, assignSeenIndex]);

  // Bulk advance course items
  const handleBulkAdvanceCourse = useCallback((courseItemIds: string[]) => {
    const now = formatStaticTime(new Date());
    setItemStatuses(prev => {
      const next = new Map(prev);
      // Check collective state
      const allPreparing = courseItemIds.every(id => {
        const s = next.get(id);
        return s === 'preparing' || s === 'done';
      });
      const allDone = courseItemIds.every(id => next.get(id) === 'done');

      if (allDone) {
        // Confirm this course as served so it collapses
        const courseName = displayCourses.find(c =>
          c.items.some(i => courseItemIds.includes(i.id))
        )?.course;
        if (courseName) {
          setConfirmedCourses(prev => {
            const next = new Set(prev);
            next.add(courseName);
            return next;
          });
        }
        return prev;
      }

      if (allPreparing) {
        // Advance all to done
        courseItemIds.forEach(id => {
          if (next.get(id) !== 'done') {
            next.set(id, 'done');
            onItemStatusChange?.(id, 'done');
          }
        });
      } else {
        // Advance all unseen to preparing
        const newlySeen: string[] = [];
        courseItemIds.forEach(id => {
          if (!next.get(id)) {
            next.set(id, 'preparing');
            onItemStatusChange?.(id, 'preparing');
            newlySeen.push(id);
          }
        });
        if (newlySeen.length > 0) assignSeenIndex(newlySeen);
      }
      return next;
    });
    // Record timestamps
    setItemTimestamps(prev => {
      const next = new Map(prev);
      const allPreparing = courseItemIds.every(id => {
        const s = itemStatuses.get(id);
        return s === 'preparing' || s === 'done';
      });

      if (allPreparing) {
        courseItemIds.forEach(id => {
          if (itemStatuses.get(id) !== 'done') {
            const existing = next.get(id) || {};
            next.set(id, { ...existing, seenAt: existing.seenAt || now, doneAt: now });
          }
        });
      } else {
        courseItemIds.forEach(id => {
          if (!itemStatuses.get(id)) {
            const existing = next.get(id) || {};
            next.set(id, { ...existing, seenAt: existing.seenAt || now });
          }
        });
      }
      return next;
    });
  }, [onItemStatusChange, itemStatuses, displayCourses, assignSeenIndex]);

  // For coursed orders: get active course item IDs
  const activeCourseItemIds = useMemo(() => {
    if (!isDineIn) return allItemIds;
    for (const c of displayCourses) {
      const lifecycle = courseLifecycleMap.get(c.course);
      if (lifecycle === 'active') {
        return c.items.filter(i => !i.isCancelled).map(i => i.id);
      }
    }
    // All courses served - no active course
    return [];
  }, [isDineIn, displayCourses, courseLifecycleMap, allItemIds]);

  // Check if all courses are served (for final DONE)
  const allCoursesServed = useMemo(() => {
    if (!isDineIn) return false;
    if (courseLifecycleMap.size === 0) return false;
    for (const status of courseLifecycleMap.values()) {
      if (status !== 'served') return false;
    }
    return true;
  }, [isDineIn, courseLifecycleMap]);

  // Compute ticket-level collective state from item statuses
  const ticketState: TicketState = useMemo(() => {
    // For coursed orders: derive from active course only, or show final DONE if all served
    if (isDineIn) {
      if (allCoursesServed) return 'done';
      if (activeCourseItemIds.length === 0) return 'seen';
      const allDone = activeCourseItemIds.every(id => itemStatuses.get(id) === 'done');
      if (allDone) return 'done';
      const anyUnseen = activeCourseItemIds.some(id => !itemStatuses.get(id));
      if (anyUnseen) return 'seen';
      return 'in-progress';
    }
    // Non-coursed: use all items
    if (allItemIds.length === 0) return 'seen';
    const allDone = allItemIds.every(id => itemStatuses.get(id) === 'done');
    if (allDone) return 'done';
    const anyUnseen = allItemIds.some(id => !itemStatuses.get(id));
    if (anyUnseen) return 'seen';
    return 'in-progress';
  }, [isDineIn, allCoursesServed, activeCourseItemIds, allItemIds, itemStatuses]);

  // Ticket-level advance: operates on active course only for dine-in
  // Find the currently active course name
  const activeCourseName = useMemo(() => {
    if (!isDineIn) return undefined;
    for (const [course, status] of courseLifecycleMap) {
      if (status === 'active') return course;
    }
    return undefined;
  }, [isDineIn, courseLifecycleMap]);

  const handleTicketAdvance = useCallback((orderId: string) => {
    // Mark as seen in global store on first advance (unseen → preparing)
    if (ticketState === 'seen') {
      onMarkSeen?.(orderId);
    }
    if (ticketState === 'done') {
      if (isDineIn && activeCourseName) {
        // Confirm this course as done - it will collapse and next course becomes active
        setConfirmedCourses(prev => {
          const next = new Set(prev);
          next.add(activeCourseName);
          return next;
        });
        return;
      }
      if (isDineIn && allCoursesServed) {
        // All courses served, final DONE - remove ticket
        onBump?.(orderId);
        return;
      }
      // Non-coursed DONE - remove ticket
      onBump?.(orderId);
      return;
    }
    const now = formatStaticTime(new Date());
    const targetIds = isDineIn ? activeCourseItemIds : allItemIds;
    const targetStatus: ItemStatus = ticketState === 'seen' ? 'preparing' : 'done';
    setItemStatuses(prev => {
      const next = new Map(prev);
      const newlySeen: string[] = [];
      targetIds.forEach(id => {
        const current = next.get(id);
        // Skip items already at or past the target status
        if (current === 'done') return;
        if (current === 'preparing' && targetStatus === 'preparing') return;
        if (!current && (targetStatus === 'preparing' || targetStatus === 'done')) {
          newlySeen.push(id);
        }
        next.set(id, targetStatus);
        onItemStatusChange?.(id, targetStatus);
      });
      if (newlySeen.length > 0) assignSeenIndex(newlySeen);
      return next;
    });
    setItemTimestamps(prev => {
      const next = new Map(prev);
      targetIds.forEach(id => {
        const currentStatus = itemStatuses.get(id);
        // Skip items already done
        if (currentStatus === 'done') return;
        const existing = next.get(id) || {};
        if (targetStatus === 'preparing') {
          next.set(id, { ...existing, seenAt: existing.seenAt || now });
        } else {
          next.set(id, { ...existing, seenAt: existing.seenAt || now, doneAt: now });
        }
      });
      return next;
    });
  }, [ticketState, isDineIn, activeCourseName, allCoursesServed, activeCourseItemIds, allItemIds, onBump, onItemStatusChange, onMarkSeen, assignSeenIndex]);

  // Ticket-level recall: operates on active course only for dine-in
  const handleTicketRecall = useCallback((_orderId: string) => {
    const targetIds = isDineIn ? activeCourseItemIds : allItemIds;
    if (ticketState === 'done') {
      // Back to in-progress: active course items to preparing
      const now = formatStaticTime(new Date());
      setItemStatuses(prev => {
        const next = new Map(prev);
        targetIds.forEach(id => {
          next.set(id, 'preparing');
          onItemStatusChange?.(id, 'preparing');
        });
        return next;
      });
      setItemTimestamps(prev => {
        const next = new Map(prev);
        targetIds.forEach(id => {
          const existing = next.get(id) || {};
          next.set(id, { seenAt: existing.seenAt || now, doneAt: undefined });
        });
        return next;
      });
    } else {
      // Back to unseen: clear non-done items only, preserve done items
      const nonDoneIds = targetIds.filter(id => itemStatuses.get(id) !== 'done');
      if (nonDoneIds.length === 0) return;
      onMarkSeen?.(_orderId);
      setItemStatuses(prev => {
        const next = new Map(prev);
        nonDoneIds.forEach(id => {
          next.delete(id);
          onItemStatusChange?.(id, undefined);
        });
        return next;
      });
      setItemTimestamps(prev => {
        const next = new Map(prev);
        nonDoneIds.forEach(id => next.delete(id));
        return next;
      });
      nonDoneIds.forEach(id => clearSeenIndex(id));
    }
  }, [ticketState, isDineIn, activeCourseItemIds, allItemIds, onItemStatusChange, onMarkSeen, itemStatuses, clearSeenIndex]);

  const handleUndoItem = useCallback((itemId: string) => {
    setItemStatuses(prev => {
      const next = new Map(prev);
      const current = next.get(itemId);
      if (current === 'done') {
        next.set(itemId, 'preparing');
        onItemStatusChange?.(itemId, 'preparing');
        // Clear doneAt timestamp
        setItemTimestamps(tsPrev => {
          const tsNext = new Map(tsPrev);
          const existing = tsNext.get(itemId);
          if (existing) {
            tsNext.set(itemId, { ...existing, doneAt: undefined });
          }
          return tsNext;
        });
      } else {
        next.delete(itemId);
        onItemStatusChange?.(itemId, undefined);
        // Clear all timestamps
        setItemTimestamps(tsPrev => {
          const tsNext = new Map(tsPrev);
          tsNext.delete(itemId);
          return tsNext;
        });
        // Clear seen index when item drops back to unseen
        clearSeenIndex(itemId);
      }
      return next;
    });
  }, [onItemStatusChange, clearSeenIndex]);

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

  // Record "Done at" timestamp when a course transitions to served
  useEffect(() => {
    if (!isDineIn) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCourseDoneTimestamps(prev => {
      let changed = false;
      const next = new Map(prev);
      for (const [course, status] of courseLifecycleMap) {
        if (status === 'served' && !next.has(course)) {
          next.set(course, now);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [courseLifecycleMap, isDineIn]);

  // Sort courses: active first, then pending, then served
  const sortedDisplayCourses = useMemo(() => {
    if (!isDineIn) return displayCourses;
    const priority = { active: 0, pending: 1, served: 2 };
    return [...displayCourses].sort((a, b) => {
      const aStatus = courseLifecycleMap.get(a.course) || 'pending';
      const bStatus = courseLifecycleMap.get(b.course) || 'pending';
      return priority[aStatus] - priority[bStatus];
    });
  }, [isDineIn, displayCourses, courseLifecycleMap]);

  if (compact) {
    return <CompactOrderCard order={order} liveElapsed={liveElapsed} urgency={urgency} onBump={onBump} />;
  }

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
          borderLeft: order.isRushed ? '4px solid #c0392b' : undefined,
        }}
      >
        {/* Header area */}
        <div>
          <OrderTypeBadge
            type={order.orderType}
            time={formatTimeForKDS(order.timeReceived, timeFormat)}
            tableInfo={getLocationLabel(order.orderType, order.tableName)}
            stationBadge={undefined}
            hasRecalled={order.courses.some(c => c.items.some(i => i.isRecalled && !i.isCancelled))}
          />

          <div
            role="button"
            tabIndex={0}
            aria-label={`Advance ticket (currently ${ticketState})`}
            title={`Tap to advance: ${ticketState === 'seen' ? 'SEEN → IN PROGRESS' : ticketState === 'in-progress' ? 'IN PROGRESS → DONE' : 'DONE'}`}
            onClick={() => handleTicketAdvance(order.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTicketAdvance(order.id);
              }
            }}
            className="flex items-center justify-between transition-all duration-200 cursor-pointer select-none active:brightness-95"
            style={{
              backgroundColor: order.isRushed ? '#c0392b' : effectiveStatusColor.color,
              padding: '12px',
            }}
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
                        className="text-white font-black min-w-0 leading-tight break-words"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        <div>{firstName}</div>
                        {restName && <div>{restName}</div>}
                      </div>
                    );
                  }
                  return (
                    <div className="text-white font-black shrink-0 leading-none min-w-0 truncate" style={{ fontSize: '28px' }}>
                      {order.orderNumber}
                    </div>
                  );
                })()}
                <div className="flex flex-col items-end justify-center shrink-0 ml-2" style={{ gap: '4px' }}>
                  <div className="flex items-center gap-1.5 leading-none">
                    {order.isRushed && (
                      <span className="text-[10px] font-medium text-destructive bg-white rounded-full px-2 py-0.5">{tl('RUSH')}</span>
                    )}
                    <TimerBadge seconds={liveElapsed} urgency={urgency} invertColor className="text-[20px] leading-none font-bold" />
                  </div>
                  <span className="text-[12px] leading-none font-medium text-white/70 max-w-full text-right break-words">
                    {tperson(order.serverName)}
                  </span>
                </div>
              </>
            ) : ticketHeaderLayout === 'kitchen' ? (
              <>
                <div className="text-white font-black shrink-0" style={{ fontSize: 'var(--kds-order-num)', lineHeight: '0.75' }}>
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
                  <div className="flex items-center gap-1.5 leading-none">
                    {order.isRushed && (
                      <span className="text-[10px] font-medium text-destructive bg-white rounded-full px-2 py-0.5">{tl('RUSH')}</span>
                    )}
                    <TimerBadge seconds={liveElapsed} urgency={urgency} invertColor className="text-[20px] leading-none font-bold" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-[28px] font-black text-white leading-tight flex items-center min-w-0 flex-1">
                  {order.guestName ? tperson(order.guestName) : order.orderNumber}
                </div>
                <div className="flex flex-col items-end justify-between self-stretch gap-1.5 shrink-0">
                  <span className="flex items-center gap-1 text-[16px] font-medium text-white whitespace-nowrap">
                    <img src={PersonSimpleRunBold} alt="" width={14} height={14} className="invert opacity-90 shrink-0" />
                    {tperson(order.serverName)}
                  </span>
                  <span className="text-[16px] font-semibold text-white">
                    {order.orderNumber}
                  </span>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {order.isRushed && (
                      <span className="text-[10px] font-medium text-destructive bg-white rounded-full px-2 py-0.5">{tl('RUSH')}</span>
                    )}
                    <TimerBadge seconds={liveElapsed} urgency={urgency} invertColor className="text-[20px] font-bold" />
                  </div>
                </div>
              </>
            )}
          </div>

          {showAllergens && <OrderAllergenStrip order={order} compact={isCompactLayout} />}
        </div>

        {order.orderNotes && (
          <OrderNotesSection
            notes={order.orderNotes}
            orderId={order.id}
            onAcknowledgeNotes={onAcknowledgeNotes}
          />
        )}

        {orderMessages.length > 0 && (
          <KitchenMessageSection
            messages={orderMessages}
            replies={replies.filter(r => orderMessages.some(m => m.message_id === r.message_id))}
            onAcknowledge={acknowledgeMessage}
            onReply={sendReply}
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
            sortedDisplayCourses.map((courseGroup) => {
                const lifecycleStatus = courseLifecycleMap.get(courseGroup.course) || 'pending';
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
                    itemTimestamps={itemTimestamps}
                    onAdvanceItem={handleAdvanceItem}
                    onUndoItem={handleUndoItem}
                    onBulkAdvanceCourse={handleBulkAdvanceCourse}
                    stationCourse={stationCourse}
                    forcedStationStatus={forcedStatus}
                    onReRouteItem={undefined}
                    showAllergens={showAllergens}
                    highlightItemNames={highlightItemNames}
                    lifecycleStatus={lifecycleStatus}
                    courseDoneAt={courseDoneTimestamps.get(courseGroup.course)}
                    servableModifiersEnabled={servableModifiersEnabled}
                    modifierStatuses={modifierStatuses}
                    onAdvanceModifier={handleAdvanceModifier}
                    onUndoModifier={handleUndoModifier}
                    courseAgingColor={courseStatusColors.get(courseGroup.course)}
                    dismissedItemIds={dismissedItemIds}
                    onDismissItem={handleDismissItem}
                    compactRows={compactRows}
                    seenOrderIndex={seenOrderIndex}
                    ticketLayoutMode={resolvedTicketLayout}
                  />
                );
              })
          ) : (
            <FlatItemList
              courses={orderWithStations.courses}
              itemStatuses={itemStatuses}
              itemTimestamps={itemTimestamps}
              onAdvanceItem={handleAdvanceItem}
              onUndoItem={handleUndoItem}
              onReRouteItem={undefined}
              showAllergens={showAllergens}
              servableModifiersEnabled={servableModifiersEnabled}
              modifierStatuses={modifierStatuses}
              onAdvanceModifier={handleAdvanceModifier}
              onUndoModifier={handleUndoModifier}
              dismissedItemIds={dismissedItemIds}
              onDismissItem={handleDismissItem}
              ticketLayoutMode={resolvedTicketLayout}
            />
          )}
        </div>
      </div>
    </>
  );
}
