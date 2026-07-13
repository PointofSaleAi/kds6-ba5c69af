import { useState, useMemo, useEffect } from 'react';
import { Languages, Eye, Check, ConciergeBell, ChevronRight, Clock } from 'lucide-react';
import type { CourseGroup, OrderItem, Order } from '@/types/kds';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import { AllergenBadge } from './AllergenBadge';
import { KdsActionIcon } from './KdsActionIcon';
import { LegacyActionPill } from './LegacyActionPill';
import { StationBadge } from './StationBadge';
import { ModifierLine, type ModifierStatus } from './ModifierLine';
import { Flag86Button, Flag86Modal, Item86Modal } from './Flag86Button';
import { RecipeReferenceModal } from './RecipeReferenceModal';
import { TightWidthBox } from './TightWidthBox';
import { useRowTap } from '@/hooks/use-row-tap';
import { useLongPress } from '@/hooks/use-long-press';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { useFlag86 } from '@/hooks/use-flag86';
import { ONBOARDING_SAMPLE_FIRST_ITEM_ID } from '@/data/onboarding-sample-order';

export type ItemStatus = 'preparing' | 'ready' | 'done';
export type StationStatus = 'fired' | 'active' | 'pending';

interface CourseSectionProps {
  courseGroup: CourseGroup;
  onFireCourse?: (course: string) => void;
  itemStatuses?: Map<string, ItemStatus>;
  itemTimestamps?: Map<string, { seenAt?: string; doneAt?: string }>;
  onAdvanceItem?: (itemId: string, skipToDone?: boolean) => void;
  onUndoItem?: (itemId: string) => void;
  onBulkAdvanceCourse?: (courseItems: string[]) => void;
  stationCourse?: string;
  forcedStationStatus?: StationStatus;
  onReRouteItem?: (item: OrderItem) => void;
  showAllergens?: boolean;
  highlightItemNames?: Set<string>;
  lifecycleStatus?: 'active' | 'pending' | 'served';
  courseDoneAt?: string;
  servableModifiersEnabled?: boolean;
  modifierStatuses?: Map<string, ModifierStatus>;
  modifierTimestamps?: Map<string, { seenAt?: string; doneAt?: string }>;
  onAdvanceModifier?: (modId: string) => void;
  onUndoModifier?: (modId: string) => void;
  courseAgingColor?: { color: string; textColor: string };
  dismissedItemIds?: Set<string>;
  onDismissItem?: (itemId: string) => void;
  compactRows?: boolean;
  seenOrderIndex?: Map<string, number>;
  /** Override the global ticketLayout (used by previews). */
  ticketLayoutMode?: 'standard' | 'compact';
  /** When true, render per-product KdsActionIcon (legacy mode) and disable row-tap cycle. */
  legacyActions?: boolean;
  /** Optional parent order for contextual metadata (e.g. recipe modal). */
  order?: Order;
}

function getStationStatus(courseGroup: CourseGroup, stationCourse: string): StationStatus {
  if (courseGroup.isFired) return 'fired';
  if (courseGroup.course === stationCourse) return 'active';
  return 'pending';
}

function getCoursingStatus(courseGroup: CourseGroup): StationStatus {
  if (courseGroup.isFired) return 'fired';
  if (courseGroup.prepTimerLabel || courseGroup.fireInSeconds !== undefined) return 'active';
  if (courseGroup.autoFireLabel || courseGroup.autoFireTargetSeconds !== undefined) return 'pending';
  return 'active';
}

function getStationLabel(
  courseGroup: CourseGroup,
  status: StationStatus,
  tc: (s: string) => string,
  labels: { active: string; queued: string; served: string },
): string {
  const name = tc(courseGroup.course.charAt(0) + courseGroup.course.slice(1).toLowerCase());
  switch (status) {
    case 'fired': return `${name} \u00B7 ${labels.served}`;
    case 'active': return `${name} \u00B7 ${labels.active}`;
    case 'pending': return `${name} \u00B7 ${labels.queued}`;
  }
}

