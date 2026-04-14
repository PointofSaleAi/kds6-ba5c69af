import type { CourseGroup, OrderItem } from '@/types/kds';
import { Languages } from 'lucide-react';
import type { ItemStatus } from './CourseSection';
import { useLanguage } from '@/hooks/use-language';
import { AllergenBadge } from './AllergenBadge';
import { KdsActionIcon } from './KdsActionIcon';
import { StationBadge } from './StationBadge';
import { ModifierLine, type ModifierStatus } from './ModifierLine';

interface FlatItemListProps {
  courses: CourseGroup[];
  itemStatuses: Map<string, ItemStatus>;
  itemTimestamps?: Map<string, { seenAt?: string; doneAt?: string }>;
  onAdvanceItem: (itemId: string, skipToDone?: boolean) => void;
  onUndoItem: (itemId: string) => void;
  onReRouteItem?: (item: OrderItem) => void;
  showAllergens?: boolean;
  servableModifiersEnabled?: boolean;
  modifierStatuses?: Map<string, ModifierStatus>;
  onAdvanceModifier?: (modId: string) => void;
  onUndoModifier?: (modId: string) => void;
}

export function FlatItemList({ courses, itemStatuses, itemTimestamps, onAdvanceItem, onUndoItem, onReRouteItem, showAllergens = true, servableModifiersEnabled, modifierStatuses, onAdvanceModifier, onUndoModifier }: FlatItemListProps) {
  const { tp, displayMode, tpSecondary } = useLanguage();

  const allItems = courses.flatMap(c => c.items);

  return (
    <div className="px-2 py-0.5">
      {allItems.map((item) => {
        const status = itemStatuses?.get(item.id);
        const timestamps = itemTimestamps?.get(item.id);
        const isDone = status === 'done';

        return (
          <div
            key={item.id}
            className={`flex items-center border-b border-border/50 cursor-pointer active:bg-muted/50 transition-colors ${item.isCancelled ? 'opacity-50' : ''} ${item.isNew && !item.isCancelled ? 'animate-new-item' : ''}`}
            style={{ padding: `var(--kds-item-gap) 0 var(--kds-item-gap) 4px`, gap: 0, opacity: isDone && !item.isCancelled ? 0.5 : undefined }}
            onClick={() => !item.isCancelled && onReRouteItem?.(item)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap" style={{ gap: 'var(--kds-item-gap)' }}>
                <span className="font-normal text-text-secondary" style={{ fontSize: 'var(--kds-item-qty)' }}>
                  {item.quantity}&times;
                </span>
                <span className={`font-medium uppercase ${item.isCancelled ? 'line-through text-text-muted' : 'text-text-primary'} ${item.isCompleted ? 'text-success' : ''}`} style={{ fontSize: 'var(--kds-item-name)' }}>
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
                {showAllergens && item.allergens.length > 0 && item.allergens.map((a) => (
                  <AllergenBadge key={a.type} allergen={a} variant="item" />
                ))}
                {/* Item-level timestamps */}
                {status === 'preparing' && timestamps?.seenAt && (
                  <span className="text-[10px] text-text-muted font-normal ml-1">
                    Seen {timestamps.seenAt}
                  </span>
                )}
                {status === 'done' && timestamps?.doneAt && (
                  <span className="text-[10px] text-text-muted font-normal ml-1">
                    Done {timestamps.doneAt}
                  </span>
                )}
              </div>

              {displayMode === 'dual' && !item.isCancelled && (
                <div className="flex items-center gap-1.5 text-text-muted font-semibold uppercase" style={{ paddingLeft: '20px', marginTop: '1px', fontSize: 'var(--kds-modifier)' }}>
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-muted shrink-0">
                    <Languages size={10} className="text-text-secondary" />
                  </span>
                  {tpSecondary(item.name)}
                </div>
              )}

              {item.modifiers.length > 0 && (
                <div style={{ marginTop: '2px' }}>
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

              {item.notes && !item.isCancelled && (
                <div
                  className="text-text-muted italic leading-snug"
                  style={{ paddingLeft: '20px', marginTop: '2px', fontSize: 'var(--kds-modifier)' }}
                >
                  "{item.notes}"
                </div>
              )}
            </div>

            {!item.isCancelled && (
              <div className="flex items-center shrink-0 ml-auto" style={{ gap: '0px' }} onClick={(e) => e.stopPropagation()}>
                {status === 'done' ? (
                  <>
                    <KdsActionIcon icon="undo" onClick={() => onUndoItem(item.id)} label="Undo" />
                    <KdsActionIcon icon="ready" disabled label="Done" />
                  </>
                ) : status === 'preparing' ? (
                  <>
                    <KdsActionIcon icon="undo" onClick={() => onUndoItem(item.id)} label="Undo" />
                    <KdsActionIcon icon="preparing" onClick={() => onAdvanceItem(item.id)} label="Mark done" />
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
