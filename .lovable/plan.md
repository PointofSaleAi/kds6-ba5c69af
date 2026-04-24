## Goal
Make the Settings right pane look like iPad Settings: no white card background, no centered max-width, content uses the full available width with consistent padding.

## Changes

### 1. `src/pages/SettingsLayout.tsx`
Remove the white rounded-card chrome and the `max-w-2xl mx-auto` constraint from `<main>`. Keep the same outer padding rhythm so content aligns with the sidebar.

```tsx
<main className="flex-1 overflow-y-auto scrollbar-hide">
  <div className="w-full px-4 py-6">
    <Outlet key={location.pathname} />
  </div>
</main>
```

### 2. `src/pages/settings/DisplaySettings.tsx` (Language overlay sub-screen)
The inline Language overlay currently wraps its content in another rounded white card. Flatten it so it matches the new iPad-style surface, and reduce its inner padding from `px-6` to `px-2` to match the parent.

The sidebar (left settings nav) keeps its white rounded card to maintain the two-pane hierarchy. `StatusSettings` and `OrderTypeColorsSettings` already render with a flat `flex-1 flex flex-col` wrapper, so they will inherit the new flat surface automatically.

## Verification
- Resize the preview wide: right pane content fills the full width, no empty gutters.
- Right pane has no white card background (matches page bg).
- Sidebar (settings group nav) still appears as a white rounded card.
- Sub-screens (Status, Order Type Colors, Language overlay) render flat on the page background.
- KDS left rail and bottom footer remain visible.
