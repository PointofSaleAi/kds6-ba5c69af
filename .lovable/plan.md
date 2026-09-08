# Settings: active nav selection + helper text legibility

## Issue 1 — Active settings option doesn't look selected (left rail)

Confirmed in `src/components/settings/SettingsSidebar.tsx`: the active group button
gets `background: hsl(var(--surface-bg))`. The sidebar card itself sits on
`--surface-card` (white in light theme, #232336-ish in dark), and `--surface-bg`
(95% light / 11% dark) is nearly identical in light mode — so the selected state
is visually invisible.

**Fix:** give the active nav row a clearly visible selected treatment:
- Background: `hsl(var(--text-primary) / 0.08)` (visible tint on both themes)
- Keep the rounded-full pill shape; optionally add a subtle left accent or
  bolder label color so selection is unmistakable on light and dark themes.

## Issue 2 — Helper text under pills hard to read (right side)

Confirmed in `src/components/settings/SettingsPill.tsx`: helper text uses
`hsl(var(--text-muted))` — 62% lightness in light theme, 50% in dark. Since the
right pane is now bare page background, muted grey on grey is low contrast.

**Fix:** switch helper text to `hsl(var(--text-secondary))` (45% light / 68%
dark), which is the token designed for readable secondary copy in both themes.

## Files to change

- `src/components/settings/SettingsSidebar.tsx` — active row background/label styling
- `src/components/settings/SettingsPill.tsx` — helper text color token

## Verification

- Settings > each group: the selected nav item is clearly highlighted in light
  and dark themes.
- Helper text under pills (e.g. Display, Orders) is comfortably readable in
  both themes, on desktop, tablet, and portrait widths.
- Confirm `/tmp/observability/build-errors.log` shows a clean build.
