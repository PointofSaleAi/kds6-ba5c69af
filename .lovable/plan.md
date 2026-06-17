
# Plan: Populate Home Module rows in KDS UI/UX Tracker

## Source mapping (old KDS screenshots → current Lovable build)

The 9 screenshots all show the Home screen and capture these distinct states/interactions:

1. **Default Home grid** — order cards grouped by day ("Yesterday / Today"), with collapsed sidebar (icon rail), Item Summary right panel, bottom "X Orders in Queue" bar.
2. **Expanded left sidebar** — Home, History, Alert, Settings, Unseen, Seen, Sort by Order, Collapse, Switch To POS.
3. **Right panel collapsed** — chevron to reopen Item Summary.
4. **Order card anatomy** — colored header (DINE IN / TAKE OUT / DELIVERY), timestamp, server initials, big order number, elapsed timer, server name, station strip (BAR COCKTAIL / ONION), item rows with qty + name + eye icon, full-width SEEN button, "X Orders in Queue" footer.
5. **Item-level tap** — eye icon → item enters PREPARING (bell) with undo.
6. **Item PREPARING → DONE** — bell tap → purple check with undo.
7. **All items done → ticket SERVED state** — card turns grey, full-width bell button, then SERVED label with undo.
8. **Course / "NO COURSE" pill** — second DINE IN card shows course header pill (ONION / NO COURSE) plus queued course preview list (Bloody Mary, Collins, Espresso Martini, Gimlet, Negroni shown in blue).
9. **Item Summary panel** — aggregate item counts across all active tickets, notification bell with unread badge, date/time header.

## Rows to append (one per Sub-Sub Module)

Module = `Home`. Sub Module = `Order Grid` / `Order Card` / `Left Sidebar` / `Item Summary Panel` / `Bottom Status Bar`.

Sub-Sub Modules (each → 1 row):

1. Home — Order Grid — Day-grouped Layout
2. Home — Order Grid — Grid / Horizontal / Stagger display modes
3. Home — Order Card — Header (Order Type color + timestamp + server initials)
4. Home — Order Card — Order Number / Guest Name anchor
5. Home — Order Card — Elapsed Timer & Status Aging color
6. Home — Order Card — Station Strip / Course Pill (incl. NO COURSE)
7. Home — Order Card — Queued Course Preview (blue item list)
8. Home — Order Card — Item Row (qty, name, allergens, modifiers, eye icon)
9. Home — Order Card — Item 3-step lifecycle (UNSEEN → PREPARING → DONE) + Undo
10. Home — Order Card — Ticket Primary Button (SEEN → IN PROGRESS → SERVED) + Undo
11. Home — Order Card — Served / Recall state (grey card, strikethrough, recall)
12. Home — Left Sidebar — Persistent rail, expand/collapse, nav items, badges
13. Home — Left Sidebar — Switch To POS
14. Home — Item Summary Panel — Aggregate counts, station header, collapse chevron
15. Home — Item Summary Panel — Notification bell & unread badge
16. Home — Bottom Status Bar — Orders in Queue counter, mode/clock/connection
17. Home — Empty State — "Queue is clear"

Each row filled with: Section Description, Use Case, Edge Cases, Test Case, Settings Dependency (e.g. Display Mode, Coursing, Order Card Layout, Status Aging), vertical checkmarks (Full Service ✓, QSR ✓, Food Truck ✓, eatOS 5.0 ✓ where applicable), UI Completion %, Lovable Status (Done / Pending), Old KDS (Before) = brief screenshot description, New KDS (After) = current implementation w/ component refs (`MainOrderView.tsx`, `OrderCard.tsx`, `OrderCardActions.tsx`, `KDSSidebar.tsx`, `ItemSummaryPanel.tsx`, `BottomStatusBar.tsx`, `CourseSection.tsx`), Lovable Link = `/kds/full`.

## Execution (build mode)

1. Copy uploaded template to `/tmp/kds_tracker.xlsx`.
2. Open with openpyxl, find first empty row after header on `POSAI 6 | UI_UX_Tracker`.
3. Append the 17 Home rows in exact column order from the approved schema, preserving styling by copying the header row's font/alignment to each new row.
4. Run `recalculate_formulas.py` to ensure zero formula errors.
5. Save as `POSAI - Kitchen Display System (KDS) (UI UX) Ver. 1.0 - Home.xlsx` in `/mnt/documents/` and hand back the download link.

After approval, you'll send History screenshots next and we repeat.
