## Goal
Keep `/kds/old` as a single route that only renders the old ticket layout. Remove the duplicated settings and performance sub-routes so `/kds/old/settings/*` no longer exists.

## Changes

### 1. `src/App.tsx`
- Delete the entire `<Route path="/kds/old/settings" ...>` block and all its nested children (display, orders, expo, hardware, system, system/ai-integration, system/ai-integration/ai-instructions, account).
- Keep only the single `<Route path="/kds/old" element={<Index legacyActions />} />`.

### 2. `src/pages/Index.tsx`
- Remove the `basePath` branching. Hardcode settings/home navigation targets back to `/kds/full` so that when a user on `/kds/old` taps the Settings icon in the left rail, it navigates to `/kds/full/settings/display` (the single canonical settings location).
- Same for the Tickets/Home nav target: always route to `/kds/full`.
- This means the left rail on `/kds/old` will take the user out of the legacy view when they open Settings, which is the correct behavior since settings are global, not per-variant.

### Result
- `/kds/old` → old ticket layout (legacy action icons) only.
- `/kds/old/settings/*`, `/kds/old/performance` → no longer resolve; fall through to `NotFound`.
- All settings/performance flows continue to work from `/kds/full/settings/*` as the single source of truth.

## Not changed
- `/kds/v1` through `/kds/v5` and `/kds/home-onlineordering` — these already don't have duplicated settings sub-routes, so they're unaffected.
- The `legacyActions` prop threading through `Index` → `MainOrderView` — still needed for `/kds/old` itself.
