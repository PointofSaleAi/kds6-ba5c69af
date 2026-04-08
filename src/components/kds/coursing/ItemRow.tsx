import type { OrderItem } from '@/types/kds';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import seenIcon from '@/assets/seen-icon.svg';

interface ItemRowProps {
  item: OrderItem;
  dimmed: boolean;
}

export function ItemRow({ item, dimmed }: ItemRowProps) {
  const { tp, displayMode, tpSecondary } = useLanguage();

  return (
    <div
      className={`flex items-start border-b border-border/50 ${dimmed ? 'opacity-[0.32]' : ''}`}
      style={{ padding: '4px', gap: 0 }}
    >
      {/* Child 1 — item-main */}
      <div className="flex-1 min-w-0">
        {/* .item-name-row */}
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

        {/* Dual-language secondary name */}
        {displayMode === 'dual' && (
          <div className="flex items-center gap-1 text-[11px] text-text-muted font-semibold uppercase" style={{ paddingLeft: '20px', marginTop: '1px' }}>
            <Languages size={10} className="shrink-0" />
            {tpSecondary(item.name)}
          </div>
        )}

        {/* .item-mods */}
        {item.modifiers.length > 0 && (
          <div style={{ marginTop: '2px' }}>
            {item.modifiers.map((mod, idx) => (
              <div
                key={idx}
                className={
                  mod.type === 'extra'
                    ? 'text-modifier-extra'
                    : mod.type === 'remove'
                      ? 'text-destructive line-through'
                      : 'text-text-secondary'
                }
                style={{ fontSize: '11px', lineHeight: '1.4', marginBottom: 0, paddingLeft: '20px' }}
              >
                {mod.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Child 2 — item-action */}
      <div
        className="flex items-center shrink-0"
        style={{ gap: '4px', paddingTop: '1px', display: dimmed ? 'none' : 'flex' }}
      >
        <button
          className="flex items-center justify-center rounded-[3px] overflow-hidden min-w-[44px] min-h-[44px]"
          aria-label="Mark seen"
        >
          <img src={seenIcon} alt="Seen" className="w-full h-full" style={{ width: '40px', height: '30px' }} />
        </button>
      </div>
    </div>
  );
}
