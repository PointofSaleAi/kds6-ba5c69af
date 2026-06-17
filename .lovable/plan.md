
## Goal
Add a new `Station_View` sheet to `POSAI - Kitchen Display System (KDS) (UI UX) Ver. 1.0 - Expo_View.xlsx` (or a new sibling file `...Station_View.xlsx`) that documents the Station mode (internally `Prep`) experience after a station is selected from the Station popup in Settings — same structure/depth as the existing Expo_View sheet.

## Scope of documentation
Source files to trace: `use-kds-mode.tsx`, `SettingsPanel.tsx` (Mode switcher + Station ID row), `NotificationStationSync.tsx`, `MainOrderView.tsx`, `OrderCard.tsx`, `CourseSection.tsx`, `station-utils.ts`, `ItemSummaryPanel.tsx`, `BottomStatusBar.tsx`, `mock-orders.ts`.

Sections to include (matching Expo_View layout):
1. **Entry / Activation** — Settings → Mode switcher chip "Station" maps to internal `mode='Prep'`; Station ID row (STN-001); station course selection popup; `stationCourse` state in `useKDSMode`.
2. **Sidebar (Station)** — which nav items show vs hidden in Prep mode, action mappings, badges.
3. **Header / Top bar** — station label, course filter chip, mode indicator.
4. **Order grid / filtering rules** — only items belonging to the selected station/course render; cross-station items hidden or dimmed; coursing behavior.
5. **Ticket card layout (Station mode)** — header, item rows shown, items filtered by `courseToStation` map, allergens, modifiers.
6. **Ticket card actions** — single-tap advance, double-tap revert, partial qty, per-item Send, auto-advance, Recall, Rush, new-item ack, station hold/release, fire next course (if applicable in Prep).
7. **Action wiring validation** — UI prop → handler → store mutation, mirroring the Expo `Action_Wiring_Validation` columns.
8. **Summary panel (Station)** — aggregate counts scoped to station, send-all behavior.
9. **Bottom status bar** — station ID, connection, counts.
10. **Notifications** — `NotificationStationSync` maps `stationCourse` → `StationTag` (Grill/Fry/Salad/Kitchen), filtering alerts to that station; Expo tag when in Expo, All in Standard.
11. **Empty / no station selected state** — fallback to All.
12. **Exit** — switching mode back to Standard/Expo clears `stationCourse` (line 29 of `use-kds-mode.tsx`).
13. **Constraints / terminology** — internal name `Prep` must never appear in UI; user-facing label is "Station".

## Deliverable
New worksheet `Station_View` (and an `Action_Wiring_Validation` sheet for Station actions) added to the existing Expo_View workbook, styled identically (dark title row, dark headers, green OK column). Saved to `/mnt/documents/` as a versioned file (`..._Station_View.xlsx`).

## Out of scope
No `src/` code changes.

## Confirm before build
1. Add to the **existing** `Expo_View.xlsx` workbook as new tabs, or create a **separate** `Station_View.xlsx` file matching the other view-specific files? (Other views like Home, Alerts, History each have their own file, so a separate file is the consistent choice — please confirm.)
