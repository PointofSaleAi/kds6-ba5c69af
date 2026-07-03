import { useState } from 'react';
import type { CourseGroup, OrderItem } from '@/types/kds';
import { Languages, ChevronRight } from 'lucide-react';
import type { ItemStatus } from './CourseSection';
import { useLanguage } from '@/hooks/use-language';
import { AllergenBadge } from './AllergenBadge';
import { ModifierLine, type ModifierStatus } from './ModifierLine';
import { Flag86Button, Flag86Modal } from './Flag86Button';
import { TightWidthBox } from './TightWidthBox';
import { KdsActionIcon, type KdsIconType } from './KdsActionIcon';
import { LegacyActionPill } from './LegacyActionPill';
import { useRowTap } from '@/hooks/use-row-tap';
import { useLongPress } from '@/hooks/use-long-press';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { useFlag86 } from '@/hooks/use-flag86';
import { ONBOARDING_SAMPLE_FIRST_ITEM_ID } from '@/data/onboarding-sample-order';

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
  /** When true, render per-product KdsActionIcon (legacy mode) and disable row-tap cycle. */
  legacyActions?: boolean;
}

export function FlatItemList({ courses, itemStatuses, itemTimestamps, onAdvanceItem, onUndoItem, onReRouteItem, showAllergens = true, servableModifiersEnabled, modifierStatuses, modifierTimestamps, onAdvanceModifier, onUndoModifier, dismissedItemIds, onDismissItem, ticketLayoutMode, legacyActions }: FlatItemListProps) {
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
            legacyActions={legacyActions}
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
  legacyActions?: boolean;
}

