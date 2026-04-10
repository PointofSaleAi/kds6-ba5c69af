import { useState, useEffect, useMemo } from 'react';
import { Languages, Eye } from 'lucide-react';
import type { CourseGroup, OrderItem } from '@/types/kds';
import { useLanguage, formatTimeForKDS } from '@/hooks/use-language';
import { AllergenBadge } from './AllergenBadge';
import { KdsActionIcon } from './KdsActionIcon';
import { StationBadge } from './StationBadge';

export type ItemStatus = 'preparing' | 'ready' | 'done';
export type StationStatus = 'fired' | 'active' | 'pending';

type FireUrgency = 'normal' | 'due-soon' | 'overdue';

interface CourseSectionProps {
  courseGroup: CourseGroup;
  onFireCourse?: (course: string) => void;
  itemStatuses?: Map<string, ItemStatus>;
  onAdvanceItem?: (itemId: string, skipToDone?: boolean) => void;
  onUndoItem?: (itemId: string) => void;
  stationCourse?: string;
  forcedStationStatus?: StationStatus;
  onReRouteItem?: (item: OrderItem) => void;
  showAllergens?: boolean;
  highlightItemNames?: Set<string>;
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

function getStationLabel(courseGroup: CourseGroup, status: StationStatus, tc: (s: string) => string): string {
  const name = tc(courseGroup.course.charAt(0) + courseGroup.course.slice(1).toLowerCase());
  switch (status) {
    case 'fired': return `${name} \u00B7 Served`;
    case 'active': return `${name} \u00B7 Active`;
    case 'pending': return `${name} \u00B7 Pending`;
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
    // Parse "Auto-fire in M:SS" style labels to compute a target time
    const match = courseGroup.autoFireLabel.match(/(\d+):(\d+)/);
    if (match) {
      const totalSec = parseInt(match[1]) * 60 + parseInt(match[2]);
      const firingAt = new Date(Date.now() + totalSec * 1000);
      return formatTimeForKDS(firingAt, timeFormat);
    }
  }
  return null;
}

/** Live timer hook for active and fired courses only */
function useCourseTimer(courseGroup: CourseGroup, status: StationStatus): {
  label: string;
  urgency: FireUrgency;
} | null {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (status === 'pending') return; // No live timer for pending
    if (status === 'fired' && !courseGroup.firedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status, courseGroup.firedAt]);

  if (status === 'fired') {
    if (courseGroup.firedAt) {
      const ago = Math.floor((now - courseGroup.firedAt.getTime()) / 1000);
      return { label: `Done ${formatTimer(ago)} ago`, urgency: 'normal' };
    }
    if (courseGroup.firedAgoLabel) {
      return { label: `Done ${courseGroup.firedAgoLabel}`, urgency: 'normal' };
    }
    return null;
  }

  if (status === 'active') {
    if (courseGroup.fireInSeconds !== undefined) {
      const remaining = courseGroup.fireInSeconds - Math.floor((now - (courseGroup._startedAt?.getTime() ?? now)) / 1000);
      const targetTime = new Date(now + remaining * 1000);
      const timeStr = targetTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      if (remaining <= 0) {
        return { label: `Overdue ${formatTimer(-remaining)}`, urgency: 'overdue' };
      }
      return { label: `Preparing at ${timeStr}`, urgency: remaining <= 60 ? 'due-soon' : 'normal' };
    }
    if (courseGroup.prepTimerLabel) {
      const parts = courseGroup.prepTimerLabel.split(':').map(Number);
      const totalSec = (parts[0] || 0) * 60 + (parts[1] || 0);
      const elapsed = Math.floor((now - (courseGroup._startedAt?.getTime() ?? (now - totalSec * 1000))) / 1000);
      const remaining = totalSec - elapsed;
      const targetTime = new Date(now + remaining * 1000);
      const timeStr = targetTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      if (remaining <= 0) {
        return { label: `Preparing now`, urgency: 'due-soon' };
      }
      return { label: `Preparing at ${timeStr}`, urgency: remaining <= 60 ? 'due-soon' : 'normal' };
    }
    return null;
  }

  return null;
}

const urgencyChipStyles: Record<FireUrgency, string> = {
  'normal': 'bg-success/15 text-success',
  'due-soon': 'bg-warning/15 text-warning',
  'overdue': 'bg-destructive/15 text-destructive animate-pulse',
};

const firedChipStyle = 'bg-order-take-out/15 text-order-take-out';

