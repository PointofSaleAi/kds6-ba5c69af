import type { CourseGroup } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { AllergenBadge } from './AllergenBadge';
import { ModifierLine } from './ModifierLine';
import seenIcon from '@/assets/seen-icon.svg';
import preparingIcon from '@/assets/preparing-icon.svg';
import undoIcon from '@/assets/undo-icon.svg';
import readyIcon from '@/assets/item-ready-icon.svg';

export type ItemStatus = 'preparing' | 'ready' | 'done';
export type StationStatus = 'fired' | 'active' | 'pending';

interface CourseSectionProps {
  courseGroup: CourseGroup;
  onFireCourse?: (course: string) => void;
  itemStatuses?: Map<string, ItemStatus>;
  onAdvanceItem?: (itemId: string, skipToDone?: boolean) => void;
  onUndoItem?: (itemId: string) => void;
  /** When set, enables station-mode rendering */
  stationCourse?: string;
  /** Explicit station status (computed by parent based on position) */
  forcedStationStatus?: StationStatus;
}

function getStationStatus(courseGroup: CourseGroup, stationCourse: string): StationStatus {
  if (courseGroup.isFired) return 'fired';
  if (courseGroup.course === stationCourse) return 'active';
  return 'pending';
}

function getStationLabel(courseGroup: CourseGroup, status: StationStatus, tc: (s: string) => string): string {
  const name = tc(courseGroup.course.charAt(0) + courseGroup.course.slice(1).toLowerCase());
  switch (status) {
    case 'fired':
      return `${name} \u00B7 Other station`;
    case 'active':
      return `${name} \u00B7 Your station - active`;
    case 'pending':
      return `${name} \u00B7 Other station - pending`;
  }
}

