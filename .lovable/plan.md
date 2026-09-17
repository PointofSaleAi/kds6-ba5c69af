# Differentiate the Settings search bar from its background

## Problem
The search bar at the bottom of the Settings left rail (`SettingsSidebar.tsx`) uses `background: hsl(var(--text-primary) / 0.06)` with a 0.5px `0.04`-alpha outline. In light theme that is a ~6% dark tint on a pure-white `--surface-card`, so the field reads almost flush with the card behind it — it "blends in". The same happens in dark theme (a ~6% light tint on a dark card). The user wants the search field clearly differentiated from the background.

## Change
Edit only the search bar wrapper in `src/components/settings/SettingsSidebar.tsx` (the `<div>` at lines 196–202). Replace the near-invisible tint with the existing neutral surface tokens already used by the pill rows and the account button:

- Background: `hsl(var(--text-primary) / 0.06)` → `hsl(var(--muted))` (light: `210 14% 93%` grey; dark: `225 13% 19%` grey) — a real fill, not a 6% wash.
- Border/outline: `inset 0 0 0 0.5px hsl(var(--text-primary) / 0.04)` → `1px solid hsl(var(--border))` (light: `220 13% 87%`; dark: `226 10% 24%`), matching the pill rows' `1px solid hsl(var(--border))`.
- Keep `rounded-2xl`, `px-3`, `py-[0.55rem]`, and `backdrop-blur-xl` unchanged. Keep the Search/Mic icon colors and input text color unchanged.

This reuses tokens already on the page, so light/dark both get a clearly visible grey field with a real hairline border — no new tokens, no component-structural changes.

## Verify
- Build stays clean (`build OK` in `/tmp/observability/build-errors.log`).
- Light theme: search bar shows a distinct grey fill with a border against the white rail card.
- Dark theme: search bar shows a distinct lighter-grey fill with a border against the dark rail card.
- No change to the account button or nav items above it.