function ItemTapRow({
  item, status, timestamps, seenIdx, isLastVisible, showAllergens,
  displayMode, showSecondaryMenu, secondaryDir, tp, tpSecondary, t,
  servableModifiersEnabled, modifierStatuses, modifierTimestamps, onAdvanceModifier, onUndoModifier,
  onAdvanceItem, onUndoItem, onDismissItem, ticketLayoutCompact, legacyActions,
}: ItemTapRowProps) {
  const { tn } = useLanguage();
  const { clearedIds: flag86Cleared, isConfirmed: is86Confirmed, confirm: confirm86 } = useFlag86();
  const [manual86Open, setManual86Open] = useState(false);
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
  const is86ConfirmedItem = is86Confirmed(item.id);
  const is86Active = item.is86Flagged && !flag86Cleared.has(item.id) && !is86ConfirmedItem;
  const show86Pill = is86ConfirmedItem;
  const rowBg = is86Active ? 'rgba(26, 26, 46, 0.08)' : (isDone ? 'rgba(149, 165, 166, 0.12)' : (isSeen && !legacyActions) ? (useTeal ? seenBgTeal : seenBgGreen) : undefined);

  const longPress = useLongPress(() => {
    if (item.isCancelled || is86Active || is86ConfirmedItem) return;
    setManual86Open(true);
  }, { stopPropagation: true });

  const isOnboardingFirstItem = item.id === ONBOARDING_SAMPLE_FIRST_ITEM_ID;
  const showOnboardingActionSet = false;
  const onbAttr = isOnboardingFirstItem ? { 'data-onboarding': 'item-row' } : {};
  return (
    <div
      {...onbAttr}
      className={`-mx-2 px-2 ${isLastVisible ? '' : 'border-b border-border/50'} ${item.isCancelled ? 'opacity-50' : ''} ${item.isNew && !item.isCancelled ? 'animate-new-item' : ''}`}
      style={{ 
        ...(!isolateModifierRows && rowBg ? { backgroundColor: rowBg } : {}),
        paddingTop: 'var(--kds-row-py, 4px)',
        paddingBottom: hasServableModifiers ? '0px' : 'var(--kds-row-py, 4px)',
      }}
    >
      <div
        className={`flex items-center transition-colors select-none ${legacyActions ? '' : 'cursor-pointer active:bg-muted/50'}`}
        style={{
          padding: isolateModifierRows ? '0px 8px 0 8px' : `0px 0 0 0px`,
          gap: 0,
          ...(isolateModifierRows ? { marginLeft: '-8px', marginRight: '-8px' } : {}),
          ...(isolateModifierRows && rowBg ? { backgroundColor: rowBg } : {}),
        }}
        onClick={legacyActions ? undefined : handleTap}
        {...longPress}
        title={item.isCancelled ? undefined : (legacyActions ? 'Hold to 86' : (isDone ? 'Tap to remove · Double-tap to undo · Hold to 86' : isSeen ? 'Tap to mark DONE · Double-tap to undo · Hold to 86' : 'Tap to mark SEEN · Hold to 86'))}
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
              style={{ fontSize: 'var(--kds-item-qty)', lineHeight: 1.1, width: ticketLayoutCompact ? '1.5ch' : '2.25ch', textAlign: 'center', display: 'inline-block' }}
            >
              {item.quantity}x
            </span>
            <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 'var(--kds-child-gap, 1px)' }}>
              <TightWidthBox
                constrainSecondary={secondaryDir === 'rtl'}
                deps={[item.name, displayMode, showSecondaryMenu, secondaryDir]}
                primary={
                  <span
                    className={`inline font-bold uppercase break-words ${item.isCancelled ? 'line-through text-text-muted' : isDone ? 'line-through text-text-primary' : 'text-text-primary'}`}
                    style={{ fontSize: 'var(--kds-item-name)', lineHeight: 1.1, wordBreak: 'break-word' }}
                  >
                    {tp(item.name)}
                  </span>
                }
                secondary={showDetails && displayMode === 'dual' && showSecondaryMenu && !item.isCancelled ? (
                  <div
                    dir="ltr"
                    className={`flex items-center font-bold uppercase text-text-muted ${isDone ? 'line-through' : ''}`}
                    style={{ gap: '4px', marginBottom: '0px', fontSize: 'var(--kds-modifier)', lineHeight: '1', flexDirection: secondaryDir === 'rtl' ? 'row-reverse' : 'row', justifyContent: 'flex-start' }}
                  >
                    <span className="inline-flex items-center justify-center w-3 h-3 rounded bg-muted shrink-0">
                      <Languages size={8} className="text-text-secondary" />
                    </span>
                    <span className="min-w-0 flex-1" style={{ lineHeight: 1, unicodeBidi: 'plaintext', textAlign: secondaryDir === 'rtl' ? 'right' : 'left', overflowWrap: 'anywhere' }} dir={secondaryDir}>{tpSecondary(item.name)}</span>
                  </div>
                ) : undefined}
              />
            </div>
            {item.isCancelled && (
              <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1 py-px rounded shrink-0">
                CANCELLED
              </span>
            )}
            {!legacyActions && isSeen && timestamps?.seenAt && (
              <span style={{ fontSize: '10px', color: useTeal ? seenTextTeal : seenTextGreen, fontWeight: 600, paddingTop: '3px', alignSelf: 'flex-start' }} className="ml-1 shrink-0 whitespace-nowrap">
                {t.seenAt} {timestamps.seenAt}
              </span>
            )}
            {!legacyActions && isDone && timestamps?.doneAt && (
              <span style={{ fontSize: '10px', color: '#374151', fontWeight: 600, paddingTop: '3px', alignSelf: 'flex-start' }} className="ml-1 shrink-0 whitespace-nowrap">
                {t.doneAt} {timestamps.doneAt}
              </span>
            )}
          </div>

          {showDetails && showAllergens && item.allergens.length > 0 && (
            <div className="flex items-start" style={{ gap: '4px', marginTop: 'var(--kds-child-gap, 1px)', lineHeight: 1 }}>
              <span className="invisible shrink-0 font-normal" aria-hidden="true" style={{ fontSize: 'var(--kds-item-qty)', lineHeight: 1, width: ticketLayoutCompact ? '1.5ch' : '2.25ch', display: 'inline-block' }}>
                0x
              </span>
              <div
                {...(isOnboardingFirstItem ? { 'data-onboarding': 'item-allergen' } : {})}
                className="flex flex-wrap items-start"
                style={{ gap: '4px', rowGap: '2px', lineHeight: 1 }}
              >
                {item.allergens.map((a) => (
                  <AllergenBadge key={a.type} allergen={a} variant="item" />
                ))}
              </div>
            </div>
          )}
        </div>
        {(is86Active || show86Pill) && <Flag86Button itemId={item.id} productName={item.name} />}
        {legacyActions && !item.isCancelled && !is86Active && !show86Pill && (
          <div className="shrink-0 ml-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {(showOnboardingActionSet || (!isSeen && !isDone)) && (
              <span {...(item.id === 'onb-i-1' ? { 'data-onboarding': 'item-eye' } : {})}>
                <LegacyActionPill variant="seen" onClick={() => onAdvanceItem(item.id)} title="Mark Seen / In Progress" />
              </span>
            )}
            {!showOnboardingActionSet && (isSeen || isDone) && (
              <LegacyActionPill variant="undo" onClick={() => onUndoItem(item.id)} title="Undo" />
            )}
            {(showOnboardingActionSet || (isSeen && !isDone)) && (
              <span {...(item.id === 'onb-i-2' ? { 'data-onboarding': 'item-bell' } : {})}>
                <LegacyActionPill variant="bell" onClick={() => onAdvanceItem(item.id)} title="Mark Done" />
              </span>
            )}
            {(showOnboardingActionSet || isDone) && (
              <span {...(item.id === 'onb-i-3' ? { 'data-onboarding': 'item-check' } : {})}>
                <LegacyActionPill variant="check" onClick={() => onDismissItem?.(item.id)} title="Remove from ticket" />
              </span>
            )}
          </div>
        )}
      </div>

      {showDetails && item.modifiers.length > 0 && (() => {
        const nonServable = item.modifiers.filter((m) => !isServableMod(m));
        const servable = item.modifiers.filter((m) => isServableMod(m));
        return (
          <>
            {nonServable.length > 0 && (
              <div
                {...(item.id === 'onb-i-2' ? { 'data-onboarding': 'item-modifier' } : {})}
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
            className={`italic leading-snug min-w-0 text-text-muted font-medium ${isDone ? 'line-through' : ''}`}
            style={{ fontSize: 'var(--kds-modifier)' }}
          >
            "{tn(item.notes)}"
          </div>
        </div>
      )}
      <Flag86Modal
        open={manual86Open}
        onClose={() => setManual86Open(false)}
        onConfirm={() => {
          setManual86Open(false);
          confirm86(item.id);
          // eslint-disable-next-line no-console
          console.log('Manual 86 requested:', 'item', [item.id]);
        }}
        title={item.name}
        subtext="Asks the manager to confirm this from the Point of Sale. Once they approve, the item is taken off the menu and no new orders can be sent to the kitchen. Open tickets are not affected."
        primaryLabel="Request 86"
        showQuantityAdjuster="below-title"
      />
    </div>
  );
}
