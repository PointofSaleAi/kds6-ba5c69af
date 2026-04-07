import type { OrderItem } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import seenIcon from '@/assets/seen-icon.svg';

interface ItemRowProps {
  item: OrderItem;
  dimmed: boolean;
}

export function ItemRow({ item, dimmed }: ItemRowProps) {
  const { tp } = useLanguage();

  return (
    <div
      className={`flex items-start border-b border-border/50 ${dimmed ? 'opacity-[0.32]' : ''}`}
      style={{ padding: '8px 12px', gap: 0 }}
    >
      {/* Child 1 — item-main */}
      <div className="flex-1 min-w-0">
        {/* .item-name-row */}
        <div className="flex items-center flex-wrap" style={{ gap: '6px' }}>
          <span className="text-[13px] font-normal text-text-secondary">
            {item.quantity}×
          </span>
          <span className="text-[13px] font-medium text-text-primary">
            {tp(item.name)}
          </span>
          {item.allergens.map((a) => (
            <AllergenBadge key={a.type} allergen={a} variant="item" />
          ))}
        </div>

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
                {mod.type === 'extra' ? `+ ${mod.text}` : mod.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Child 2 — item-action */}
      <div
        className="flex items-start justify-center shrink-0"
        style={{ width: '28px', paddingTop: '1px', display: dimmed ? 'none' : 'flex' }}
      >
        <button
          className="flex items-center justify-center rounded bg-muted border border-border/50"
          style={{ width: '24px', height: '24px' }}
          aria-label="Mark seen"
        >
          <img src={seenIcon} alt="Seen" style={{ width: '12px', height: '12px' }} />
        </button>
      </div>
    </div>
  );
}
