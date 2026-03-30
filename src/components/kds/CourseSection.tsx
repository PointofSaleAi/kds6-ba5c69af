import type { CourseGroup } from '@/types/kds';
import { AllergenBadge } from './AllergenBadge';
import { ModifierLine } from './ModifierLine';
import seenIcon from '@/assets/seen-icon.svg';

interface CourseSectionProps {
  courseGroup: CourseGroup;
  onFireCourse?: (course: string) => void;
}

export function CourseSection({ courseGroup, onFireCourse }: CourseSectionProps) {
  const isFired = courseGroup.isFired;

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
        {courseGroup.items.map((item) => (
          <div key={item.id} className={`py-1.5 ${item.isCancelled ? 'opacity-50' : ''}`}>
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
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-2.5 rounded hover:bg-muted transition-colors text-text-muted hover:text-text-primary min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Mark seen">
                    <img src={seenIcon} alt="Seen" width={20} height={15} />
                  </button>
                </div>
              )}
            </div>

            {item.allergens.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 pl-5">
                <span className="text-[12px] font-bold text-allergen">Allergies:</span>
                {item.allergens.map((a) => (
                  <AllergenBadge key={a.type} allergen={a} />
                ))}
              </div>
            )}

            {item.modifiers.map((mod, idx) => (
              <ModifierLine key={idx} modifier={mod} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
