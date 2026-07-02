# Update existing rows in KDS Tracker with post-29-Jun UI changes

## What I did last time vs. what's still missing

Last pass: appended 60 new rows (#48–#108) for net-new features.
Missing: the original 47 rows still describe the 29 Jun state. Several of those modules have shipped UI changes that belong **in-place** on the existing row (updating Sub-Sub-Module New / Change Status / Description / UI %). Adding another row for the same module would duplicate.

## Rows to update in place

For each row I'll edit the columns in brackets. All other columns preserved.

**Row 2 — Login** [New Sub-Sub, Description, Notes, %]
- Post-29-Jun: PIN-first startup; email/password is fallback. Change status → CHANGED.

**Row 4 — Device Activation** [Description, Notes]
- Set-PIN now integrated into HardwareActivationScreen (single wizard). Status → CHANGED.

**Row 5 — Ticket card grid** [Description, Notes, %]
- New: Portrait column rules (2-col Mini/Air, 3-col Pro ≥960px), Stagger forced 2-col, Horizontal 220px. Bump % to 95.

**Row 6 — Ticket card header** [Sub-Sub, Description, Notes]
- New: order-number `#` prefix removed; "Ticket header allergen summary" toggle; v6 uses product-level style allergen list.

**Row 7 — Ticket card item rows** [Description, Notes]
- "Item" → "Product" terminology; RTL/Arabic alignment via TightWidthBox; allergens moved below product name (v1–v4); long-press recipe modal; Servable Modifiers hardcoded OFF.

**Row 8 — Order notes** [Description]
- Violet POS kitchen-messaging banner variant added alongside notes.

**Row 9 — Primary action (bump)** [Description]
- Long-press on ticket header now opens Flag86 modal (manual 86 request at ticket level).

**Row 10 — Coursing** [Description, %, Notes]
- Sequential enforcement (Dine-In) shipped; course-level aging shipped; long-press on course header opens Flag86 modal. Bump % to 80.

**Rows 11–14 — Station view** [Notes]
- Note the persistent-rail + dock-layout wiring now applies here too.

**Rows 15–16 — Unseen / Seen** [Notes]
- Now honour Ticket Layout modes (Standard/Compact/Header-only) and header allergen toggle.

**Rows 17–23, 37–46 — Expediter view** [Notes]
- Add: Maya AI Assistant available from Expo; notification AI summary strip + per-alert action chip apply here; header allergen toggle honoured.

**Rows 24–25 — History** [Description]
- Date/time standardization ("D MMMM YYYY", 12-hour) applied to history rows.

**Row 26 — Settings root** [Sub-Sub, Description, %, Notes]
- Header renamed to Search-only + mic; controls changed to rounded pills; Settings renders inside KDS shell (rail visible). Add: /kds/v1/settings/system tree with AI Integration + AI Instructions. Bump % to 90.

**Row 27 — KDS Mode switcher** [Notes]
- Now scoped per-route (/kds/v1..v6) with per-route Spacing/Text size/Appearance/Identifier overrides.

**Row 28 — Text size** [Notes]
- Per-route scoping (see row 27).

**Row 29 — Layout / columns** [Sub-Sub, Description]
- Renamed "layout" → "appearance"; new "layout" mode picker (Standard / Compact / Header-only + HeaderOnlyDrawer).

**Row 30 — Sound** [Notes]
- Manufacturer defaults documented (part of Reset to default).

**Row 31 — Order type colours** [Description]
- Default palette updated per new brand spec.

**Row 32 — Station ID (Account)** [Description, %, Notes]
- Account now shows full ProfileSection (avatar + role + restaurant logo badge), 6 KPI cards (3 per row) with Today/Total tabs, Reset-to-default pill, device settings renamed "Account" and moved above Performance summary. Bump % to 95.

**Row 33 — Language & Region** [Description]
- Searchable portal dropdown replacing native picker.

**Row 34 — Aging Builder** [Description]
- Course-level aging option shipped; independent thresholds per course block.

**Row 35 — Offline indicator** [Notes]
- Notification toast stack now surfaces offline events via NotificationsProvider.

**Row 36 — Real-time sync (WebSocket)** [Notes]
- Kitchen messaging + `/kds-reply` reply flow (10-min token) piggyback on same channel; security fix applied.

**Row 47 — Seen empty state** [Notes]
- Consistent with global date/time formatting.

Also global metadata:
- Row 1 title bump: "Ver 1.0 (p) 29 Jun 26 IN" → "Ver 1.1 (p) 2 Jul 26 IN".
- Global rename: any residual "Home" label in existing rows → "Tickets"; any "item" → "product"; "POS" → "Point of Sale"; "POSAI" → "Point of Sale Ai" (where it appears in module names or descriptions).

## Technical approach

1. Load `/mnt/documents/POSAI_KDS_Tracker_Updated_2Jul26.xlsx` with `openpyxl` (preserves the 60 appended rows).
2. For each row above, update only the listed columns; keep styles intact.
3. Do a final regex sweep across all cells to apply the four global renames without touching column headers.
4. Save as `/mnt/documents/POSAI_KDS_Tracker_Updated_v2_2Jul26.xlsx` and expose for download.

Existing appended rows (48–108) are left as-is.
