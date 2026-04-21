import type { Allergen, AllergenType } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';

const allergenColors: Record<string, { bg: string; border: string; text: string }> = {
  gluten:    { bg: 'bg-amber-100',   border: 'border-amber-400',   text: 'text-amber-900' },
  dairy:     { bg: 'bg-sky-100',     border: 'border-sky-400',     text: 'text-sky-900' },
  shellfish: { bg: 'bg-orange-100',  border: 'border-orange-400',  text: 'text-orange-900' },
  egg:       { bg: 'bg-yellow-50',   border: 'border-yellow-400',  text: 'text-yellow-900' },
  sesame:    { bg: 'bg-amber-200',   border: 'border-amber-600',   text: 'text-amber-950' },
  fish:      { bg: 'bg-teal-100',    border: 'border-teal-400',    text: 'text-teal-900' },
  peanut:    { bg: 'bg-red-100',     border: 'border-red-400',     text: 'text-red-900' },
  'tree-nut': { bg: 'bg-red-100',    border: 'border-red-400',     text: 'text-red-900' },
  soy:       { bg: 'bg-lime-100',    border: 'border-lime-400',    text: 'text-lime-900' },
};

const defaultColor = { bg: 'bg-muted', border: 'border-border', text: 'text-foreground' };

function getColor(type: string) {
  return allergenColors[type] || defaultColor;
}

interface AllergenBadgeProps {
  allergen: Allergen;
  /** 'order' = prominent warning at top; 'item' = subtle inline; 'expo-item' = smaller inline for expo */
  variant?: 'order' | 'item' | 'expo-item';
}

export function AllergenBadge({ allergen, variant = 'item' }: AllergenBadgeProps) {
  const { ta } = useLanguage();
  const color = getColor(allergen.type);

  const sizeStyle = variant === 'order'
    ? { fontSize: 'var(--kds-allergen-font)', padding: 'var(--kds-allergen-py) var(--kds-allergen-px)', opacity: 1 }
    : variant === 'expo-item'
      ? { fontSize: '7px', padding: '1px 5px', opacity: 0.7 }
      : { fontSize: '7px', padding: '1px 5px', opacity: 0.7 };

  return (
    <span
      className={`inline-flex items-center rounded border font-bold uppercase ${color.bg} ${color.border} ${color.text}`}
      style={{ ...sizeStyle, lineHeight: 1.3 }}
    >
      {ta(allergen.label)}
    </span>
  );
}
