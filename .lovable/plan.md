## Goal
Add an Orders setting that controls whether the aggregated allergen strip is shown in the ticket card header, independently of the existing per-item allergen badges.

## Behavior
- New toggle: "Show allergen summary on ticket header"
  - ON (default): `OrderAllergenStrip` renders at the top of each ticket card (current behavior).
  - OFF: header strip is hidden; allergens still appear next to each product (controlled by the existing "Allergen badges" toggle).
- The existing "Allergen badges" toggle continues to control per-item allergen chips shown near each product.
- The two toggles are independent so the user can choose: header only, items only, both, or neither.

## Changes

1. `src/hooks/use-kds-settings.tsx`
   - Add `showHeaderAllergens: boolean` (default `true`) to `KDSSettings`, defaults, and context with `setShowHeaderAllergens`.
   - Persisted via existing `posai-kds-settings-v2` localStorage.

2. `src/pages/settings/OrdersSettings.tsx`
   - Add a new `SettingsPill` above "Allergen badges":
     - Label: "Ticket header allergen summary"
     - Helper: "Show a combined allergen strip at the top of each ticket card."
     - Right: `SwitchToggle` bound to `showHeaderAllergens`.
   - Update the existing "Allergen badges" helper to clarify it controls per-item display: "Show colored allergen chips next to each item on the ticket."

3. `src/components/kds/OrderCard.tsx`
   - Read `showHeaderAllergens` from `useKDSSettings`.
   - Gate the `<OrderAllergenStrip ... />` render on `showHeaderAllergens` in addition to the existing `showAllergens` prop (line ~910). The per-item display path (passing `showAllergens` down to `CourseSection` / `FlatItemList`) is untouched.

4. `src/lib/settings-search-index.ts` (if it indexes Orders settings)
   - Add an entry for the new toggle so it is searchable. Skip if file does not index Orders entries.

## Out of scope
- No changes to `AllergenBadge`, `OrderAllergenStrip`, `CourseSection`, `FlatItemList` rendering logic.
- No changes to compact card / expo / history surfaces unless they also render `OrderAllergenStrip`; if so, same gating applied for consistency.
