## Goal
Extend `Settings_v2.xlsx` with sub-screen detail rows so each Settings entry's deeper screen is tracked. Save as `Settings_v3.xlsx` in `/mnt/documents/`.

## Sub-screen rows to append (Module = Settings, Section = "<Parent> · <Sub-screen>")

### Status Colours · Aging Builder (StatusSettings.tsx)
1. Status rules list (add/remove status levels)
2. Threshold time pickers per level (Started → Overtime)
3. Colour swatch picker per level
4. Course-level aging toggle ("Apply to course level")
5. Presets row (load preset aging rule sets)

### Region · Language Portal (LanguageSettings.tsx)
6. Single vs dual language mode toggle ("One language on KDS" vs "Two languages per item")
7. Searchable language dropdown with flag/locale list
8. Swap languages button (dual mode)

### Category Filter (CategoryFilterPanel.tsx)
9. Multi-select category chip grid (with "no active categories" empty state)

### Revenue Center Filter (RevenueCenterFilter.tsx)
10. Multi-select revenue center list

### Stagger Mode Config (StaggerModeSettings.tsx)
11. Release interval stepper
12. Max orders per batch stepper
13. Release preview visualisation

### Sound Settings (SoundSettings.tsx)
14. Master volume slider + test button
15. New order alert sound preset picker
16. Custom sound upload (per event)
17. Alert volume slider (separate from master)
18. Urgent / overtime alert picker
19. Service Bell (manual) sound picker
20. Mute all sounds master toggle

### Connection · WebSocket + EdgeOS (WebSocketSettings.tsx)
21. Local Backup Server enable toggle + address field
22. Cloud Server status block
23. Device Info (device name, last order number)
24. Force-sync button with interruption warning
25. Recent sync events log

### KOT Printer Sub-screen (PrinterSettings.tsx)
26. Current main printer display
27. Available printers list (pair + test print)

### Label Printer Sub-screen
28. Label printer device list (pair + test print)

## Steps
1. Open `Settings_v2.xlsx`, copy styling from row 35.
2. Append rows 57+ with columns Module, Section, Feature, Description, Use case (and remaining columns inherited blank/default like prior Settings rows).
3. Save as `POSAI - Kitchen Display System (KDS) (UI UX) Ver. 1.0 - Settings_v3.xlsx`.
4. Verify by reading back the new rows.

No code in `src/` is touched.
