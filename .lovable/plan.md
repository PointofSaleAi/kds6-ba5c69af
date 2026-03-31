

## Comparison: Existing KDS Software vs Lovable KDS

### What the reference screenshots show (Settings grid with 15 items):

| # | Reference Setting | Lovable Status | Notes |
|---|---|---|---|
| 1 | CATEGORY FILTER | ✅ Exists | In Settings → Orders group |
| 2 | ENABLE BADGE | ❌ Missing | Toggle to show/hide order badges |
| 3 | GRID MODE | ✅ Exists | As "Display Mode" toggle (List/Grid/Horizontal) |
| 4 | HORIZONTAL MODE | ✅ Exists | Merged into Display Mode toggle |
| 5 | INSTABUG OFF | ❌ Missing | Bug reporting toggle (may not be needed for KDS clone) |
| 6 | LOGOUT | ✅ Exists | At bottom of Settings |
| 7 | MAIN PRINTING DEVICE | ✅ Exists | In Settings → Hardware group |
| 8 | MODE SWITCHER | ❌ Missing | Switch between KDS modes |
| 9 | PRINTERS | ✅ Partially | Only "Main Printing Device" exists, no full Printers sub-screen with "Paired Printers", "Test Printer", "Detect Device" |
| 10 | REVENUE CENTER FILTER | ✅ Exists | In Settings → Orders group |
| 11 | SERVABLE MODIFIERS | ✅ Exists | Toggle in Orders group |
| 12 | SOUND SETTINGS | ✅ Exists | In Settings → Hardware group |
| 13 | STAGGER MODE | ✅ Exists | Toggle + sub-settings |
| 14 | STATUS SETTINGS | ✅ Exists | As "Status Colours" |
| 15 | SYNC | ❌ Missing | Manual sync/refresh trigger |

### Sub-screens comparison:

| Sub-screen | Reference | Lovable | Gap |
|---|---|---|---|
| SELECT CATEGORIES | Grid of category chips, no Apply/Clear buttons | Has chip grid + Apply/Clear | Style differs — reference is flat grid, no bottom actions |
| SELECT REVENUE CENTERS | Grid of center chips, no bottom actions | Has chip grid + Apply/Clear | Same style gap |
| MAIN PRINTING DEVICE | Simple dialog: description + "SET AS MAIN PRINTING DEVICE" button | Full printer list with status dots, radio, test buttons | Over-designed vs reference |
| SELECT PRINTERS | Full-screen: breadcrumb "Printers > Paired Printers", "Test Printer" + "Detect Device" buttons | Missing entirely | Need separate Printers screen |
| SOUND SETTINGS | Volume slider + Mute button, compact | Has volume + tone selector | Close match |
| STATUS TIMER SETTINGS | 4 quadrants: Started/Medium/Delayed/Overtime with colored circles and time thresholds | Has color swatches + text color editor | Reference shows timer thresholds, not just colors |
| Color picker | Grid of 18 colored circles | Has 14 swatches + custom hex | Close enough |

### Missing features to add:

1. **ENABLE BADGE** — toggle in Settings
2. **MODE SWITCHER** — switch between KDS operational modes
3. **PRINTERS** (full sub-screen) — "Paired Printers" with "Test Printer" and "Detect Device" buttons
4. **SYNC** — manual sync button
5. **Status Timer Settings** — the reference shows time thresholds (Till 5 mins, Till 10 mins, Till 20 mins) per status level, not just colors

### Where to place Category Filter and Revenue Center Filter

Based on the reference screenshots, both Category Filter and Revenue Center Filter are **inside the Settings grid as icon-button tiles**, not in the sidebar or bottom bar. They open as modal overlays from Settings.

**Current placement is correct** — both are already in Settings → Orders group. However, the reference uses a **flat icon grid layout** for all settings (not grouped lists). 

**Important conflict**: The project knowledge doc says "Never do: Flat icon grid for Settings — always a grouped list with descriptions." So the current grouped-list approach is the correct design for this project, and Category Filter / Revenue Center Filter should stay in the Settings → Orders group as they are now.

**Alternative placement option**: If quick access is needed without opening Settings, these two filters could also be added as sidebar items (below the existing filter section) since they're frequently used during service. But the primary home should remain in Settings.

### Recommended implementation plan:

1. **Add "Enable Badge" toggle** to Settings → Display group
2. **Add "Mode Switcher"** to Settings → Display group (opens sub-screen)
3. **Add "Printers" sub-screen** — full screen with paired printers list, "Test Printer" and "Detect Device" buttons (separate from Main Printing Device)
4. **Add "Sync" button** to Settings → Hardware group (triggers manual sync with toast feedback)
5. **Update Status Settings** to include timer thresholds (Started: 5 min, Medium: 10 min, Delayed: 20 min, Overtime: ∞) alongside color customization

