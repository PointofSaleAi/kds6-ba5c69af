import type { Modifier } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { KdsActionIcon } from './KdsActionIcon';
import type { ItemStatus } from './CourseSection';

export type ModifierStatus = ItemStatus;

interface ModifierLineProps {
  modifier: Modifier;
  servableEnabled?: boolean;
  modifierStatus?: ModifierStatus;
  onAdvanceModifier?: (modId: string) => void;
  onUndoModifier?: (modId: string) => void;
  parentQuantity?: number;
  compactQtyCol?: boolean;
}

export function ModifierLine({ modifier, servableEnabled, modifierStatus, onAdvanceModifier, onUndoModifier, parentQuantity = 1, compactQtyCol }: ModifierLineProps) {
  const { tm } = useLanguage();
  const styles = {
    extra: 'text-modifier-extra',
    remove: 'text-modifier-remove',
    neutral: 'text-modifier-neutral',
  };

  const qtyColWidth = compactQtyCol ? '1.5ch' : '2.25ch';
  const isServable = servableEnabled && modifier.isServable && modifier.type !== 'remove' && modifier.id;
  const isDone = isServable && modifierStatus === 'done';

  // Servable modifier: tap row to advance (matches product/ticket pattern).
  // Undo affordance only appears once advanced past Unseen.
  if (isServable && modifier.id) {
    const handleAdvance = () => {
      if (modifierStatus !== 'done') onAdvanceModifier?.(modifier.id!);
    };
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          handleAdvance();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            handleAdvance();
          }
        }}
        className={`flex items-center select-none ${modifierStatus !== 'done' ? 'cursor-pointer' : ''}`}
        style={{ paddingTop: '4px', paddingBottom: '4px', gap: '4px', minHeight: '33px' }}
      >
        <span className="invisible shrink-0 font-normal" aria-hidden="true" style={{ fontSize: 'var(--kds-item-qty)', width: qtyColWidth, display: 'inline-block' }}>
          0x
        </span>
        <span
          className={`flex-1 min-w-0 font-bold uppercase text-text-primary ${isDone ? 'line-through opacity-50' : ''}`}
          style={{ fontSize: 'var(--kds-item-name)', lineHeight: '1.2' }}
        >
          {tm(modifier.text)}
        </span>
        {modifierStatus && modifierStatus !== 'unseen' && (
          <div
            className="flex items-center shrink-0 ml-auto"
            style={{ gap: '0px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <KdsActionIcon icon="undo" onClick={() => onUndoModifier?.(modifier.id!)} label="Undo modifier" />
          </div>
        )}
      </div>
    );
  }

  // Non-servable modifier: keep existing small muted style
  return (
    <div className="flex items-start" style={{ lineHeight: '1', paddingTop: '0px', paddingBottom: '0px', gap: '4px' }}>
      <span className="invisible shrink-0 font-normal" aria-hidden="true" style={{ fontSize: 'var(--kds-item-qty)', lineHeight: '0.9', width: qtyColWidth, display: 'inline-block' }}>
        0x
      </span>
      <span
        className={`min-w-0 font-semibold ${styles[modifier.type]}`}
        style={{ fontSize: 'var(--kds-modifier)', lineHeight: '0.9', display: 'inline-block' }}
      >
        {tm(modifier.text)}
      </span>
    </div>
  );
}
