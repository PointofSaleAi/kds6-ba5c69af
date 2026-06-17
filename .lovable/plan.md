## Goal
Add an **Unseen / Seen Filtered Views** module to the tracker as a separate workbook (since each module ships as its own `.xlsx`). Note explicitly that ticket-card behaviour inside these screens reuses the new `OrderCard` (3-state lifecycle, allergen chips, course aging, etc.) — different from old KDS's simpler cards — even though the *screen concept* (state-filtered list) is 1:1 with old KDS.

## Source files mapped
- `src/pages/UnseenOrdersScreen.tsx`
- `src/pages/SeenOrdersScreen.tsx`
- `src/pages/MainOrderView.tsx` (nav wiring at `activeNav === 'unseen-orders' | 'seen-orders'`)

## Rows to add (Module = "Unseen / Seen Views")

### Shared (both screens)
1. **Sidebar entry + active state** — `activeNav` switch routes Home to the filtered list; left rail highlights the entry.
2. **Real-time filtering** — list re-evaluates as `seenOrderIds` set updates from the order store; tickets appear/disappear without refresh.
3. **Station-mode awareness** — when Station Mode is active, list scopes to that station's course and empty-state copy adapts (e.g. "No new {course} orders").
4. **View mode parity** — supports Grid / Horizontal / Stagger display modes from main Settings (no separate toggle inside the screen).
5. **Summary panel reuse** — same `ItemSummaryPanel` aggregates only the filtered list (Unseen-only or Seen-only).
6. **Ticket card reuse with new behaviours** — cards render via the new `OrderCard` component, so 3-state lifecycle (Unseen → Preparing → Done), allergen chips, course aging, servable modifiers, new-item indicators and dock layout all apply *inside* these screens — explicit divergence from old KDS, where filtered views showed simpler legacy cards.

### Unseen Orders Screen
7. **Title + count** — header shows "New / Unseen orders" with live ticket count.
8. **Empty state** — friendly "No new unseen orders" (or station-scoped variant).
9. **Mark seen action** — tapping the card or using primary action transitions to Preparing and removes ticket from this list (drops into Seen list).
10. **Sort default** — newest-first; respects global Sort Default from Settings.

### Seen Orders Screen
11. **Title + count** — header shows "Seen orders" with live count.
12. **Empty state** — "No seen orders" (or station-scoped variant).
13. **Step-back affordance** — supports `onStepBack` to revert a card to Unseen if mis-acknowledged.
14. **Bump to Done** — primary action progresses card to Served and removes from list (drops into History).

## Steps
1. Reuse the Settings_v3 styling/column structure as the template (Module, Sub Module, Sub-Sub Module, Description, Use case, Edge cases, Test case, Old KDS Before, New KDS After, etc.).
2. Create a new workbook `POSAI - Kitchen Display System (KDS) (UI UX) Ver. 1.0 - Unseen_Seen.xlsx` in `/mnt/documents/` by copying the Settings_v3 header structure (rows 1–2) only, then writing the 14 rows starting at row 3.
3. Mark "Old KDS (Before)" column to show parity ("Same concept: state-filtered list of new/seen tickets.") and "New KDS (After)" to call out the OrderCard upgrades when relevant.
4. Verify by reading rows back.

No `src/` changes.
