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
}

export function ModifierLine({ modifier, servableEnabled, modifierStatus, onAdvanceModifier, onUndoModifier, parentQuantity = 1 }: ModifierLineProps) {
  const { tm } = useLanguage();
  const styles = {
    extra: 'text-modifier-extra',
    remove: 'text-modifier-remove',
    neutral: 'text-modifier-neutral',
  };

  const isServable = servableEnabled && modifier.isServable && modifier.type !== 'remove' && modifier.id;
  const isDone = isServable && modifierStatus === 'done';

  // Servable modifier: render with item-row prominence (large name + large circular eye icon)
  if (isServable && modifier.id) {
    return (
      <div
        className="flex items-center"
        style={{ paddingTop: '4px', paddingBottom: '4px', gap: '4px' }}
      >
        <span className="invisible shrink-0 font-normal" aria-hidden="true" style={{ fontSize: 'var(--kds-item-qty)', width: '2.25ch', display: 'inline-block' }}>
          0x
        </span>
        <span
          className={`flex-1 min-w-0 font-bold uppercase text-text-primary ${isDone ? 'line-through opacity-50' : ''}`}
          style={{ fontSize: 'var(--kds-item-name)', lineHeight: '1.2' }}
        >
          {tm(modifier.text)}
        </span>
        <div className="flex items-center shrink-0 ml-auto" style={{ gap: '0px' }} onClick={(e) => e.stopPropagation()}>
          {modifierStatus === 'done' ? (
            <>
              <KdsActionIcon icon="undo" onClick={() => onUndoModifier?.(modifier.id!)} label="Undo modifier" />
              <KdsActionIcon icon="ready" disabled label="Modifier done" />
            </>
          ) : modifierStatus === 'preparing' ? (
            <>
              <KdsActionIcon icon="undo" onClick={() => onUndoModifier?.(modifier.id!)} label="Undo modifier" />
              <KdsActionIcon icon="preparing" onClick={() => onAdvanceModifier?.(modifier.id!)} label="Mark modifier done" />
            </>
          ) : (
            <KdsActionIcon icon="seen" onClick={() => onAdvanceModifier?.(modifier.id!)} label="Mark modifier seen" />
          )}
        </div>
      </div>
    );
  }

  // Non-servable modifier: keep existing small muted style
  return (
    <div className="flex items-baseline" style={{ lineHeight: '0.95', marginTop: '-2px', paddingTop: '0px', paddingBottom: '0px', gap: '4px' }}>
      <span className="invisible shrink-0 font-normal" aria-hidden="true" style={{ fontSize: 'var(--kds-item-qty)', lineHeight: '0.95', width: '2.25ch', display: 'inline-block' }}>
        0x
      </span>
      <span
        className={`min-w-0 font-semibold ${styles[modifier.type]}`}
        style={{ fontSize: 'var(--kds-modifier)', lineHeight: '0.95' }}
      >
        {tm(modifier.text)}
      </span>
    </div>
  );
}
