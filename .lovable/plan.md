

## Problem

The new TABLE 15 order (ord-new-dine) has `APPETIZER` set with `isFired: true`, which makes it display as "Served/Done". For a brand-new order from POS, the first course (APPETIZER) should be the **active** course, and ENTREE and DESSERT should be **pending**.

## Fix

Update the mock data in `src/data/mock-orders.ts` for the `ord-new-dine` order:

1. **APPETIZER course** - Remove `isFired: true`, `firedAt`, and `firedAgoLabel`. This makes it the active (first unfired) course.
2. **ENTREE course** - Keep as pending (no `isFired`), keep `autoFireTargetSeconds: 600`.
3. **DESSERT course** - Keep as pending (no `isFired`), keep `autoFireTargetSeconds: 900`.

This way the ticket displays:
- APPETIZER = Active (full opacity, fire button visible)
- ENTREE = Pending ("Firing at X:XX PM", items at 40% opacity)
- DESSERT = Pending ("Firing at X:XX PM", items at 40% opacity)

Only the mock data file changes. No UI components affected.

