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
  if (courseGroup.prepTimerLabel) return 'active';
  if (courseGroup.autoFireLabel) return 'pending';
  return 'active';
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

  const coursingStatus = forcedStationStatus
    ?? (isStationMode ? getStationStatus(courseGroup, stationCourse) : getCoursingStatus(courseGroup));
  
  const isDimmed = coursingStatus === 'fired' || coursingStatus === 'pending';
  const isStationDimmed = isStationMode && coursingStatus !== 'active';

  const hasItems = courseGroup.items.length > 0;
  const allItemsDone = hasItems && courseGroup.items
    .filter(i => !i.isCancelled)
    .every(i => itemStatuses?.get(i.id) === 'done');

  if (allItemsDone) return null;

  const containerClass = coursingStatus === 'active'
    ? 'border-l-[3px] rounded-l-none'
    : isDimmed
      ? (isStationMode ? 'opacity-30 pointer-events-none' : '')
      : '';

  const containerStyle = coursingStatus === 'active'
    ? { borderLeftColor: '#7F77DD' }
    : undefined;

  // Header background
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
    ? 'text-[10px] uppercase tracking-widest'
    : coursingStatus === 'fired'
      ? 'text-[10px] uppercase tracking-widest text-success'
      : 'text-[10px] uppercase text-muted-foreground tracking-widest';

  const labelStyle = coursingStatus === 'active'
    ? { color: '#7F77DD', fontWeight: 500 }
    : undefined;

  const timerChip = getTimerChip(courseGroup, coursingStatus);
  const showFireButton = coursingStatus !== 'fired' && !!onFireCourse;
  const fireButtonDisabled = coursingStatus === 'pending';

  return (
    <div className={containerClass} style={containerStyle}>
      {/* Compact header: label + timer + fire button in single row */}
      <div className={`flex items-center justify-between ${headerBg} px-2 py-1`} style={headerStyle}>
        <span className={labelClass} style={labelStyle}>
          {courseLabel}
        </span>
        <div className="flex items-center gap-1.5">
          {timerChip && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${timerChip.className}`}>
              {timerChip.label}
            </span>
          )}
          {showFireButton && onFireCourse && (
            <button
              onClick={() => onFireCourse(courseGroup.course)}
              disabled={fireButtonDisabled}
              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded min-h-[28px] transition-colors ${
                fireButtonDisabled
                  ? 'bg-muted text-muted-foreground pointer-events-none'
                  : 'text-white hover:opacity-90'
              }`}
              style={!fireButtonDisabled ? { backgroundColor: '#7F77DD' } : undefined}
            >
              FIRE {tc(courseGroup.course === 'APPETIZER' ? 'APPS' : courseGroup.course === 'ENTREE' ? 'MAINS' : courseGroup.course)}
            </button>
          )}
        </div>
      </div>

      {hasItems && (
        <div className="px-2 py-0.5">
          {courseGroup.items.map((item) => {
            const status = itemStatuses?.get(item.id);

            return (
              <div key={item.id} className={`py-px ${item.isCancelled ? 'opacity-50' : ''} ${status === 'done' ? 'hidden' : ''} ${isDimmed && !item.isCancelled ? 'opacity-[0.32]' : ''}`}>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <span className={`text-[13px] font-semibold leading-tight ${item.isCancelled ? 'line-through text-text-muted' : 'text-text-primary'} ${item.isCompleted ? 'text-success' : ''}`}>
                      {item.quantity}&times; {tp(item.name)}
                    </span>
                    {item.isCancelled && (
                      <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1 py-px rounded">
                        CANCELLED
                      </span>
                    )}
                    {item.isCompleted && !item.isCancelled && (
                      <span className="text-success text-xs">&#10003;</span>
                    )}
                    {/* Inline item-level allergens - subtle */}
                    {item.allergens.length > 0 && (
                      <div className="flex items-center gap-0.5 ml-1">
                        {item.allergens.map((a) => (
                          <AllergenBadge key={a.type} allergen={a} variant="item" />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Action icons */}
                  {!item.isCancelled && !isDimmed && (
                    <div className="flex items-center shrink-0">
                        {status === 'ready' ? (
                          <>
                            <button onClick={() => onUndoItem?.(item.id)} className="p-0.5 rounded flex items-center justify-center min-w-[36px] min-h-[36px]" aria-label="Undo">
                              <img src={undoIcon} alt="Undo" width={22} height={17} />
                            </button>
                            <button onClick={() => onAdvanceItem?.(item.id)} className="p-0.5 rounded flex items-center justify-center min-w-[36px] min-h-[36px]" aria-label="Mark done">
                              <img src={readyIcon} alt="Ready" width={22} height={17} />
                            </button>
                          </>
                      ) : status === 'preparing' ? (
                        <>
                          <button onClick={() => onUndoItem?.(item.id)} className="p-0.5 rounded flex items-center justify-center min-w-[36px] min-h-[36px]" aria-label="Undo">
                            <img src={undoIcon} alt="Undo" width={22} height={17} />
                          </button>
                          <button onClick={() => onAdvanceItem?.(item.id)} className="p-0.5 rounded flex items-center justify-center min-w-[36px] min-h-[36px]" aria-label="Mark ready">
                            <img src={preparingIcon} alt="Preparing" width={22} height={17} />
                          </button>
                        </>
                      ) : isFired ? (
                        <>
                          <button onClick={() => onUndoItem?.(item.id)} className="p-0.5 rounded flex items-center justify-center min-w-[36px] min-h-[36px]" aria-label="Undo">
                            <img src={undoIcon} alt="Undo" width={22} height={17} />
                          </button>
                          <button onClick={() => onAdvanceItem?.(item.id, true)} className="p-0.5 rounded flex items-center justify-center min-w-[36px] min-h-[36px]" aria-label="Mark done">
                            <img src={readyIcon} alt="Ready" width={22} height={17} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => onAdvanceItem?.(item.id)} className="p-0.5 rounded flex items-center justify-center min-w-[36px] min-h-[36px]" aria-label="Mark seen">
                          <img src={seenIcon} alt="Seen" width={22} height={17} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

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
