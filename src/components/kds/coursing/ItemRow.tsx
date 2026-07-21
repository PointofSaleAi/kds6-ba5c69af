import type { OrderItem } from '@/types/kds';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import { KdsActionIcon } from '@/components/kds/KdsActionIcon';

interface ItemRowProps {
  item: OrderItem;
  dimmed: boolean;
}

export function ItemRow({ item, dimmed }: ItemRowProps) {
  const { tp, tm, displayMode, tpSecondary, showSecondaryMenu, secondaryLang } = useLanguage();
  const secondaryDir = secondaryLang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      className={`flex items-center border-b border-border/50 ${dimmed ? 'opacity-[0.32]' : ''}`}
      style={{ padding: '4px 0 4px 4px', gap: 0 }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start flex-nowrap min-w-0" style={{ gap: '6px', lineHeight: 1.1 }}>
          <span className="text-[13px] font-normal text-text-secondary shrink-0">
            {item.quantity}×
          </span>
          <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '1px' }}>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="text-[13px] font-bold text-text-primary uppercase break-words" style={{ lineHeight: 1.1, wordBreak: 'break-word' }}>
                {tp(item.name)}
              </span>
              {item.allergens.map((a) => (
                <AllergenBadge key={a.type} allergen={a} variant="item" suffix="allergy" />
              ))}
            </div>
            {displayMode === 'dual' && showSecondaryMenu && (
              <div
                dir="ltr"
                className="flex items-center text-[11px] font-bold uppercase"
                style={{ gap: '6px', color: '#AAAAAA', justifyContent: secondaryDir === 'rtl' ? 'flex-end' : 'flex-start' }}
              >
                {secondaryDir !== 'rtl' && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-muted shrink-0">
                    <Languages size={10} className="text-text-secondary" />
                  </span>
                )}
                <span style={{ textAlign: secondaryDir === 'rtl' ? 'right' : 'left', minWidth: 0, overflowWrap: 'anywhere', unicodeBidi: 'plaintext' }} dir={secondaryDir}>{tpSecondary(item.name)}</span>
                {secondaryDir === 'rtl' && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-muted shrink-0">
                    <Languages size={10} className="text-text-secondary" />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>


        {item.modifiers.length > 0 && (
          <div style={{ marginTop: '1px' }}>
            {item.modifiers.map((mod, idx) => (
              <div
                key={idx}
                className={`flex items-center font-semibold ${
                  mod.type === 'extra'
                    ? 'text-modifier-extra'
                    : mod.type === 'remove'
                      ? 'text-destructive'
                      : 'text-text-secondary'
                }`}
                style={{ fontSize: '11px', lineHeight: '1.4', marginBottom: 0, gap: '6px' }}
              >
                <span className="invisible shrink-0 font-normal text-[13px]" aria-hidden="true">
                  {item.quantity}x
                </span>
                <span className="min-w-0">{tm(mod.text)}</span>
              </div>
            ))}
          </div>
        )}

        {item.notes && (
          <div className="flex items-start" style={{ marginTop: '1px', gap: '6px' }}>
            <span className="invisible shrink-0 font-normal text-[13px]" aria-hidden="true">
              {item.quantity}x
            </span>
            <div className="text-[11px] italic leading-snug min-w-0 font-medium" style={{ color: '#AAAAAA' }}>
              "{item.notes}"
            </div>
          </div>
        )}
      </div>

      <div
        className="flex items-center shrink-0"
        style={{ gap: '4px', display: dimmed ? 'none' : 'flex' }}
      >
        <KdsActionIcon icon="seen" label="Mark Seen" />
      </div>
    </div>
  );
}
