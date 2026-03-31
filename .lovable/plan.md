

## Update KDS Status Report with Partially Done Estimates

Add individual time estimates for each of the 19 partially done items in the PDF report.

### Estimated Hours for Partially Done Items

| # | Item | Est. |
|---|------|------|
| 1 | Splash Screen (offline fallback, MAC binding) | 1.5h |
| 2 | PIN Login (3-failed-attempts fallback) | 1h |
| 3 | Order Card - READY State | 1.5h |
| 4 | Order Card - DONE/SERVED (grey, strikethrough, auto-collapse) | 2h |
| 5 | Order Card - OVERTIME (pulse, flash, audio) | 1.5h |
| 6 | Order Card - Cancelled Item (badge, greyed allergen) | 0.5h |
| 7 | Course Labels (styling, NO COURSE fallback) | 0.5h |
| 8 | Empty State (stats, positive copy) | 1h |
| 9 | Sidebar - Collapsed (long-press tooltip) | 0.5h |
| 10 | Alerts Panel (dismiss, categorised sections) | 1.5h |
| 11 | Settings - Full Layout (two-column redesign) | 3h |
| 12 | Settings - Display (remove duplicates, text size) | 0.5h |
| 13 | Settings - Orders (allergen toggle, stagger config) | 0.5h |
| 14 | Settings - Hardware (connection status dot) | 0.5h |
| 15 | Status Colour Customiser (WCAG badge) | 0.5h |
| 16 | Sound Settings (percentage, test button) | 0.5h |
| 17 | Connection/WebSocket Settings (plain language, status dot) | 0.5h |
| 18 | Printer Settings (printer list, status badges, test print) | 1.5h |
| 19 | Category Filter (multi-select chips, apply/clear) | 1h |
| | **Total Partially Done** | **~19h** |

### What Changes

Generate a new `KDS_Status_Report_v2.pdf` with the "Partially Done" table updated to include an "Est. Time" column for each item. Update the summary section totals accordingly:

- Partially Done: ~19 hours
- Not Started: ~16 hours
- **Total remaining: ~35 hours**

### Technical approach

Re-run the Python/reportlab script with the added estimation column in the Partially Done table, output to `/mnt/documents/KDS_Status_Report_v2.pdf`.

