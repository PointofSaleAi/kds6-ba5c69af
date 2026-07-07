// Mock recipe reference data for the RecipeReferenceModal.
// Front-end only. Real content will be authored elsewhere (Dashboard TBD).

export interface RefIngredient {
  name: string;
  qty: string;
  image?: string;
  allergen?: string;
}

export interface RefStep {
  title: string;
  instruction: string; // key ingredient/action wrapped in **bold**
  image?: string;
}

export interface RefRecipe {
  yields: string[]; // e.g. ['1 plate', '2 plates', 'batch of 4']
  ingredients: RefIngredient[];
  steps: RefStep[];
  video?: { url: string; duration: string };
}

const DEFAULT: RefRecipe = {
  yields: ['1 plate', '2 plates'],
  ingredients: [
    { name: 'Main protein', qty: '1 portion', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop' },
    { name: 'House sauce', qty: '2 tbsp', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=120&h=120&fit=crop' },
    { name: 'Seasonal side', qty: '1 cup', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=120&h=120&fit=crop' },
    { name: 'Garnish herbs', qty: 'to taste', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=120&h=120&fit=crop' },
  ],
  steps: [
    { title: 'Mise en place', instruction: 'Gather **all ingredients** at the station before firing.', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=260&fit=crop' },
    { title: 'Cook protein', instruction: 'Sear on **grill** to recommended doneness.', image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=260&fit=crop' },
    { title: 'Rest and slice', instruction: 'Rest **one minute** before slicing on the bias.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=260&fit=crop' },
    { title: 'Plate and finish', instruction: 'Drizzle **sauce**, add garnish, wipe rim.', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=260&fit=crop' },
  ],
  video: { url: '', duration: '1:30' },
};

const RECIPES: Record<string, RefRecipe> = {
  burger: {
    yields: ['1 burger', '2 burgers', '4 burgers'],
    ingredients: [
      { name: 'Beef patty', qty: '180g', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=120&h=120&fit=crop' },
      { name: 'Brioche bun', qty: '1', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop', allergen: 'gluten' },
      { name: 'Aged cheddar', qty: '2 slices', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=120&h=120&fit=crop', allergen: 'dairy' },
      { name: 'Beefsteak tomato', qty: '2 slices', image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=120&h=120&fit=crop' },
      { name: 'Iceberg lettuce', qty: '2 leaves', image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=120&h=120&fit=crop' },
      { name: 'House sauce', qty: '1 tbsp', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=120&h=120&fit=crop', allergen: 'egg' },
    ],
    steps: [
      { title: 'Season patty', instruction: 'Season with **salt and pepper** just before grilling.', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=260&fit=crop' },
      { title: 'Grill to medium', instruction: 'Grill **3 min per side** for medium.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=260&fit=crop' },
      { title: 'Melt cheese', instruction: 'Add **cheddar** in the last 30 seconds, cover to melt.', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=260&fit=crop' },
      { title: 'Build burger', instruction: 'Sauce, lettuce, tomato, **patty**, top bun.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=260&fit=crop' },
    ],
    video: { url: '', duration: '1:24' },
  },
  steak: {
    yields: ['1 plate', '2 plates'],
    ingredients: [
      { name: 'Ribeye steak', qty: '300g', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=120&h=120&fit=crop' },
      { name: 'Clarified butter', qty: '2 tbsp', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=120&h=120&fit=crop', allergen: 'dairy' },
      { name: 'Fresh thyme', qty: '2 sprigs', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=120&h=120&fit=crop' },
      { name: 'Garlic', qty: '2 cloves', image: 'https://images.unsplash.com/photo-1615477550927-6ec8445fefc4?w=120&h=120&fit=crop' },
    ],
    steps: [
      { title: 'Dry and season', instruction: 'Pat **dry**, season generously.', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=260&fit=crop' },
      { title: 'Sear high heat', instruction: 'Cast iron **2 min per side** over high heat.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=260&fit=crop' },
      { title: 'Baste', instruction: 'Add **butter, thyme, garlic**; baste 90 seconds.', image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=260&fit=crop' },
      { title: 'Rest and slice', instruction: 'Rest **5 min** before slicing against the grain.', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=260&fit=crop' },
    ],
    video: { url: '', duration: '2:10' },
  },
  salad: {
    yields: ['1 bowl', '2 bowls', 'family style'],
    ingredients: [
      { name: 'Mixed greens', qty: '120g', image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=120&h=120&fit=crop' },
      { name: 'Cherry tomatoes', qty: '50g', image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=120&h=120&fit=crop' },
      { name: 'Shaved parmesan', qty: '30g', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=120&h=120&fit=crop', allergen: 'dairy' },
      { name: 'House vinaigrette', qty: '2 tbsp', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=120&h=120&fit=crop' },
      { name: 'Toasted croutons', qty: '20g', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop', allergen: 'gluten' },
    ],
    steps: [
      { title: 'Wash greens', instruction: 'Wash and **spin-dry** just before service.', image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=400&h=260&fit=crop' },
      { title: 'Dress lightly', instruction: 'Toss with **vinaigrette** in chilled bowl.', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=260&fit=crop' },
      { title: 'Add garnish', instruction: 'Add **tomatoes and croutons**; toss lightly.', image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=260&fit=crop' },
      { title: 'Finish', instruction: 'Top with **shaved parmesan**.', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=260&fit=crop' },
    ],
  },
  pasta: {
    yields: ['1 plate', '2 plates', '4 plates'],
    ingredients: [
      { name: 'Dried pasta', qty: '120g', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=120&h=120&fit=crop', allergen: 'gluten' },
      { name: 'Pasta sauce', qty: '100g', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=120&h=120&fit=crop' },
      { name: 'Parmigiano', qty: '20g', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=120&h=120&fit=crop', allergen: 'dairy' },
    ],
    steps: [
      { title: 'Boil pasta', instruction: 'Drop in **salted boiling water**.', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=260&fit=crop' },
      { title: 'Al dente', instruction: 'Cook to **al dente** per package.', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=260&fit=crop' },
      { title: 'Finish in sauce', instruction: 'Toss in pan with **2 oz pasta water**.', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=260&fit=crop' },
      { title: 'Mount', instruction: 'Mount with **butter and parmigiano** off heat.', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=260&fit=crop' },
    ],
    video: { url: '', duration: '1:48' },
  },
};

export function getRecipeReference(name: string): RefRecipe {
  const n = (name || '').toLowerCase();
  for (const key of Object.keys(RECIPES)) if (n.includes(key)) return RECIPES[key];
  return DEFAULT;
}
