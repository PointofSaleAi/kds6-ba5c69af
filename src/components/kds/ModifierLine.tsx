import { Eye, ConciergeBell, Check, Undo2 } from 'lucide-react';
import type { Modifier } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { KdsActionIcon } from './KdsActionIcon';
import type { ItemStatus } from './CourseSection';

export type ModifierStatus = ItemStatus;

const MOD_ICON_SIZE = 18;

interface ModifierLineProps {
  modifier: Modifier;
  servableEnabled?: boolean;
  modifierStatus?: ModifierStatus;
  onAdvanceModifier?: (modId: string) => void;
  onUndoModifier?: (modId: string) => void;
}

function ModifierEyeIcon({ status, size, onClick, onUndo, disabled }: { status?: ModifierStatus; size: number; onClick?: () => void; onUndo?: () => void; disabled?: boolean }) {
  const iconSize = Math.round(size * 0.55);

  if (status === 'done') {
    return (
      <div className="flex items-center shrink-0" style={{ gap: '0px' }}>
        <button onClick={onUndo} className="flex items-center justify-center" style={{ width: size, height: size }} aria-label="Undo modifier">
          <Undo2 size={iconSize} color="#64748B" strokeWidth={2.5} />
        </button>
        <button disabled className="flex items-center justify-center opacity-40 pointer-events-none" style={{ width: size, height: size }} aria-label="Modifier done">
          <Check size={iconSize} color="#7C3AED" strokeWidth={2.5} />
        </button>
      </div>
    );
  }
  if (status === 'preparing') {
    return (
      <div className="flex items-center shrink-0" style={{ gap: '0px' }}>
        <button onClick={onUndo} className="flex items-center justify-center" style={{ width: size, height: size }} aria-label="Undo modifier">
          <Undo2 size={iconSize} color="#64748B" strokeWidth={2.5} />
        </button>
        <button onClick={onClick} className="flex items-center justify-center" style={{ width: size, height: size }} aria-label="Mark modifier done">
          <ConciergeBell size={iconSize} color="#D32F2F" strokeWidth={2.5} />
        </button>
      </div>
    );
  }
  return (
    <button onClick={onClick} className="flex items-center justify-center" style={{ width: size, height: size }} aria-label="Mark modifier seen">
      <Eye size={iconSize} color="#1E293B" strokeWidth={2} />
    </button>
  );
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
    <div className="flex items-center" style={{ paddingLeft: '20px', lineHeight: '1.1', paddingTop: '0px', paddingBottom: '0px', gap: '4px' }}>
      <span
        className={`min-w-0 ${styles[modifier.type]} ${isDone ? 'line-through opacity-50' : ''}`}
        style={{ fontSize: 'var(--kds-modifier)', lineHeight: '1.3' }}
      >
        {tm(modifier.text)}
      </span>
      {isServable && modifier.id && (
        <div className="flex items-center shrink-0" style={{ gap: '0px' }} onClick={(e) => e.stopPropagation()}>
          <ModifierEyeIcon
            status={modifierStatus}
            size={MOD_ICON_SIZE}
            onClick={() => onAdvanceModifier?.(modifier.id!)}
            onUndo={() => onUndoModifier?.(modifier.id!)}
          />
        </div>
      )}
    </div>
  );
}
