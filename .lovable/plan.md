# KDS Module Spec Sheet — Matching POSAI UI/UX Tracker Template

## Goal
Produce a deliverable that mirrors the uploaded **POSAI 6 | UI_UX_Tracker** sheet (42-column layout, one row per screen/sub-screen, blank spacer rows between modules) and populates it with every Kitchen Display System module/sub-module shipped in this project.

## Deliverables (both written to `/mnt/documents/`)
1. **`POSAI_KDS_UI_UX_Tracker.xlsx`** — single sheet, identical column order, header row styled like the source (bold, frozen top row, autofiltered, wrapped text, ~28 px row height for data, spacer row between modules).
2. **`POSAI_KDS_UI_UX_Tracker.md`** — same data as a markdown table for quick review/diffing.

## Exact Column Order (from source, preserved 1:1)
Module · Parent Screen · Child Screen · Setting Options (If) · Form Fields (If) · Validations (If) · Section Description · Use Case (If) · Edge Cases Considered · Settings Dependency (Yes/No) · ALL Verticals · Full Service · QSR · Food Truck · All Devices · Point Of Sale · Point of Purchase · Kitchen Display System · Customer Facing Display · Self Service KIOSK · orderOS (Online Ordering) · Table Side Order & Pay · workforceOS · 5.0 Implemented? · New Requirement · Design Status · Lovable Status · UI Completion (%) · Functionality Implementation for Settings Module · Current Status Summary · Estimation time · Lovable Link to the Screen · Figma Link (If) · Owner · Missing UI/Feature/Functionality · Bug/Error/QA Suggestions · Missing UI Status (+ 5 trailing blanks to match column count)

## Modules & Sub-screens to Document (grouped, parent → children)

