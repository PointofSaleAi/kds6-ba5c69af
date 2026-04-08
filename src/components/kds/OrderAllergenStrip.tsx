import type { Order } from '@/types/kds';
import { AllergenBadge } from './AllergenBadge';

interface OrderAllergenStripProps {
  order: Order;
}

export function OrderAllergenStrip({ order }: OrderAllergenStripProps) {
  const allAllergens = order.courses.flatMap(c => c.items.flatMap(i => i.allergens));
  const unique = Array.from(new Map(allAllergens.map(a => [a.type, a])).values());

  if (unique.length === 0) return null;

  return (
    <div className="px-2 py-1 flex items-center gap-1.5 bg-allergen/8 border-t border-allergen/15">
      <span className="text-allergen text-[10px] font-bold">&#9888;</span>
      {unique.map(a => (
        <AllergenBadge key={a.type} allergen={a} variant="order" />
      ))}
    </div>
  );
}
