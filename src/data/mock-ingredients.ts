// Mock ingredient knowledge. Used by the AI allergen-intelligence module
// to detect modifier × ingredient conflicts.
import type { AllergenType } from '@/types/kds';
import type { IngredientProfile } from '@/types/ai';

export const mockIngredients: Record<string, IngredientProfile> = {
  'Cheese Selection': {
    ingredients: ['brie', 'cheddar', 'walnut', 'honey', 'dairy', 'butter'],
    hiddenAllergens: ['tree-nut', 'dairy'],
  },
  'Meatballs': {
    ingredients: ['beef', 'pork', 'breadcrumbs', 'parmesan', 'egg', 'tomato'],
    hiddenAllergens: ['gluten', 'dairy', 'egg'],
  },
  'Filet Mignon': {
    ingredients: ['beef', 'butter', 'thyme', 'garlic'],
    hiddenAllergens: ['dairy'],
  },
  'Tres Leches': {
    ingredients: ['milk', 'cream', 'condensed milk', 'egg', 'flour'],
    hiddenAllergens: ['dairy', 'egg', 'gluten'],
  },
  'Caesar Salad': {
    ingredients: ['romaine', 'parmesan', 'anchovy', 'croutons', 'egg yolk'],
    hiddenAllergens: ['gluten', 'dairy', 'egg'],
  },
  'Pasta Carbonara': {
    ingredients: ['pasta', 'guanciale', 'parmesan', 'egg', 'pepper'],
    hiddenAllergens: ['gluten', 'dairy', 'egg'],
  },
  'Margherita Pizza': {
    ingredients: ['dough', 'mozzarella', 'basil', 'tomato'],
    hiddenAllergens: ['gluten', 'dairy'],
  },
  'House Burger': {
    ingredients: ['beef', 'brioche bun', 'cheddar', 'lettuce', 'tomato', 'aioli'],
    hiddenAllergens: ['gluten', 'dairy', 'egg'],
  },
  'Grilled Salmon': {
    ingredients: ['salmon', 'butter', 'lemon', 'capers'],
    hiddenAllergens: ['dairy'],
  },
};

export const severityByAllergen: Record<AllergenType | string, 'preference' | 'medium' | 'high'> = {
  peanut: 'high',
  'tree-nut': 'high',
  shellfish: 'high',
  gluten: 'high',
  dairy: 'medium',
  egg: 'medium',
  soy: 'medium',
  sesame: 'medium',
};