function formatTimer(seconds: number): string {
  const abs = Math.abs(Math.floor(seconds));
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Compute a static firing-at time for pending courses */
function computeFiringAtTime(courseGroup: CourseGroup, timeFormat: 0 | 1): string | null {
  if (courseGroup.autoFireTargetSeconds !== undefined && courseGroup._startedAt) {
    const firingAt = new Date(courseGroup._startedAt.getTime() + courseGroup.autoFireTargetSeconds * 1000);
    return formatTimeForKDS(firingAt, timeFormat);
  }
  if (courseGroup.autoFireLabel) {
    const match = courseGroup.autoFireLabel.match(/(\d+):(\d+)/);
    if (match) {
      const totalSec = parseInt(match[1]) * 60 + parseInt(match[2]);
      const firingAt = new Date(Date.now() + totalSec * 1000);
      return formatTimeForKDS(firingAt, timeFormat);
    }
  }
  return null;
}

export function CourseSection({ courseGroup, onFireCourse, itemStatuses, itemTimestamps, onAdvanceItem, onUndoItem, onBulkAdvanceCourse, stationCourse, forcedStationStatus, onReRouteItem, showAllergens = true, highlightItemNames, lifecycleStatus, courseDoneAt, servableModifiersEnabled, modifierStatuses, modifierTimestamps, onAdvanceModifier, onUndoModifier, courseAgingColor, dismissedItemIds, onDismissItem, compactRows, seenOrderIndex, ticketLayoutMode, legacyActions, order }: CourseSectionProps) {
  const { tp, tc, displayMode, tpSecondary, timeFormat, t, showSecondaryMenu, secondaryLang, tl } = useLanguage();
  const { ticketLayout } = useKDSSettings();
  const ticketLayoutCompact = (ticketLayoutMode ?? ticketLayout) === 'compact';
  const secondaryDir = secondaryLang === 'ar' ? 'rtl' : 'ltr';
  const isFired = courseGroup.isFired;
  const isStationMode = !!stationCourse;

  // If lifecycleStatus is provided (dine-in lifecycle), use it to override coursing status
  const isServedByLifecycle = lifecycleStatus === 'served';
  const isPendingByLifecycle = lifecycleStatus === 'pending';
  const isActiveByLifecycle = lifecycleStatus === 'active';

  const coursingStatus = isServedByLifecycle ? 'fired' as StationStatus
    : isPendingByLifecycle ? 'pending' as StationStatus
    : isActiveByLifecycle ? 'active' as StationStatus
    : forcedStationStatus
      ?? (isStationMode ? getStationStatus(courseGroup, stationCourse) : getCoursingStatus(courseGroup));
  
  const isDimmed = coursingStatus === 'fired' || coursingStatus === 'pending';
  const isPending = coursingStatus === 'pending';
  const isActive = coursingStatus === 'active';

  const hasItems = courseGroup.items.length > 0;
  const isCourseCompleted = coursingStatus === 'fired';

  const [isExpanded, setIsExpanded] = useState(!isCourseCompleted && !isServedByLifecycle);
  const [servedExpanded, setServedExpanded] = useState(false);

  // Static firing-at label for pending courses
  const firingAtLabel = useMemo(() => {
    if (coursingStatus !== 'pending') return null;
    return computeFiringAtTime(courseGroup, timeFormat as 0 | 1);
  }, [coursingStatus, courseGroup, timeFormat]);

  // Active course items (non-cancelled)
  const activeItemIds = useMemo(() =>
    courseGroup.items.filter(i => !i.isCancelled).map(i => i.id),
    [courseGroup.items]
  );

  // Determine collective state for course-level icon
  const collectiveState = useMemo(() => {
    if (!isActive || activeItemIds.length === 0) return 'unseen';
    const allDone = courseGroup.items
      .filter(item => !item.isCancelled)
      .every(item => item.isCompleted || itemStatuses?.get(item.id) === 'done');
    if (allDone) return 'done';
    const allSeen = activeItemIds.every(id => {
      const s = itemStatuses?.get(id);
      return s === 'preparing' || s === 'done';
    });
    if (allSeen) return 'preparing';
    return 'unseen';
  }, [isActive, activeItemIds, itemStatuses, courseGroup.items]);

  // Auto-collapse only when course is explicitly confirmed served (via ticket button).
  // Marking the last product as done should NOT collapse the course; the user must
  // tap the course confirmation to advance to the next course.
  useEffect(() => {
    if (isServedByLifecycle) {
      setIsExpanded(false);
    }
  }, [isServedByLifecycle]);

  // "Seen at" timestamp for course header (first item's seenAt)
  const courseSeenAt = useMemo(() => {
    if (!isActive || !itemTimestamps) return null;
    for (const id of activeItemIds) {
      const ts = itemTimestamps.get(id);
      if (ts?.seenAt) return ts.seenAt;
    }
    return null;
  }, [isActive, activeItemIds, itemTimestamps]);

  // Fired course timer for served courses
  const firedTimerLabel = useMemo(() => {
    if (coursingStatus !== 'fired') return null;
    if (courseGroup.firedAgoLabel) {
      // "8:00 ago" -> translate trailing word, keep timer
      const translated = courseGroup.firedAgoLabel.replace(/\b(ago)\b/i, (m) => tl(m));
      return `${t.doneAt} ${translated}`;
    }
    return null;
  }, [coursingStatus, courseGroup.firedAgoLabel]);

  const handleCourseEyeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onBulkAdvanceCourse) return;
    onBulkAdvanceCourse(activeItemIds);
  };

  const handleCourseUndo = () => {
    if (!onUndoItem) return;
    // Undo all items one step back
    activeItemIds.forEach(id => onUndoItem(id));
  };

  const agingColor = courseAgingColor?.color;
  const containerClass = coursingStatus === 'active'
    ? 'border-l-[3px] rounded-l-none'
    : isServedByLifecycle
      ? 'opacity-60'
      : isDimmed
        ? (isStationMode ? 'opacity-80 pointer-events-none' : isPending ? '' : '')
        : '';

  const containerStyle = coursingStatus === 'active'
    ? { borderLeftColor: agingColor || '#0F4C81', transition: 'all 200ms ease-in-out' }
    : isPending
      ? { transition: 'all 200ms ease-in-out', opacity: 0.75 }
      : { transition: 'all 200ms ease-in-out' };

  // FIX 2: QUEUED and SERVED course headers share the same muted gray background
  const headerBg = coursingStatus === 'active'
    ? ''
    : 'bg-muted';

  const headerStyle = coursingStatus === 'active'
    ? { backgroundColor: agingColor ? `${agingColor}18` : '#EFF6FF' }
    : undefined;

  const courseName = tc(courseGroup.course.charAt(0) + courseGroup.course.slice(1).toLowerCase());
  const statusWord = coursingStatus === 'fired' ? t.served : coursingStatus === 'active' ? t.active : t.queued;
  const courseLabel = isServedByLifecycle
    ? courseName
    : isStationMode
      ? getStationLabel(courseGroup, coursingStatus, tc, { active: t.active, queued: t.queued, served: t.served })
      : coursingStatus === 'active'
        ? `${courseName} \u00B7 ${statusWord}`
        : courseName;

  const labelClass = isServedByLifecycle
    ? 'uppercase tracking-wider text-text-primary flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'
    : coursingStatus === 'active'
      ? 'uppercase tracking-wider font-semibold flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'
      : coursingStatus === 'fired'
        ? 'uppercase tracking-wider text-text-primary flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'
        : 'uppercase text-text-primary tracking-wider flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis';

  const labelStyle = coursingStatus === 'active'
    ? { color: agingColor || '#0F4C81', fontWeight: 600, fontSize: 'var(--kds-course-header)' }
    : { fontWeight: 600 };

  // Course-level icon for active courses - purple/violet to distinguish from item-level
  const renderCourseIcon = () => {
    if (!isActive) return null;

    if (collectiveState === 'done') {
      return (
        <div className="flex items-center justify-center" style={{ width: 20, height: 20 }}>
          <Check size={18} color="#166534" strokeWidth={2.5} />
        </div>
      );
    }
    if (collectiveState === 'preparing') {
      return (
        <div className="flex items-center justify-center" style={{ width: 20, height: 20 }}>
          <ConciergeBell size={18} color="#0C4A6E" strokeWidth={2.5} />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center" style={{ width: 20, height: 20 }}>
        <Eye size={18} color="#1E293B" strokeWidth={2.5} />
      </div>
    );
  };

  // Served courses: render a collapsible row (collapsed by default, tappable to expand)
  if (isServedByLifecycle) {
    return (
      <div className={containerClass} style={containerStyle}>
        <div
          className={`flex items-center justify-between flex-nowrap ${headerBg} cursor-pointer select-none`}
          style={{ padding: '2px 8px' }}
          onClick={() => setServedExpanded(prev => !prev)}
        >
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className={`text-muted-foreground transition-transform duration-200 ${servedExpanded ? 'rotate-90' : ''}`} style={{ fontSize: 'var(--kds-course-header)' }}>▶</span>
            <span className={labelClass} style={{ ...labelStyle, fontSize: 'var(--kds-course-header)' }}>
              {courseLabel}
            </span>
          </div>
          {courseDoneAt && (
            <span className="inline-flex items-center px-1.5 rounded text-[10px] font-semibold text-text-primary leading-none">
              {t.doneAt} {courseDoneAt}
            </span>
          )}
        </div>
        {hasItems && (
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: servedExpanded ? '500px' : '0px',
              opacity: servedExpanded ? 1 : 0,
            }}
          >
            <div className="px-2 py-0.5">
              {courseGroup.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center border-b border-border/50 ${item.isCancelled ? 'opacity-50' : ''}`}
                  style={{ padding: '2px 0 2px 4px', opacity: 0.6 }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap" style={{ gap: '3px' }}>
                      <span className="font-normal text-text-secondary" style={{ fontSize: 'var(--kds-item-qty)' }}>
                        {item.quantity}x
                      </span>
                      <span
                        className={`font-medium uppercase line-through text-text-muted`}
                        style={{ fontSize: 'var(--kds-item-name)' }}
                      >
                        {tp(item.name)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  // Course-level manual 86 (long-press on active course header)
  const { confirmMany: confirm86Many, isConfirmed: is86ConfirmedFn2 } = useFlag86();
  const [courseManual86Open, setCourseManual86Open] = useState(false);
  const eligibleCourseItemIds = useMemo(
    () => courseGroup.items
      .filter(i => !i.isCancelled && !is86ConfirmedFn2(i.id))
      .map(i => i.id),
    [courseGroup.items, is86ConfirmedFn2]
  );
  const longPressHeader = useLongPress(() => {
    if (!isActive) return;
    if (eligibleCourseItemIds.length === 0) return;
    setCourseManual86Open(true);
  }, { enabled: isActive, stopPropagation: true });

  return (
    <div className={containerClass} style={containerStyle}>
      <div
        className={`flex items-center justify-between flex-nowrap ${headerBg} cursor-pointer select-none`}
        style={{ ...headerStyle, padding: '2px 8px' }}
        onClick={() => setIsExpanded(prev => !prev)}
        {...longPressHeader}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className={`text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} style={{ fontSize: 'var(--kds-course-header)' }}>
            ▶
          </span>
          <span className={labelClass} style={{ ...labelStyle, fontSize: 'var(--kds-course-header)' }}>
            {courseLabel}
          </span>
        </div>
        <div className="flex items-center shrink-0" style={{ gap: '4px' }}>
          {/* Fired course: "Done X ago" */}
          {coursingStatus === 'fired' && firedTimerLabel && (
            <span className="inline-flex items-center px-1.5 rounded text-[10px] font-bold font-mono tabular-nums text-text-primary leading-none">
              {firedTimerLabel}
            </span>
          )}
          {/* Pending: amber "preparing at X:XX pm" badge */}
          {coursingStatus === 'pending' && firingAtLabel && (
            <span
              className="inline-flex items-center rounded-full leading-none"
              style={{
                backgroundColor: '#FAEEDA',
                color: '#633806',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3.5px',
                gap: '4px',
                border: '1.5px solid #BA7517',
              }}
            >
              <Clock size={12} style={{ color: '#633806' }} />
              <span>{firingAtLabel.toLowerCase()}</span>
            </span>
          )}
        </div>
      </div>

      {hasItems && (
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: isExpanded ? '500px' : '0px',
            opacity: isExpanded ? 1 : 0,
          }}
        >
        <div className="px-1">
          {(() => {
          const visibleItems = courseGroup.items
            .filter((item) => {
              if (dismissedItemIds?.has(item.id)) return false;
              return true;
            })
            .map((item, idx) => ({ item, idx }))
            .sort((a, b) => {
              const aDone = a.item.isCompleted || itemStatuses?.get(a.item.id) === 'done' ? 1 : 0;
              const bDone = b.item.isCompleted || itemStatuses?.get(b.item.id) === 'done' ? 1 : 0;
              return aDone - bDone || a.idx - b.idx;
            })
            .map((x) => x.item);
          return visibleItems.map((item, visibleIdx) => {
            const isLastVisible = visibleIdx === visibleItems.length - 1;
            const status = itemStatuses?.get(item.id);
            const timestamps = itemTimestamps?.get(item.id);
            const isHighlighted = !!highlightItemNames && highlightItemNames.size > 0 && highlightItemNames.has(item.name);

            const itemOpacity = isPending && !item.isCancelled
              ? undefined
              : isCourseCompleted
                ? 0.8
                : undefined;

            return (
              <CourseItemTapRow
                key={item.id}
                item={item}
                status={status}
                timestamps={timestamps}
                isLastVisible={isLastVisible}
                isHighlighted={isHighlighted}
                itemOpacity={itemOpacity}
                isActive={isActive}
                isPending={isPending}
                isCourseCompleted={isCourseCompleted}
                showAllergens={showAllergens}
                displayMode={displayMode}
                showSecondaryMenu={showSecondaryMenu}
                secondaryDir={secondaryDir}
                tp={tp}
                tpSecondary={tpSecondary}
                t={t}
                servableModifiersEnabled={servableModifiersEnabled}
                modifierStatuses={modifierStatuses}
                modifierTimestamps={modifierTimestamps}
                onAdvanceModifier={onAdvanceModifier}
                onUndoModifier={onUndoModifier}
                onAdvanceItem={onAdvanceItem}
                onUndoItem={onUndoItem}
                onDismissItem={onDismissItem}
                compactRows={compactRows}
                seenIdx={seenOrderIndex?.get(item.id)}
                ticketLayoutCompact={ticketLayoutCompact}
                legacyActions={legacyActions}
                order={order}
              />
            );
          });
          })()}
        </div>
        </div>
      )}
      <Flag86Modal
        open={courseManual86Open}
        onClose={() => setCourseManual86Open(false)}
        onConfirm={() => {
          setCourseManual86Open(false);
          confirm86Many(eligibleCourseItemIds);
          // eslint-disable-next-line no-console
          console.log('Manual 86 requested:', 'course', courseGroup.course, eligibleCourseItemIds);
        }}
        title={`${tc(courseGroup.course.charAt(0) + courseGroup.course.slice(1).toLowerCase()).toUpperCase()} · ${eligibleCourseItemIds.length} ${eligibleCourseItemIds.length === 1 ? 'item' : 'items'}`}
        subtext="Asks the manager to confirm this from the Point of Sale. Once they approve, the item is taken off the menu and no new orders can be sent to the kitchen. Open tickets are not affected."
        primaryLabel="Request 86"
      />
    </div>
  );
}