export function CourseSection({ courseGroup, onFireCourse, itemStatuses, onAdvanceItem, onUndoItem, stationCourse, forcedStationStatus }: CourseSectionProps) {
  const { tp, tc } = useLanguage();
  const isFired = courseGroup.isFired;
  const isStationMode = !!stationCourse;
  const stationStatus = forcedStationStatus ?? (isStationMode ? getStationStatus(courseGroup, stationCourse) : null);
  const isStationDimmed = isStationMode && stationStatus !== 'active';

  const hasItems = courseGroup.items.length > 0;
  const allItemsDone = hasItems && courseGroup.items
    .filter(i => !i.isCancelled)
    .every(i => itemStatuses?.get(i.id) === 'done');

  // Hide if all items done (but keep empty station-mode course blocks visible)
  if (allItemsDone) return null;

  // FIX 2: Purple left border ONLY on the course block container for active station course
  const containerClass = isStationMode && stationStatus === 'active'
    ? 'border-l-[3px] rounded-l-none'
    : isStationDimmed
      ? 'opacity-30 pointer-events-none'
      : isFired
        ? 'opacity-50'
        : '';

  const containerStyle = isStationMode && stationStatus === 'active'
    ? { borderLeftColor: '#7F77DD' }
    : undefined;

  // Header background: purple tint for active, muted for others
  const headerBg = isStationMode && stationStatus === 'active'
    ? ''
    : 'bg-muted';

  const headerStyle = isStationMode && stationStatus === 'active'
    ? { backgroundColor: '#EEEDFE' }
    : undefined;

  // FIX 6: Course label
  const courseLabel = isStationMode
    ? getStationLabel(courseGroup, stationStatus!, tc)
    : tc(courseGroup.course);

  // Label colour: purple for active station course
  const labelClass = isStationMode && stationStatus === 'active'
    ? 'text-[11px] uppercase tracking-widest'
    : 'text-section-label uppercase text-text-secondary tracking-widest';

  const labelStyle = isStationMode && stationStatus === 'active'
    ? { color: '#7F77DD', fontWeight: 500 }
    : undefined;

  // Timer chip for station mode
  const timerChip = isStationMode ? getTimerChip(courseGroup, stationStatus!) : null;

  // Fire button: in station mode, only show on active course
  const showFireButton = isStationMode
    ? stationStatus === 'active'
    : !isFired && !!onFireCourse;

  // FIX 5: Pending course fire button is disabled
  const fireButtonDisabled = isStationMode && stationStatus === 'pending';

  return (
    <div className={containerClass} style={containerStyle}>
      <div className={`flex items-center justify-between ${headerBg} px-3 py-1.5 mt-1`} style={headerStyle}>
        <span className={labelClass} style={labelStyle}>
          {courseLabel}
        </span>
        <div className="flex items-center gap-2">
          {/* Timer chip */}
          {timerChip && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${timerChip.className}`}>
              {timerChip.label}
            </span>
          )}

          {/* Fired badge (non-station mode only) */}
          {!isStationMode && isFired && (
            <span className="text-[10px] font-bold uppercase text-success">FIRED</span>
          )}

          {/* FIX 4: Fire button - solid purple (#7F77DD) in station mode */}
          {showFireButton && onFireCourse && (
            <button
              onClick={() => onFireCourse(courseGroup.course)}
              disabled={fireButtonDisabled}
              className={`text-[11px] font-bold uppercase px-3 py-2 rounded min-h-[44px] min-w-[44px] transition-colors ${
                fireButtonDisabled
                  ? 'bg-muted text-muted-foreground pointer-events-none'
                  : isStationMode
                    ? 'text-white hover:opacity-90'
                    : 'text-brand-primary hover:text-brand-primary/80 bg-brand-primary/10'
              }`}
              style={!fireButtonDisabled && isStationMode ? { backgroundColor: '#7F77DD' } : undefined}
            >
              FIRE {tc(courseGroup.course === 'APPETIZER' ? 'APPS' : courseGroup.course === 'ENTREE' ? 'MAINS' : courseGroup.course)}
            </button>
          )}
        </div>
      </div>

      {hasItems && (
        <div className="px-3 py-1">
          {courseGroup.items.map((item) => {
            const status = itemStatuses?.get(item.id);

            return (
              <div key={item.id} className={`py-1.5 ${item.isCancelled ? 'opacity-50' : ''} ${status === 'done' ? 'hidden' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-item-name ${item.isCancelled ? 'line-through text-text-muted' : 'text-text-primary'} ${item.isCompleted ? 'text-success' : ''}`}>
                      {item.quantity}&times; {tp(item.name)}
                    </span>
                    {item.isCancelled && (
                      <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                        CANCELLED
                      </span>
                    )}
                    {item.isCompleted && !item.isCancelled && (
                      <span className="text-success text-sm">&#10003;</span>
                    )}
                  </div>
                  {/* FIX 6: Hide action icons on dimmed (non-active) rows */}
                  {!item.isCancelled && !isStationDimmed && (
                    <div className="flex items-center shrink-0">
                        {status === 'ready' ? (
                          <>
                            <button
                              onClick={() => onUndoItem?.(item.id)}
                              className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                              aria-label="Undo"
                            >
                              <img src={undoIcon} alt="Undo" width={28} height={21} />
                            </button>
                            <button
                              onClick={() => onAdvanceItem?.(item.id)}
                              className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                              aria-label="Mark done"
                            >
                              <img src={readyIcon} alt="Ready" width={28} height={21} />
                            </button>
                          </>
                      ) : status === 'preparing' ? (
                        <>
                          <button
                            onClick={() => onUndoItem?.(item.id)}
                            className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                            aria-label="Undo"
                          >
                            <img src={undoIcon} alt="Undo" width={28} height={21} />
                          </button>
                          <button
                            onClick={() => onAdvanceItem?.(item.id)}
                            className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                            aria-label="Mark ready"
                          >
                            <img src={preparingIcon} alt="Preparing" width={28} height={21} />
                          </button>
                        </>
                      ) : isFired ? (
                        <>
                          <button
                            onClick={() => onUndoItem?.(item.id)}
                            className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                            aria-label="Undo"
                          >
                            <img src={undoIcon} alt="Undo" width={28} height={21} />
                          </button>
                          <button
                            onClick={() => onAdvanceItem?.(item.id, true)}
                            className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                            aria-label="Mark done"
                          >
                            <img src={readyIcon} alt="Ready" width={28} height={21} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onAdvanceItem?.(item.id)}
                          className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                          aria-label="Mark seen"
                        >
                          <img src={seenIcon} alt="Seen" width={28} height={21} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {item.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5 pl-5">
                    <span className="text-[12px] font-bold text-allergen">Allergies</span>
                    {item.allergens.map((a) => (
                      <AllergenBadge key={a.type} allergen={a} />
                    ))}
                  </div>
                )}

                {item.modifiers.map((mod, idx) => (
                  <ModifierLine key={idx} modifier={mod} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTimerChip(courseGroup: CourseGroup, status: StationStatus): { label: string; className: string } | null {
  switch (status) {
    case 'fired':
      if (!courseGroup.firedAgoLabel) return null;
      return { label: `Done ${courseGroup.firedAgoLabel}`, className: 'bg-order-take-out/15 text-order-take-out' };
    case 'active':
      if (!courseGroup.prepTimerLabel) return null;
      return { label: `Prep: ${courseGroup.prepTimerLabel}`, className: 'bg-success/15 text-success' };
    case 'pending':
      if (!courseGroup.autoFireLabel) return null;
      return { label: courseGroup.autoFireLabel, className: 'bg-muted text-muted-foreground' };
  }
}
