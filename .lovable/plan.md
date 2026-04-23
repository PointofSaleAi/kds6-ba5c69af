

## Goal

Restructure the Settings screen to match the reference layout: two visually separated rounded compartments (left nav card and right content card) floating on the page background, with a "Settings" title above the left card and a search pill at the bottom of the left card. Light theme only, no other behavior changes.

## Current vs Target

**Current**: Left nav and right content are flush panes filling the viewport edge-to-edge.

**Target**: Both panes become rounded card compartments with padding around them, separated by a gap, sitting on the surface background. The KDS rail on the far left and bottom status bar stay unchanged.

```text
+--------+---------------------------------------------+
| KDS    |  (page padding)                              |
| rail   |  Settings                                    |
|        |  +------------+   +-----------------------+ |
|        |  |            |   |  [header card]        | |
|        |  | Account    |   |                       | |
|        |  | Display *  |   |  [pill row]           | |
|        |  | Orders     |   |  [pill row]           | |
|        |  | Expo View  |   |                       | |
|        |  | Hardware   |   |                       | |
|        |  |            |   |                       | |
|        |  | [Search]   |   |                       | |
|        |  +------------+   +-----------------------+ |
+--------+---------------------------------------------+
|                Bottom status bar                      |
+-------------------------------------------------------+
```

## Changes

### `src/pages/MainOrderView.tsx` (settings branch only)

Wrap the existing settings region in a padded container that places two rounded cards side by side instead of edge-to-edge panes.

- Outer wrapper: `flex-1 overflow-hidden p-4 gap-4` on a light background (`hsl(var(--surface-bg))`).
- Left card: fixed width `w-[280px]`, `rounded-3xl bg-surface-card shadow-sm`, contains the new `<SettingsSidebar />` plus a "Settings" heading at the top inside the card padding.
- Right card: `flex-1 rounded-3xl bg-surface-card shadow-sm overflow-y-auto`, contains the `<Outlet />` rendered with the existing `max-w-2xl mx-auto px-6 py-6`.

### `src/components/settings/SettingsSidebar.tsx`

- Remove the outer panel chrome (border, full-height background) since the parent card now provides it.
- Move the search input from the top to the bottom of the card (sticky at bottom of the left card), styled as a rounded pill matching the reference.
- Add a "Settings" title at the top of the card content (large, bold, left-aligned).
- Keep all existing nav items, active state, search behavior, and route handling exactly as-is.
- No chevrons (already removed). No back button (already removed).

### `src/pages/SettingsLayout.tsx`

Mirror the same two-card structure for the standalone `/kds/full/settings` route so behavior is identical whether reached through `MainOrderView` or directly.

## Out of Scope

- No changes to section content, controls, search index, routes, or hooks.
- No changes to KDSSidebar, BottomStatusBar, or any KDS surfaces.
- No new icons, no asset copying from the reference project.
- Theme stays light for settings only; rest of app unaffected.

