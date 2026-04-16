import type { Modifier } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { KdsActionIcon } from './KdsActionIcon';
import type { ItemStatus } from './CourseSection';

export type ModifierStatus = ItemStatus;

const MOD_ICON_SIZE = 26;

interface ModifierLineProps {
  modifier: Modifier;
  servableEnabled?: boolean;
  modifierStatus?: ModifierStatus;
  onAdvanceModifier?: (modId: string) => void;
  onUndoModifier?: (modId: string) => void;
}

export function ModifierLine({ modifier, servableEnabled, modifierStatus, onAdvanceModifier, onUndoModifier }: ModifierLineProps) {
  const { tm } = useLanguage();
  const styles = {
    extra: 'text-modifier-extra',
    remove: 'text-modifier-remove line-through',
    neutral: 'text-text-secondary',
  };

  const isServable = servableEnabled && modifier.isServable && modifier.type !== 'remove' && modifier.id;
  const isDone = isServable && modifierStatus === 'done';

  return (
    <div className="flex items-center" style={{ paddingLeft: '20px', lineHeight: '1.3', paddingTop: '2px', paddingBottom: '2px', gap: '4px' }}>
      <span
        className={`min-w-0 ${styles[modifier.type]} ${isDone ? 'line-through opacity-50' : ''}`}
        style={{ fontSize: 'var(--kds-modifier)', lineHeight: '1.3' }}
      >
        {tm(modifier.text)}
      </span>
      {isServable && modifier.id && (
        <div className="flex items-center shrink-0" style={{ gap: '0px' }} onClick={(e) => e.stopPropagation()}>
          {modifierStatus === 'done' ? (
            <>
              <KdsActionIcon icon="undo" size={MOD_ICON_SIZE} onClick={() => onUndoModifier?.(modifier.id!)} label="Undo modifier" />
              <KdsActionIcon icon="ready" size={MOD_ICON_SIZE} disabled label="Modifier done" />
            </>
          ) : modifierStatus === 'preparing' ? (
            <>
              <KdsActionIcon icon="undo" size={MOD_ICON_SIZE} onClick={() => onUndoModifier?.(modifier.id!)} label="Undo modifier" />
              <KdsActionIcon icon="preparing" size={MOD_ICON_SIZE} onClick={() => onAdvanceModifier?.(modifier.id!)} label="Mark modifier done" />
            </>
          ) : (
            <KdsActionIcon icon="seen" size={MOD_ICON_SIZE} onClick={() => onAdvanceModifier?.(modifier.id!)} label="Mark modifier seen" />
          )}
        </div>
      )}
    </div>
  );
}
