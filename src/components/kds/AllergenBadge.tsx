import type { Allergen } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';

interface AllergenBadgeProps {
  allergen: Allergen;
  /** 'order' = prominent warning at top; 'item' = subtle inline */
  variant?: 'order' | 'item';
}

export function AllergenBadge({ allergen, variant = 'item' }: AllergenBadgeProps) {
  const { ta } = useLanguage();

  if (variant === 'order') {
    return (
      <span className="inline-flex items-center gap-0.5 text-allergen text-[11px] font-bold">
        <span className="text-[10px]">{allergen.icon}</span>
        <span>{ta(allergen.label)}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-allergen/80 text-[10px] font-semibold">
      <span>{allergen.icon}</span>
      <span>{ta(allergen.label)}</span>
    </span>
  );
}
