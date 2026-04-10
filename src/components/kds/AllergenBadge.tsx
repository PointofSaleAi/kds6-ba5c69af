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
      <span
        className="inline-flex items-center gap-0.5 text-allergen font-bold"
        style={{ fontSize: 'var(--kds-allergen-font)', padding: `var(--kds-allergen-py) var(--kds-allergen-px)` }}
      >
        <span style={{ fontSize: 'var(--kds-allergen-font)' }}>{allergen.icon}</span>
        <span>{ta(allergen.label)}</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-0.5 text-allergen/80 font-semibold"
      style={{ fontSize: 'var(--kds-allergen-font)', padding: `var(--kds-allergen-py) var(--kds-allergen-px)` }}
    >
      <span>{allergen.icon}</span>
      <span>{ta(allergen.label)}</span>
    </span>
  );
}
