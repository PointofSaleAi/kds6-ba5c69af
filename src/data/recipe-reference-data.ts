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

export const DEFAULT: RefRecipe = {
  yields: ['1 plate', '2 plates'],
  ingredients: [
    { name: 'Main Protein', qty: '1 portion', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop' },
    { name: 'House Sauce', qty: '2 tbsp', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=120&h=120&fit=crop' },
    { name: 'Seasonal Side', qty: '1 cup', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=120&h=120&fit=crop' },
    { name: 'Garnish Herbs', qty: 'to taste', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=120&h=120&fit=crop' },
  ],
  steps: [
    { title: 'Mise En Place', instruction: 'Gather **all ingredients** at the station before firing.', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=260&fit=crop' },
    { title: 'Preheat Station', instruction: 'Bring **grill or pan** to service temperature.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=260&fit=crop' },
    { title: 'Season Protein', instruction: 'Season generously with **salt and pepper** just before cooking.', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=260&fit=crop' },
    { title: 'Cook Protein', instruction: 'Sear on **grill** to recommended doneness.', image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=260&fit=crop' },
    { title: 'Prepare Side', instruction: 'Warm **side accompaniment** and season to taste.', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=260&fit=crop' },
    { title: 'Rest and Slice', instruction: 'Rest **one minute** before slicing on the bias.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=260&fit=crop' },
    { title: 'Plate and Finish', instruction: 'Drizzle **sauce**, add garnish, wipe rim.', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=260&fit=crop' },
  ],
  video: { url: 'https://fqfophupmpeopmfmgkkv.supabase.co/storage/v1/object/sign/recipe-videos/default.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yYmY1MzZjZi05OTU3LTQ0YzgtYjViZS05OGEwNDMwNWMxYTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZWNpcGUtdmlkZW9zL2RlZmF1bHQubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MzQzNDE2NywiZXhwIjoyMDk4Nzk0MTY3fQ.aa_wSAT_1Jeuy41Y1CaU0xb967UsWctw-VF2qUI2Wm0', duration: '1:30' },
};

export const RECIPES: Record<string, RefRecipe> = {
  burger: {
    yields: ['1 burger', '2 burgers', '4 burgers'],
    ingredients: [
      { name: 'Beef Patty', qty: '180g', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=120&h=120&fit=crop' },
      { name: 'Brioche Bun', qty: '1', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop', allergen: 'gluten' },
      { name: 'Aged Cheddar', qty: '2 slices', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=120&h=120&fit=crop', allergen: 'dairy' },
      { name: 'Beefsteak Tomato', qty: '2 slices', image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=120&h=120&fit=crop' },
      { name: 'Iceberg Lettuce', qty: '2 leaves', image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=120&h=120&fit=crop' },
      { name: 'House Sauce', qty: '1 tbsp', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=120&h=120&fit=crop', allergen: 'egg' },
    ],
    steps: [
      { title: 'Preheat Grill', instruction: 'Bring flat-top or grill to **high heat** (230C).', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=260&fit=crop' },
      { title: 'Form and Season', instruction: 'Loosely form **180g patty**, dimple center, season heavily right before cooking.', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=260&fit=crop' },
      { title: 'Prep Garnish', instruction: 'Wash **lettuce**, slice **tomato**, portion sauce on plate.', image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=400&h=260&fit=crop' },
      { title: 'Sear First Side', instruction: 'Press patty on grill, cook **3 min** for a hard crust, do not move.', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=260&fit=crop' },
      { title: 'Flip and Cheese', instruction: 'Flip once, add **2 slices cheddar**, cover to melt.', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=260&fit=crop' },
      { title: 'Toast Bun', instruction: 'Butter **brioche bun**, toast cut-side down until golden (about 60 sec).', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=260&fit=crop' },
      { title: 'Build Burger', instruction: 'Bottom bun, **sauce**, lettuce, tomato, patty, top bun.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=260&fit=crop' },
      { title: 'Pass to Expo', instruction: 'Skewer through crown, plate with **fries and pickle**, call to expo.', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=260&fit=crop' },
    ],
    video: { url: 'https://fqfophupmpeopmfmgkkv.supabase.co/storage/v1/object/sign/recipe-videos/burger.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yYmY1MzZjZi05OTU3LTQ0YzgtYjViZS05OGEwNDMwNWMxYTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZWNpcGUtdmlkZW9zL2J1cmdlci5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzNDM0MTY4LCJleHAiOjIwOTg3OTQxNjh9.1NASD7FJuS1C0cq52RZGB4WBz1Wb8d03WE2X8SiUWqw', duration: '1:24' },
  },
  steak: {
    yields: ['1 plate', '2 plates'],
    ingredients: [
      { name: 'Ribeye Steak', qty: '300g', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=120&h=120&fit=crop' },
      { name: 'Clarified Butter', qty: '2 tbsp', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=120&h=120&fit=crop', allergen: 'dairy' },
      { name: 'Fresh Thyme', qty: '2 sprigs', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=120&h=120&fit=crop' },
      { name: 'Garlic', qty: '2 cloves', image: 'https://images.unsplash.com/photo-1615477550927-6ec8445fefc4?w=120&h=120&fit=crop' },
    ],
    steps: [
      { title: 'Temper Steak', instruction: 'Pull **ribeye** from walk-in 20 min before firing to take chill off.', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=260&fit=crop' },
      { title: 'Dry and Season', instruction: 'Pat completely **dry**, season heavily with salt and cracked pepper both sides.', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=260&fit=crop' },
      { title: 'Heat Pan', instruction: 'Bring **cast iron** to smoking, add thin film of grapeseed oil.', image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=260&fit=crop' },
      { title: 'Sear First Side', instruction: 'Lay steak down away from you, sear **2 min undisturbed** for crust.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=260&fit=crop' },
      { title: 'Flip and Sear', instruction: 'Flip once, sear another **2 min** on second side.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=260&fit=crop' },
      { title: 'Butter Baste', instruction: 'Add **butter, thyme, garlic**; tilt pan and baste for 90 seconds.', image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=260&fit=crop' },
      { title: 'Check Temp', instruction: 'Probe center: **52C rare, 55C med-rare, 60C medium**. Pull 2C below target.', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=260&fit=crop' },
      { title: 'Rest and Slice', instruction: 'Rest **5 min** on rack, then slice against the grain and finishing salt.', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=260&fit=crop' },
    ],
    video: { url: 'https://fqfophupmpeopmfmgkkv.supabase.co/storage/v1/object/sign/recipe-videos/steak.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yYmY1MzZjZi05OTU3LTQ0YzgtYjViZS05OGEwNDMwNWMxYTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZWNpcGUtdmlkZW9zL3N0ZWFrLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODM0MzQxNjksImV4cCI6MjA5ODc5NDE2OX0.BmNvZb5AKAO89QOmnn5y7frX2VPYu85-8VFn-bkgFO8', duration: '2:10' },
  },
  salad: {
    yields: ['1 bowl', '2 bowls', 'family style'],
    ingredients: [
      { name: 'Mixed Greens', qty: '120g', image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=120&h=120&fit=crop' },
      { name: 'Cherry Tomatoes', qty: '50g', image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=120&h=120&fit=crop' },
      { name: 'Shaved Parmesan', qty: '30g', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=120&h=120&fit=crop', allergen: 'dairy' },
      { name: 'House Vinaigrette', qty: '2 tbsp', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=120&h=120&fit=crop' },
      { name: 'Toasted Croutons', qty: '20g', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop', allergen: 'gluten' },
    ],
    steps: [
      { title: 'Chill Bowl', instruction: 'Pull **serving bowl** from freezer, keep cold until plate-up.', image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=400&h=260&fit=crop' },
      { title: 'Wash Greens', instruction: 'Wash **mixed greens** in cold water, spin completely dry.', image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=400&h=260&fit=crop' },
      { title: 'Halve Tomatoes', instruction: 'Cut **cherry tomatoes** in half through the equator, season with pinch of salt.', image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=260&fit=crop' },
      { title: 'Toast Croutons', instruction: 'Warm **croutons** in oven 60 sec so they are crisp, not soggy.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=260&fit=crop' },
      { title: 'Dress Greens', instruction: 'Toss greens with **2 tbsp vinaigrette** in mixing bowl, coat every leaf lightly.', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=260&fit=crop' },
      { title: 'Add Garnish', instruction: 'Add **tomatoes and croutons**; toss twice with hands, do not bruise.', image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=260&fit=crop' },
      { title: 'Plate High', instruction: 'Pile into chilled bowl **tall and airy**, do not press down.', image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=400&h=260&fit=crop' },
      { title: 'Finish', instruction: 'Shave **parmesan** over the top table-side or at pass, crack pepper.', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=260&fit=crop' },
    ],
    video: { url: 'https://fqfophupmpeopmfmgkkv.supabase.co/storage/v1/object/sign/recipe-videos/salad.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yYmY1MzZjZi05OTU3LTQ0YzgtYjViZS05OGEwNDMwNWMxYTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZWNpcGUtdmlkZW9zL3NhbGFkLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODM0MzQxNzAsImV4cCI6MjA5ODc5NDE3MH0._dDUNI_kC7_0flFXv3R9rGKgWcEmOo_9yxj3_lKGhOg', duration: '1:05' },
  },
  pasta: {
    yields: ['1 plate', '2 plates', '4 plates'],
    ingredients: [
      { name: 'Dried Pasta', qty: '120g', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=120&h=120&fit=crop', allergen: 'gluten' },
      { name: 'Pasta Sauce', qty: '100g', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=120&h=120&fit=crop' },
      { name: 'Parmigiano', qty: '20g', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=120&h=120&fit=crop', allergen: 'dairy' },
      { name: 'Butter', qty: '1 tbsp', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=120&h=120&fit=crop', allergen: 'dairy' },
      { name: 'EVOO', qty: '1 tbsp', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=120&h=120&fit=crop' },
    ],
    steps: [
      { title: 'Boil Water', instruction: 'Bring **4L water** to rolling boil, salt heavily (like the sea).', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=260&fit=crop' },
      { title: 'Warm Sauce', instruction: 'Ladle **100g sauce** into wide saute pan over low heat.', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=260&fit=crop' },
      { title: 'Drop Pasta', instruction: 'Drop **120g pasta**, stir immediately so it does not stick.', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=260&fit=crop' },
      { title: 'Cook Al Dente', instruction: 'Cook to **al dente**, 1 min shy of package time.', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=260&fit=crop' },
      { title: 'Reserve Water', instruction: 'Save **1 cup pasta water** before draining, do not rinse pasta.', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=260&fit=crop' },
      { title: 'Marry in Pan', instruction: 'Transfer pasta to sauce pan with **2 oz pasta water**, toss over medium.', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=260&fit=crop' },
      { title: 'Mount Off Heat', instruction: 'Pull from heat, add **butter and parmigiano**, toss to emulsify glossy.', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=260&fit=crop' },
      { title: 'Plate and Finish', instruction: 'Twist into **nest** with tongs, top with more parmigiano, drizzle EVOO.', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=260&fit=crop' },
    ],
    video: { url: 'https://fqfophupmpeopmfmgkkv.supabase.co/storage/v1/object/sign/recipe-videos/pasta.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yYmY1MzZjZi05OTU3LTQ0YzgtYjViZS05OGEwNDMwNWMxYTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZWNpcGUtdmlkZW9zL3Bhc3RhLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODM0MzQxNzEsImV4cCI6MjA5ODc5NDE3MX0.6vXp4cInDySujsdnNptzpX5DROiJGji3UtTtwxigrGI', duration: '1:48' },
  },
  pizza: {
    yields: ['1 pizza', '2 pizzas'],
    ingredients: [
      { name: 'Pizza Dough Ball', qty: '220g', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&h=120&fit=crop', allergen: 'gluten' },
      { name: 'San Marzano Sauce', qty: '80g', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=120&h=120&fit=crop' },
      { name: 'Fresh Mozzarella', qty: '120g', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=120&h=120&fit=crop', allergen: 'dairy' },
      { name: 'Fresh Basil', qty: '6 leaves', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=120&h=120&fit=crop' },
      { name: 'EVOO Finishing Oil', qty: '1 tbsp', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=120&h=120&fit=crop' },
    ],
    steps: [
      { title: 'Preheat Deck', instruction: 'Bring deck oven to **500F / 260C**, stone fully saturated.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=260&fit=crop' },
      { title: 'Portion Mozzarella', instruction: 'Tear **fresh mozzarella** into rough pieces, drain on towel.', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=260&fit=crop' },
      { title: 'Stretch Dough', instruction: 'Push **220g dough ball** from center out to 12 inch round on floured peel.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=260&fit=crop' },
      { title: 'Sauce Base', instruction: 'Spoon **80g sauce**, spread in spiral leaving 1 inch border.', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=260&fit=crop' },
      { title: 'Add Cheese', instruction: 'Distribute **mozzarella** evenly, leave small gaps for sauce to show.', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=260&fit=crop' },
      { title: 'Launch and Bake', instruction: 'Slide onto stone, bake **6-8 min** until crust is charred and cheese bubbles.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=260&fit=crop' },
      { title: 'Finish out of Oven', instruction: 'Top with **fresh basil** and drizzle EVOO immediately.', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=260&fit=crop' },
      { title: 'Slice and Serve', instruction: 'Cut into **8 slices** on wooden board, serve within 60 seconds.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=260&fit=crop' },
    ],
    video: { url: 'https://fqfophupmpeopmfmgkkv.supabase.co/storage/v1/object/sign/recipe-videos/pizza.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yYmY1MzZjZi05OTU3LTQ0YzgtYjViZS05OGEwNDMwNWMxYTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZWNpcGUtdmlkZW9zL3BpenphLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODM0MzQxNzIsImV4cCI6MjA5ODc5NDE3Mn0.Qb0xfMU9l5CuYxhoE8kXSQ0T3IP7c4GrmpeJ1wKt8W0', duration: '1:35' },
  },
  fish: {
    yields: ['1 plate', '2 plates'],
    ingredients: [
      { name: 'White Fish Fillet', qty: '180g', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=120&h=120&fit=crop', allergen: 'fish' },
      { name: 'Grapeseed Oil', qty: '1 tbsp', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=120&h=120&fit=crop' },
      { name: 'Butter', qty: '1 tbsp', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=120&h=120&fit=crop', allergen: 'dairy' },
      { name: 'Lemon Wedge', qty: '1', image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=120&h=120&fit=crop' },
    ],
    steps: [
      { title: 'Check Quality', instruction: 'Confirm **fillet** smells fresh, no gaping flesh; reject if in doubt.', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=260&fit=crop' },
      { title: 'Score and Dry', instruction: 'Score **skin** shallowly, pat both sides completely dry with towel.', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=260&fit=crop' },
      { title: 'Season', instruction: 'Season with **salt and white pepper** both sides right before pan.', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=260&fit=crop' },
      { title: 'Heat Pan', instruction: 'Bring nonstick pan to **medium-high** with grapeseed oil until shimmering.', image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=260&fit=crop' },
      { title: 'Sear Skin-side', instruction: 'Lay fillet **skin down**, press with fish weight for 4 min until crisp.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=260&fit=crop' },
      { title: 'Flip and Baste', instruction: 'Flip, add **butter**, baste 60 sec until flesh is just opaque.', image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=260&fit=crop' },
      { title: 'Rest Briefly', instruction: 'Rest **60 seconds** on warm plate, do not stack.', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=260&fit=crop' },
      { title: 'Plate Skin-up', instruction: 'Plate **skin-side up** over puree, muslin-wrapped lemon to the side.', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=260&fit=crop' },
    ],
    video: { url: 'https://fqfophupmpeopmfmgkkv.supabase.co/storage/v1/object/sign/recipe-videos/fish.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yYmY1MzZjZi05OTU3LTQ0YzgtYjViZS05OGEwNDMwNWMxYTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZWNpcGUtdmlkZW9zL2Zpc2gubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MzQzNDE3MiwiZXhwIjoyMDk4Nzk0MTcyfQ.KDsA5UnnBw4EhDvScp2mOlDPiNlfoa8xcufMZZN8C_c', duration: '1:40' },
  },
  chicken: {
    yields: ['1 plate', '2 plates'],
    ingredients: [
      { name: 'Chicken Breast', qty: '220g', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=120&h=120&fit=crop' },
      { name: 'Neutral Oil', qty: '1 tbsp', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=120&h=120&fit=crop' },
      { name: 'Compound Butter', qty: '1 tbsp', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=120&h=120&fit=crop', allergen: 'dairy' },
      { name: 'Rosemary', qty: '2 sprigs', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=120&h=120&fit=crop' },
    ],
    steps: [
      { title: 'Brine (prep shift)', instruction: 'Brine **breast** in 5% salt solution for 2 hours; drain and dry.', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=260&fit=crop' },
      { title: 'Temper and Dry', instruction: 'Pull from walk-in 15 min out, pat **completely dry**.', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=260&fit=crop' },
      { title: 'Season', instruction: 'Season with **salt and pepper** both sides.', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=260&fit=crop' },
      { title: 'Sear First Side', instruction: 'Sear in hot pan **4 min skin/presentation side down** until deep golden.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=260&fit=crop' },
      { title: 'Flip and Butter', instruction: 'Flip, add **butter and rosemary**, baste 3 min.', image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&h=260&fit=crop' },
      { title: 'Finish in Oven', instruction: 'Transfer pan to **190C oven** until internal reads 74C, about 4 min.', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=260&fit=crop' },
      { title: 'Rest', instruction: 'Rest on rack **3 min** so juices redistribute.', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=260&fit=crop' },
      { title: 'Slice and Plate', instruction: 'Slice on the **bias**, fan over starch, spoon pan jus around plate.', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=260&fit=crop' },
    ],
    video: { url: 'https://fqfophupmpeopmfmgkkv.supabase.co/storage/v1/object/sign/recipe-videos/chicken.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yYmY1MzZjZi05OTU3LTQ0YzgtYjViZS05OGEwNDMwNWMxYTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZWNpcGUtdmlkZW9zL2NoaWNrZW4ubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MzQzNDE3MywiZXhwIjoyMDk4Nzk0MTczfQ.mSrO7P9maaFVRQmesEV3p6gm1dq9D1rmhroTNk68pgw', duration: '2:00' },
  },
};

export function getRecipeReference(name: string): RefRecipe {
  const n = (name || '').toLowerCase();
  for (const key of Object.keys(RECIPES)) if (n.includes(key)) return RECIPES[key];
  return DEFAULT;
}
