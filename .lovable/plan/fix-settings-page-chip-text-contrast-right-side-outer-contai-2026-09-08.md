# Fix Settings page: chip text contrast + right-side outer container

## Issue 1 — Today/Total chip text unreadable (Account > Performance Summary)

In `ProfileSection.tsx`, the active chip of the Today/Total toggle uses
`background: hsl(var(--brand-primary))` (near-black) with
`color: hsl(var(--primary-foreground))`. Inside the settings surface,
`--primary-foreground` resolves to a dark value, so the active chip shows
dark text on a near-black background.

**Fix:** switch the active chip text color to `hsl(var(--brand-primary-foreground))`
(always white, paired with `--brand-primary`), so the active chip reads white-on-black
in both light and dark themes. Inactive chips keep their current styling.

## Issue 2 — Restore one outer container on the settings right-side section

Currently the settings right pane renders rows directly on the page background
(standalone sections, per an earlier change). The attached screenshot shows the
desired look: the whole right-side settings content sits inside a single
continuous light outer container, with the white pill cards and their helper
text inside it.

**Fix:** in `SettingsLayout.tsx`, restore a single outer container background
around the routed settings content (the `<main>` outlet area) — one continuous
`surface-card` panel with the existing rounded corners and 8px outer spacing
already used around the left nav and settings rail. White pill cards and helper
text remain unchanged inside it. Applies to all settings sub-pages (Account,
Display, Tickets, Hardware, etc.) since they all render through this layout.

## Files to change

- `src/components/settings/ProfileSection.tsx` — chip text color token
- `src/pages/SettingsLayout.tsx` — outer container background on the content pane

## Verification

- Open Settings > Account: Today/Total toggle shows white text on the selected chip.
- Check the settings right section in light and dark themes: one continuous outer
  panel wraps the content, pills render as white cards inside it, matching the
  screenshot.
- Confirm `/tmp/observability/build-errors.log` shows a clean build.
