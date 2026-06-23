import type { OrderItem } from '@/types/kds';
import type { AllergenAi, AllergenSeverity, ModifierConflict } from '@/types/ai';
import { mockIngredients, severityByAllergen } from '@/data/mock-ingredients';

const SEVERITY_RANK: Record<AllergenSeverity, number> = {
  high: 3,
  medium: 2,
  preference: 1,
};

export function scoreAllergen(type: string, label: string): AllergenAi {
  const severity = severityByAllergen[type] ?? 'preference';
  return { type, label, severity };
}

export function topSeverity(item: OrderItem): AllergenSeverity {
  let max: AllergenSeverity = 'preference';
  for (const a of item.allergens) {
    const s = severityByAllergen[a.type] ?? 'preference';
    if (SEVERITY_RANK[s] > SEVERITY_RANK[max]) max = s;
  }
  return max;
}

export function detectConflicts(item: OrderItem): ModifierConflict[] {
  const profile = mockIngredients[item.name];
  if (!profile) return [];
  const conflicts: ModifierConflict[] = [];

  for (const mod of item.modifiers) {
    const text = mod.text.toLowerCase();
    // Looks like a "no X" / "without X" / "remove X" instruction.
    const noMatch = text.match(/\b(?:no|without|remove|free)\s+([a-z\- ]+)/);
    if (!noMatch) continue;
    const requested = noMatch[1].trim();

    for (const ingredient of profile.ingredients) {
      if (ingredient.toLowerCase().includes(requested) || requested.includes(ingredient.toLowerCase())) {
        // Direct ingredient match; no conflict.
        continue;
      }
    }

    // Hidden allergen check: e.g. "no dairy" but dish has butter/cream.
    if (/(dairy|lactose|milk)/.test(requested) && profile.hiddenAllergens.includes('dairy')) {
      const offender = profile.ingredients.find((i) => /butter|cream|milk|cheese|parmesan|mozzarella|cheddar|brie/.test(i));
      if (offender) {
        conflicts.push({
          itemName: item.name,
          modifier: mod.text,
          ingredient: offender,
          reason: `Contains ${offender} — hidden ${requested}.`,
        });
      }
    }
    if (/gluten|wheat/.test(requested) && profile.hiddenAllergens.includes('gluten')) {
      const offender = profile.ingredients.find((i) => /bread|dough|pasta|flour|bun|croutons/.test(i));
      if (offender) {
        conflicts.push({
          itemName: item.name,
          modifier: mod.text,
          ingredient: offender,
          reason: `Contains ${offender} — hidden gluten.`,
        });
      }
    }
    if (/nut/.test(requested) && profile.hiddenAllergens.includes('tree-nut')) {
      const offender = profile.ingredients.find((i) => /nut|walnut|almond|pecan/.test(i));
      if (offender) {
        conflicts.push({
          itemName: item.name,
          modifier: mod.text,
          ingredient: offender,
          reason: `Contains ${offender} — hidden tree-nut.`,
        });
      }
    }
    if (/egg/.test(requested) && profile.hiddenAllergens.includes('egg')) {
      const offender = profile.ingredients.find((i) => /egg/.test(i));
      if (offender) {
        conflicts.push({
          itemName: item.name,
          modifier: mod.text,
          ingredient: offender,
          reason: `Contains ${offender} — hidden egg.`,
        });
      }
    }
  }

  return conflicts;
}
