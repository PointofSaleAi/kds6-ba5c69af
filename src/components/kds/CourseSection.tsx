import { useState, useMemo, useEffect } from 'react';
import { Languages, Eye, Check, ConciergeBell } from 'lucide-react';
import type { CourseGroup, OrderItem } from '@/types/kds';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import { AllergenBadge } from './AllergenBadge';
import { KdsActionIcon } from './KdsActionIcon';
import { StationBadge } from './StationBadge';
import { ModifierLine, type ModifierStatus } from './ModifierLine';

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

export function CourseSection({ courseGroup, onFireCourse, itemStatuses, itemTimestamps, onAdvanceItem, onUndoItem, onBulkAdvanceCourse, stationCourse, forcedStationStatus, onReRouteItem, showAllergens = true, highlightItemNames, lifecycleStatus, courseDoneAt, servableModifiersEnabled, modifierStatuses, onAdvanceModifier, onUndoModifier, courseAgingColor, dismissedItemIds, onDismissItem }: CourseSectionProps) {
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
        : 'uppercase text-muted-foreground tracking-wider flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis';

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
          {/* Active course: "Seen at HH:MM" after first acknowledgement */}
          {isActive && courseSeenAt && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-normal text-[#0F4C81]" style={{ backgroundColor: '#EFF6FF' }}>
              {t.seenAt} {courseSeenAt}
            </span>
          )}
          {/* Pending: static "Preparing at X:XX PM" label */}
          {coursingStatus === 'pending' && firingAtLabel && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground">
              {t.preparingAt} {firingAtLabel}
            </span>
          )}
          {/* Course-level undo + action icon for active courses - stopPropagation to prevent collapse */}
          {isActive && onBulkAdvanceCourse && (
            <div className="flex items-center" style={{ gap: '4px' }} onClick={(e) => e.stopPropagation()}>
              {collectiveState !== 'unseen' && (
                <button
                  onClick={() => handleCourseUndo()}
                  className="flex items-center justify-center"
                  style={{ width: 20, height: 20 }}
                  aria-label="Undo course"
                >
                  <div className="flex items-center justify-center" style={{ width: 18, height: 18 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
                  </div>
                </button>
              )}
              <button
                onClick={handleCourseEyeClick}
                className="flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ width: 20, height: 20, flexShrink: 0 }}
                title={collectiveState === 'unseen' ? 'Mark all seen' : collectiveState === 'preparing' ? 'Mark all done' : 'All done'}
              >
                {renderCourseIcon()}
              </button>
            </div>
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
        <div className="px-2 py-0.5">
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
              <div
                key={item.id}
                className={`${isLastVisible ? '' : 'border-b border-border/50'} ${item.isCancelled ? 'opacity-50' : ''} ${item.isNew && !item.isCancelled ? 'animate-new-item' : ''}`}
                style={{
                  ...(itemOpacity !== undefined ? { opacity: itemOpacity } : {}),
                  ...(isHighlighted ? { backgroundColor: '#EFF6FF' } : {}),
                }}
              >
                {/* Item primary row - name + item-level action icons */}
                <div
                  className="flex items-center cursor-pointer active:bg-muted/50 transition-colors"
                  style={{ padding: '2px 0 0 4px', gap: 0 }}
                  onClick={() => !item.isCancelled && onReRouteItem?.(item)}
                >
                  {/* Child 1 - item-main (name + translation only) */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap" style={{ gap: 'var(--kds-item-gap)' }}>
                      <span className="font-normal text-text-secondary" style={{ fontSize: 'var(--kds-item-qty)' }}>
                        {item.quantity}x
                      </span>
                      <span
                        className={`font-medium uppercase ${item.isCancelled ? 'line-through text-text-muted' : status === 'done' ? 'line-through text-success' : 'text-text-primary'} ${item.isCompleted && status !== 'done' ? 'text-success' : ''}`}
                        style={{ fontSize: 'var(--kds-item-name)', ...(isHighlighted && !item.isCancelled && !item.isCompleted && status !== 'done' ? { color: '#1D4ED8' } : {}) }}
                      >
                        {tp(item.name)}
                      </span>
                      {item.isCancelled && (
                        <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1 py-px rounded">
                          CANCELLED
                        </span>
                      )}
                      {item.isCompleted && !item.isCancelled && (
                        <span className="text-success text-xs">&#10003;</span>
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
                      {showAllergens && item.allergens.length > 0 && item.allergens.map((a) => (
                        <AllergenBadge key={a.type} allergen={a} variant="item" />
                      ))}
                      {isActive && status === 'preparing' && timestamps?.seenAt && (
                        <span className="text-[10px] text-text-muted font-normal ml-1">
                          {t.seenAt} {timestamps.seenAt}
                        </span>
                      )}
                      {isActive && status === 'done' && timestamps?.doneAt && (
                        <span className="text-[10px] text-text-muted font-normal ml-1">
                          {t.doneAt} {timestamps.doneAt}
                        </span>
                      )}
                    </div>

                    {displayMode === 'dual' && showSecondaryMenu && !item.isCancelled && (
                      <div className={`flex items-center gap-1 font-semibold uppercase ${status === 'done' ? 'line-through text-success/70' : 'text-text-muted'}`} style={{ paddingLeft: '20px', marginTop: '0px', marginBottom: '0px', fontSize: 'var(--kds-modifier)', lineHeight: '1' }}>
                        <span className="inline-flex items-center justify-center w-3 h-3 rounded bg-muted shrink-0">
                          <Languages size={8} className="text-text-secondary" />
                        </span>
                        {tpSecondary(item.name)}
                      </div>
                    )}
                  </div>

                  {/* Child 2 - item-action icons */}
                  {!item.isCancelled && (
                    <div className="flex items-center shrink-0 ml-auto" style={{ gap: '0px' }} onClick={(e) => e.stopPropagation()}>
                      {isCourseCompleted ? (
                        <KdsActionIcon icon="acknowledged" disabled />
                      ) : isPending ? null : isActive ? (
                        status === 'done' ? (
                          <>
                            <KdsActionIcon icon="undo" onClick={() => onUndoItem?.(item.id)} label="Undo" />
                            <KdsActionIcon icon="done" onClick={() => onDismissItem?.(item.id)} label="Dismiss" />
                          </>
                        ) : status === 'preparing' ? (
                          <>
                            <KdsActionIcon icon="undo" onClick={() => onUndoItem?.(item.id)} label="Undo" />
                            <KdsActionIcon icon="preparing" onClick={() => onAdvanceItem?.(item.id)} label="Mark done" />
                          </>
                        ) : (
                          <KdsActionIcon icon="seen" onClick={() => onAdvanceItem?.(item.id)} label="Mark seen" />
                        )
                      ) : isFired ? (
                        <>
                          <KdsActionIcon icon="undo" onClick={() => onUndoItem?.(item.id)} label="Undo" />
                          <KdsActionIcon icon="ready" onClick={() => onAdvanceItem?.(item.id, true)} label="Mark done" />
                        </>
                      ) : (
                        <KdsActionIcon icon="seen" onClick={() => onAdvanceItem?.(item.id)} label="Mark seen" />
                      )}
                    </div>
                  )}
                </div>

                {/* Modifiers as siblings of item row - each modifier row spans full width so its right-aligned eye icon lines up with item eye column */}
                {item.modifiers.length > 0 && (
                  <div className={status === 'done' ? 'line-through opacity-60' : ''}>
                    {item.modifiers.map((mod, idx) => (
                      <ModifierLine
                        key={mod.id || idx}
                        modifier={mod}
                        servableEnabled={servableModifiersEnabled}
                        modifierStatus={mod.id ? modifierStatuses?.get(mod.id) : undefined}
                        onAdvanceModifier={onAdvanceModifier}
                        onUndoModifier={onUndoModifier}
                      />
                    ))}
                  </div>
                )}

                {/* Product notes */}
                {item.notes && !item.isCancelled && (
                  <div
                    className="text-text-muted italic leading-snug"
                    style={{ paddingLeft: '24px', paddingBottom: '2px', fontSize: 'var(--kds-modifier)' }}
                  >
                    "{item.notes}"
                  </div>
                )}
              </div>
            );
          });
          })()}
        </div>
        </div>
      )}
    </div>
  );
}
