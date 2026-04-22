import { useState, useMemo, useEffect } from 'react';
import { Languages, Eye, Check, ConciergeBell } from 'lucide-react';
import type { CourseGroup, OrderItem } from '@/types/kds';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import { AllergenBadge } from './AllergenBadge';
import { KdsActionIcon } from './KdsActionIcon';
import { StationBadge } from './StationBadge';
import { ModifierLine, type ModifierStatus } from './ModifierLine';
import { useRowTap } from '@/hooks/use-row-tap';

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
  onAdvanceModifier?: (modId: string) => void;
  onUndoModifier?: (modId: string) => void;
  courseAgingColor?: { color: string; textColor: string };
  dismissedItemIds?: Set<string>;
  onDismissItem?: (itemId: string) => void;
  compactRows?: boolean;
  seenOrderIndex?: Map<string, number>;
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

export function CourseSection({ courseGroup, onFireCourse, itemStatuses, itemTimestamps, onAdvanceItem, onUndoItem, onBulkAdvanceCourse, stationCourse, forcedStationStatus, onReRouteItem, showAllergens = true, highlightItemNames, lifecycleStatus, courseDoneAt, servableModifiersEnabled, modifierStatuses, onAdvanceModifier, onUndoModifier, courseAgingColor, dismissedItemIds, onDismissItem, compactRows, seenOrderIndex }: CourseSectionProps) {
  const { tp, tc, displayMode, tpSecondary, timeFormat, t, showSecondaryMenu, secondaryLang } = useLanguage();
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
    const allDone = activeItemIds.every(id => itemStatuses?.get(id) === 'done');
    if (allDone) return 'done';
    const allSeen = activeItemIds.every(id => {
      const s = itemStatuses?.get(id);
      return s === 'preparing' || s === 'done';
    });
    if (allSeen) return 'preparing';
    return 'unseen';
  }, [isActive, activeItemIds, itemStatuses]);

  // Auto-collapse when course becomes served or all items done
  useEffect(() => {
    if (isServedByLifecycle) {
      setIsExpanded(false);
    } else if (isActive && collectiveState === 'done') {
      setIsExpanded(false);
    }
  }, [isActive, collectiveState, isServedByLifecycle]);

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
    if (courseGroup.firedAgoLabel) return `${t.doneAt} ${courseGroup.firedAgoLabel}`;
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

  const headerBg = coursingStatus === 'active'
    ? ''
    : coursingStatus === 'fired'
      ? 'bg-muted/50'
      : 'bg-muted';

  const headerStyle = coursingStatus === 'active'
    ? { backgroundColor: agingColor ? `${agingColor}18` : '#EFF6FF' }
    : undefined;

  const courseName = tc(courseGroup.course.charAt(0) + courseGroup.course.slice(1).toLowerCase());
  const statusWord = coursingStatus === 'fired' ? t.served : coursingStatus === 'active' ? t.active : t.queued;
  const courseLabel = isServedByLifecycle
    ? `${courseName} \u00B7 ${t.served}`
    : isStationMode
      ? getStationLabel(courseGroup, coursingStatus, tc, { active: t.active, queued: t.queued, served: t.served })
      : `${courseName} \u00B7 ${statusWord}`;

  const labelClass = isServedByLifecycle
    ? 'uppercase tracking-wider text-muted-foreground flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'
    : coursingStatus === 'active'
      ? 'uppercase tracking-wider font-semibold flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'
      : coursingStatus === 'fired'
        ? 'uppercase tracking-wider text-muted-foreground flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'
        : 'uppercase text-text-secondary tracking-wider flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis';

  const labelStyle = coursingStatus === 'active'
    ? { color: agingColor || '#0F4C81', fontWeight: 600, fontSize: '14px' }
    : { fontWeight: 500 };

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
          style={{ padding: '4px 8px' }}
          onClick={() => setServedExpanded(prev => !prev)}
        >
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className={`text-muted-foreground transition-transform duration-200 ${servedExpanded ? 'rotate-90' : ''}`} style={{ fontSize: 'var(--kds-course-header)' }}>▶</span>
            <span className={labelClass} style={{ ...labelStyle, fontSize: 'var(--kds-course-header)' }}>
              {courseLabel}
            </span>
          </div>
          {courseDoneAt && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-muted-foreground">
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
                    <div className="flex items-center flex-wrap" style={{ gap: 'var(--kds-item-gap)' }}>
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

  return (
    <div className={containerClass} style={containerStyle}>
      <div
        className={`flex items-center justify-between flex-nowrap ${headerBg} cursor-pointer select-none`}
        style={{ ...headerStyle, padding: '4px 8px' }}
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className={`text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} style={{ fontSize: 'var(--kds-course-header)' }}>
            ▶
          </span>
          <span className={labelClass} style={{ ...labelStyle, ...(coursingStatus !== 'active' ? { fontSize: 'var(--kds-course-header)' } : {}) }}>
            {courseLabel}
          </span>
        </div>
        <div className="flex items-center shrink-0" style={{ gap: '4px' }}>
          {/* Fired course: "Done X ago" */}
          {coursingStatus === 'fired' && firedTimerLabel && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tabular-nums bg-order-take-out/15 text-order-take-out">
              {firedTimerLabel}
            </span>
          )}
          {/* Pending: static "Preparing at X:XX PM" label */}
          {coursingStatus === 'pending' && firingAtLabel && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted" style={{ color: '#AAAAAA' }}>
              {t.preparingAt} {firingAtLabel}
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
        <div className="px-2">
          {(() => {
          const visibleItems = courseGroup.items.filter((item) => {
            if (dismissedItemIds?.has(item.id)) return false;
            return true;
          });
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
                onAdvanceModifier={onAdvanceModifier}
                onUndoModifier={onUndoModifier}
                onAdvanceItem={onAdvanceItem}
                onUndoItem={onUndoItem}
                onDismissItem={onDismissItem}
              />
            );
          });
          })()}
        </div>
        </div>
      )}
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
  onAdvanceModifier?: (id: string) => void;
  onUndoModifier?: (id: string) => void;
  onAdvanceItem?: (itemId: string, skipToDone?: boolean) => void;
  onUndoItem?: (itemId: string) => void;
  onDismissItem?: (itemId: string) => void;
}

function CourseItemTapRow({
  item, status, timestamps, isLastVisible, isHighlighted, itemOpacity,
  isActive, isPending, isCourseCompleted,
  showAllergens, displayMode, showSecondaryMenu, secondaryDir,
  tp, tpSecondary, t,
  servableModifiersEnabled, modifierStatuses, onAdvanceModifier, onUndoModifier,
  onAdvanceItem, onUndoItem, onDismissItem,
}: CourseItemTapRowProps) {
  const tappable = isActive && !isPending && !isCourseCompleted && !item.isCancelled;

  const handleSingle = () => {
    if (!tappable) return;
    if (status === 'done') {
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

  // Seen rows use a very light green tint; Done rows use a light grey tint.
  const stateBg = tappable && (isDone ? 'rgba(149, 165, 166, 0.12)' : isSeen ? 'rgba(29, 158, 117, 0.10)' : undefined);
  const stateOpacity = itemOpacity;

  return (
    <div
      className={`-mx-2 px-2 ${isLastVisible ? '' : 'border-b border-border/50'} ${item.isCancelled ? 'opacity-50' : ''} ${item.isNew && !item.isCancelled ? 'animate-new-item' : ''}`}
      style={{
        ...(stateOpacity !== undefined ? { opacity: stateOpacity } : {}),
        ...(isHighlighted ? { backgroundColor: 'rgba(29, 158, 117, 0.10)' } : stateBg ? { backgroundColor: stateBg } : {}),
      }}
    >
      <div
        className={`flex items-center transition-colors select-none ${tappable ? 'cursor-pointer active:bg-muted/50' : ''}`}
        style={{ padding: '2px 0 0 4px', gap: 0 }}
        onClick={tappable ? handleTap : undefined}
        title={tappable ? (status === 'done' ? 'Tap to remove · Double-tap to undo' : status === 'preparing' ? 'Tap to mark DONE · Double-tap to undo' : 'Tap to mark SEEN') : undefined}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap" style={{ gap: 'var(--kds-item-gap)' }}>
            <span
              className={`font-normal ${isDone ? 'line-through' : ''}`}
              style={{ fontSize: 'var(--kds-item-qty)', color: 'hsl(var(--text-secondary))' }}
            >
              {item.quantity}x
            </span>
            <span
              className={`font-bold uppercase ${item.isCancelled ? 'line-through text-text-muted' : isDone ? 'line-through text-text-primary' : 'text-text-primary'}`}
              style={{
                fontSize: 'var(--kds-item-name)',
                ...(isHighlighted && !item.isCancelled ? { color: '#1D4ED8' } : {}),
              }}
            >
              {tp(item.name)}
            </span>
            {item.isCancelled && (
              <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1 py-px rounded">
                CANCELLED
              </span>
            )}
            {item.isRecalled && !item.isCancelled && (
              <span
                className="uppercase tracking-wide"
                style={{
                  backgroundColor: '#E24B4A',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                RECALLED
              </span>
            )}
            {tappable && isSeen && timestamps?.seenAt && (
              <span style={{ fontSize: '10px', color: '#0F5132', fontWeight: 600 }} className="ml-1">
                {t.seenAt} {timestamps.seenAt}
              </span>
            )}
            {tappable && isDone && timestamps?.doneAt && (
              <span style={{ fontSize: '10px', color: '#374151', fontWeight: 600 }} className="ml-1">
                {t.doneAt} {timestamps.doneAt}
              </span>
            )}
          </div>

          {displayMode === 'dual' && showSecondaryMenu && !item.isCancelled && (
            <div
              dir={secondaryDir}
              className={`relative flex items-center font-bold uppercase text-text-muted ${isDone ? 'line-through' : ''}`}
              style={{
                gap: 'var(--kds-item-gap)',
                marginTop: '0px',
                marginBottom: '0px',
                fontSize: 'var(--kds-modifier)',
                lineHeight: '1',
              }}
            >
              <span className="relative font-normal shrink-0" style={{ fontSize: 'var(--kds-item-qty)' }}>
                <span className="invisible" aria-hidden="true">{item.quantity}x</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded bg-muted">
                    <Languages size={8} className="text-text-secondary" />
                  </span>
                </span>
              </span>
              <span>{tpSecondary(item.name)}</span>
            </div>
          )}

          {showAllergens && item.allergens.length > 0 && (
            <div className="flex items-start" style={{ gap: '6px', marginTop: '2px' }}>
              <span className="invisible shrink-0 font-normal" aria-hidden="true" style={{ fontSize: 'var(--kds-item-qty)' }}>
                {item.quantity}x
              </span>
              <div className="flex flex-wrap items-center" style={{ gap: '4px' }}>
                {item.allergens.map((a) => (
                  <AllergenBadge key={a.type} allergen={a} variant="item" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {item.modifiers.length > 0 && (
        <div className={isDone ? 'line-through' : ''}>
          {item.modifiers.map((mod, idx) => (
            <ModifierLine
              key={mod.id || idx}
              modifier={mod}
              servableEnabled={servableModifiersEnabled}
              modifierStatus={mod.id ? modifierStatuses?.get(mod.id) : undefined}
              onAdvanceModifier={onAdvanceModifier}
              onUndoModifier={onUndoModifier}
              parentQuantity={item.quantity}
            />
          ))}
        </div>
      )}

      {item.notes && !item.isCancelled && (
        <div className="flex items-start" style={{ gap: '6px', paddingLeft: '4px' }}>
          <span className="invisible shrink-0 font-normal" aria-hidden="true" style={{ fontSize: 'var(--kds-item-qty)' }}>
            {item.quantity}&times;
          </span>
          <div
            className={`italic leading-snug min-w-0 text-text-muted ${isDone ? 'line-through' : ''}`}
            style={{ fontSize: 'var(--kds-modifier)' }}
          >
            "{item.notes}"
          </div>
        </div>
      )}
    </div>
  );
}
