

## Goal
Fix the Language sub-screen layout so horizontal padding is consistent with the rest of Settings, and constrain the KDS preview ticket on the right so it doesn't balloon on wide landscape screens.

## Scope
Two files only:
- `src/components/kds/SettingsPanel.tsx` (sub-screen header padding)
- `src/components/kds/InlineLanguageSettings.tsx` (content padding + preview width)

No logic changes. No changes to other sub-screens, modals, sidebar, or bottom bar.

## Changes

### 1. Consistent horizontal padding for the Language sub-screen
In `SettingsPanel.tsx`, the sub-screen header currently uses `px-5` while the main Settings page uses `px-10`. Align the sub-screen so its left/right gutters match the main page.

- Sub-screen header row: `px-5 py-3` to `px-10 py-5`
- Divider under header: `mx-5` to `mx-10`
- Wrap the `<InlineLanguageSettings />` render in a `px-10 pb-7` container so the inner content respects the same gutter as the main settings grid (currently it has zero horizontal padding, which is why content sits too close to edges).

### 2. Cap the preview ticket width on the right column
In `InlineLanguageSettings.tsx`, the right "Preview - KDS ticket" column uses `flex-1` and renders a full-bleed `OrderCard`, so on a 1119px canvas it stretches to ~500px wide and looks oversized.

- Change the right column wrapper from `flex-1 flex flex-col min-w-0` to a fixed-width column: `w-[360px] shrink-0 flex flex-col` (matches the typical KDS card width specced in project knowledge: ~280-400px Grid view).
- Wrap the `<OrderCard />` in a `max-w-[340px] w-full mx-auto` container so the ticket renders at a realistic KDS size regardless of canvas width.
- Keep the left column as `flex-1 min-w-0` so it absorbs all the freed horizontal space (language list, scope chips, and display-mode cards become wider and easier to read).

### 3. Left/right column gap
The flex row uses `gap-4`. Increase to `gap-8` so the divider + preview don't crowd the language list now that the preview is narrower and the left column is wider.

## Out of scope
- All toggle/chip/button logic, language selection, save behaviour
- Region tab, Request-a-language modal styling
- Other sub-screens (Status Colours, Order Type Colors)
- Sidebar, bottom bar, main Settings grid (already correctly padded)

## Acceptance
- On the 1119px landscape preview, the Language sub-screen left/right gutters visually match the main Settings page (no more flush-to-edge content vs `px-10` mismatch).
- The "Preview - KDS ticket" card renders at ~340px wide (realistic KDS card size), not stretched across half the canvas.
- The left column (scope, display mode, language list) gains the freed width and reads more comfortably.
- Save button, language selection, swap, and all other interactions behave exactly as before.

