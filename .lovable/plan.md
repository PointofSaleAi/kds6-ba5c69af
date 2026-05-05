## Problem

The "Filter by category" popup in `src/pages/CategoryFilterPanel.tsx` shows a hardcoded list (BAR COCKTAIL, APPETIZER, SALAD, ENTREE, DESSERT, BAKERY, SIDES, BEVERAGES, KIDS MENU, SPECIALS) that does not match the categories rendered in the Cooking Summary panel (`src/components/kds/ItemSummaryPanel.tsx`), which are derived from each item's `ProductCategory` (Seafood, Meat, Poultry, Pasta, Salads, Sides, Desserts, Soups, Pizza, Sandwiches, Appetizers, Vegetarian, Beverages, plus "Uncategorized"). This is also the root cause of filter-match issues that previously needed `norm()` and `categoryToCenters` workarounds.

## Fix

Make the popup's category list dynamic, sourced from the same data the Summary panel uses, so what the user sees in the popup is exactly what's on screen in Summary.

1. **CategoryFilterPanel** (`src/pages/CategoryFilterPanel.tsx`)
   - Remove the hardcoded `allCategories` array.
   - Add a new prop `availableCategories: string[]` (already deduped, in the same order the Summary panel renders).
   - Render `['ALL CATEGORIES', ...availableCategories]`. Skip `Uncategorized`.
   - If `availableCategories` is empty, show a small empty state ("No active categories").
   - Keep current selection/toggle, live-apply, and Clear All behavior intact.

2. **Index.tsx** (`src/pages/Index.tsx`)
   - Compute `availableCategories` from the active `orders` using the same logic as `ItemSummaryPanel.collectActiveItems` + `buildSummary` ordering (skip cancelled/completed items, dedupe by category, preserve sort order).
   - To avoid duplication, export a small helper from `ItemSummaryPanel.tsx` (or a new `src/lib/summary-categories.ts`) that returns the ordered category list given `orders` and `stationCourse`.
   - Pass `availableCategories` into `<CategoryFilterPanel ... />`.

3. **MainOrderView.tsx**
   - Since popup values now come from the actual `item.category` strings, simplify the matching block: compare directly against `i.category`. Keep `norm()` as a safety net but drop the `categoryToCenters` fallback for category matching (revenue-center fallback stays).

4. No UI/style changes to the popup chrome. Same chip styling, same Clear All, same live-apply (no Apply button), same close behavior.

## Out of scope

- Revenue Center popup (separate ticket).
- Course-based filtering. Categories come from item.category (Summary), not `CourseType`.
