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
          <span className="text-[13px] font-normal text-text-secondary">
            {item.quantity}×
          </span>
          <span className="text-[13px] font-bold text-text-primary uppercase min-w-0 flex-1 break-words" style={{ lineHeight: 1.1, wordBreak: 'break-word' }}>
            {tp(item.name)}
          </span>
        </div>

        {item.allergens.length > 0 && (
          <div className="flex items-start" style={{ gap: '6px', marginTop: '1px', lineHeight: 1 }}>
            <span className="invisible shrink-0 font-normal text-[13px]" aria-hidden="true" style={{ lineHeight: 1 }}>
              {item.quantity}×
            </span>
            <div className="flex flex-wrap items-start" style={{ gap: '4px', rowGap: '2px', lineHeight: 1 }}>
              {item.allergens.map((a) => (
                <AllergenBadge key={a.type} allergen={a} variant="item" />
              ))}
            </div>
          </div>
        )}

        {displayMode === 'dual' && showSecondaryMenu && (
          <div
            dir={secondaryDir}
            className="flex items-center text-[11px] font-bold uppercase"
            style={{ gap: '6px', marginTop: '1px', color: '#AAAAAA' }}
          >
            <span className="relative text-[13px] font-normal shrink-0">
              <span className="invisible" aria-hidden="true">{item.quantity}&times;</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-muted">
                  <Languages size={10} className="text-text-secondary" />
                </span>
              </span>
            </span>
            <span>{tpSecondary(item.name)}</span>
          </div>
        )}

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
            <div className="text-[11px] italic leading-snug min-w-0" style={{ color: '#AAAAAA' }}>
              "{item.notes}"
            </div>
          </div>
        )}
      </div>

      <div
        className="flex items-center shrink-0"
        style={{ gap: '4px', display: dimmed ? 'none' : 'flex' }}
      >
        <KdsActionIcon icon="seen" label="Mark seen" />
      </div>
    </div>
  );
}
