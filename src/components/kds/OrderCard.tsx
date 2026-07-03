import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { getOverlayInsets } from '@/lib/dock-insets';

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
import { Flag86Modal } from './Flag86Button';
import { useLongPress } from '@/hooks/use-long-press';
import { useFlag86 } from '@/hooks/use-flag86';
import { OrderAllergenStrip } from './OrderAllergenStrip';
import { OrderNotesSection } from './OrderNotesSection';
import { OrderCardActions } from './OrderCardActions';
import { normalizeStationCourses, getLocationLabel } from './station-utils';
import { ItemRoutingModal } from './ItemRoutingModal';
import { TicketRoutingModal } from './TicketRoutingModal';
import { KitchenMessageSection } from './KitchenMessageSection';
import { CustomerContactStrip } from './CustomerContactStrip';
import { useStatusRules } from '@/hooks/use-status-rules';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { useKitchenMessages } from '@/hooks/use-kitchen-messages';
import PersonSimpleRunBold from '@/assets/person-simple-run-bold.svg';
import UsersBold from '@/assets/users-bold.svg';
import { V1Header } from './variants/headers/V1Header';
import { V2Header } from './variants/headers/V2Header';
import { V3Header } from './variants/headers/V3Header';

interface OrderCardProps {
  order: Order;
  compact?: boolean;
  onBump?: (orderId: string) => void;
  onRecall?: (orderId: string) => void;
  onFireCourse?: (orderId: string, course: string) => void;
  onItemStatusChange?: (itemId: string, status: ItemStatus | undefined) => void;
  onAcknowledgeNotes?: (orderId: string) => void;
  onUnacknowledgeNotes?: (orderId: string) => void;
  onMarkSeen?: (orderId: string) => void;
  onItemDismiss?: (orderId: string, item: OrderItem) => void;
  /** When provided, returning true blocks the ticket-level "remove" advance (3rd tap). */
  isAcknowledgmentPending?: (orderId: string) => boolean;
  /** Notifies parent that a final-bump (ticket removal) was attempted while acknowledgments were pending. */
  onBumpBlocked?: (orderId: string) => void;
  stationCourse?: string;
  showAllergens?: boolean;
  highlightItemNames?: Set<string>;
  /** When true (grid view), apply tighter row spacing inside courses. */
  compactRows?: boolean;
  /** Override the global ticketLayout setting (used by previews). */
  layoutOverride?: 'standard' | 'compact' | 'header';
  /** Force a specific header style override (used by header-layout modal). */
  forceEmphasizedV1Header?: boolean;
  /** When true, strips the outer card border/shadow so the content sits inside another container (e.g. the sidebar drawer). */
  bare?: boolean;
  /** When true, the card's own header area is not rendered (parent provides its own header). */
  suppressHeader?: boolean;
  /** When true, kitchen messaging block is not rendered. */
  suppressKitchenMessages?: boolean;
  /** When true, restore legacy per-product icon actions on product rows. */
  legacyActions?: boolean;
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

import { formatTime as formatStaticTime } from '@/lib/datetime';

export function OrderCard({ order, compact, onBump, onRecall, onFireCourse, onItemStatusChange, onAcknowledgeNotes, onUnacknowledgeNotes, onMarkSeen, onItemDismiss, isAcknowledgmentPending, onBumpBlocked, stationCourse, showAllergens = true, highlightItemNames, compactRows, layoutOverride, forceEmphasizedV1Header, bare, suppressHeader, suppressKitchenMessages, legacyActions }: OrderCardProps) {
  const { timeFormat, tperson, tl } = useLanguage();
  const { pathname } = useLocation();
  const showCustomerContact =
    pathname === '/kds/home-onlineordering' &&
    (order.orderType === 'delivery' || order.orderType === 'phone-in') &&
    !!order.customerPhone;
  const displayGuestName = showCustomerContact && order.customerName
    ? order.customerName
    : order.guestName;
  const { servableModifiers: servableModifiersEnabled, showHeaderAllergens } = useKDSSettings();
  const { getMessagesForOrder, getRepliesForMessage, acknowledgeMessage, sendReply, replies } = useKitchenMessages();
  const orderMessages = getMessagesForOrder(order.id);
  const liveElapsed = useElapsedSeconds(order.timeReceived);
  const urgency = getTimerUrgency(liveElapsed, order.targetSeconds);
  const { getStatusForElapsed, courseLevelAging } = useStatusRules();
  const { ticketHeaderLayout, ticketLayout, ticketHeaderStyle } = useKDSSettings();
  const resolvedTicketLayout: 'standard' | 'compact' | 'header' = layoutOverride ?? ticketLayout;
  const isHeaderOnly = resolvedTicketLayout === 'header';
  const isCompactLayout = resolvedTicketLayout === 'compact';
  const innerLayoutMode: 'standard' | 'compact' = resolvedTicketLayout === 'compact' ? 'compact' : 'standard';
  const statusColor = getStatusForElapsed(liveElapsed);
  const [itemStatuses, setItemStatuses] = useState<Map<string, ItemStatus>>(() => {
    if (order.id === 'onboarding-sample') {
      return new Map<string, ItemStatus>([
        ['onb-i-2', 'preparing'],
        ['onb-i-3', 'done'],
      ]);
    }
    return new Map();
  });
  const [headerOnlyModalOpen, setHeaderOnlyModalOpen] = useState(false);
  const effectiveHeaderOnly = isHeaderOnly;
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

  // Servable modifier statuses + timestamps (mirror item-level seenAt/doneAt)
  const [modifierStatuses, setModifierStatuses] = useState<Map<string, ModifierStatus>>(new Map());
  const [modifierTimestamps, setModifierTimestamps] = useState<Map<string, { seenAt?: string; doneAt?: string }>>(new Map());

  const handleAdvanceModifier = useCallback((modId: string) => {
    const now = formatStaticTime(new Date());
    setModifierStatuses(prev => {
      const next = new Map(prev);
      const current = next.get(modId);
      if (!current) next.set(modId, 'preparing');
      else if (current === 'preparing') next.set(modId, 'done');
      else next.set(modId, 'done');
      return next;
    });
    setModifierTimestamps(prev => {
      const next = new Map(prev);
      const existing = next.get(modId) || {};
      const currentStatus = modifierStatuses.get(modId);
      if (!currentStatus) {
        next.set(modId, { ...existing, seenAt: existing.seenAt || now });
      } else if (currentStatus === 'preparing') {
        next.set(modId, { ...existing, seenAt: existing.seenAt || now, doneAt: now });
      }
      return next;
    });
  }, [modifierStatuses]);

  const handleUndoModifier = useCallback((modId: string) => {
    setModifierStatuses(prev => {
      const next = new Map(prev);
      const current = next.get(modId);
      if (current === 'done') next.set(modId, 'preparing');
      else next.delete(modId);
      return next;
    });
    setModifierTimestamps(prev => {
      const next = new Map(prev);
      const existing = next.get(modId);
      if (!existing) return next;
      const current = modifierStatuses.get(modId);
      if (current === 'done') {
        next.set(modId, { ...existing, doneAt: undefined });
      } else {
        next.delete(modId);
      }
      return next;
    });
  }, [modifierStatuses]);

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

  // When the last dine-in course has been confirmed served, the product rows are gone.
  // If notes/messages were pending, keep the ticket visible until they clear, then bump it.
  useEffect(() => {
    if (!isDineIn || !allCoursesServed) return;
    if (isAcknowledgmentPending?.(order.id)) {
      onBumpBlocked?.(order.id);
      return;
    }
    onBump?.(order.id);
  }, [isDineIn, allCoursesServed, order.id, isAcknowledgmentPending, onBumpBlocked, onBump]);

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

  // Collect servable modifier IDs belonging to a set of item IDs
  const collectServableModIds = useCallback((itemIds: string[]): string[] => {
    if (!servableModifiersEnabled) return [];
    const idSet = new Set(itemIds);
    const modIds: string[] = [];
    for (const c of displayCourses) {
      for (const item of c.items) {
        if (!idSet.has(item.id) || item.isCancelled) continue;
        if (!item.modifiers) continue;
        for (const m of item.modifiers) {
          if (m.isServable && m.type !== 'remove' && m.id) modIds.push(m.id);
        }
      }
    }
    return modIds;
  }, [displayCourses, servableModifiersEnabled]);

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
      if (isAcknowledgmentPending?.(orderId)) {
        onBumpBlocked?.(orderId);
        toast.info('Acknowledge messages and notes before clearing the ticket.', { duration: 2200 });
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
    // Propagate ticket-level advance to servable modifiers within targeted items
    const modIds = collectServableModIds(targetIds);
    if (modIds.length > 0) {
      setModifierStatuses(prev => {
        const next = new Map(prev);
        modIds.forEach(mid => {
          const cur = next.get(mid);
          if (cur === 'done') return;
          if (cur === 'preparing' && targetStatus === 'preparing') return;
          next.set(mid, targetStatus);
        });
        return next;
      });
      setModifierTimestamps(prev => {
        const next = new Map(prev);
        modIds.forEach(mid => {
          const existing = next.get(mid) || {};
          if (targetStatus === 'preparing') {
            next.set(mid, { ...existing, seenAt: existing.seenAt || now });
          } else {
            next.set(mid, { ...existing, seenAt: existing.seenAt || now, doneAt: now });
          }
        });
        return next;
      });
    }
  }, [ticketState, isDineIn, activeCourseName, allCoursesServed, activeCourseItemIds, allItemIds, onBump, onItemStatusChange, onMarkSeen, assignSeenIndex, isAcknowledgmentPending, onBumpBlocked, collectServableModIds]);

