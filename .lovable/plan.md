

## Plan: Add station assignments to all mock order items

### Problem
Only 16 out of 72 items in `src/data/mock-orders.ts` have a `station` property. Items without a station show no station chip in the Expo view.

### Solution
Add a `station` value to every item in `src/data/mock-orders.ts` that currently lacks one, using logical category-to-station mappings:

| Category | Station |
|----------|---------|
| Seafood, Meat, Poultry, Pizza, Sandwiches | Grill |
| Appetizers, Sides (fried items) | Fry |
| Salads, Vegetarian, Soups | Salad |
| Desserts | Dessert |
| Beverages | Bar |

### File changed
**`src/data/mock-orders.ts`** - Add `station` field to all ~56 items currently missing it.

No other files, components, or screens are affected.

