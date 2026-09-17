# Detailed Change Report with Screen Names

## What you get
A single downloadable document (PDF-style text/Markdown file saved to Files) listing every change made today, with **each item tagged with the exact screen or view it affects** — e.g. "Hardware screen → KOT Printer modal", "Ticket Layout page", "Language screen", "Glass board — Grid view".

## Structure

### 1. UI/UX & Typography Fixes
Each bullet prefixed with its screen name:
- **Ticket Aging Rules screen** — selected/unselected status row backgrounds, label font colors
- **Language screen** — section headers, native language names, "Selected Language" labels, preview info text, footer "Showing English (US) only" text
- **AI Integration screen** — AI Provider / API Key / AI Behavior labels, billing note, AI Instructions sub-line
- **Hardware screen + all four modals** (KOT Printer, Label Printer, Sound Settings, Connection Settings) — secondary text, section headings, IPs, status text, timestamps, 12px minimum font rule
- Convention applied: pale grey `text-text-muted` → darker `text-text-secondary`, semibold headings, `text-text-primary` for operational values

### 2. Spacing & Layout Adjustments
- **AI Integration screen** — uniform 12px gaps between chips/cards
- **Settings screens** (Ticket Layout, Ticket Studio, Status Colors, Order Type Colors, Language) — equal 8px gutters left/right
- **Ticket Layout page** — 50/50 editor vs Preview split; Layout dropdown arrow fix (native arrow removed, fixed chevron 12px from edge)
- **Glass board — Grid & Stagger views** — fluid columns, 4 tickets per row on wide screens, 250px minimum ticket width
- **Ticket Aging Rules screen** — guided split editor restructure (setup strip, status rail, workbench with sticky preview)

### 3. Localization & Multi-language
- **App-wide** — ~700 phrases translated (es/ar/zh/vi), Arabic RTL
- Screens listed per pass: board chrome (left rail, bottom bar, top header, notifications, summary panel), Settings shell + sidebar group labels, all Settings sub-screens, PIN/clock-in/entry screens, 86 drawer, recipes, replies, filters, history, staff walkthrough
- **Language screen** — live ticket preview follows saved language (Glass ticket included)
- Persistence keys and fallback behavior documented

### 4. Screen-Specific Fixes
- **Notifications drawer** — settings-pill background color, full height, blurred full-screen overlay
- **Settings screen** — active Performance Summary chip text, single right container, active nav + info text colors, lighter grey background, pill description readability, equal padding, search bar contrast
- **86 drawer / badge** — light theme adaptation
- **KDS footer** — Sort and 86 Products button backgrounds matching other icons
- **Ticket Aging Rules + Language previews** — honor the saved Glass ticket style
- **Clock-in PIN pad** — half-clipped fix (portaled overlay)
- **Glass tickets** — Ready no longer moves ticket to Served; secondary language on glass items; footer language icon; black icons in light theme; white badge counts

### 5. Default System Configuration
- **Editor preview + published app** — Glass View is the default ticket layout on fresh visits; saved user choices still respected; all other layouts unchanged

### 6. Verification Summary
- Typecheck clean, build OK
- Checked at 390 / 1024 / 1280 / 1494 px in light and dark themes

## Technical details
- Single deliverable written to Files (Markdown). No app code changes.
- Every bullet carries a bold screen/modal name prefix so the report reads as a screen-by-screen changelog.
