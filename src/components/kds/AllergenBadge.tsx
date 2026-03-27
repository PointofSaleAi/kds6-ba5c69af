import type { Allergen } from '@/types/kds';

interface AllergenBadgeProps {
  allergen: Allergen;
}

export function AllergenBadge({ allergen }: AllergenBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 bg-allergen/15 text-allergen px-2 py-0.5 rounded-full text-[12px] font-bold border border-allergen/30">
      <span>{allergen.icon}</span>
      <span>{allergen.label}</span>
    </span>
  );
}
