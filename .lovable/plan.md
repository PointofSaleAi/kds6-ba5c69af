## Problem

In portrait orientation, the footer shows three view-mode toggles (Grid, Horizontal, Stagger), but tapping Horizontal or Stagger has no visible effect. The portrait branch in `MainOrderView.tsx` (lines 833-845) hardcodes a 2-column CSS grid and ignores `viewMode` entirely. The screenshot shows the user selecting Stagger with no layout change.

## Fix

In `src/pages/MainOrderView.tsx`, replace the portrait-only branch so it routes to the same Stagger and Horizontal renderers used in landscape, with portrait-tuned column counts. Default (Grid) keeps the current 2-column layout.

### Behavior per mode in portrait

- **Grid** (default): 2-column grid (unchanged).
- **Stagger**: 2 stacked columns using `staggerOrderColumns`, distributed via the existing `distributeIntoColumns` helper. Portrait forces column count to 2 regardless of `cardsPerRow` setting so cards stay legible.
- **Horizontal**: horizontal-scrolling row of cards with a fixed card width tuned for narrow viewports (about 240px wide), reusing the landscape horizontal renderer's structure.

Same change applied to the History panel (lines 758-792) so Stagger/Horizontal also work for History in portrait.

### Implementation notes

1. Compute `portraitStaggerColumns = useMemo(() => distributeIntoColumns(filteredOrders, 2), [filteredOrders])` and the same for history.
2. Restructure the portrait branch (line 833) into a `switch (viewMode)` with three cases, mirroring the landscape JSX (lines 846-895) but with:
   - Grid case: existing `grid-cols-2` block.
   - Stagger case: same flex/column JSX as landscape, using `portraitStaggerColumns`.
   - Horizontal case: same overflow-x-auto flex row as landscape, with `min-w-[240px]` per card wrapper.
3. Keep AnimatePresence + motion wrappers and `getStationDisplayOrder` exactly as in the landscape branches so animations and station filtering stay consistent.
4. No changes to `BottomStatusBar` (toggles already render correctly in portrait) or `use-portrait` hook.
5. Update memory `mem://ui/portrait-orientation-layout` to note that all three view modes are now supported in portrait, with Stagger locked to 2 columns.

### Files touched

- `src/pages/MainOrderView.tsx` (portrait branch for orders + history)
- `mem://ui/portrait-orientation-layout` (memory update)

### Out of scope

- No changes to landscape behavior.
- No changes to Expo or Prep board renderers (they already handle their own layouts).
- `cardsPerRow` setting is intentionally ignored in portrait Stagger to prevent overcrowding on narrow screens.
