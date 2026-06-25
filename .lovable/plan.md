## Goal

One consistent date/time format across the entire KDS frontend:

- **Time:** 12-hour with AM/PM, no seconds → `1:15 PM`
- **Date:** Day-first long form → `25 June 2026`
- **Date + time combined:** `25 June 2026, 1:15 PM`

## Approach

### 1. Add a single formatting module

Create `src/lib/datetime.ts` exporting:

- `formatTime(date)` → `"1:15 PM"` (uses `en-GB` locale with `hour12: true`, no leading zero, no seconds)
- `formatDate(date)` → `"25 June 2026"`
- `formatDateTime(date)` → `"25 June 2026, 1:15 PM"`
- `formatTimeAgo(date)` → existing relative helper kept consistent (`Just now`, `5m ago`, `2h ago`)

All helpers accept `Date | string | number` and guard against invalid values.

### 2. Replace ad-hoc formatting everywhere

Sweep the codebase and replace inline `toLocaleTimeString` / `toLocaleDateString` / hand-rolled `HH:MM` strings with the helpers. Known hotspots:

- Ticket headers and fire times: `OrderCardV1/V2/V3.tsx`, `variant-utils.ts` (`courseFireTime`), `OrderCard.tsx`, `CompactOrderCard.tsx`, `CourseSection.tsx`, `ExpandedOrderCard.tsx`, `HistoryOrderCard.tsx`, `CustomerContactStrip.tsx`
- Kitchen messages and replies: `KitchenMessageSection.tsx`, `KitchenReplyDialog.tsx`, `NotificationToastStack.tsx`, `AlertsPanel.tsx`
- History and seen/unseen screens: `OrderHistoryScreen.tsx`, `SeenOrdersScreen.tsx`, `UnseenOrdersScreen.tsx`
- Status bar and summary: `BottomStatusBar.tsx`, `SummaryDrawer.tsx`, `ItemSummaryPanel.tsx`
- Settings previews using sample dates: `LanguageSettings.tsx` (sample strings updated to match), `StatusSettings.tsx`

### 3. Language & Region settings page

`LanguageSettings.tsx` currently exposes date/time format toggles that conflict with the new standard. Two options I will take:

- Keep the toggles visible but mark the chosen defaults (12h, `25 June 2026`) as the active selection.
- The `timeFormat`/`dateFormat` preferences in `use-language` remain in the store but are no longer read by display code; the helpers are the single source of truth. This avoids ripping out the UI now while making behavior consistent.

If you'd rather remove the toggles entirely, say so and I'll drop them in the same pass.

### 4. Verification

- Visual spot-check on `/kds/full`, `/kds/v1`, `/kds/v2`, `/kds/v3`, `/kds/home-onlineordering`, History, Alerts, Settings preview.
- Grep for remaining `toLocaleTimeString` / `toLocaleDateString` to confirm none slipped through.

## Out of scope

- Backend timestamp payloads (untouched; helpers consume whatever the API sends).
- Locale-specific translation of month names (always English month names per the chosen format).
- Relative-time wording changes beyond what already exists.
