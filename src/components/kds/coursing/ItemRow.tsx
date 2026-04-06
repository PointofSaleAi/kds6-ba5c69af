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
    <div className={`py-0.5 mb-0.5 ${dimmed ? 'opacity-[0.32]' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-item-name text-text-primary">
          {item.quantity}x {tp(item.name)}
        </span>
        {item.allergens.map((a) => (
          <AllergenBadge key={a.type} allergen={a} />
        ))}
      </div>
      {item.modifiers.map((m, i) => (
        <ModifierLine key={i} modifier={m} />
      ))}
    </div>
  );
}
