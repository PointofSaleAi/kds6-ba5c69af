## Problem

When the user activates Station view (Settings → Display → Mode switcher → Station, then picks a category), the **History**, **Unseen**, and **Seen** screens still display **every order**, ignoring the station filter. Only the main board respects the station selection.

### Why

`MainOrderView` applies the station filter locally (lines 297-321 of `src/pages/MainOrderView.tsx`):
- Filters `orders` to those with at least one in-progress item whose `category === stationCourse`.
- Re-shapes each order via `getStationDisplayOrder(...)` so only the matching items are visible inside the card.

But the three other screens never read `useKDSMode()`:
- `src/pages/UnseenOrdersScreen.tsx` (line 31): `orders.filter(o => o.status !== 'served' && !seenOrderIds.has(o.id))`
- `src/pages/SeenOrdersScreen.tsx` (line 38): same shape, just inverted seen check
- `src/pages/OrderHistoryScreen.tsx` (line 46): filters a separate `mockHistory` array that has no item-level data at all

## Fix

Apply the same station-aware filter MainOrderView uses to **Unseen** and **Seen**, and apply a best-effort station scope to **History** based on the data it has.

### 1. Unseen + Seen screens (`UnseenOrdersScreen.tsx`, `SeenOrdersScreen.tsx`)

In each screen:

1. Import `useKDSMode` from `@/hooks/use-kds-mode`.
2. Read `mode` and `stationCourse`. Compute `isStationView = mode === 'Prep' && !!stationCourse`.
3. After the existing seen / unseen filter, apply:
   ```ts
   if (isStationView && stationCourse) {
     list = list.filter(o =>
       o.courses.some(c =>
         c.items.some(i =>
           !i.isCompleted && !i.isCancelled && i.category === stationCourse
         )
       )
     );
   }
   ```
4. Re-shape each remaining order so the card only shows items for the active station, using the same logic as `MainOrderView.getStationDisplayOrder`:
   ```ts
   const display = isStationView && stationCourse
     ? { ...o, courses: o.courses.map(c => ({ ...c, items: c.items.filter(i => i.category === stationCourse) })).filter(c => c.items.length > 0) }
     : o;
   ```
   Pass `display` (not `o`) to `<OrderCard order={...} />`.
5. Update the empty state to mention the station when active, e.g. `No new {stationCourse} orders`.

### 2. History screen (`OrderHistoryScreen.tsx`)

`mockHistory` rows currently only contain summary fields (`itemCount`, `durationMin`) with no per-item `category`. So strict filtering is not possible against the existing mock data without a schema change. To keep this change tight and reversible:

1. Import and read `useKDSMode()` the same way.
2. When `isStationView && stationCourse`, render a small banner above the list:
   `Showing all history. Station-scoped history requires per-item category data, which is not yet available in the History feed.`
3. Add a `TODO: filter by stationCourse once HistoryOrder includes per-item categories` comment on the existing `filtered` block.

This makes the limitation visible and discoverable without silently lying about the filter being applied. A follow-up task can extend `HistoryOrder` to carry the items array (matching the live `Order` shape) and apply the same `.some(c => c.items.some(...))` check.

### 3. No changes elsewhere

- `useKDSMode` already exposes `mode` and `stationCourse`; no provider work required.
- `MainOrderView` keeps its existing logic untouched.
- No changes to data hooks, the picker dialog, or notification routing.

## Files to change

- `src/pages/UnseenOrdersScreen.tsx`
- `src/pages/SeenOrdersScreen.tsx`
- `src/pages/OrderHistoryScreen.tsx`

## Out of scope

- Restructuring `mockHistory` to include items (deferred; flagged with TODO).
- Any change to the Station picker dialog or Mode switcher pill.
- Any change to filter chips, sort modes, or sidebar nav.