interface CourseItemTapRowProps {
  item: OrderItem;
  status?: ItemStatus;
  timestamps?: { seenAt?: string; doneAt?: string };
  isLastVisible: boolean;
  isHighlighted: boolean;
  itemOpacity?: number;
  isActive: boolean;
  isPending: boolean;
  isCourseCompleted: boolean;
  showAllergens: boolean;
  displayMode: string;
  showSecondaryMenu: boolean;
  secondaryDir: 'rtl' | 'ltr';
  tp: (s: string) => string;
  tpSecondary: (s: string) => string;
  t: { seenAt: string; doneAt: string };
  servableModifiersEnabled?: boolean;
  modifierStatuses?: Map<string, ModifierStatus>;
  modifierTimestamps?: Map<string, { seenAt?: string; doneAt?: string }>;
  onAdvanceModifier?: (id: string) => void;
  onUndoModifier?: (id: string) => void;
  onAdvanceItem?: (itemId: string, skipToDone?: boolean) => void;
  onUndoItem?: (itemId: string) => void;
  onDismissItem?: (itemId: string) => void;
  compactRows?: boolean;
  seenIdx?: number;
  ticketLayoutCompact?: boolean;
  legacyActions?: boolean;
  order?: Order;
}

function CourseItemTapRow({
  item, status, timestamps, isLastVisible, isHighlighted, itemOpacity,
  isActive, isPending, isCourseCompleted,
  showAllergens, displayMode, showSecondaryMenu, secondaryDir,
  tp, tpSecondary, t,
  servableModifiersEnabled, modifierStatuses, modifierTimestamps, onAdvanceModifier, onUndoModifier,
  onAdvanceItem, onUndoItem, onDismissItem,
  compactRows, seenIdx, ticketLayoutCompact, legacyActions, order,
}: CourseItemTapRowProps) {
  const { tn } = useLanguage();
  const { clearedIds: flag86Cleared, isConfirmed: is86ConfirmedFn, confirm: confirm86 } = useFlag86();
  const is86Confirmed = is86ConfirmedFn(item.id);
  const [manual86Open, setManual86Open] = useState(false);
  const is86Active = !!item.is86Flagged && !flag86Cleared.has(item.id) && !is86Confirmed;
  const show86Pill = is86Confirmed;
  const tappable = isActive && !isPending && !isCourseCompleted && !item.isCancelled;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);
  

  const hasDetails =
    (showAllergens && item.allergens.length > 0) ||
    item.modifiers.length > 0 ||
    !!item.notes ||
    (displayMode === 'dual' && showSecondaryMenu && !item.isCancelled);
  const showDetails = !ticketLayoutCompact || detailsOpen;

  // Servable modifier guard: when the product has servable modifiers, do not
  // allow dismissing the product (which would also remove its servable modifiers)
  // until every servable modifier is itself marked Done.
  const servableMods = (item.modifiers || []).filter(
    (m) => !!servableModifiersEnabled && !!m.isServable && m.type !== 'remove' && !!m.id
  );
  const allServableModsDone =
    servableMods.length === 0 ||
    servableMods.every((m) => modifierStatuses?.get(m.id as string) === 'done');

  const handleSingle = () => {
    if (!tappable) return;
    if (status === 'done') {
      // Block removal while independent servable modifiers are still pending.
      if (!allServableModsDone) return;
      onDismissItem?.(item.id);
    } else {
      onAdvanceItem?.(item.id);
    }
  };
  const handleDouble = () => {
    if (!tappable) return;
    if (status === 'preparing' || status === 'done') {
      onUndoItem?.(item.id);
    }
  };
  const handleTap = useRowTap(handleSingle, handleDouble);

  const isDone = status === 'done';
  const isSeen = status === 'preparing';
  const hasModifiers = item.modifiers.length > 0;
  // A modifier is "servable" (independently actionable) only if the feature is on,
  // the modifier is flagged servable, it is not a removal, and it has an id.
  const isServableMod = (m: typeof item.modifiers[number]) =>
    !!servableModifiersEnabled && !!m.isServable && m.type !== 'remove' && !!m.id;
  const hasServableModifiers = item.modifiers.some(isServableMod);
  // Only isolate the product background from modifier rows when there are
  // truly independent (servable) modifier rows below. Non-servable modifiers
  // should visually inherit the product's tint / done state.
  const isolateModifierRows = hasServableModifiers;

  // FIX 3: Alternating seen colors. Even index (0, 2, ...) = green, odd (1, 3, ...) = amber for clear contrast.
  const useTeal = isSeen && typeof seenIdx === 'number' && seenIdx % 2 === 1;
  const seenBgGreen = 'rgba(29, 158, 117, 0.14)';
  const seenBgTeal = 'rgba(245, 158, 11, 0.18)';
  const seenTextGreen = '#0F5132';
  const seenTextTeal = '#92400E';

  // Seen rows use a very light tint (alternating); Done rows use a light grey tint.
  const stateBg = tappable && (isDone ? 'rgba(149, 165, 166, 0.12)' : (isSeen && !legacyActions) ? (useTeal ? seenBgTeal : seenBgGreen) : undefined);
  const isHighlightActive = isHighlighted && !item.isCancelled;
  const productRowBg = is86Active
    ? 'rgba(26, 26, 46, 0.08)'
    : isHighlightActive
      ? 'hsl(var(--destructive) / 0.12)'
      : stateBg || undefined;
  const stateOpacity = itemOpacity;
  // Pending course items dim to 0.55, but allergens must remain crisp — so we
  // apply the dim to individual sections (name row, modifiers, notes) rather
  // than the whole card, and skip the allergen row.
  const pendingDim = isPending && !item.isCancelled ? 0.55 : undefined;
  const dimStyle = pendingDim !== undefined ? { opacity: pendingDim } : undefined;

  // Tightened spacing for Standard view: minimize gaps between name / allergens / modifiers / notes.
  const headerPad = compactRows ? '0px 0 0 0px' : '0px 0 0 0px';
  const allergenMt = compactRows ? '0px' : '0px';

  const longPressRow = useLongPress(() => {
    if (item.isCancelled || is86Active || is86Confirmed) return;
    setManual86Open(true);
  }, { enabled: tappable, stopPropagation: true });

  const isOnboardingFirstItem = item.id === ONBOARDING_SAMPLE_FIRST_ITEM_ID;
  const showOnboardingActionSet = false;
  const onbAttr = isOnboardingFirstItem ? { 'data-onboarding': 'item-row' } : {};
  return (
    <div
      {...onbAttr}
      className={`-mx-2 px-2 relative ${isLastVisible ? '' : 'border-b border-border/50'} ${item.isCancelled ? 'opacity-50' : ''} ${item.isNew && !item.isCancelled ? 'animate-new-item' : ''} ${isHighlightActive ? 'animate-pulse' : ''}`}
      style={{
        ...(stateOpacity !== undefined ? { opacity: stateOpacity } : {}),
        ...(!isolateModifierRows && productRowBg ? { backgroundColor: productRowBg } : {}),
        paddingTop: 'var(--kds-row-py, 4px)',
        paddingBottom: hasServableModifiers ? '0px' : 'var(--kds-row-py, 4px)',
        paddingRight: legacyActions && tappable ? '56px' : undefined,
      }}
    >
      <div
        className={`flex items-center transition-colors select-none ${tappable && !legacyActions ? 'cursor-pointer active:bg-muted/50' : ''}`}
        style={{
          padding: isolateModifierRows ? '0px 8px 0 8px' : headerPad,
          gap: 0,
          ...(isolateModifierRows ? { marginLeft: '-8px', marginRight: '-8px' } : {}),
          ...(isolateModifierRows && productRowBg ? { backgroundColor: productRowBg } : {}),
        }}
        onClick={legacyActions ? (tappable ? () => setRecipeOpen(true) : undefined) : (tappable ? handleTap : undefined)}
        {...longPressRow}
        title={tappable ? (legacyActions ? 'Tap for recipe · Hold to 86' : (status === 'done' ? 'Tap to remove · Double-tap to undo · Hold to 86' : status === 'preparing' ? 'Tap to mark DONE · Double-tap to undo · Hold to 86' : 'Tap to mark SEEN · Hold to 86')) : undefined}
      >
        {ticketLayoutCompact && (
          hasDetails ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setDetailsOpen(o => !o); }}
              aria-label={detailsOpen ? 'Collapse details' : 'Expand details'}
              aria-expanded={detailsOpen}
              data-chevron-slot="line"
              className="shrink-0 inline-flex items-center justify-center rounded hover:bg-muted/60"
              style={{ width: 12, height: 12 }}
            >
              <ChevronRight
                size={12}
                className="text-text-muted transition-transform duration-200"
                style={{ transform: detailsOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>
          ) : (
            <span
              aria-hidden="true"
              data-chevron-slot="line"
              className="shrink-0 inline-flex items-center justify-center"
              style={{ width: 12, height: 12 }}
            >
              <ChevronRight size={12} className="text-text-muted/60" />
            </span>
          )
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-nowrap min-w-0" style={{ gap: '4px', lineHeight: 1.1, ...(dimStyle || {}) }}>
            <span
              className={`font-normal shrink-0 ${isDone ? 'line-through' : ''}`}
              style={{ fontSize: 'var(--kds-item-qty)', color: 'hsl(var(--text-secondary))', lineHeight: 1.1, width: ticketLayoutCompact ? '1.5ch' : '2.25ch', textAlign: 'center', display: 'inline-block' }}
            >
              {item.quantity}x
            </span>
            <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 'var(--kds-child-gap, 1px)' }}>
              <TightWidthBox
                constrainSecondary={secondaryDir === 'rtl'}
                deps={[item.name, displayMode, showSecondaryMenu, secondaryDir, isHighlighted]}
                primary={
                  <span
                    className={`inline font-bold uppercase break-words ${item.isCancelled ? 'line-through text-text-muted' : isDone ? 'line-through text-text-primary' : 'text-text-primary'}`}
                    style={{
                      fontSize: 'var(--kds-item-name)',
                      lineHeight: 1.1,
                      wordBreak: 'break-word',
                      ...(isHighlighted && !item.isCancelled ? { color: '#1D4ED8' } : {}),
                    }}
                  >
                    {tp(item.name)}
                  </span>
                }
                secondary={showDetails && displayMode === 'dual' && showSecondaryMenu && !item.isCancelled ? (
                  <div
                    dir="ltr"
                    className={`flex items-center font-bold uppercase text-text-muted ${isDone ? 'line-through' : ''}`}
                    style={{
                      gap: '4px',
                      marginBottom: '0px',
                      fontSize: 'var(--kds-modifier)',
                      lineHeight: '1',
                      flexDirection: secondaryDir === 'rtl' ? 'row-reverse' : 'row',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-3 h-3 rounded bg-muted shrink-0">
                      <Languages size={8} className="text-text-secondary" />
                    </span>
                    <span className="min-w-0 flex-1" style={{ lineHeight: 1, unicodeBidi: 'plaintext', textAlign: secondaryDir === 'rtl' ? 'right' : 'left', overflowWrap: 'anywhere' }} dir={secondaryDir}>{tpSecondary(item.name)}</span>
                  </div>
                ) : undefined}
              />
            </div>
            {item.isCancelled && (
              <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1 py-px rounded shrink-0">
                CANCELLED
              </span>
            )}
            {!legacyActions && tappable && isSeen && timestamps?.seenAt && (
              <span
                style={{ fontSize: '11px', color: useTeal ? seenTextTeal : seenTextGreen, fontWeight: 600, paddingTop: '3px', alignSelf: 'flex-start' }}
                className="ml-1 shrink-0 whitespace-nowrap"
              >
                {t.seenAt} {timestamps.seenAt}
              </span>
            )}
            {!legacyActions && tappable && isDone && timestamps?.doneAt && (
              <span
                style={{ fontSize: '11px', color: '#374151', fontWeight: 600, paddingTop: '3px', alignSelf: 'flex-start' }}
                className="ml-1 shrink-0 whitespace-nowrap"
              >
                {t.doneAt} {timestamps.doneAt}
              </span>
            )}
          </div>

          {showDetails && showAllergens && item.allergens.length > 0 && (
            <div className="flex items-start" style={{ gap: '4px', marginTop: 'var(--kds-child-gap, 1px)', marginBottom: '4px', lineHeight: 1 }}>
              <span className="invisible shrink-0 font-normal" aria-hidden="true" style={{ fontSize: 'var(--kds-item-qty)', lineHeight: 1, width: ticketLayoutCompact ? '1.5ch' : '2.25ch', display: 'inline-block' }}>
                0x
              </span>
              <div
                {...(isOnboardingFirstItem ? { 'data-onboarding': 'item-allergen' } : {})}
                className="flex flex-wrap items-start"
                style={{ gap: '4px', rowGap: '2px', lineHeight: 1 }}
              >
                {item.allergens.map((a) => (
                  <AllergenBadge key={a.type} allergen={a} variant="item" suffix="allergy" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showDetails && item.modifiers.length > 0 && (() => {
        const nonServable = item.modifiers.filter((m) => !isServableMod(m));
        const servable = item.modifiers.filter((m) => isServableMod(m));
        return (
          <>
            {nonServable.length > 0 && (
              <div
                {...(item.id === 'onb-i-2' ? { 'data-onboarding': 'item-modifier' } : {})}
                className={isDone ? 'line-through' : ''}
                style={{
                  marginTop: '-2px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isolateModifierRows ? '0px' : 'var(--kds-child-gap, 1px)',
                  paddingLeft: isolateModifierRows ? (ticketLayoutCompact ? '24px' : '8px') : (ticketLayoutCompact ? '16px' : '0px'),
                  paddingRight: isolateModifierRows ? '8px' : '0px',
                  ...(isolateModifierRows ? { marginLeft: '-8px', marginRight: '-8px' } : {}),
                  ...(isolateModifierRows && productRowBg ? { backgroundColor: productRowBg } : {}),
                  ...(dimStyle || {}),
                }}
              >
                {nonServable.map((mod, idx) => (
                  <ModifierLine
                    key={mod.id || `ns-${idx}`}
                    modifier={mod}
                    servableEnabled={false}
                    parentQuantity={item.quantity}
                    compactQtyCol={ticketLayoutCompact}
                  />
                ))}
              </div>
            )}
            {servable.length > 0 && (
              <div
                style={{
                  marginTop: '0px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0px',
                  paddingLeft: ticketLayoutCompact ? '16px' : '0px',
                  ...(dimStyle || {}),
                }}
              >
                {servable.map((mod, idx) => (
                  <ModifierLine
                    key={mod.id || `s-${idx}`}
                    modifier={mod}
                    servableEnabled={servableModifiersEnabled}
                    modifierStatus={mod.id ? modifierStatuses?.get(mod.id) : undefined}
                    modifierTimestamps={mod.id ? modifierTimestamps?.get(mod.id) : undefined}
                    onAdvanceModifier={onAdvanceModifier}
                    onUndoModifier={onUndoModifier}
                    parentQuantity={item.quantity}
                    compactQtyCol={ticketLayoutCompact}
                  />
                ))}
              </div>
            )}
          </>
        );
      })()}

      {showDetails && item.notes && !item.isCancelled && (
        <div className="flex items-start" style={{ gap: '4px', marginTop: 'var(--kds-child-gap, 1px)', paddingLeft: ticketLayoutCompact ? '16px' : '0px', ...(dimStyle || {}) }}>
          <span className="invisible shrink-0 font-normal" aria-hidden="true" style={{ fontSize: 'var(--kds-item-qty)', width: ticketLayoutCompact ? '1.5ch' : '2.25ch', display: 'inline-block' }}>
            0x
          </span>
          <div
            className={`italic leading-snug min-w-0 text-text-muted font-medium ${isDone ? 'line-through' : ''}`}
            style={{ fontSize: 'var(--kds-modifier)' }}
          >
            "{tn(item.notes)}"
          </div>
        </div>
      )}
      {(is86Active || show86Pill) && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10" onClick={(e) => e.stopPropagation()}>
          <Flag86Button itemId={item.id} productName={item.name} />
        </div>
      )}
      {legacyActions && tappable && !is86Active && !show86Pill && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {(showOnboardingActionSet || (!isSeen && !isDone)) && (
            <span {...(item.id === 'onb-i-1' ? { 'data-onboarding': 'item-eye' } : {})}>
              <LegacyActionPill variant="seen" onClick={() => onAdvanceItem?.(item.id)} title="Mark Seen / In Progress" />
            </span>
          )}
          {!showOnboardingActionSet && (isSeen || isDone) && (
            <LegacyActionPill variant="undo" onClick={() => onUndoItem?.(item.id)} title="Undo" />
          )}
          {(showOnboardingActionSet || (isSeen && !isDone)) && (
            <span {...(item.id === 'onb-i-2' ? { 'data-onboarding': 'item-bell' } : {})}>
              <LegacyActionPill variant="bell" onClick={() => onAdvanceItem?.(item.id)} title="Mark Done" />
            </span>
          )}
          {(showOnboardingActionSet || isDone) && (
            <span {...(item.id === 'onb-i-3' ? { 'data-onboarding': 'item-check' } : {})}>
              <LegacyActionPill variant="check" onClick={() => onDismissItem?.(item.id)} title="Remove from ticket" />
            </span>
          )}
        </div>
      )}
      <Item86Modal
        open={manual86Open}
        onClose={() => setManual86Open(false)}
        onConfirm={(qty) => {
          setManual86Open(false);
          confirm86(item.id);
          // eslint-disable-next-line no-console
          console.log('Manual 86 confirmed:', 'item', [item.id], 'qty', qty);
        }}
        productName={item.name}
        currentQuantity={item.quantity ?? 1}
      />

      {legacyActions && (
        <RecipeReferenceModal
          product={recipeOpen ? item : null}
          order={order}
          onClose={() => setRecipeOpen(false)}
          variant="default"
        />
      )}
    </div>
  );
}
