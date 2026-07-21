## Problem

Tickets on the History, Seen, and Unseen screens don't match the tickets on the main Tickets screen even though they render the same variant components. Two concrete drifts in `src/pages/MainOrderView.tsx`:

1. **Compact row density is missing on sub-screens.** The main Tickets grid calls `renderOrderCard(displayOrder, { compactRows: true })` (line 1514). History (lines 1407, 1416, 1427) and both `SeenOrdersScreen` / `UnseenOrdersScreen` (which call `renderCard(order)` internally) render without `compactRows`, so rows look taller/looser than on the main screen.
2. **Station-mode order transform is skipped.** The main grid maps each order through `getStationDisplayOrder(order)` before rendering. History / Seen / Unseen render the raw order, so in Prep/Station mode the tickets show a different item set than the main screen.

Grid column classes are already identical across the four screens, so no change there.

## Changes

**`src/pages/MainOrderView.tsx`**
- History grid, horizontal, and stagger blocks (≈lines 1405–1428): render via `renderOrderCard(getStationDisplayOrder(order), { compactRows: viewMode === 'grid' })` to match the main screen.
- Change the `renderCard` prop passed to `SeenOrdersScreen` and `UnseenOrdersScreen` (lines 1442, 1450) to a wrapper: `(order) => renderOrderCard(getStationDisplayOrder(order), { compactRows: viewMode === 'grid' })`.

No changes needed inside `SeenOrdersScreen.tsx` / `UnseenOrdersScreen.tsx` — they already delegate to `renderCard` when provided.

## Out of scope

- Grid/column breakpoints (already matched).
- Expo view path (uses `ExpoView`, intentionally different).
- Any variant-component visuals.
