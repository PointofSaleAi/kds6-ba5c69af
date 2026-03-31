import type { CourseGroup } from '@/types/kds';
import { AllergenBadge } from './AllergenBadge';
import { ModifierLine } from './ModifierLine';
import seenIcon from '@/assets/seen-icon.svg';
import preparingIcon from '@/assets/preparing-icon.svg';
import undoIcon from '@/assets/undo-icon.svg';
import readyIcon from '@/assets/item-ready-icon.svg';

export type ItemStatus = 'preparing' | 'ready' | 'done';

interface CourseSectionProps {
  courseGroup: CourseGroup;
  onFireCourse?: (course: string) => void;
  itemStatuses?: Map<string, ItemStatus>;
  onAdvanceItem?: (itemId: string, skipToDone?: boolean) => void;
  onUndoItem?: (itemId: string) => void;
}

export function CourseSection({ courseGroup, onFireCourse, itemStatuses, onAdvanceItem, onUndoItem }: CourseSectionProps) {
  const isFired = courseGroup.isFired;
  const allItemsDone = courseGroup.items
    .filter(i => !i.isCancelled)
    .every(i => itemStatuses?.get(i.id) === 'done');

  if (allItemsDone) return null;

  return (
    <div className={isFired ? 'opacity-50' : ''}>
      <div className="flex items-center justify-between bg-muted px-3 py-1.5 mt-1">
        <span className="text-section-label uppercase text-text-secondary tracking-widest">
          {courseGroup.course}
        </span>
        {!isFired && onFireCourse && (
          <button
            onClick={() => onFireCourse(courseGroup.course)}
            className="text-[11px] font-bold uppercase text-brand-primary hover:text-brand-primary/80 transition-colors px-3 py-2 rounded bg-brand-primary/10 min-h-[44px] min-w-[44px]"
          >
            FIRE {courseGroup.course === 'APPETIZER' ? 'APPS' : courseGroup.course === 'ENTREE' ? 'MAINS' : courseGroup.course}
          </button>
        )}
        {isFired && (
          <span className="text-[10px] font-bold uppercase text-success">FIRED</span>
        )}
      </div>

      <div className="px-3 py-1">
        {courseGroup.items.map((item) => {
          const status = itemStatuses?.get(item.id);

          return (
            <div key={item.id} className={`py-1.5 ${item.isCancelled ? 'opacity-50' : ''} ${status === 'done' ? 'hidden' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`text-item-name ${item.isCancelled ? 'line-through text-text-muted' : 'text-text-primary'} ${item.isCompleted ? 'text-success' : ''}`}>
                    {item.quantity}&times; {item.name}
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
                {!item.isCancelled && (
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
                          onClick={() => onAdvanceItem?.(item.id)}
                          className="p-1 rounded flex items-center justify-center min-w-[44px] min-h-[44px]"
                          aria-label="Mark seen"
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
                <div className="flex flex-wrap gap-1 mt-1 pl-5">
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
    </div>
  );
}