export function CourseSection({ courseGroup, onFireCourse, itemStatuses, onAdvanceItem, onUndoItem, stationCourse, forcedStationStatus, onReRouteItem, showAllergens = true, highlightItemNames }: CourseSectionProps) {
  const { tp, tc, displayMode, tpSecondary, timeFormat } = useLanguage();
  const isFired = courseGroup.isFired;
  const isStationMode = !!stationCourse;

  const coursingStatus = forcedStationStatus
    ?? (isStationMode ? getStationStatus(courseGroup, stationCourse) : getCoursingStatus(courseGroup));
  
  const isDimmed = coursingStatus === 'fired' || coursingStatus === 'pending';
  const isPending = coursingStatus === 'pending';

  const hasItems = courseGroup.items.length > 0;

  const isCourseCompleted = coursingStatus === 'fired';

  const [isExpanded, setIsExpanded] = useState(!isCourseCompleted);

  // Live timer (only for active/fired)
  const timer = useCourseTimer(courseGroup, coursingStatus);

  // Static firing-at label for pending courses (computed once via useMemo)
  const firingAtLabel = useMemo(() => {
    if (coursingStatus !== 'pending') return null;
    return computeFiringAtTime(courseGroup, timeFormat as 0 | 1);
  }, [coursingStatus, courseGroup, timeFormat]);

  const containerClass = coursingStatus === 'active'
    ? 'border-l-[3px] rounded-l-none'
    : isDimmed
      ? (isStationMode ? 'opacity-80 pointer-events-none' : '')
      : '';

  const containerStyle = coursingStatus === 'active'
    ? { borderLeftColor: '#7F77DD' }
    : undefined;

  const headerBg = coursingStatus === 'active'
    ? ''
    : coursingStatus === 'fired'
      ? 'bg-success/10'
      : 'bg-muted';

  const headerStyle = coursingStatus === 'active'
    ? { backgroundColor: '#EEEDFE' }
    : undefined;

  const courseName = tc(courseGroup.course.charAt(0) + courseGroup.course.slice(1).toLowerCase());
  const courseLabel = isStationMode
    ? getStationLabel(courseGroup, coursingStatus, tc)
    : `${courseName} \u00B7 ${coursingStatus === 'fired' ? 'Served' : coursingStatus === 'active' ? 'Active' : 'Pending'}`;

  const labelClass = coursingStatus === 'active'
    ? 'text-[11px] uppercase tracking-wider font-medium flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'
    : coursingStatus === 'fired'
      ? 'text-[11px] uppercase tracking-wider text-success font-normal flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'
      : 'text-[11px] uppercase text-muted-foreground tracking-wider font-normal flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis';

  const labelStyle = coursingStatus === 'active'
    ? { color: '#7F77DD', fontWeight: 500 }
    : { fontWeight: 400 };

  const showFireButton = coursingStatus === 'active' && !!onFireCourse;

  // Timer chip style
  const chipStyle = coursingStatus === 'fired'
    ? firedChipStyle
    : timer ? urgencyChipStyles[timer.urgency] : '';

  return (
    <div className={containerClass} style={containerStyle}>
      <div
        className={`flex items-center justify-between flex-nowrap ${headerBg} cursor-pointer select-none`}
        style={{ ...headerStyle, padding: '4px 8px' }}
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className={`text-[11px] text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <span className={labelClass} style={labelStyle}>
            {courseLabel}
          </span>
        </div>
        <div className="flex items-center shrink-0" style={{ gap: '4px' }}>
          {/* Fired/active timer chip */}
          {timer && coursingStatus !== 'pending' && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tabular-nums ${chipStyle}`}>
              {timer.label}
            </span>
          )}
          {/* Pending: static "Preparing at X:XX PM" label */}
          {coursingStatus === 'pending' && firingAtLabel && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-normal bg-muted text-muted-foreground">
              Preparing at {firingAtLabel}
            </span>
          )}
          {/* Eye button only for active courses */}
          {showFireButton && onFireCourse && (
            <button
              onClick={(e) => { e.stopPropagation(); onFireCourse(courseGroup.course); }}
              className="rounded-full flex items-center justify-center min-h-[28px] min-w-[28px] p-0.5 transition-all duration-200 hover:scale-110"
              title={`Prepare ${tc(courseGroup.course === 'APPETIZER' ? 'APPS' : courseGroup.course === 'ENTREE' ? 'MAINS' : courseGroup.course)}`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: '#DBEAFE' }}>
                <Eye size={14} color="#3B82F6" strokeWidth={2.5} />
              </div>
            </button>
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
          {courseGroup.items.map((item) => {
            const status = itemStatuses?.get(item.id);
            const isHighlighted = !!highlightItemNames && highlightItemNames.size > 0 && highlightItemNames.has(item.name);

            return (
              <div
                key={item.id}
                className={`flex items-center border-b border-border/50 cursor-pointer active:bg-muted/50 transition-colors ${item.isCancelled ? 'opacity-50' : ''} ${status === 'done' && !isCourseCompleted ? 'hidden' : ''} ${isCourseCompleted ? 'opacity-80' : ''}`}
                style={{
                  padding: '4px 0 4px 4px',
                  gap: 0,
                  ...(isPending && !item.isCancelled ? { opacity: 0.4 } : {}),
                  ...(isHighlighted ? { backgroundColor: '#EFF6FF' } : {}),
                }}
                onClick={() => !item.isCancelled && onReRouteItem?.(item)}
              >
                {/* Child 1 — item-main */}
                <div className="flex-1 min-w-0">
                  {/* .item-name-row */}
                  <div className="flex items-center flex-wrap" style={{ gap: '6px' }}>
                    <span className="text-[13px] font-normal text-text-secondary">
                      {item.quantity}×
                    </span>
                    <span
                      className={`text-[13px] font-medium uppercase ${item.isCancelled ? 'line-through text-text-muted' : 'text-text-primary'} ${item.isCompleted ? 'text-success' : ''}`}
                      style={isHighlighted && !item.isCancelled && !item.isCompleted ? { color: '#1D4ED8' } : undefined}
                    >
                      {tp(item.name)}
                    </span>
                    {item.station && !item.isCancelled && (
                      <StationBadge station={item.station} />
                    )}
                    {item.isCancelled && (
                      <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1 py-px rounded">
                        CANCELLED
                      </span>
                    )}
                    {item.isCompleted && !item.isCancelled && (
                      <span className="text-success text-xs">&#10003;</span>
                    )}
                    {showAllergens && item.allergens.length > 0 && item.allergens.map((a) => (
                      <AllergenBadge key={a.type} allergen={a} variant="item" />
                    ))}
                  </div>

                  {/* Dual-language secondary name */}
                  {displayMode === 'dual' && !item.isCancelled && (
                    <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-semibold uppercase" style={{ paddingLeft: '20px', marginTop: '1px' }}>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-muted shrink-0">
                        <Languages size={10} className="text-text-secondary" />
                      </span>
                      {tpSecondary(item.name)}
                    </div>
                  )}

                  {/* .item-mods */}
                  {item.modifiers.length > 0 && (
                    <div style={{ marginTop: '2px' }}>
                      {item.modifiers.map((mod, idx) => (
                        <div
                          key={idx}
                          className={
                            mod.type === 'extra'
                              ? 'text-modifier-extra'
                              : mod.type === 'remove'
                                ? 'text-destructive line-through'
                                : 'text-text-secondary'
                          }
                          style={{ fontSize: '11px', lineHeight: '1.4', marginBottom: 0, paddingLeft: '20px' }}
                        >
                          {mod.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Product notes */}
                  {item.notes && !item.isCancelled && (
                    <div
                      className="text-[11px] text-text-muted italic leading-snug"
                      style={{ paddingLeft: '20px', marginTop: '2px' }}
                    >
                      "{item.notes}"
                    </div>
                  )}
                </div>

                {/* Child 2 — item-action */}
                {!item.isCancelled && (
                  <div className="flex items-center shrink-0 ml-auto" style={{ gap: '0px' }} onClick={(e) => e.stopPropagation()}>
                    {isCourseCompleted ? (
                      <KdsActionIcon icon="acknowledged" disabled />
                    ) : isPending ? null : status === 'ready' ? (
                      <>
                        <KdsActionIcon icon="undo" onClick={() => onUndoItem?.(item.id)} label="Undo" />
                        <KdsActionIcon icon="ready" onClick={() => onAdvanceItem?.(item.id)} label="Mark done" />
                      </>
                    ) : status === 'preparing' ? (
                      <>
                        <KdsActionIcon icon="undo" onClick={() => onUndoItem?.(item.id)} label="Undo" />
                        <KdsActionIcon icon="preparing" onClick={() => onAdvanceItem?.(item.id)} label="Mark ready" />
                      </>
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
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
}
