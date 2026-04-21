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
        <div className="flex items-center flex-wrap" style={{ gap: '6px' }}>
          <span className="text-[13px] font-normal text-text-secondary">
            {item.quantity}×
          </span>
          <span className="text-[13px] font-medium text-text-primary uppercase">
            {tp(item.name)}
          </span>
          {item.allergens.map((a) => (
            <AllergenBadge key={a.type} allergen={a} variant="item" />
          ))}
        </div>

        {displayMode === 'dual' && showSecondaryMenu && (
          <div
            dir={secondaryDir}
            className="flex items-center text-[11px] text-text-muted font-semibold uppercase"
            style={{ gap: '6px', marginTop: '1px' }}
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
          <div style={{ marginTop: '2px' }}>
            {item.modifiers.map((mod, idx) => (
              <div
                key={idx}
                className={`flex items-center ${
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
          <div className="flex items-start" style={{ marginTop: '2px', gap: '6px' }}>
            <span className="invisible shrink-0 font-normal text-[13px]" aria-hidden="true">
              {item.quantity}x
            </span>
            <div className="text-[11px] text-text-muted italic leading-snug min-w-0">
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
