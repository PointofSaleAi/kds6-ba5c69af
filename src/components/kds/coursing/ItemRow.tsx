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
  const { tp, tm, displayMode, tpSecondary, showSecondaryMenu } = useLanguage();

  return (
    <div
      className={`flex items-center border-b border-border/50 ${dimmed ? 'opacity-[0.32]' : ''}`}
      style={{ padding: '4px 0 4px 4px', gap: 0 }}
    >
      <div className="min-w-0">
        <div className="flex items-start flex-wrap" style={{ gap: '6px' }}>
          <span
            className="font-normal text-text-secondary shrink-0"
            style={{ fontSize: '13px', width: '22px', textAlign: 'right', display: 'inline-block' }}
          >
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
  <div className="flex items-start font-semibold uppercase" style={{ gap: '6px', marginTop: '1px', fontSize: '9px', color: '#555555', lineHeight: '1.2' }}>
    <span className="shrink-0" style={{ width: '22px', textAlign: 'right', display: 'inline-block' }}>
      <Languages size={8} style={{ color: '#555555' }} />
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
