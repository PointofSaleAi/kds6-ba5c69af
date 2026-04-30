import type { Modifier } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { useRowTap } from '@/hooks/use-row-tap';
import type { ItemStatus } from './CourseSection';

export type ModifierStatus = ItemStatus;

interface ModifierLineProps {
  modifier: Modifier;
  servableEnabled?: boolean;
  modifierStatus?: ModifierStatus;
  modifierTimestamps?: { seenAt?: string; doneAt?: string };
  onAdvanceModifier?: (modId: string) => void;
  onUndoModifier?: (modId: string) => void;
  parentQuantity?: number;
  compactQtyCol?: boolean;
}

export function ModifierLine({ modifier, servableEnabled, modifierStatus, modifierTimestamps, onAdvanceModifier, onUndoModifier, parentQuantity = 1, compactQtyCol }: ModifierLineProps) {
  const { tm, t } = useLanguage();
  const styles = {
    extra: 'text-modifier-extra',
    remove: 'text-modifier-remove',
    neutral: 'text-modifier-neutral',
  };

  const qtyColWidth = compactQtyCol ? '1.5ch' : '2.25ch';
  const isServable = servableEnabled && modifier.isServable && modifier.type !== 'remove' && modifier.id;
  const isDone = isServable && modifierStatus === 'done';
  const isSeen = isServable && modifierStatus === 'preparing';

  const handleSingle = () => {
    if (!modifier.id) return;
    if (modifierStatus !== 'done') onAdvanceModifier?.(modifier.id);
  };
  const handleDouble = () => {
    if (!modifier.id) return;
    if (modifierStatus === 'preparing' || modifierStatus === 'done') {
      onUndoModifier?.(modifier.id);
    }
  };
  const handleTap = useRowTap(handleSingle, handleDouble);

  if (isServable && modifier.id) {
    const stateBg = isDone
      ? 'rgba(149, 165, 166, 0.12)'
      : isSeen
        ? 'rgba(29, 158, 117, 0.14)'
        : undefined;
    const seenTextGreen = '#0F5132';
    const doneText = '#374151';

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          handleTap();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            handleSingle();
          }
        }}
        className="flex items-center select-none cursor-pointer active:bg-muted/50 -mx-2 px-2"
        style={{
          paddingTop: '0px',
          paddingBottom: '0px',
          gap: '4px',
          minHeight: '0px',
          backgroundColor: stateBg,
        }}
        title={modifierStatus === 'done' ? 'Double-tap to undo' : modifierStatus === 'preparing' ? 'Tap to mark DONE · Double-tap to undo' : 'Tap to mark SEEN'}
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
        {isSeen && modifierTimestamps?.seenAt && (
          <span
            style={{ fontSize: '11px', color: seenTextGreen, fontWeight: 600 }}
            className="ml-1 shrink-0 whitespace-nowrap"
          >
            {t.seenAt} {modifierTimestamps.seenAt}
          </span>
        )}
        {isDone && modifierTimestamps?.doneAt && (
          <span
            style={{ fontSize: '11px', color: doneText, fontWeight: 600 }}
            className="ml-1 shrink-0 whitespace-nowrap"
          >
            {t.doneAt} {modifierTimestamps.doneAt}
          </span>
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
