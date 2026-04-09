import type { CourseGroup, OrderItem } from '@/types/kds';
import { Languages } from 'lucide-react';
import type { ItemStatus } from './CourseSection';
import { useLanguage } from '@/hooks/use-language';
import { AllergenBadge } from './AllergenBadge';
import { KdsActionIcon } from './KdsActionIcon';
import { StationBadge } from './StationBadge';

interface FlatItemListProps {
  courses: CourseGroup[];
  itemStatuses: Map<string, ItemStatus>;
  onAdvanceItem: (itemId: string, skipToDone?: boolean) => void;
  onUndoItem: (itemId: string) => void;
  onReRouteItem?: (item: OrderItem) => void;
  showAllergens?: boolean;
}

export function FlatItemList({ courses, itemStatuses, onAdvanceItem, onUndoItem, onReRouteItem, showAllergens = true }: FlatItemListProps) {
  const { tp, displayMode, tpSecondary } = useLanguage();

  const allItems = courses.flatMap(c => c.items);

  return (
    <div className="px-2 py-0.5">
      {allItems.map((item) => {
        const status = itemStatuses?.get(item.id);

        return (
          <div
            key={item.id}
            className={`flex items-center border-b border-border/50 cursor-pointer active:bg-muted/50 transition-colors ${item.isCancelled ? 'opacity-50' : ''} ${status === 'done' ? 'hidden' : ''}`}
            style={{ padding: '4px 0 4px 4px', gap: 0 }}
            onClick={() => !item.isCancelled && onReRouteItem?.(item)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap" style={{ gap: '6px' }}>
                <span className="text-[13px] font-normal text-text-secondary">
                  {item.quantity}&times;
                </span>
                <span className={`text-[13px] font-medium uppercase ${item.isCancelled ? 'line-through text-text-muted' : 'text-text-primary'} ${item.isCompleted ? 'text-success' : ''}`}>
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

              {displayMode === 'dual' && !item.isCancelled && (
                <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-semibold uppercase" style={{ paddingLeft: '20px', marginTop: '1px' }}>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-muted shrink-0">
                    <Languages size={10} className="text-text-secondary" />
                  </span>
                  {tpSecondary(item.name)}
                </div>
              )}

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

              {item.notes && !item.isCancelled && (
                <div
                  className="text-[11px] text-text-muted italic leading-snug"
                  style={{ paddingLeft: '20px', marginTop: '2px' }}
                >
                  "{item.notes}"
                </div>
              )}
            </div>

            {!item.isCancelled && (
              <div className="flex items-center shrink-0 ml-auto" style={{ gap: '0px' }} onClick={(e) => e.stopPropagation()}>
                {status === 'ready' ? (
                  <>
                    <KdsActionIcon icon="undo" onClick={() => onUndoItem(item.id)} label="Undo" />
                    <KdsActionIcon icon="ready" onClick={() => onAdvanceItem(item.id)} label="Mark done" />
                  </>
                ) : status === 'preparing' ? (
                  <>
                    <KdsActionIcon icon="undo" onClick={() => onUndoItem(item.id)} label="Undo" />
                    <KdsActionIcon icon="preparing" onClick={() => onAdvanceItem(item.id)} label="Mark ready" />
                  </>
                ) : (
                  <KdsActionIcon icon="seen" onClick={() => onAdvanceItem(item.id)} label="Mark seen" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
