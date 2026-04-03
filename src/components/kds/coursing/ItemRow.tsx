import type { OrderItem } from '@/types/kds';
import { AllergenBadge } from '@/components/kds/AllergenBadge';
import { ModifierLine } from '@/components/kds/ModifierLine';

interface ItemRowProps {
  item: OrderItem;
  dimmed: boolean;
}

export function ItemRow({ item, dimmed }: ItemRowProps) {
  return (
    <div className={`py-1.5 ${dimmed ? 'opacity-[0.32]' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-item-name text-text-primary">
          {item.quantity}x {item.name}
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
