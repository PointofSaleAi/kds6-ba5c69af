## Problem

The Category and Revenue Center filters in the bottom status bar only apply to the History tab. On the Home screen (active orders), changing them has no effect because `filteredOrders` in `src/pages/MainOrderView.tsx` ignores `historyCategories` and `historyCenters`.

## Fix

In `src/pages/MainOrderView.tsx`, extend the `filteredOrders` memo with the same category and revenue-center matching used by `filteredHistory`:

1. Reuse the same normalization (`toUpperCase` + strip trailing `S`) for category comparisons so `SALAD` matches `Salads`, etc.
2. Reuse the `centerStationMap` (revenue center to `StationName`) and the `categoryToCenters` fallback (when items lack a `station`).
3. Add two checks inside the existing `orders.filter(...)`:
   - If categories selected: ticket must have a course or item category matching.
   - If revenue centers selected: ticket must have an item whose station is in the allowed set, OR whose category maps to one of the selected centers.
4. Add `historyCategories` and `historyCenters` to the memo's dependency array.

No UI changes. Status filter (New/In-Progress/Completed), Station view, sort, and summary item filtering remain unchanged. Same filter state powers both Home and History so chips and the filter icon badge stay consistent.