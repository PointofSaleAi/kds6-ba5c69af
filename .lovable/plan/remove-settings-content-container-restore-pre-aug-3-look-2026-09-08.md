# Remove settings content container (restore pre-Aug-3 look)

## Goal
Remove the selected settings content container in `src/pages/MainOrderView.tsx` so the settings right section no longer sits inside a visible wrapped pane — matching how it looked in builds on or before August 3.

## Changes (src/pages/MainOrderView.tsx, settings branch ~lines 1257-1281)

1. **Strip container styling from the wrapper** (line 1258): remove the `surface-bg` background so the area behind the settings sidebar and content is transparent (inherits the app background, as in older builds). Keep `pr-2 py-2 gap-2` spacing intact.

2. **Simplify the `<main>` element** (line 1271): remove its own `surface-bg` background fill so it renders chromeless — just a transparent scroll area hosting the settings `<Outlet />`. Settings cards (white pills) keep their own backgrounds and remain visually unchanged.

3. **Glass mode unchanged**: when glass chrome is active, keep `ios-glass-card rounded-3xl` on `<main>` since Glass view styling is intentional.

4. Verify at `/kds/v1/settings/display` (and Glass view) in light and dark themes that no visible container/pane surrounds the settings content, spacing stays at 8px, and the build stays clean.