1. **KDS Entry & Shell** — `/kds/full` route, Splash→PinPad→Main handoff, persistent left rail, bottom status bar, drag-to-dock layout (left/right rail, top/bottom bar), `getOverlayInsets` rule.
2. **Home View (Standard KDS)** — Grid layout (280–400 px), Horizontal (220 px), Stagger (forced 2-col portrait), order card anchoring (Order # vs Guest Name), New-item 2 px green border pulse, course sections, allergen text chips, order notes, 2-state acknowledgment toggle.
3. **Product & Ticket Lifecycle** — 3-state product machine (Unseen→Preparing→Done with blue eye / red bell / purple check), single-tap advance + double-tap revert, bulk ticket transition via primary card CTA, servable modifier 3-step lifecycle, course-level independent aging.
4. **Expo (Expediter) View** — Expo Home, manual status cycling (Queued→In Progress→Ready, double-tap undo), Expo History (header parity with Home), Ready-filtering, manual timing, Cooking Summary Panel, ExpoSummaryPanel grid filtering & matching highlights.
5. **Ready Only & Recalled (state-filtered lists)** — Real-time filtered screens, recall deduplication, restored-state behavior.
6. **History Screen** — 3-tab system (All / Seen / Unseen), search bar, summary panel, recall buttons (item + ticket), category & revenue-center filters.
7. **Notifications / Alert Log** — 4 s auto-dismiss toast stack, station-scoped filtering, kitchen messaging violet banners, mobile reply via QR → `/kds-reply` (10-min expiry), unread badge counts.
8. **Station Mode** — Dynamic category filter (internally "Prep", UI says "Station"), station-scoped queues, station badges intentionally omitted on rows.
9. **Stagger Mode** — Batch release rules, settings sub-screen, portrait 2-col enforcement.
10. **Status Aging Engine** — Time-threshold color mapping, status rule builder UI, per-course independent timers.
11. **Settings Shell** — SettingsLayout with KDS rail visible, inline sub-screens with Save-on-Back, no X close buttons, search index.
12. **Settings → Display** — Theme (light/dark, 91% lightness bg), Ticket Spacing (Compact/Standard/Spacious; default Compact), font scaling, order-type header colors, badge visibility.
13. **Settings → Orders** — Stagger Mode, Status Rules / Aging editor, Category Filter, Revenue Center Filter, Order Notes toggles.
14. **Settings → Hardware** — Printer Routing (KOT + Label), Printer Assignments, WebSocket, Sound Settings (Web Audio API, per-event volume, custom uploads).
15. **Settings → Account** — Language portal (searchable dropdown; en-US/en-GB/fr-CA/es-MX/ar-AE), Logout confirmation dialog, Switch to POS, feature-request modal, simulated log uploads.
16. **Settings → Expo** — Expo-specific toggles.
17. **Offline / EdgeOS** — Local backup server messaging.
18. **Performance Dashboard** — Operator stats screen.
19. **Kitchen Messaging** — Inbound POS messages, reply dialog, mobile QR reply flow.

Each module above becomes a parent block: one **parent row** (Module + Parent Screen filled, Child Screen = "NA") followed by one **child row per sub-screen** (Module/Parent blank to mirror the source's "merged-look" convention), then a blank spacer row.

## Column-Fill Rules (applied uniformly, per project memory)
- **Kitchen Display System** column → `Yes` on every row; **Point Of Sale**, **CFD**, **Kiosk**, **orderOS**, **TSOP**, **workforceOS** → `No` unless the feature genuinely spans (e.g., Switch to POS).
- **ALL Verticals / Full Service / QSR / Food Truck** → `Yes` where applicable (KDS is cross-vertical).
- **Settings Dependency** → `Yes` for rows gated by a toggle (Stagger, Aging, Sound, Theme, Language, Printer); else `No`.
- **5.0 Implemented?** = `Yes` for everything shipped; **New Requirement** = `Existing`; **Design Status** = `Not Needed` (already built); **Lovable Status** = `Completed` / `Needs Review` based on memory (e.g., Montserrat tailwind wiring, light-mode parity = `Needs Review`).
- **UI Completion (%)** = `1.0` for shipped, `0.5` for known gaps (ExportDialog, dual-month date filter, swipe-to-reveal, `prefers-reduced-motion`).
- **Lovable Link** = `https://kitchen-display-system-posai6.lovable.app/kds/full` (+ deep paths where they exist).
- **Owner** = blank (user fills).
- **Edge Cases** authored per screen — auth expiry, offline, double-tap race, station re-route attempts (rejected per memory), portrait/landscape rotation, drag-to-dock collision, sound muted device, allergen overflow wrap, recall deduplication, stagger batch starvation, etc.
- **Missing UI/Feature** column captures the open gaps surfaced in the prior audit (ExportDialog on History/Notifications, column visibility toggle, `de-DE` decision, AI persona-push notifications, SOP §8.10 spec).
- **Terminology guardrails** enforced: "Kitchen Display System" (never "KDS" in copy), "Station" (never "Prep"), "Send/Serve" (never "Fire"/"Auto-fire"), allergens described as **text-only colored chips** (never "red badge with icon").
- Grammar pass on every cell; sentence case for descriptions, bullet style preserved for Edge Cases / Form Fields to match source.

## Build Steps
1. Read full column inventory from source workbook (already inspected — 42 columns confirmed) and copy header row verbatim including the `5.0\nImplemented?` line break.
2. Build Python (openpyxl) generator that:
   - Creates workbook, writes header with bold + wrap + fill matching source (light grey header band).
   - Iterates a Python list-of-dicts (the 19 modules above, each with its sub-screens and pre-authored cell content).
   - Inserts a blank spacer row between modules.
   - Sets column widths (Module 18, Parent 22, Child 26, long-text columns 45, Yes/No columns 10, link 50).
   - Freezes row 1, applies autofilter, sets row heights to 28 px (parent) / auto for wrapped child rows.
3. Save to `/mnt/documents/POSAI_KDS_UI_UX_Tracker.xlsx`.
4. Run `recalculate_formulas.py` (defensive; no formulas expected but verifies file integrity).
5. Render the same data set to a markdown table → `/mnt/documents/POSAI_KDS_UI_UX_Tracker.md`.
6. QA: convert workbook page 1 to PNG, visually verify header parity, column widths, no clipped text, spacer rows present.
7. Emit `<presentation-artifact>` tags for both files.

## Out of Scope
- No edits to the running app — this is documentation only.
- Will not modify the source POSAI workbook.
- Will not invent screens that do not exist in the current codebase.

Ready to implement on approval.