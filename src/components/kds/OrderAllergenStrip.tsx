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
    <div className="px-2 py-1 flex flex-wrap items-center gap-1 border-t border-border/40">
      {unique.map(a => (
        <AllergenBadge key={a.type} allergen={a} variant="order" />
      ))}
    </div>
  );
}
