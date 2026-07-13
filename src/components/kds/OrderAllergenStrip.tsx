import type { Order } from '@/types/kds';
import { AllergenBadge } from './AllergenBadge';

interface OrderAllergenStripProps {
  order: Order;
  compact?: boolean;
  showBottomRule?: boolean;
}

export function OrderAllergenStrip({ order, compact, showBottomRule }: OrderAllergenStripProps) {
  const allAllergens = order.courses.flatMap(c => c.items.flatMap(i => i.allergens));
  const unique = Array.from(new Map(allAllergens.map(a => [a.type, a])).values());

  if (unique.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center border-t border-border/40 ${showBottomRule ? 'border-b border-border/40' : ''} ${compact ? 'px-2 py-0.5 gap-0.5' : 'px-2 py-1 gap-1'}`}
    >
      {unique.map(a => (
        <AllergenBadge key={a.type} allergen={a} variant={compact ? 'item' : 'order'} suffix="allergy" />
      ))}
    </div>
  );
}
