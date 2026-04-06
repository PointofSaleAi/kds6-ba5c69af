import type { OrderItem } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import { ModifierLine } from '@/components/kds/ModifierLine';

interface ItemRowProps {
  item: OrderItem;
  dimmed: boolean;
}

export function ItemRow({ item, dimmed }: ItemRowProps) {
  const { tp } = useLanguage();
  return (
    <div className={`py-0 ${dimmed ? 'opacity-[0.32]' : ''}`}>
      <div className="flex items-center gap-1">
        <span className="text-[13px] font-semibold text-text-primary leading-tight">
          {item.quantity}x {tp(item.name)}
        </span>
        {item.allergens.map((a) => (
          <AllergenBadge key={a.type} allergen={a} variant="item" />
        ))}
      </div>
      {item.modifiers.map((m, i) => (
        <ModifierLine key={i} modifier={m} />
      ))}
    </div>
  );
}
