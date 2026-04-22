import type { CourseGroup, OrderItem } from '@/types/kds';
import { Languages } from 'lucide-react';
import type { ItemStatus } from './CourseSection';
import { useLanguage } from '@/hooks/use-language';
import { AllergenBadge } from './AllergenBadge';
import { ModifierLine, type ModifierStatus } from './ModifierLine';
import { useRowTap } from '@/hooks/use-row-tap';

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
  dismissedItemIds?: Set<string>;
  onDismissItem?: (itemId: string) => void;
}

export function FlatItemList({ courses, itemStatuses, itemTimestamps, onAdvanceItem, onUndoItem, onReRouteItem, showAllergens = true, servableModifiersEnabled, modifierStatuses, onAdvanceModifier, onUndoModifier, dismissedItemIds, onDismissItem }: FlatItemListProps) {
  const { tp, displayMode, tpSecondary, t, showSecondaryMenu, secondaryLang } = useLanguage();
  const secondaryDir = secondaryLang === 'ar' ? 'rtl' : 'ltr';

  const allItems = courses.flatMap(c => c.items);

  return (
    <div className="px-2 py-0.5">
      {(() => {
        const visibleItems = allItems.filter((item) => {
          if (dismissedItemIds?.has(item.id)) return false;
          return true;
        });
        return visibleItems.map((item, visibleIdx) => {
        const isLastVisible = visibleIdx === visibleItems.length - 1;
        const status = itemStatuses?.get(item.id);
        const timestamps = itemTimestamps?.get(item.id);

        return (
          <ItemTapRow
            key={item.id}
            item={item}
            status={status}
            timestamps={timestamps}
            isLastVisible={isLastVisible}
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
  );
}

interface ItemTapRowProps {
  item: OrderItem;
  status?: ItemStatus;
  timestamps?: { seenAt?: string; doneAt?: string };
  isLastVisible: boolean;
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
  onAdvanceItem: (itemId: string, skipToDone?: boolean) => void;
  onUndoItem: (itemId: string) => void;
  onDismissItem?: (itemId: string) => void;
}

function ItemTapRow({
  item, status, timestamps, isLastVisible, showAllergens,
  displayMode, showSecondaryMenu, secondaryDir, tp, tpSecondary, t,
  servableModifiersEnabled, modifierStatuses, onAdvanceModifier, onUndoModifier,
  onAdvanceItem, onUndoItem, onDismissItem,
}: ItemTapRowProps) {
  const handleSingle = () => {
    if (item.isCancelled) return;
    if (status === 'done') {
      onDismissItem?.(item.id);
    } else {
      onAdvanceItem(item.id);
    }
  };
  const handleDouble = () => {
    if (item.isCancelled) return;
    if (status === 'preparing' || status === 'done') {
      onUndoItem(item.id);
    }
  };
  const handleTap = useRowTap(handleSingle, handleDouble);

  const isDone = status === 'done';
  const isSeen = status === 'preparing';

  // Seen rows use a very light green tint; Done rows use a light grey tint.
  const rowBg = isDone ? 'rgba(149, 165, 166, 0.12)' : isSeen ? 'rgba(29, 158, 117, 0.10)' : undefined;

  return (
    <div
      className={`-mx-2 px-2 ${isLastVisible ? '' : 'border-b border-border/50'} ${item.isCancelled ? 'opacity-50' : ''} ${item.isNew && !item.isCancelled ? 'animate-new-item' : ''}`}
      style={{ 
        backgroundColor: rowBg,
      }}
    >
      <div
        className="flex items-center cursor-pointer active:bg-muted/50 transition-colors select-none"
        style={{ padding: `var(--kds-item-gap) 0 0 4px`, gap: 0 }}
        onClick={handleTap}
        title={item.isCancelled ? undefined : (isDone ? 'Tap to remove · Double-tap to undo' : isSeen ? 'Tap to mark DONE · Double-tap to undo' : 'Tap to mark SEEN')}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap" style={{ gap: '6px' }}>
            <span
              className={`font-normal ${isDone ? 'line-through' : ''}`}
              style={{ fontSize: 'var(--kds-item-qty)' }}
            >
              {item.quantity}&times;
            </span>
            <span
              className={`font-bold uppercase ${item.isCancelled ? 'line-through text-text-muted' : isDone ? 'line-through text-text-primary' : 'text-text-primary'}`}
              style={{ fontSize: 'var(--kds-item-name)' }}
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
            {showAllergens && item.allergens.length > 0 && item.allergens.map((a) => (
              <AllergenBadge key={a.type} allergen={a} variant="item" />
            ))}
            {isSeen && timestamps?.seenAt && (
              <span style={{ fontSize: '10px', color: '#0F5132', fontWeight: 600 }} className="ml-1">
                {t.seenAt} {timestamps.seenAt}
              </span>
            )}
            {isDone && timestamps?.doneAt && (
              <span style={{ fontSize: '10px', color: '#0F5132', fontWeight: 600 }} className="ml-1">
                {t.doneAt} {timestamps.doneAt}
              </span>
            )}
          </div>

          {displayMode === 'dual' && showSecondaryMenu && !item.isCancelled && (
            <div
              dir={secondaryDir}
              className={`flex items-center font-bold uppercase text-text-muted ${isDone ? 'line-through' : ''}`}
              style={{ gap: '6px', marginTop: '0px', marginBottom: '0px', fontSize: 'var(--kds-modifier)', lineHeight: '1' }}
            >
              <span className="relative font-normal shrink-0" style={{ fontSize: 'var(--kds-item-qty)' }}>
                <span className="invisible" aria-hidden="true">{item.quantity}&times;</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded bg-muted">
                    <Languages size={8} className="text-text-secondary" />
                  </span>
                </span>
              </span>
              <span>{tpSecondary(item.name)}</span>
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
        <div className="flex items-start" style={{ gap: '6px', marginTop: '2px', paddingLeft: '4px' }}>
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
