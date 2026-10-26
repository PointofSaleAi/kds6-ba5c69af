# Fix "to cook" text color on collapsed Summary panel

The collapsed Summary strip shows "68 to cook" in hardcoded white, so it vanishes when the panel background is light (light theme / glass chrome).

## Change
- `src/components/kds/ItemSummaryPanel.tsx` (collapsed state): replace `text-white` with `text-sidebar-foreground` so the label matches the expand arrow and follows the panel theme in light and dark.
- Apply the same token to the collapsed Expo summary counter (`ExpoSummaryPanel.tsx`, currently `text-sidebar-foreground/70`) by using full `text-sidebar-foreground` and 14px bold for kitchen-distance readability.

Applies on desktop, tablet and mobile (same component). Verify in light and dark with a screenshot of the collapsed panel.
