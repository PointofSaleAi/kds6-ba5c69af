import { useState } from 'react';
import type { CourseGroup, OrderItem } from '@/types/kds';
import { Languages, ChevronRight } from 'lucide-react';
import type { ItemStatus } from './CourseSection';
import { useLanguage } from '@/hooks/use-language';
import { AllergenBadge } from './AllergenBadge';
import { ModifierLine, type ModifierStatus } from './ModifierLine';
import { useRowTap } from '@/hooks/use-row-tap';
import { useKDSSettings } from '@/hooks/use-kds-settings';

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
  modifierTimestamps?: Map<string, { seenAt?: string; doneAt?: string }>;
  onAdvanceModifier?: (modId: string) => void;
  onUndoModifier?: (modId: string) => void;
  dismissedItemIds?: Set<string>;
  onDismissItem?: (itemId: string) => void;
  /** Override the global ticketLayout (used by previews). */
  ticketLayoutMode?: 'standard' | 'compact';
}

export function FlatItemList({ courses, itemStatuses, itemTimestamps, onAdvanceItem, onUndoItem, onReRouteItem, showAllergens = true, servableModifiersEnabled, modifierStatuses, modifierTimestamps, onAdvanceModifier, onUndoModifier, dismissedItemIds, onDismissItem, ticketLayoutMode }: FlatItemListProps) {
  const { tp, displayMode, tpSecondary, t, showSecondaryMenu, secondaryLang } = useLanguage();
  const { ticketLayout } = useKDSSettings();
  const ticketLayoutCompact = (ticketLayoutMode ?? ticketLayout) === 'compact';
  const secondaryDir = secondaryLang === 'ar' ? 'rtl' : 'ltr';

  const allItems = courses.flatMap(c => c.items);

  return (
    <div className="px-1">
      {(() => {
        const visibleItems = allItems.filter((item) => {
          if (dismissedItemIds?.has(item.id)) return false;
          return true;
        });
        let seenIdx = 0;
        return visibleItems.map((item, visibleIdx) => {
        const isLastVisible = visibleIdx === visibleItems.length - 1;
        const status = itemStatuses?.get(item.id);
        const timestamps = itemTimestamps?.get(item.id);
        const currentSeenIdx = status === 'preparing' ? seenIdx++ : 0;

        return (
          <ItemTapRow
            key={item.id}
            item={item}
            status={status}
            timestamps={timestamps}
            seenIdx={currentSeenIdx}
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
            modifierTimestamps={modifierTimestamps}
            onAdvanceModifier={onAdvanceModifier}
            onUndoModifier={onUndoModifier}
            onAdvanceItem={onAdvanceItem}
            onUndoItem={onUndoItem}
            onDismissItem={onDismissItem}
            ticketLayoutCompact={ticketLayoutCompact}
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
  seenIdx: number;
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
  modifierTimestamps?: Map<string, { seenAt?: string; doneAt?: string }>;
  onAdvanceModifier?: (id: string) => void;
  onUndoModifier?: (id: string) => void;
  onAdvanceItem: (itemId: string, skipToDone?: boolean) => void;
  onUndoItem: (itemId: string) => void;
  onDismissItem?: (itemId: string) => void;
  ticketLayoutCompact?: boolean;
}

function ItemTapRow({
  item, status, timestamps, seenIdx, isLastVisible, showAllergens,
  displayMode, showSecondaryMenu, secondaryDir, tp, tpSecondary, t,
  servableModifiersEnabled, modifierStatuses, modifierTimestamps, onAdvanceModifier, onUndoModifier,
  onAdvanceItem, onUndoItem, onDismissItem, ticketLayoutCompact,
}: ItemTapRowProps) {
  const { tn } = useLanguage();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const hasDetails =
    (showAllergens && item.allergens.length > 0) ||
    item.modifiers.length > 0 ||
    !!item.notes ||
    (displayMode === 'dual' && showSecondaryMenu && !item.isCancelled);
  const showDetails = !ticketLayoutCompact || detailsOpen;
  // Servable modifier guard: keep the product (and its servable modifier rows)
  // visible until every servable modifier is itself marked Done.
  const servableMods = (item.modifiers || []).filter(
    (m) => !!servableModifiersEnabled && !!m.isServable && m.type !== 'remove' && !!m.id
  );
  const allServableModsDone =
    servableMods.length === 0 ||
    servableMods.every((m) => modifierStatuses?.get(m.id as string) === 'done');

  const handleSingle = () => {
    if (item.isCancelled) return;
    if (status === 'done') {
      if (!allServableModsDone) return;
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
  const hasModifiers = item.modifiers.length > 0;
  const isServableMod = (m: typeof item.modifiers[number]) =>
    !!servableModifiersEnabled && !!m.isServable && m.type !== 'remove' && !!m.id;
  const hasServableModifiers = item.modifiers.some(isServableMod);
  const isolateModifierRows = hasServableModifiers;

  const useTeal = isSeen && seenIdx % 2 === 1;
  const seenBgGreen = 'rgba(29, 158, 117, 0.14)';
  const seenBgTeal = 'rgba(245, 158, 11, 0.18)';
  const seenTextGreen = '#0F5132';
  const seenTextTeal = '#92400E';

  // Seen rows alternate green/amber tint; Done rows use a light grey tint.
  const rowBg = isDone ? 'rgba(149, 165, 166, 0.12)' : isSeen ? (useTeal ? seenBgTeal : seenBgGreen) : undefined;

  return (
    <div
      className={`-mx-2 px-2 ${isLastVisible ? '' : 'border-b border-border/50'} ${item.isCancelled ? 'opacity-50' : ''} ${item.isNew && !item.isCancelled ? 'animate-new-item' : ''}`}
      style={{ 
        ...(!isolateModifierRows && rowBg ? { backgroundColor: rowBg } : {}),
        paddingTop: 'var(--kds-row-py, 4px)',
        paddingBottom: hasServableModifiers ? '0px' : 'var(--kds-row-py, 4px)',
      }}
    >
      <div
        className="flex items-center cursor-pointer active:bg-muted/50 transition-colors select-none"
        style={{
          padding: isolateModifierRows ? '0px 8px 0 8px' : `0px 0 0 0px`,
          gap: 0,
          ...(isolateModifierRows ? { marginLeft: '-8px', marginRight: '-8px' } : {}),
          ...(isolateModifierRows && rowBg ? { backgroundColor: rowBg } : {}),
        }}
        onClick={handleTap}
        title={item.isCancelled ? undefined : (isDone ? 'Tap to remove · Double-tap to undo' : isSeen ? 'Tap to mark DONE · Double-tap to undo' : 'Tap to mark SEEN')}
      >
        {ticketLayoutCompact && (
          hasDetails ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setDetailsOpen(o => !o); }}
              aria-label={detailsOpen ? 'Collapse details' : 'Expand details'}
              aria-expanded={detailsOpen}
              data-chevron-slot="line"
              className="shrink-0 inline-flex items-center justify-center rounded hover:bg-muted/60"
              style={{ width: 12, height: 12 }}
            >
              <ChevronRight
                size={12}
                className="text-text-muted transition-transform duration-200"
                style={{ transform: detailsOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>
          ) : (
            <span
              aria-hidden="true"
              data-chevron-slot="line"
              className="shrink-0 inline-flex items-center justify-center"
              style={{ width: 12, height: 12 }}
            >
              <ChevronRight size={12} className="text-text-muted/60" />
            </span>
          )
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start flex-nowrap min-w-0" style={{ gap: '4px', lineHeight: 1.1 }}>
            <span
              className={`font-normal shrink-0 ${isDone ? 'line-through' : ''}`}
              style={{ fontSize: 'var(--kds-item-qty)', lineHeight: 1.1, width: ticketLayoutCompact ? '1.5ch' : '2.25ch', textAlign: 'right', display: 'inline-block' }}
            >
              {item.quantity}x
            </span>
            <span
              className={`font-bold uppercase min-w-0 flex-1 break-words ${item.isCancelled ? 'line-through text-text-muted' : isDone ? 'line-through text-text-primary' : 'text-text-primary'}`}
              style={{ fontSize: 'var(--kds-item-name)', lineHeight: 1.1, wordBreak: 'break-word' }}
            >
              {tp(item.name)}
            </span>
            {item.isCancelled && (
              <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1 py-px rounded">
                CANCELLED
              </span>
            )}
            {isSeen && timestamps?.seenAt && (
              <span style={{ fontSize: '10px', color: useTeal ? seenTextTeal : seenTextGreen, fontWeight: 600, paddingTop: '3px', alignSelf: 'flex-start' }} className="ml-1">
                {t.seenAt} {timestamps.seenAt}
              </span>
            )}
            {isDone && timestamps?.doneAt && (
              <span style={{ fontSize: '10px', color: '#374151', fontWeight: 600, paddingTop: '3px', alignSelf: 'flex-start' }} className="ml-1">
                {t.doneAt} {timestamps.doneAt}
              </span>
            )}
          </div>

          {showDetails && displayMode === 'dual' && showSecondaryMenu && !item.isCancelled && (
            <div
              dir="ltr"
              className={`flex items-center font-bold uppercase text-text-muted ${isDone ? 'line-through' : ''}`}
              style={{ gap: '4px', marginTop: 'var(--kds-child-gap, 1px)', marginBottom: '0px', fontSize: 'var(--kds-modifier)', lineHeight: '1' }}
            >
              <span className="relative font-normal shrink-0" style={{ fontSize: 'var(--kds-item-qty)', width: ticketLayoutCompact ? '1.5ch' : '2.25ch', display: 'inline-block', lineHeight: 1 }}>
                <span className="invisible" aria-hidden="true">0x</span>
                <span className="absolute inset-0 flex items-center justify-end">
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded bg-muted">
                    <Languages size={8} className="text-text-secondary" />
                  </span>
                </span>
              </span>
              <span style={{ lineHeight: 1, unicodeBidi: 'plaintext' }}>{tpSecondary(item.name)}</span>
            </div>
          )}

          {showDetails && showAllergens && item.allergens.length > 0 && (
            <div className="flex items-start" style={{ gap: '4px', marginTop: 'var(--kds-child-gap, 1px)', lineHeight: 1 }}>
              <span className="invisible shrink-0 font-normal" aria-hidden="true" style={{ fontSize: 'var(--kds-item-qty)', lineHeight: 1, width: ticketLayoutCompact ? '1.5ch' : '2.25ch', display: 'inline-block' }}>
                0x
              </span>
              <div className="flex flex-wrap items-start" style={{ gap: '4px', rowGap: '2px', lineHeight: 1 }}>
                {item.allergens.map((a) => (
                  <AllergenBadge key={a.type} allergen={a} variant="item" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showDetails && item.modifiers.length > 0 && (() => {
        const nonServable = item.modifiers.filter((m) => !isServableMod(m));
        const servable = item.modifiers.filter((m) => isServableMod(m));
        return (
          <>
            {nonServable.length > 0 && (
              <div
                className={isDone ? 'line-through' : ''}
                style={{
                  marginTop: isolateModifierRows ? '0px' : 'var(--kds-child-gap, 1px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isolateModifierRows ? '0px' : 'var(--kds-child-gap, 1px)',
                  paddingLeft: isolateModifierRows ? (ticketLayoutCompact ? '24px' : '8px') : (ticketLayoutCompact ? '16px' : '0px'),
                  paddingRight: isolateModifierRows ? '8px' : '0px',
                  ...(isolateModifierRows ? { marginLeft: '-8px', marginRight: '-8px' } : {}),
                  ...(isolateModifierRows && rowBg ? { backgroundColor: rowBg } : {}),
                }}
              >
                {nonServable.map((mod, idx) => (
                  <ModifierLine
                    key={mod.id || `ns-${idx}`}
                    modifier={mod}
                    servableEnabled={false}
                    parentQuantity={item.quantity}
                    compactQtyCol={ticketLayoutCompact}
                  />
                ))}
              </div>
            )}
            {servable.length > 0 && (
              <div
                style={{
                  marginTop: '0px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0px',
                  paddingLeft: ticketLayoutCompact ? '16px' : '0px',
                }}
              >
                {servable.map((mod, idx) => (
                  <ModifierLine
                    key={mod.id || `s-${idx}`}
                    modifier={mod}
                    servableEnabled={servableModifiersEnabled}
                    modifierStatus={mod.id ? modifierStatuses?.get(mod.id) : undefined}
                    modifierTimestamps={mod.id ? modifierTimestamps?.get(mod.id) : undefined}
                    onAdvanceModifier={onAdvanceModifier}
                    onUndoModifier={onUndoModifier}
                    parentQuantity={item.quantity}
                    compactQtyCol={ticketLayoutCompact}
                  />
                ))}
              </div>
            )}
          </>
        );
      })()}

      {showDetails && item.notes && !item.isCancelled && (
        <div className="flex items-start" style={{ gap: '4px', marginTop: 'var(--kds-child-gap, 1px)', paddingLeft: ticketLayoutCompact ? '16px' : '0px' }}>
          <span className="invisible shrink-0 font-normal" aria-hidden="true" style={{ fontSize: 'var(--kds-item-qty)', width: ticketLayoutCompact ? '1.5ch' : '2.25ch', display: 'inline-block' }}>
            0x
          </span>
          <div
            className={`italic leading-snug min-w-0 text-text-muted ${isDone ? 'line-through' : ''}`}
            style={{ fontSize: 'var(--kds-modifier)' }}
          >
            "{tn(item.notes)}"
          </div>
        </div>
      )}
    </div>
  );
}
