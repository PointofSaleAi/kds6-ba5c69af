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
            className="flex items-center text-[11px] text-text-muted font-semibold uppercase"
            style={{ gap: '6px', marginTop: '1px' }}
          >
            <span className="inline-flex items-center justify-center shrink-0" style={{ minWidth: '1.5em' }}>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-muted">
                <Languages size={10} className="text-text-secondary" />
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
                className={
                  mod.type === 'extra'
                    ? 'text-modifier-extra'
                    : mod.type === 'remove'
                      ? 'text-destructive'
                      : 'text-text-secondary'
                }
                style={{ fontSize: '11px', lineHeight: '1.4', marginBottom: 0, paddingLeft: '20px' }}
              >
                {tm(mod.text)}
              </div>
            ))}
          </div>
        )}

        {item.notes && (
          <div
            className="text-[11px] text-text-muted italic leading-snug"
            style={{ paddingLeft: '20px', marginTop: '2px' }}
          >
            "{item.notes}"
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
