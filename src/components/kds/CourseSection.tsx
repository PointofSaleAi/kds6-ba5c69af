import { useState, useEffect, useCallback } from 'react';
import type { CourseGroup } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { AllergenBadge } from './AllergenBadge';

import seenIcon from '@/assets/seen-icon.svg';
import preparingIcon from '@/assets/preparing-icon.svg';
import undoIcon from '@/assets/undo-icon.svg';
import readyIcon from '@/assets/item-ready-icon.svg';
import fireIcon from '@/assets/fire-icon.png';

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
    case 'fired': return `${name} \u00B7 Fired`;
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

/** Live timer hook for a single course */
function useCourseTimer(courseGroup: CourseGroup, status: StationStatus): {
  label: string;
  urgency: FireUrgency;
} | null {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
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
      if (remaining <= 0) {
        return { label: `Overdue ${formatTimer(-remaining)}`, urgency: 'overdue' };
      }
      if (remaining <= 60) {
        return { label: `Ready to fire`, urgency: 'due-soon' };
      }
      return { label: `Fire in ${formatTimer(remaining)}`, urgency: 'normal' };
    }
    if (courseGroup.prepTimerLabel) {
      // Parse static label as seconds for live countdown
      const parts = courseGroup.prepTimerLabel.split(':').map(Number);
      const totalSec = (parts[0] || 0) * 60 + (parts[1] || 0);
      const elapsed = Math.floor((now - (courseGroup._startedAt?.getTime() ?? (now - totalSec * 1000))) / 1000);
      const remaining = totalSec - elapsed;
      if (remaining <= 0) {
        return { label: `Ready to fire`, urgency: 'due-soon' };
      }
      if (remaining <= 60) {
        return { label: `Fire in ${formatTimer(remaining)}`, urgency: 'due-soon' };
      }
      return { label: `Fire in ${formatTimer(remaining)}`, urgency: 'normal' };
    }
    return null;
  }

  if (status === 'pending') {
    if (courseGroup.autoFireTargetSeconds !== undefined) {
      const remaining = courseGroup.autoFireTargetSeconds - Math.floor((now - (courseGroup._startedAt?.getTime() ?? now)) / 1000);
      return { label: `Auto-fire in ${formatTimer(Math.max(0, remaining))}`, urgency: 'normal' };
    }
    if (courseGroup.autoFireLabel) {
      return { label: courseGroup.autoFireLabel, urgency: 'normal' };
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
const pendingChipStyle = 'bg-muted text-muted-foreground';

export function CourseSection({ courseGroup, onFireCourse, itemStatuses, onAdvanceItem, onUndoItem, stationCourse, forcedStationStatus }: CourseSectionProps) {
  const { tp, tc, displayMode, tpSecondary } = useLanguage();
  const isFired = courseGroup.isFired;
  const isStationMode = !!stationCourse;

  const coursingStatus = forcedStationStatus
    ?? (isStationMode ? getStationStatus(courseGroup, stationCourse) : getCoursingStatus(courseGroup));
  
  const isDimmed = coursingStatus === 'fired' || coursingStatus === 'pending';

  const hasItems = courseGroup.items.length > 0;
  const allItemsDone = hasItems && courseGroup.items
    .filter(i => !i.isCancelled)
    .every(i => itemStatuses?.get(i.id) === 'done');

  if (allItemsDone) return null;

  // Live timer
  const timer = useCourseTimer(courseGroup, coursingStatus);

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
    : `${courseName} \u00B7 ${coursingStatus === 'fired' ? 'Fired' : coursingStatus === 'active' ? 'Active' : 'Pending'}`;

  const labelClass = coursingStatus === 'active'
    ? 'text-[11px] uppercase tracking-wider font-medium flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'
    : coursingStatus === 'fired'
      ? 'text-[11px] uppercase tracking-wider text-success font-normal flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'
      : 'text-[11px] uppercase text-muted-foreground tracking-wider font-normal flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis';

  const labelStyle = coursingStatus === 'active'
    ? { color: '#7F77DD', fontWeight: 500 }
    : { fontWeight: 400 };

  const showFireButton = coursingStatus !== 'fired' && !!onFireCourse;
  const fireButtonDisabled = coursingStatus === 'pending';

  // Timer chip style
  const chipStyle = coursingStatus === 'fired'
    ? firedChipStyle
    : coursingStatus === 'pending'
      ? pendingChipStyle
      : timer ? urgencyChipStyles[timer.urgency] : '';

  return (
    <div className={containerClass} style={containerStyle}>
      <div className={`flex items-center justify-between flex-nowrap ${headerBg}`} style={{ ...headerStyle, padding: '4px 8px' }}>
        <span className={labelClass} style={labelStyle}>
          {courseLabel}
        </span>
        <div className="flex items-center shrink-0" style={{ gap: '4px' }}>
          {timer && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tabular-nums ${chipStyle}`}>
              {timer.label}
            </span>
          )}
          {showFireButton && onFireCourse && (
            <button
              onClick={() => onFireCourse(courseGroup.course)}
              disabled={fireButtonDisabled}
              className={`rounded-full flex items-center justify-center min-h-[28px] min-w-[28px] p-0.5 transition-all duration-200 ${
                fireButtonDisabled
                  ? 'opacity-30 pointer-events-none'
                  : 'hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(255,140,50,0.6)]'
              }`}
              title={`Fire ${tc(courseGroup.course === 'APPETIZER' ? 'APPS' : courseGroup.course === 'ENTREE' ? 'MAINS' : courseGroup.course)}`}
            >
              <img src={fireIcon} alt="Fire" className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {hasItems && (
        <div className="px-2 py-0.5">
          {courseGroup.items.map((item) => {
            const status = itemStatuses?.get(item.id);

            return (
              <div
                key={item.id}
                className={`flex items-start border-b border-border/50 ${item.isCancelled ? 'opacity-50' : ''} ${status === 'done' ? 'hidden' : ''} ${isDimmed && !item.isCancelled ? 'opacity-[0.32]' : ''}`}
                style={{ padding: '4px', gap: 0 }}
              >
                {/* Child 1 — item-main */}
                <div className="flex-1 min-w-0">
                  {/* .item-name-row */}
                  <div className="flex items-center flex-wrap" style={{ gap: '6px' }}>
                    <span className="text-[13px] font-normal text-text-secondary">
                      {item.quantity}×
                    </span>
                    <span className={`text-[13px] font-medium uppercase ${item.isCancelled ? 'line-through text-text-muted' : 'text-text-primary'} ${item.isCompleted ? 'text-success' : ''}`}>
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
                    {item.allergens.length > 0 && item.allergens.map((a) => (
                      <AllergenBadge key={a.type} allergen={a} variant="item" />
                    ))}
                  </div>

                  {/* Dual-language secondary name */}
                  {displayMode === 'dual' && !item.isCancelled && (
                    <div className="text-[11px] text-text-muted" style={{ paddingLeft: '20px', marginTop: '1px' }}>
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
                </div>

                {/* Child 2 — item-action */}
                {!item.isCancelled && !isDimmed && (
                  <div className="flex items-center shrink-0" style={{ gap: '4px', paddingTop: '1px' }}>
                    {status === 'ready' ? (
                      <>
                        <button onClick={() => onUndoItem?.(item.id)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Undo">
                          <img src={undoIcon} alt="Undo" style={{ width: '40px', height: '30px' }} />
                        </button>
                        <button onClick={() => onAdvanceItem?.(item.id)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Mark done">
                          <img src={readyIcon} alt="Ready" style={{ width: '40px', height: '30px' }} />
                        </button>
                      </>
                    ) : status === 'preparing' ? (
                      <>
                        <button onClick={() => onUndoItem?.(item.id)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Undo">
                          <img src={undoIcon} alt="Undo" style={{ width: '40px', height: '30px' }} />
                        </button>
                        <button onClick={() => onAdvanceItem?.(item.id)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Mark ready">
                          <img src={preparingIcon} alt="Preparing" style={{ width: '40px', height: '30px' }} />
                        </button>
                      </>
                    ) : isFired ? (
                      <>
                        <button onClick={() => onUndoItem?.(item.id)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Undo">
                          <img src={undoIcon} alt="Undo" style={{ width: '40px', height: '30px' }} />
                        </button>
                        <button onClick={() => onAdvanceItem?.(item.id, true)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Mark done">
                          <img src={readyIcon} alt="Ready" style={{ width: '40px', height: '30px' }} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => onAdvanceItem?.(item.id)} className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[33px]" aria-label="Mark seen">
                        <img src={seenIcon} alt="Seen" style={{ width: '40px', height: '30px' }} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
