## Problem
The previous run appended Settings rows at rows 978–999 because the source `.xlsx` reports `max_row = 977` (943 trailing blank rows after the last Alerts row at 34). Visually the sheet looks empty after row 34.

## Fix
Regenerate the Settings workbook so the 22 Settings rows live at rows 35–56, immediately under the Alerts block, with no blank gap.

### Steps
1. Load `POSAI - Kitchen Display System (KDS) (UI UX) Ver. 1.0 - Alerts.xlsx`.
2. Determine the true last-content row by scanning column A–W (currently row 34).
3. Delete the trailing blank rows (35 through `ws.max_row`) using `ws.delete_rows(35, ws.max_row - 34)`.
4. Write the same 22 Settings rows starting at row 35, copying styling from the template row (row 3) — content identical to the previous version (Entry & Shell, 7 Display rows, 6 Orders rows, 1 Expo View row, 4 Hardware rows, 3 Account rows).
5. Save as a new versioned file: `POSAI - Kitchen Display System (KDS) (UI UX) Ver. 1.0 - Settings_v2.xlsx` in `/mnt/documents/`.
6. Verify by reopening: confirm rows 35–56 are populated and row 57+ are empty / trimmed.

No code in `src/` is touched; this is a tracker-only change.
