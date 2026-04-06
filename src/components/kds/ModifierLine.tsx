import type { Modifier } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';

interface ModifierLineProps {
  modifier: Modifier;
}

export function ModifierLine({ modifier }: ModifierLineProps) {
  const { tm } = useLanguage();
  const styles = {
    extra: 'text-modifier-extra',
    remove: 'text-modifier-remove line-through',
    neutral: 'text-text-secondary',
  };

  return (
    <span className={`text-modifier pl-5 block ${styles[modifier.type]}`}>
      {tm(modifier.text)}
    </span>
  );
}