  // Ticket-level recall: operates on active course only for dine-in
  const handleTicketRecall = useCallback((_orderId: string) => {
    const targetIds = isDineIn ? activeCourseItemIds : allItemIds;
    const modIds = collectServableModIds(targetIds);
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
      if (modIds.length > 0) {
        setModifierStatuses(prev => {
          const next = new Map(prev);
          modIds.forEach(mid => next.set(mid, 'preparing'));
          return next;
        });
        setModifierTimestamps(prev => {
          const next = new Map(prev);
          modIds.forEach(mid => {
            const existing = next.get(mid) || {};
            next.set(mid, { seenAt: existing.seenAt || now, doneAt: undefined });
          });
          return next;
        });
      }
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
      // Reset servable modifiers for the non-done items back to unseen
      const nonDoneModIds = collectServableModIds(nonDoneIds);
      if (nonDoneModIds.length > 0) {
        setModifierStatuses(prev => {
          const next = new Map(prev);
          nonDoneModIds.forEach(mid => next.delete(mid));
          return next;
        });
        setModifierTimestamps(prev => {
          const next = new Map(prev);
          nonDoneModIds.forEach(mid => next.delete(mid));
          return next;
        });
      }
    }
  }, [ticketState, isDineIn, activeCourseItemIds, allItemIds, onItemStatusChange, onMarkSeen, itemStatuses, clearSeenIndex, collectServableModIds]);

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
    const now = formatStaticTime(new Date());
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


  // Ticket-level manual 86 (long-press anywhere on the card)
  const { confirmMany: confirm86Many, isConfirmed: is86ConfirmedFn } = useFlag86();
  const [ticketManual86Open, setTicketManual86Open] = useState(false);
  const eligibleTicketItems = useMemo(() => {
    const list: { id: string; name: string }[] = [];
    for (const c of order.courses) {
      for (const i of c.items) {
        if (i.isCancelled) continue;
        if (is86ConfirmedFn(i.id)) continue;
        list.push({ id: i.id, name: i.name });
      }
    }
    return list;
  }, [order.courses, is86ConfirmedFn]);
  const ticketLongPress = useLongPress(() => {
    if (eligibleTicketItems.length === 0) return;
    setTicketManual86Open(true);
  });

  return (
    <>
      <div
        data-order-id={order.id}
        className={`${bare ? '' : 'rounded-lg overflow-hidden bg-surface-card shadow-sm'} ${statusBodyMap[order.status] || ''} transition-all duration-300`}
        style={{
          minWidth: bare ? undefined : 'min(220px, 100%)',
          borderLeft: order.isRushed ? '4px solid #c0392b' : undefined,
        }}
        {...(bare ? {} : ticketLongPress)}
      >
        {/* Header area */}
        {!suppressHeader && (
        <div
          onClick={isHeaderOnly ? () => setHeaderOnlyModalOpen(true) : undefined}
          className={isHeaderOnly ? 'cursor-pointer' : undefined}
          role={isHeaderOnly ? 'button' : undefined}
          aria-expanded={isHeaderOnly ? headerOnlyModalOpen : undefined}
        >
          {forceEmphasizedV1Header ? (
            <V1Header order={order} emphasized />
          ) : ticketHeaderStyle === 'v1' ? (
            <V1Header order={order} />
          ) : ticketHeaderStyle === 'v2' ? (
            <V2Header order={order} />
          ) : ticketHeaderStyle === 'v3' ? (
            <V3Header order={order} />
          ) : (
            <>
              <div data-onboarding="ticket-header" className="block">
              <OrderTypeBadge
                type={order.orderType}
                time={formatStaticTime(order.timeReceived)}
                tableInfo={getLocationLabel(order.orderType, order.tableName)}
                stationBadge={undefined}
                
              />
              </div>


              <div
                role="button"
                tabIndex={0}
                aria-label={`Advance ticket (currently ${ticketState})`}
                title={`Tap to advance: ${ticketState === 'seen' ? 'SEEN → IN PROGRESS' : ticketState === 'in-progress' ? 'IN PROGRESS → DONE' : 'DONE'}`}
                onClick={(e) => {
                  if (isHeaderOnly) { e.stopPropagation(); setHeaderOnlyModalOpen(true); return; }
                  handleTicketAdvance(order.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isHeaderOnly) { setHeaderOnlyModalOpen(true); return; }
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
                      const useGuest = (ticketHeaderLayout === 'guest' || showCustomerContact) && !!displayGuestName;
                      if (useGuest) {
                        const translatedGuest = tperson(displayGuestName!);
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
                      <span className="text-[12px] leading-none font-medium text-white/70 max-w-full text-right truncate">
                        {tperson(order.serverName)}
                      </span>
                    </div>
                  </>
                ) : ticketHeaderLayout === 'kitchen' ? (
                  <>
                    <div data-onboarding="ticket-orderno" className="text-white font-black shrink-0" style={{ fontSize: 'var(--kds-order-num)', lineHeight: '0.75' }}>
                      {order.orderNumber}
                    </div>
                    <div className="flex flex-col items-end justify-center min-w-0 ml-2" style={{ gap: '6px' }}>
                  <span className="flex items-center gap-1 text-[16px] leading-none font-medium text-white max-w-full">
                    <img src={PersonSimpleRunBold} alt="" width={14} height={14} className="invert opacity-90 shrink-0" />
                    <span className="text-right truncate min-w-0">{tperson(order.serverName)}</span>
                  </span>
                      <span className="flex items-center gap-1 text-[15px] leading-tight font-medium text-white max-w-full" aria-hidden={!displayGuestName}>
                        <img src={UsersBold} alt="" width={14} height={14} className={`invert opacity-90 shrink-0 ${displayGuestName ? '' : 'invisible'}`} />
                        <span className="text-right break-words min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
                          {displayGuestName ? tperson(displayGuestName) : '\u00A0'}
                        </span>
                      </span>
                      <div data-onboarding="ticket-timer" className="flex items-center gap-1.5 leading-none">
                        {order.isRushed && (
                          <span className="text-[10px] font-medium text-destructive bg-white rounded-full px-2 py-0.5">{tl('RUSH')}</span>
                        )}
                        <TimerBadge seconds={liveElapsed} urgency={urgency} invertColor className="text-[20px] leading-none font-bold" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div data-onboarding="ticket-orderno" className="text-[28px] font-black text-white leading-tight flex items-center min-w-0 flex-1 truncate">
                      {displayGuestName ? tperson(displayGuestName) : order.orderNumber}
                    </div>
                    <div className="flex flex-col items-end justify-between self-stretch gap-1.5 shrink-0 min-w-0 max-w-[55%]">
                      <span className="flex items-center gap-1 text-[16px] font-medium text-white whitespace-nowrap min-w-0 max-w-full">
                        <img src={PersonSimpleRunBold} alt="" width={14} height={14} className="invert opacity-90 shrink-0" />
                        <span className="truncate">{tperson(order.serverName)}</span>
                      </span>
                      <span className="text-[16px] font-semibold text-white truncate max-w-full">
                        {order.orderNumber}
                      </span>
                      <div data-onboarding="ticket-timer" className="flex items-center gap-1.5 mb-0.5">
                        {order.isRushed && (
                          <span className="text-[10px] font-medium text-destructive bg-white rounded-full px-2 py-0.5">{tl('RUSH')}</span>
                        )}
                        <TimerBadge seconds={liveElapsed} urgency={urgency} invertColor className="text-[20px] font-bold" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {!effectiveHeaderOnly && showCustomerContact && (
            <CustomerContactStrip
              customerName={order.customerName}
              customerPhone={order.customerPhone}
            />
          )}

          {!effectiveHeaderOnly && showAllergens && showHeaderAllergens && <OrderAllergenStrip order={order} compact={isCompactLayout} />}
        </div>
        )}

        {!effectiveHeaderOnly && order.orderNotes && (
          <OrderNotesSection
            notes={order.orderNotes}
            orderId={order.id}
            onAcknowledgeNotes={onAcknowledgeNotes}
            onUnacknowledgeNotes={onUnacknowledgeNotes}
          />
        )}

        {!effectiveHeaderOnly && !suppressKitchenMessages && orderMessages.length > 0 && (
          <KitchenMessageSection
            messages={orderMessages}
            replies={replies.filter(r => orderMessages.some(m => m.message_id === r.message_id))}
            onAcknowledge={acknowledgeMessage}
            onReply={sendReply}
          />
        )}

        {!effectiveHeaderOnly && isDineIn && stationNotification && (
          <div className="px-2 py-1 flex items-center gap-1.5 bg-success/10">
            <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
            <span className="text-[10px] font-medium text-success">
              {stationNotification}
            </span>
          </div>
        )}

        {!effectiveHeaderOnly && (
          <div className="border-t border-border">
            {isDineIn ? (
              sortedDisplayCourses
                .filter((courseGroup) => (courseLifecycleMap.get(courseGroup.course) || 'pending') !== 'served')
                .map((courseGroup) => {
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
                      modifierTimestamps={modifierTimestamps}
                      onAdvanceModifier={handleAdvanceModifier}
                      onUndoModifier={handleUndoModifier}
                      courseAgingColor={courseStatusColors.get(courseGroup.course)}
                      dismissedItemIds={dismissedItemIds}
                      onDismissItem={handleDismissItem}
                      compactRows={compactRows}
                      seenOrderIndex={seenOrderIndex}
                      ticketLayoutMode={innerLayoutMode}
                      legacyActions={legacyActions}
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
                modifierTimestamps={modifierTimestamps}
                onAdvanceModifier={handleAdvanceModifier}
                onUndoModifier={handleUndoModifier}
                dismissedItemIds={dismissedItemIds}
                onDismissItem={handleDismissItem}
                ticketLayoutMode={innerLayoutMode}
                legacyActions={legacyActions}
              />
            )}
          </div>
        )}
        {legacyActions && !bare && !isHeaderOnly && (
          <OrderCardActions
            orderId={order.id}
            ticketState={ticketState}
            onTicketAdvance={handleTicketAdvance}
            onTicketRecall={handleTicketRecall}
            legacyActions
          />
        )}
      </div>
      <Flag86Modal
        open={ticketManual86Open}
        onClose={() => setTicketManual86Open(false)}
        onConfirm={() => {
          setTicketManual86Open(false);
          confirm86Many(eligibleTicketItems.map(i => i.id));
          // eslint-disable-next-line no-console
          console.log('Manual 86 requested:', 'ticket', order.id, eligibleTicketItems.map(i => i.id));
        }}
        title={`${order.tableName} · Order ${order.orderNumber}`}
        itemNames={eligibleTicketItems.map(i => `${i.name}`)}
        subtext="Asks the manager to confirm this from the Point of Sale. Once they approve, the item is taken off the menu and no new orders can be sent to the kitchen. Open tickets are not affected."
        primaryLabel="Request 86"
      />
      <HeaderOnlyDrawer
        open={headerOnlyModalOpen}
        onClose={() => setHeaderOnlyModalOpen(false)}
        order={order}
      >
        <OrderCard
          order={order}
          compact={compact}
          onBump={(id) => { onBump?.(id); setHeaderOnlyModalOpen(false); }}
          onRecall={onRecall}
          onFireCourse={onFireCourse}
          onItemStatusChange={onItemStatusChange}
          onAcknowledgeNotes={onAcknowledgeNotes}
          onUnacknowledgeNotes={onUnacknowledgeNotes}
          onMarkSeen={onMarkSeen}
          onItemDismiss={onItemDismiss}
          isAcknowledgmentPending={isAcknowledgmentPending}
          onBumpBlocked={onBumpBlocked}
          stationCourse={stationCourse}
          showAllergens={showAllergens}
          highlightItemNames={highlightItemNames}
          compactRows={compactRows}
          layoutOverride="standard"
          bare
          suppressHeader
          suppressKitchenMessages
        />
      </HeaderOnlyDrawer>
    </>
  );
}

function DrawerHeader({ order }: { order: Order }) {
  const { orderTypeDetailedColors } = useKDSSettings();
  const { getStatusForElapsed } = useStatusRules();
  const elapsed = useElapsedSeconds(order.timeReceived);
  const status = getStatusForElapsed(elapsed);
  const colorSet =
    orderTypeDetailedColors[order.orderType] ||
    ({ headerBg: '#1A1A2E', headerText: '#FFFFFF' } as { headerBg: string; headerText: string });

  // Order type pill label: prefer the same value shown on the ticket card header
  const pillLabel =
    order.orderType === 'dine-in'
      ? (order.tableName || 'Dine in')
      : order.orderType === 'take-out'
      ? 'Take out'
      : order.orderType === 'delivery'
      ? 'Delivery'
      : order.orderType === 'banquet'
      ? (order.tableName || 'Banquet')
      : order.orderType === 'drive-thru'
      ? 'Drive-thru'
      : order.orderType === 'curb-side'
      ? 'Curb-side'
      : order.orderType === 'scheduled'
      ? 'Scheduled'
      : order.orderType === 'phone-in'
      ? 'Phone in'
      : (order.tableName || 'Order');

  const mm = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const ss = Math.floor(elapsed % 60).toString().padStart(2, '0');

  return (
    <div
      className="flex items-center"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        padding: '10px 16px',
      }}
    >
      <div className="flex items-center justify-start gap-2" style={{ flex: 1, minWidth: 0 }}>
        <span
          className="inline-flex items-center shrink-0"
          style={{
            background: colorSet.headerBg,
            color: '#ffffff',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.03em',
            padding: '4px 11px',
            borderRadius: 20,
          }}
        >
          {pillLabel}
        </span>
      </div>
      <div className="flex items-center justify-center" style={{ flex: 1 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>
          {order.orderNumber}
        </span>
      </div>
      <div className="flex items-center justify-end gap-2" style={{ flex: 1 }}>
        <span
          className="whitespace-nowrap shrink-0"
          style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.45)' }}
        >
          {formatStaticTime(order.timeReceived)}
        </span>
        <span
          className="font-mono-timer tabular-nums shrink-0"
          style={{
            background: status.color,
            color: status.textColor,
            fontSize: 13,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 20,
          }}
        >
          {mm}:{ss}
        </span>
      </div>

    </div>
  );
}

function HeaderOnlyDrawer({ open, onClose, order, children }: { open: boolean; onClose: () => void; order: Order; children: React.ReactNode }) {
  const { layout } = useDockLayout();
  const insets = getOverlayInsets(layout);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bg-black/40 z-40"
            style={{ left: insets.left, right: insets.right, top: insets.top, bottom: insets.bottom }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed z-50 w-[440px] max-w-[95vw] p-[10px] pl-0"
            style={{ right: insets.right, top: insets.top, bottom: insets.bottom }}
          >
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-b border-border bg-surface-card flex flex-col">
              <DrawerHeader order={order} />
              <div
                className="flex-1 overflow-y-auto"
                style={{
                  '--kds-item-name': '16px',
                  '--kds-item-qty': '15px',
                  '--kds-modifier': '13px',
                  '--kds-allergen-font': '12px',
                  '--kds-course-header': '12px',
                } as React.CSSProperties}
              >
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
