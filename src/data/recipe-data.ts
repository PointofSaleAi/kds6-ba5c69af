// Dummy recipe data for V1 recipe popup. Frontend-only.
// In a future phase this will be replaced by a backend lookup.

export interface RecipeIngredient {
  qty: string;
  name: string;
}

export interface RecipeStep {
  text: string;
  /** Optional timer in minutes; renders a tappable timer chip below the step */
  timerMinutes?: number;
}

export interface Recipe {
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  plating: string;
}

const DEFAULT_RECIPE: Recipe = {
  ingredients: [
    { qty: '1 portion', name: 'Main Protein, Seasoned' },
    { qty: '2 tbsp', name: 'House Sauce' },
    { qty: '1 cup', name: 'Side Accompaniment' },
    { qty: 'to taste', name: 'Salt and Cracked Pepper' },
  ],
  steps: [
    { text: 'Mise en place all ingredients before firing the order.' },
    { text: 'Cook protein on the appropriate station to recommended doneness.', timerMinutes: 6 },
    { text: 'Rest protein for one minute before slicing or plating.' },
    { text: 'Plate with side and finish with sauce and garnish.' },
  ],
  plating: 'Center protein on warm plate, side at 2 o\'clock, drizzle sauce around the base. Wipe rim before pass.',
};

const RECIPES: Record<string, Recipe> = {
  burger: {
    ingredients: [
      { qty: '180g', name: 'Ground Beef Patty' },
      { qty: '1', name: 'Brioche Bun, Toasted' },
      { qty: '2 slices', name: 'Aged Cheddar' },
      { qty: '2 slices', name: 'Tomato, Beefsteak' },
      { qty: '2 leaves', name: 'Iceberg Lettuce' },
      { qty: '1 tbsp', name: 'House Burger Sauce' },
    ],
    steps: [
      { text: 'Season patty with salt and pepper just before grilling.' },
      { text: 'Grill patty 3 min per side for medium.', timerMinutes: 3 },
      { text: 'Add cheese in last 30 seconds and cover to melt.' },
      { text: 'Toast bun cut-side down until golden.', timerMinutes: 1 },
      { text: 'Build: sauce, lettuce, tomato, patty, top bun.' },
    ],
    plating: 'Cut burger in half, stack halves face-up. Fries to the right, pickle spear on top.',
  },
  steak: {
    ingredients: [
      { qty: '300g', name: 'Ribeye Steak' },
      { qty: '2 tbsp', name: 'Clarified Butter' },
      { qty: '2 sprigs', name: 'Fresh Thyme' },
      { qty: '2 cloves', name: 'Garlic, Smashed' },
      { qty: 'to taste', name: 'Maldon Salt and Cracked Pepper' },
    ],
    steps: [
      { text: 'Pat steak dry and season generously.' },
      { text: 'Sear cast iron pan 2 min per side over high heat.', timerMinutes: 2 },
      { text: 'Add butter, thyme, garlic; baste for 90 seconds.' },
      { text: 'Rest steak 5 minutes before slicing against the grain.', timerMinutes: 5 },
    ],
    plating: 'Slice steak on the bias, fan across plate. Finishing salt on top, herb oil drizzle.',
  },
  salad: {
    ingredients: [
      { qty: '120g', name: 'Mixed Greens' },
      { qty: '50g', name: 'Cherry Tomatoes, Halved' },
      { qty: '30g', name: 'Shaved Parmesan' },
      { qty: '2 tbsp', name: 'House Vinaigrette' },
      { qty: '20g', name: 'Toasted Croutons' },
    ],
    steps: [
      { text: 'Wash and spin-dry greens just before service.' },
      { text: 'Toss greens with vinaigrette in chilled bowl.' },
      { text: 'Add tomatoes and croutons; toss lightly.' },
      { text: 'Finish with shaved parmesan on top.' },
    ],
    plating: 'Pile high in center of chilled bowl. Croutons visible on top, no dressing pooled at base.',
  },
  pizza: {
    ingredients: [
      { qty: '220g', name: 'Pizza Dough Ball' },
      { qty: '80g', name: 'San Marzano Tomato Sauce' },
      { qty: '120g', name: 'Fresh Mozzarella, Torn' },
      { qty: '6 leaves', name: 'Fresh Basil' },
      { qty: '1 tbsp', name: 'EVOO Finishing Oil' },
    ],
    steps: [
      { text: 'Stretch dough to 12 inches on floured peel.' },
      { text: 'Spread sauce leaving 1 inch border; add mozzarella.' },
      { text: 'Bake in deck oven at 500F until charred.', timerMinutes: 7 },
      { text: 'Finish with basil and EVOO out of oven.' },
    ],
    plating: 'Slice into 8 even pieces. Serve on round wooden board, basil leaves whole on top.',
  },
  pasta: {
    ingredients: [
      { qty: '120g', name: 'Dried Pasta' },
      { qty: '100g', name: 'Pasta Sauce of the Day' },
      { qty: '20g', name: 'Grated Parmigiano' },
      { qty: '1 tbsp', name: 'EVOO' },
      { qty: 'pinch', name: 'Chili flakes (optional)' },
    ],
    steps: [
      { text: 'Drop pasta in salted boiling water.' },
      { text: 'Cook to al dente per package timing.', timerMinutes: 9 },
      { text: 'Finish pasta in sauce pan with 2 oz pasta water.', timerMinutes: 2 },
      { text: 'Mount with butter and parmigiano off heat.' },
    ],
    plating: 'Twist into nest using tongs and ladle. Extra parmigiano and parsley at the pass.',
  },
  fish: {
    ingredients: [
      { qty: '180g', name: 'White Fish Fillet, Skin on' },
      { qty: '1 tbsp', name: 'Grapeseed Oil' },
      { qty: '1 tbsp', name: 'Butter' },
      { qty: '1', name: 'Lemon Wedge' },
      { qty: 'to taste', name: 'Salt and White Pepper' },
    ],
    steps: [
      { text: 'Score skin and pat completely dry.' },
      { text: 'Sear skin-side down with weight 4 min.', timerMinutes: 4 },
      { text: 'Flip, add butter, baste 60 seconds.' },
      { text: 'Rest briefly off heat before plating.' },
    ],
    plating: 'Skin-side up over puree, lemon wedge wrapped in muslin to the side.',
  },
  chicken: {
    ingredients: [
      { qty: '220g', name: 'Chicken Breast, Brined' },
      { qty: '1 tbsp', name: 'Neutral Oil' },
      { qty: '1 tbsp', name: 'Compound Butter' },
      { qty: '2 sprigs', name: 'Rosemary' },
      { qty: 'to taste', name: 'Salt and Pepper' },
    ],
    steps: [
      { text: 'Pat chicken dry, season both sides.' },
      { text: 'Sear in hot pan 4 min until golden.', timerMinutes: 4 },
      { text: 'Flip, add butter and rosemary; baste.', timerMinutes: 3 },
      { text: 'Finish in oven if needed until 74C internal.' },
    ],
    plating: 'Slice on the bias, fan over starch. Pan jus around the plate.',
  },
};

export function getRecipeForProduct(name: string): Recipe {
  const n = (name || '').toLowerCase();
  for (const key of Object.keys(RECIPES)) {
    if (n.includes(key)) return RECIPES[key];
  }
  return DEFAULT_RECIPE;
}
