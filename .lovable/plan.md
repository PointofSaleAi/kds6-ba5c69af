## Goal
Create a new module workbook documenting the **Expo (Expediter) view** in the same column structure used for the Unseen/Seen and Ticket-Card-Audit workbooks. Since the old POSAI KDS had no Expediter screen, every row is flagged as **net-new** (Old KDS = "Not available"), and the New KDS column maps to the existing Expo implementation files.

## Source files mapped
- `src/components/kds/ExpoView.tsx` (main board)
- `src/components/kds/ExpoSummaryPanel.tsx` (right-side aggregate panel)
- `src/data/mock-expo-orders.ts` (ticket/item/course shape)
- `src/data/mock-expo-demo.ts`
- `src/pages/settings/ExpoSettings.tsx` (Send button mode)
- `src/components/kds/NotificationStationSync.tsx` (Expo station tag)
- `src/hooks/use-kds-mode.tsx` (`mode === 'Expo'`)

## Output
New workbook: `POSAI - Kitchen Display System (KDS) (UI UX) Ver. 1.0 - Expo_View.xlsx` in `/mnt/documents/`. Reuse the Settings_v3 header rows (1–2) verbatim for column parity, then write rows from row 3.

## Rows (Module = "Expo View")

### A. Entry & framing
1. **Mode entry** — KDS Mode toggle adds an "Expo" option; selecting it routes the home board to `ExpoView` and tags notifications as `Expo` station.
2. **Sidebar + footer parity** — persistent left rail and bottom status bar remain visible (per dock layout rules).
3. **Header title + live ticket count** — "Expediter" title with count of active tickets.

### B. Ticket grid (per ExpoTicket)
4. **Card header** — order number, order type colour (Dine-In / Take-Out / Banquet), table/area name, master timer.
5. **Station strip** — per-ticket station chips (Grill / Fry / Salad / Dessert / Bar) coloured by `done | firing | pending`.
6. **Auto-fire countdown** — `autoFireSeconds` shown as inline countdown when set; `0` = firing now.
7. **Coursing block** — when `hasCoursing`, items grouped by course with `served | active | queued` status and per-course timer reset on `activeCourseFiredAt`.
8. **Item row** — quantity, name, status label (e.g., "Frying…", "On grill…", "Overdue"), station tag, allergen chips, modifiers (extra/remove/neutral), to-go flag, item-level notes, isNew indicator.
9. **Order-level notes** — packaging / special-instruction banner sourced from `orderNotes`.
10. **Send button (per item)** — visibility controlled by `expoSendButtonMode` setting (`always` vs `when-ready`); only enabled once item is `done`.
11. **Send-all (per product)** — quick action in summary panel sends every done instance of a product across tickets.

### C. Summary panel (`ExpoSummaryPanel`)
12. **Readiness counters** — Ready to send / In progress / Pending aggregated across tickets.
13. **Ready-to-send products section** — collapsible; lists products whose all instances are `done`; per-row Send-all.
14. **Pending-products section** — collapsible; aggregates non-done quantities; highlights `firing` and `isNew`.
15. **Multi-select + clear** — tap products to highlight matching ticket rows; "Clear all" resets.
16. **Dock + collapse** — panel supports dock drag handle and collapse rail (consistent with Cooking Summary).

### D. Settings & integrations
17. **Expo settings page** — `ExpoSettings.tsx` controls the Send-button mode (Always vs When ready).
18. **Notification scoping** — `NotificationStationSync` sets current station to `Expo` so alerts filter to expediter-relevant events.
19. **Sound + alert reuse** — reuses global sound/alert system; no new sounds defined.
20. **View-mode parity** — Expo view supports the same Grid/Horizontal/Stagger display modes as Standard KDS (where applicable).

### E. Lifecycle & flow
21. **Item lifecycle inside Expo** — items remain read-only with respect to per-item progression; Expo's job is to *send*, not to advance kitchen states.
22. **Bump to history on send** — sending all items (or the ticket-level send) progresses ticket to Done and drops into History (respects coursing rules).
23. **Empty state** — friendly "All sent — nothing to expedite" copy.
24. **New-item indicator** — POS mid-service additions show 2px green border + opacity pulse, matching Standard KDS rules.

## Column values (per row)
- **Module**: "Expo View"
- **Sub Module**: section A–E label
- **Lovable Status**: "Done"
- **UI Completion**: 100
- **Old KDS (Before)**: "Not available — Expediter view is net-new in POSAI KDS"
- **New KDS (After)**: corresponding component file(s) from the source map
- **Settings Dependency**: e.g., row 10 → "Yes: `expoSendButtonMode`"; row 20 → "Yes: Display mode"
- **Test case / Edge case**: short note (e.g., "Auto-fire reaches 0", "All items done → ticket bumps")

## Steps
1. Copy header rows 1–2 from `Settings_v3.xlsx` into the new workbook for column parity.
2. Write the 24 rows starting at row 3 with the values above.
3. Apply freeze panes at A3 and column widths matching existing module workbooks.
4. Read back to verify formatting.

No `src/` changes.
