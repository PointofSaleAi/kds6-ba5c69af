## Goal
Make the existing **Settings > Display > Ticket Layout** (`standard` / `compact`) setting affect the `/kds/v1` route. Standard mode behaves exactly as today. Compact mode renders an ultra-dense, read-only product list with no expand affordance.

## Behavior

**Standard (current, unchanged)**
- Quantity + name + modifiers + allergen badges per row.
- Tap row to mark done (spinner → green check).
- Dine-in shows course headers (APPS / MAINS / DESSERTS).

**Compact (new in V1)**
- Each product row shows **only** quantity + product name on a single line.
- No modifiers, no allergen badges, no extras shown on the row.
- No expand / chevron / tap-to-reveal affordance anywhere.
- Course header bands (APPS / MAINS) are **hidden**; all products flatten into one continuous list, including for Dine-in.
- Header (table row, order #, timer pill, fired time) and Bump footer remain identical to standard.
- Tap-to-complete still works (spinner → strikethrough + green check), since it does not require expansion.

## Implementation

File: `src/components/kds/variants/OrderCardV1.tsx`

1. Pull `ticketLayout` from `useKDSSettings()`.
2. Add `compact: boolean` prop to `V1ProductRow`. When `compact`:
   - Render a single flex line: `<qty>` + `<name>` only.
   - Skip the modifiers block and the allergens block entirely.
   - Keep the existing loading/done indicator on the right.
   - Keep `lineHeight: 1.2`, `fontSize: 13`, `fontWeight: 700` on the name (matches current).
3. In `OrderCardV1`:
   - When `ticketLayout === 'compact'`, render the flat `allItems` list for **all** order types (bypass the dine-in course-section branch).
   - When `'standard'`, keep today's branching (dine-in shows course headers, others flat).
4. No changes to header, footer, bump animation, timer pill, or color logic.

No other files change. No settings UI changes (the toggle already exists in Display Settings).

## Out of scope
- V2 / V3 variants.
- Any change to the meaning of `ticketLayout` on the default `OrderCard`.
- New settings, new props on the page level.
