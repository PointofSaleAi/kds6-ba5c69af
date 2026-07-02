# Fill missing features in KDS Tracker spreadsheet

## Context

The uploaded workbook `POSAI_-_KDS_UI_UX_Ver_1.1_p_29_Jun_26_IN.xlsx` contains one sheet, `KDS Tracker`, with 47 rows tracking KDS modules (columns: #, Old Main/Sub/Sub-Sub, New Main/Sub/Sub-Sub, Change Status, Feature Description, Description, Use Case, Edge Cases, Form Fields, Validations, Test Case, eatOS 5.0 Implemented?, New Requirement, UI Completion %, Lovable Link, Notes).

The sheet was frozen on 29 Jun 26. Since then, many features have shipped or been renamed. I'll extend the sheet with new rows (starting at #48) for everything missing, preserving the exact column structure, styling, and formulas of the existing rows.

## Missing features to append

Grouped by module. Each becomes one row with Change Status = NEW / CHANGED / RENAMED, UI Completion %, Lovable route, and full description/use case/edge cases/test case populated.

**Branding & Global Renames (CHANGED)**
- POSAI → Point of Sale Ai global rename
- POS → Point of Sale global rename
- Home → Tickets nav rename
- Items → Products global rename
- Date/time standardization (12-hour, "D MMMM YYYY")
- Order number `#` prefix removed globally

**Routing / Ticket layout variants (NEW)**
- `/kds/default` legacy actions route
- `/kds/v1` through `/kds/v6` variant routes with per-route Spacing / Text size / Appearance / Identifier overrides
- `/kds/home-onlineordering` route with customer contact strip
- Ticket Layout modes: Standard / Compact / Header-only + HeaderOnlyDrawer expansion

**Maya AI Assistant (NEW)**
- Right-side Maya panel (440px), animated "e" logo
- Voice/mic input, contextual chips, self-learning suggestions
- Supabase edge function `kds-ai-chat` (Gemini)
- Settings → System → AI Integration (provider, API key persistence)
- Settings → System → AI Instructions screen
- Notification panel AI Summary Strip
- Notification per-item AI Action Chip

**86 Flow (NEW)**
- Flag86 button on flagged product rows
- Flag86 confirmation modal (pending count, POS approval copy)
- Long-press manual 86 request at ticket / course / product level
- 86'd pill (non-tappable), navy #1A1A2E treatment
- `use-flag86` state hook

**Order card enhancements (CHANGED)**
- Ticket header allergen summary toggle (Settings → Orders)
- v6 product-level style allergen summary (bold red `!` prefix)
- Allergens moved below product name in v1–v4
- RTL / Arabic tight-width alignment via `TightWidthBox`
- Long-press recipe modal per variant
- New-product green border + opacity pulse
- Servable Modifiers hardcoded OFF

**Account / Identity (NEW)**
- `use-active-identity` (Restaurant vs Staff PIN)
- ProfileSection at top of Settings → Account
- Restaurant logo badge on employee avatar
- Performance summary — 6 KPI cards, Today/Total tabs, live-queue indicator, Busiest hour swap
- 3-cards-per-row grid layout
- Account (device settings) moved above Performance summary
- Reset to default pill (clears local storage, preserves device-specific keys)
- Manufacturer defaults on reset (Maya only, Stagger mode default)

**Auth / Startup (CHANGED)**
- Splash → PinPad primary path
- Hardware Activation flow (integrated Set-PIN)
- Personal Device (BYOD) login flow
- Dev scenario selector gated to DEV builds only
- `/kds-reply` auth gate (security fix)
- Mock auth flows gated to DEV

**Notifications & Messaging (NEW)**
- NotificationsProvider, 4s auto-dismiss, station filtering
- NotificationToastStack
- Kitchen messaging (violet banners)
- Mobile reply flow via QR → `/kds-reply` (10-min expiry)
- KitchenReplyDialog

**Layout / Dock (NEW)**
- DockLayoutProvider — drag-to-dock sidebar, summary panel, status bar
- Portrait orientation layout rules (Grid 2/3-col, Stagger forced 2-col)
- Persistent KDS rail + footer across all screens
- `getOverlayInsets` for full-screen overlays

**Settings UX (CHANGED)**
- Settings header renamed to "Search" only
- Mic icon in search
- Rounded pill selections (from squared) matching Mobile POS typography
- SettingsLayout renders inside KDS shell (rail visible)
- Language settings — searchable portal dropdown

**Coursing / Aging (CHANGED)**
- Course-level aging (independent status colors per course block)
- Sequential coursing enforcement for Dine-In
- Status Aging Engine with builder UI
- 3-state lifecycle (Unseen → Preparing → Done) with 1.15x tactile scale

**Removed / constraint rows**
- Re-route item / Re-route entire ticket — REMOVED
- Auto-fire / Fire / Prep terminology — REMOVED from UI

## Technical approach

1. Load `/tmp/kds.xlsx` with `openpyxl`, keeping formulas and styles.
2. Detect the last populated row (currently 47) and copy the style of a representative body row.
3. Append ~55 new rows for the items above, numbering `48.0` upward.
4. For each row: fill columns 0–19 exactly matching existing conventions (Change Status uppercase, %s as numbers, links like `/kds/v3` or `/settings`).
5. Preserve column widths and row heights.
6. Save output as `/mnt/documents/POSAI_KDS_Tracker_Updated_2Jul26.xlsx` and expose the download path.

## Deliverable

Single updated `.xlsx` file, same sheet name, same columns, ~102 total rows, ready to hand back to the user for review.
