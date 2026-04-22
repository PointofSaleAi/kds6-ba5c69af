/**
 * Shared aging logic for KDS tickets.
 *
 * Single source of truth for "is this order/course overtime" so that
 * OrderCard headers and the ItemSummaryPanel stay in sync.
 *
 * Rules (mirrors OrderCard.tsx):
 *   - Dine-in + courseLevelAging ON → use the active course's activation time
 *   - All other cases → use order-level live elapsed time
 */
import type { Order, CourseGroup } from '@/types/kds';

/** Live elapsed seconds for an order, taking the larger of stored or wall-clock. */
export function liveOrderElapsed(order: Order, nowMs: number = Date.now()): number {
  const fromTime = order.timeReceived
    ? Math.floor((nowMs - order.timeReceived.getTime()) / 1000)
    : 0;
  return Math.max(order.elapsedSeconds || 0, fromTime);
}

/** Is a course considered "active" (not fired/served and has remaining items)? */
export function isCourseActive(cg: CourseGroup): boolean {
  if (cg.isFired) return false;
  return cg.items.some(i => !i.isCompleted && !i.isCancelled);
}

/**
 * Find the activation timestamp for a course in the shared store.
 * Falls back to course._startedAt, otherwise undefined.
 */
export function getCourseActivatedAt(cg: CourseGroup): Date | undefined {
  return cg._startedAt;
}

/**
 * Compute the elapsed seconds that drives aging for a single course in an order,
 * matching OrderCard's effectiveStatusColor logic.
 */
export function courseAgingElapsed(
  order: Order,
  cg: CourseGroup,
  courseLevelAging: boolean,
  nowMs: number = Date.now(),
): number {
  if (courseLevelAging && order.orderType === 'dine-in') {
    const activatedAt = getCourseActivatedAt(cg);
    if (activatedAt) {
      return Math.max(0, Math.floor((nowMs - activatedAt.getTime()) / 1000));
    }
  }
  return liveOrderElapsed(order, nowMs);
}

/**
 * Determine if a course is overtime under the unified aging rules.
 */
export function isCourseOvertime(
  order: Order,
  cg: CourseGroup,
  thresholdSeconds: number,
  courseLevelAging: boolean,
  nowMs: number = Date.now(),
): boolean {
  if (!isCourseActive(cg)) return false;
  const elapsed = courseAgingElapsed(order, cg, courseLevelAging, nowMs);
  return elapsed >= thresholdSeconds;
}
