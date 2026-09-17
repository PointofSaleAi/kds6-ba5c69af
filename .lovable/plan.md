# Make Glass View the default ticket UI

## Goal
Every fresh session — in the editor preview and on the published site — opens the tickets screen in **Glass View** (/kds/glass), and Glass is the default selection anywhere a layout is chosen. Users who already picked another layout keep their saved choice.

## Changes

1. **Root entry redirect** — `src/App.tsx`: change `/` redirect from `/kds/v3` to `/kds/glass`.

2. **Default stored layout** — `src/lib/ticket-card-variant.ts`: `readStoredTicketsRoute` default fallback `v3` → `glass`. When no layout has ever been saved, the app resolves to Glass View everywhere.

3. **Call-site fallbacks** — update every `readStoredTicketsRoute('v3')` to `readStoredTicketsRoute('glass')` so unsaved sessions default to Glass:
   - `src/pages/Index.tsx` (Home navigation, closing Settings)
   - `src/pages/KdsGlassPage.tsx` (back navigation)
   - `src/pages/SettingsLayout.tsx` (back target, glass chrome check)
   - `src/pages/settings/DisplaySettings.tsx` (Ticket Layout dropdown default shows Glass View)
   - `src/pages/MainOrderView.tsx` (fallback route + settings glass chrome)
   - `src/components/kds/SelectedVariantPreview.tsx` (settings ticket previews)

4. **Clock-in entry** — `src/components/kds/ClockInOutOverlay.tsx`: after PIN clock-in, navigate to `/kds/glass` instead of `/kds/v3`.

## Behavior notes
- A user who previously saved a different layout (e.g. Hero number) still sees their choice — only unsaved/fresh sessions default to Glass.
- The Ticket Layout dropdown in Display settings still offers all layouts; Glass View is simply pre-selected by default.
- All existing routes (/kds/v3, /kds/v7, etc.) remain reachable.

## Technical details
- Single storage key `kds-tickets-route`; no migration — absent key now resolves to `glass`.
- Verify with `bunx tsgo --noEmit -p tsconfig.app.json`.
- Playwright check at desktop/tablet/mobile in light and dark: fresh session (cleared storage) lands on Glass; saved-layout session unchanged; Settings back button returns to Glass.
