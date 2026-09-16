# 6.0 - KDS APP (Point of Sale)

CONTEXT & BRIEF

I am redesigning the eatOS Kitchen Display System (KDS) — a tablet-based app used by restaurant kitchen staff to receive, manage, and complete food orders in real time. I have attached two reference documents:

KDS Design Audit & Competitive Analysis Report — a three-way comparison across old Figma designs, current Figma designs, and live app screenshots, benchmarked against Square KDS, Toast KDS, Clover, and Lightspeed.

KDS Visual Screen Feedback Report — screen-by-screen annotated screenshots with issues and recommendations for every screen across all three artefacts.

Use both documents as the complete source of truth for what exists, what is broken, and what needs to be built. Do not replicate the existing flaws — redesign everything from scratch using the recommendations in both documents.

PRODUCT OVERVIEW

Product name: eatOS KDS (Kitchen Display System) Platform: iPad / Android tablet — landscape orientation, touch-first Users: Kitchen chefs, line cooks, expo staff, kitchen managers Context of use: Hot, fast-paced, high-glare kitchen environment. Staff may have wet or greasy hands. Screens are often viewed from 1–2 metres away. Speed and legibility are paramount. Brand: eatOS — "Restaurants Made Simple". Brand colour: #E84C3D (red). Logo is "eatOS" in bold sans-serif.

DESIGN SYSTEM — ESTABLISH FIRST

Before building any screens, define and apply these tokens consistently across the entire app:

Colour Tokens

Token Hex Usage brand-primary #E84C3D CTAs, logo accent, active states brand-dark #1A1A2E Sidebar, card headers (Dine In), page backgrounds order-dine-in #1A1A2E DINE IN card header — deep navy/black order-take-out #2980B9 TAKE OUT card header — blue order-delivery #16A085 DELIVERY card header — teal order-banquet #F39C12 BANQUET card header — gold/amber status-new #E84C3D New/urgent order card body — red status-in-progress #E67E22 In progress card body — orange status-seen #7F8C8D Seen/acknowledged card body — medium grey status-served #95A5A6 Completed/served card body — light grey status-overtime #922B21 Overtime/critical card body — dark red allergen-alert #C0392B Allergen badge backgrounds and text modifier-extra #2471A3 Add-on modifier text — blue modifier-remove #E74C3C Removed item text — red with strikethrough sidebar-bg #0D0D1A Left sidebar background surface-card #FFFFFF Order card surface surface-bg #F0F2F5 Main content area background text-primary #2C3E50 Primary body text text-secondary #6C7A89 Secondary/meta text text-muted #95A5A6 Timestamps, labels

Typography Scale

Element Size Weight Notes Order number 56px 900 Bold Must be readable from 2 metres Order type badge 13px 700 Bold ALL CAPS Section label (APPETIZER etc.) 11px 700 Bold ALL CAPS, letter-spaced Item name 15px 600 SemiBold Clear, scannable Modifier text 13px 400 Regular Indented below item Allergen badge 12px 700 Bold Red, icon + text Timer 13px 600 Mono Monospace for stable width Server/table name 13px 600 Must NOT be truncated CTA button 14px 700 Bold ALL CAPS

Font: Inter or system sans-serif. Never use a serif font in a KDS.

Spacing & Layout Rules

Card corner radius: 8px

Card gutter spacing: 10px

Card minimum width: 220px

Sidebar collapsed width: 56px

Sidebar expanded width: 200px

Right panel width: 220px (collapsible)

Bottom status bar height: 44px

SCREENS TO BUILD (Complete List)

Build ALL of the following screens. Every screen must be fully designed — no placeholder content.

SCREEN 1 — SPLASH / BOOT SCREEN

Layout: Full screen, white background, centred content. Elements:

eatOS logo centred (large, ~200px wide)

"Kitchen Display System" subtitle in text-secondary below logo

Animated loading indicator (subtle pulse or dots) below the subtitle

Status message that cycles: "Connecting to kitchen server…" → "Syncing orders…" → "Ready"

Connection status badge in bottom-left: green dot = connected, red dot = offline (edgeOS mode)

SCREEN 2 — SIGN IN

Layout: Split screen — left 60% is a full-bleed kitchen atmosphere photo (dark, dramatic, real kitchen), right 40% is the login panel.

Left panel:

Large, dramatic kitchen photograph (not stock office imagery — real restaurant kitchen)

eatOS tagline overlaid at bottom: "No more chaos in the kitchen" in white, large bold text

4 marketing carousel dots at the bottom (indicate multiple slides)

Right panel:

eatOS logo at top centre

"Kitchen Display System" subtitle

Primary login: PIN pad — 6-dot PIN entry with a numeric keypad (1–9, 0, backspace). This is the default for returning kitchen staff

"Sign in with email instead" text link below PIN pad — expands to show email + password fields on tap

Show/hide toggle on password field

"SIGN IN" CTA button — full width, brand-primary red (#E84C3D), white bold text

"Forgot password?" link below the CTA

Design error states: wrong PIN (shake + red border), account locked, no network connection (toast message)

SCREEN 3 — FORGOT PASSWORD FLOW (3 sub-screens)

3a — Request Reset:

Back arrow top-left

eatOS logo + "KDS" centred

Heading: "Forgot Password"

Sub-copy: "Choose how to reset your password"

Email input field (primary)

"Or" divider

Mobile number input with country code picker flag dropdown

"SEND OTP" button — brand-primary red

"Back to Sign In" link

3b — OTP Verification:

Heading: "Enter Verification Code"

Sub-copy: "A 6-digit code was sent to [masked email/phone]"

6 individual OTP digit boxes (large, touch-friendly, 52px square each)

Auto-advance to next box on digit entry

"Resend code in 0:45" countdown timer (grey, becomes a link when timer reaches 0)

"VERIFY" CTA button — brand-primary red

3c — Password Updated Success:

Modal overlay (semi-transparent dark backdrop)

White card, centred

Large green checkmark icon (solid, not dotted) — #27AE60

Heading: "Password Updated Successfully"

Sub-copy: "You can now sign in with your new password"

"SIGN IN" CTA button — brand-primary red

Auto-dismiss after 3 seconds with countdown visible

SCREEN 4 — MAIN ORDER VIEW (Default / List Mode)

This is the most important screen. It must be exceptional.

Overall layout:

[Sidebar 56px] [Order Cards Area — full remaining width] [Right Panel 220px]
                          [Bottom Status Bar 44px]


Left Sidebar (collapsed by default):

Dark background (#0D0D1A)

Icon-only when collapsed, icon + label when expanded via hamburger tap

Items from top to bottom:

☰ Hamburger (expands/collapses sidebar)

🏠 Home (active state indicator — white left border)

🕐 History (badge count — e.g. "6" in red circle)

🔔 Alert (badge count)

⚙️ Settings

Divider line

👁 New Orders (filter — shows only unseen orders)

✓ In Progress (filter — shows acknowledged orders)

🚫 Hide Completed (hides served orders)

Divider line

↕ Sort (tap to cycle: By Time → By Table → By Type)

↕↕ Collapse All (with confirmation toast before collapsing)

Spacer

⇄ Switch to POS (bottom, distinct separator above it)

When expanded (200px): show icon + label side by side

Active filter state: selected item has brand-primary left border + slightly lighter background

Tooltip on long-press of each icon when collapsed

Top area (no separate top bar — integrate into card area):

Date group headers float above rows: "Today, 27 March 2026" and "Yesterday, 26 March 2026" in a subtle pill or grey divider bar

Quick filter chip row (optional — shown when a filter is active): chips for active filters with X to clear each

Order Cards — Design Specifications:

Each order card is a white rounded card with this structure:

┌─────────────────────────────────┐
│ [ORDER TYPE BADGE — full width] │  ← coloured header: Navy/Blue/Teal/Gold
│  01:36 PM            TABLE 4   │  ← time left, table/server info
│                                 │
│          23                     │  ← order number — MASSIVE, 56px
│                                 │
│  00:03:45              A M      │  ← elapsed timer (colour changes) + course
├─────────────────────────────────┤
│ APPETIZER                       │  ← course section divider (grey bar)
│ 1× Cheese Selection    [👁] [🔔] │  ← item + action icons
│   – Allergies: 🥜 PEANUT        │  ← allergen badge (red bg, bold)
│                                 │
│ ENTREE                          │
│ 2× Meatballs           [👁] [🔔] │
│   Medium Rare, Potato Wedge     │  ← modifiers (blue)
│   + Extra Cheese                │
│ 1× Filet Mignon        [👁] [🔔] │
│   Medium Rare                   │
│   + Extra Olive Oil             │
│                                 │
│ DESSERT                         │
│ 1× Tres Leches         [👁] [🔔] │
│   – Allergies: 🌾 GLUTEN, 🥜 NUT│
├─────────────────────────────────┤
│ [    COURSE FIRE    ] [  DONE  ]│  ← action buttons
└─────────────────────────────────┘


Card header colour rules:

DINE IN → #1A1A2E navy/black with white text

TAKE OUT → #2980B9 blue with white text

DELIVERY → #16A085 teal with white text

BANQUET → #F39C12 gold with white text

Card body colour rules by urgency (card body/left-border accent):

0–10 min: neutral white card, green timer

10–20 min: subtle orange left-border accent, amber timer

20+ min: red left-border accent, red timer (pulsing)

Overtime: #922B21 dark red, timer pulsing rapidly

Allergen display — CRITICAL:

Every allergen must have a coloured badge: red pill with white bold text

Include allergen icons where possible: 🥜 nuts, 🌾 gluten, 🥛 dairy, 🦐 shellfish

Allergen lines ALWAYS appear in red bold — never same weight as modifier text

Allergens must be visually distinct even from 1.5m away

Modifier display:

Extras (+ items): #2471A3 blue text, indented

Removals (– items / NO items): #E74C3C red text with strikethrough, indented

Neutral modifiers: #6C7A89 grey text, indented

Cancelled items:

Full strikethrough on item name

Item name and modifiers greyed out (#95A5A6)

Small "CANCELLED" red badge inline

Course fire buttons (bottom of card):

"FIRE APPS" / "FIRE MAINS" / "FIRE DESSERTS" — pill buttons, tap to confirm firing that course

"DONE / SERVED" — full-width black button with bell icon, marks entire ticket as served

"SEEN" → changes to "IN PROGRESS" on first tap, then "SERVED" on final bump

Timer behaviour:

Green → Amber → Red colour progression at 33% / 66% / 100% of target time

At 80%+ of target time: timer text pulses (CSS animation)

Show as MM:SS format (not raw seconds)

Bottom status bar:

Dark background, full width

Left: "50 Orders in Queue" in white bold

Centre: subtle scroll progress indicator dots

Right: current time + date

Right Panel — Item Summary:

Collapsible via ">" arrow toggle

Header: "Item Summary" + current date/time + notification bell with badge

Content: categorised list — APPETIZERS / SALADS / ENTREES / DESSERTS

Each item shows: item name (left) + quantity (right, bold)

Show progress: "Entrees: 4 / 8 served" as a fraction + small progress bar

When panel collapsed: show a mini "47 items" badge on the arrow

SCREEN 5 — GRID VIEW

Same sidebar and right panel as default view. Cards are compact.

Grid card design:

┌─────────────────┐
│   DINE IN       │  ← coloured header
│  01:36 PM       │
│                 │
│       23        │  ← large order number
│                 │
│  ●●●●● 5 items  │  ← item count dots
│ 🥜 has allergens │  ← allergen warning badge
│  [00:03:45]     │  ← timer with urgency colour
├─────────────────┤
│  [    DONE    ] │
└─────────────────┘


Allow 4-column, 6-column, and 8-column grid options (toggle in Display Settings)

Grid/List view toggle button directly in the top-right of the order area (NOT buried in Settings)

Same urgency colour system as list view cards

Tapping a grid card expands it inline to show full order details

SCREEN 6 — HORIZONTAL MODE (Landscape layout variant)

Cards are laid out in a single horizontal scrolling row instead of a vertical scroll.

Each card is taller and narrower

Timeline/scroll view at the bottom shows all orders as a minimap

Same card content structure as list view but condensed

SCREEN 7 — EMPTY STATE (No Active Orders)

Centred layout

Large animated checkmark or chef icon (celebration/positive tone)

Heading: "Queue is clear — great work!" (in text-primary, large)

Sub-copy: "Last order served at 2:34 PM · 48 orders completed today"

Today's stats row below: three stat cards — Orders Served | Avg Ticket Time | Fastest Ticket

Subtle animated background (very faint pulsing gradient or particle effect) to show the screen is live

Right panel: show "Today's Summary" instead of empty "No Item for Preparation"

SCREEN 8 — ORDER HISTORY SCREEN

Accessible via the History icon in the sidebar.

Full-screen view with the standard sidebar

Page heading: "Order History"

Date filter tabs: Today | Yesterday | Last 7 Days | Custom Range

Search bar: search by order number, table, server name, item name

Each history item is a compact row card:

Order number + order type badge

Table / server

Time placed → Time served

Total items

Duration badge (e.g. "18 min" in green if on target, "32 min" in red if overtime)

"RECALL" button on the right — re-displays the order on the main KDS view

Pagination or infinite scroll

SCREEN 9 — ALERT / NOTIFICATIONS PANEL

Accessible via the Alert bell icon in the sidebar.

Slide-in panel from the right (not a full screen)

Header: "Alerts" + "Mark all read" link

Alert categories with icons:

🔴 Overtime orders (order number, time overdue)

🟡 New order received (order number, type, time)

🟠 Order recalled (which order, by whom)

🔵 System (printer offline, sync issue, edgeOS status)

Each alert row: icon + message + timestamp + dismiss (X)

Empty state: "No alerts — all clear" with a green checkmark

SCREEN 10 — SETTINGS (Redesigned Architecture)

NOT a flat icon grid. Design as a grouped settings list.

Layout: Full-screen modal with a dark semi-opaque overlay behind it. White card with rounded top corners (sheet style).

Header: "Settings" title centred + X close button top-right

Settings are grouped into 4 sections:

DISPLAY

Display Mode (List / Grid / Horizontal) — segmented control toggle

Cards Per Row — stepper (2 / 4 / 6 / 8)

Text Size — segmented (Compact / Standard / Large)

Theme — toggle (Dark / Light) — with preview thumbnail

Status Colours — "Customise" row → opens Status Settings sub-screen

ORDERS

Category Filter — "Manage" → opens filter panel

Revenue Center Filter — "Manage" → opens filter panel

Stagger Mode — toggle + "Configure" link when on

Servable Modifiers — toggle

Show Allergen Badges — toggle (on by default)

Sort Default — picker (By Time / By Table / By Type)

HARDWARE

Main Printing Device — current printer name → tap to change

Additional Printers — list + add

Sound Settings — volume slider + sound type picker inline

Disable Badge — toggle

Sync — "Sync Now" button + last synced timestamp

Connection (WebSocket) — "Configure" → opens WebSocket sub-screen

ACCOUNT

Device Name — editable text field inline

Language — picker (currently selected language shown)

Logout — red text, tap to confirm

Debug/Developer Mode — hidden behind 5-tap on version number

Each settings row uses:

Icon (left, 20px, greyed)

Label (left, 15px regular)

Description (left, 13px muted, one line)

Control on the right (toggle / picker / arrow / value)

Chevron ">" for rows that open sub-screens

SCREEN 11 — STATUS SETTINGS (Colour Customiser)

Accessible from Settings → Display → Status Colours.

Shows all 4 status options as rows: START / MEDIUM / DELAY / OVERTIME

Each row: status label + current colour swatch + "Edit" button

Tapping "Edit" expands an inline colour picker:

Grid of 14 colour swatches

"Custom" hex input field

Text colour selector: White / Grey / Black radio buttons

WCAG contrast ratio badge: "✓ AA Compliant" or "⚠ Low contrast"

Live preview card on the right (shows full order card not just header)

"Reset to defaults" link at the bottom

"SAVE" button — saves all status colours at once

SCREEN 12 — CATEGORY FILTER PANEL

Slide-in panel from the left (or a modal sheet).

Heading: "Filter by Category"

Multi-select category chips in a grid: BAR COCKTAIL / APPETIZER / ENTREE / DESSERT / BAKERY / etc.

"All Categories" chip at the top (deselects all others when tapped)

Active filter chips have brand-primary red background with white text

"APPLY FILTER" CTA button — full width, red

"Clear All" link above the button

When a filter is active, show a sticky filter bar below the sidebar on the main view: "[BAR COCKTAIL ×] [ENTREE ×] — Clear all"

SCREEN 13 — REVENUE CENTER FILTER

Same pattern as Category Filter but with station/section names.

Options: BAR / KITCHEN / GRILL / COLD KITCHEN / PASS / EXPO

Same multi-select chip UI

Active revenue center shown in the main view header area

SCREEN 14 — STAGGER MODE CONFIGURATION

Toggle: Stagger Mode ON/OFF

When ON, show:

"Release new orders every [___] minutes" — stepper (1–30 min)

"Maximum orders released at once" — stepper (1–10)

Preview timeline: visual diagram showing order release schedule

"SAVE" button + "Cancel" link

SCREEN 15 — SOUND SETTINGS (Sub-screen/Modal)

Heading: "Sound Settings"

Volume control: horizontal slider with speaker icon on left, value label (0–100%) on right

"Test Sound" button (play icon) next to the slider — plays the alert sound at current volume

Sound type picker:

New Order Alert — dropdown: Bell / Chime / Ding / Buzz

Urgent/Overtime Alert — dropdown: Alarm / Double Bell / Pulse

Service Bell (manual) — dropdown

Mute All toggle — ON/OFF, with label "Mute All Sounds"

When muted: show a "MUTED" badge prominently in the header

SCREEN 16 — PRINTER SETTINGS (Main Printing Device)

Heading: "Printer Settings"

Current device section:

"Main Printing Device" label

Device name + IP address + Online/Offline status dot

"CHANGE" button

Available Printers list:

Each printer: name + IP + status badge (Online green / Offline red / Low Paper amber)

Radio button to select as main printer

"TEST PRINT" button per printer

"SET AS MAIN PRINTER" CTA button — red, full width

Success state: green checkmark toast "Main printer updated"

SCREEN 17 — WEBSOCKET / SYNC SETTINGS

Heading: "Connection Settings"

Replace all technical jargon with plain language:

"Local Backup Server" (instead of edgeOS) — toggle ON/OFF

Description: "Keeps KDS working even if internet goes down"

"Backup Server Address" — editable IP field (only visible when toggle is ON)

Cloud Server section:

Status indicator: green dot "Connected" or red dot "Disconnected — tap to retry"

Server address: ws.eatos.net (non-editable, shown as reference)

Device info section:

Device Name: editable field

Last Order Number: read-only value + refresh icon

Sync actions:

"SYNC NOW" — large primary button (syncs both local and cloud)

"FORCE SYNC" — secondary outlined button (with warning: "This may cause brief interruption")

Connection log: last 3 sync events with timestamps

SCREEN 18 — LANGUAGE / LOCALE SETTINGS

This screen was in the old designs and must be restored.

Heading: "Language & Region"

Language scope toggle: "App Interface" / "Menu Items & Descriptions" / "Both"

Search bar: "Search languages..."

Language list with flags, sorted: currently selected at top with checkmark, then alphabetical

Each row: flag icon + language name + native name (e.g. "Spanish — Español")

Regional format preview:

Date format: 27 March 2026 / March 27, 2026 / 27/03/2026

Time format: 12h (2:34 PM) / 24h (14:34)

"SAVE CHANGES" CTA button

SCREEN 19 — PERFORMANCE / ANALYTICS DASHBOARD

This is a new screen competitors have and eatOS lacks — a major competitive gap.

Accessible from History → "Today's Performance" or a dedicated sidebar icon.

Header: "Kitchen Performance — Today"

Date range picker: Today / Yesterday / This Week / Custom

Key metrics row (4 stat cards):

Total Orders Served

Average Ticket Time (with target comparison: "18 min avg · target 15 min")

Fastest Ticket

Slowest/Longest Ticket

Charts row:

Bar chart: Orders per hour (x = hour, y = order count)

Line chart: Average ticket time by hour

Category breakdown table: orders and avg time per category (Appetizer / Entree / Dessert)

"Top 3 Slowest Items" list — item name + avg prep time

Export button (CSV) in top-right corner

INTERACTION STATES FOR ALL CARDS

Design every order card in ALL of these states:

State Visual Treatment New (just arrived) Red card body, urgent timer, subtle "NEW" badge top-right Acknowledged (SEEN) Orange body, timer amber, "IN PROGRESS" badge Partially complete Green checkmark per completed item, remaining items still bold Course fired Fired course section dimmed, other sections still active Served/Bumped Full grey wash, all items strikethrough, "SERVED" badge, card auto-collapses after 30s Overtime Dark red pulsing body, flashing timer, "OVERTIME" badge in alarm red Cancelled (item) Individual item greyed + strikethrough + "CANCELLED" red badge inline Recalled (from history) Blue left-border accent, "RECALLED" blue badge

NAVIGATION & FLOWS

Design complete user flows with transitions for:

Sign In → Main View (PIN entry → success animation → main KDS loads)

Receive New Order (order card slides in from right, subtle notification sound indicator)

Bump an Order (SEEN → IN PROGRESS → SERVED → card fades to grey, then auto-removes)

Course Fire (tap "FIRE MAINS" → confirm toast → mains section dimmed, apps/desserts still active)

Recall from History (history screen → tap RECALL → card reappears on main view with RECALLED badge)

Apply Category Filter (filter panel → select categories → APPLY → main view updates with filter bar visible)

Change Display Mode (Grid/List/Horizontal toggle → instant re-layout with smooth transition)

Settings → Sub-screen (settings list row tap → slide-in sub-panel from right)

ACCESSIBILITY REQUIREMENTS

Minimum touch target size: 44×44px on all interactive elements

Minimum contrast ratio: 4.5:1 for all text (WCAG AA)

All allergen information must be visible without relying on colour alone (use icons + text, not colour only)

All timer states must communicate urgency through both colour AND icon/animation (not colour alone)

Font sizes must be readable at arm's length (~50cm viewing distance) — nothing smaller than 12px in the interface

No hover-only states — all interactions must be accessible via tap

Dark mode must maintain all contrast ratios

WHAT NOT TO DO (Anti-Patterns to Avoid)

Based on the audit findings, explicitly DO NOT:

❌ Use a flat icon grid for Settings — use a grouped list with descriptions

❌ Use the same purple colour for both DINE IN card headers AND served/completed card state — they must be distinct

❌ Show allergen warnings in the same visual weight as modifier text — allergens must always stand out

❌ Use email + password as the primary login method — PIN pad is primary

❌ Bury Grid/List mode toggle inside Settings — put it directly on the main view

❌ Use the word "SEEN" as the only CTA — it implies viewed, not actioned. Use a clear state progression: SEEN → IN PROGRESS → SERVED

❌ Show "No Orders Right Now" as a flat empty state — make it positive and informative

❌ Expose developer tools (Instabug, debug modes) to kitchen staff

❌ Use a dotted/outline success icon for Password Updated — use a solid green checkmark

❌ Let the marketing carousel run behind the Forgot Password form — auth screens must be focused

❌ Make the sound settings mute button label ambiguous ("MUTE ON" is confusing) — use a clear toggle

❌ Use small timer text that turns red — use size + colour + animation together for urgency

❌ Truncate server name or table name — this is critical information for expediting

COMPONENT LIBRARY (Build These as Reusable Components)

<OrderCard> with variants: new / in-progress / seen / served / overtime / cancelled / recalled

<OrderTypeBadge> with variants: dine-in / take-out / delivery / banquet / catering

<CourseSection> — APPETIZER / ENTREE / DESSERT divider bar with fire button

<AllergenBadge> — red pill with allergen icon + text

<ModifierLine> — with variants: extra (blue) / remove (red strikethrough) / neutral (grey)

<TimerBadge> — with urgency states: ok / warning / critical / overtime

<SidebarNav> — with collapsed/expanded states + badge counts

<SettingsRow> — icon + label + description + right control (toggle/picker/arrow)

<StatusChip> — for order status: New / In Progress / Served / Recalled / Overtime

<FilterChip> — active/inactive states for category and revenue center filters

<ItemSummaryPanel> — with collapsed/expanded states + progress fractions

<QuickStatCard> — for analytics tiles: value + label + trend indicator

FINAL QUALITY CHECK

Before considering the design complete, verify:

[ ] Every card state designed (new, in-progress, seen, served, overtime, cancelled, recalled)

[ ] Allergen badges are visually prominent on ALL relevant cards

[ ] DINE IN = navy/black. NOT purple.

[ ] Served/completed cards = grey wash. NOT purple.

[ ] Settings is a grouped list, NOT an icon grid

[ ] PIN login is the default sign-in method

[ ] Empty state is positive and shows today's stats

[ ] Grid view has a direct toggle on the main view (not buried in Settings)

[ ] All 18 screens above are built

[ ] Course fire buttons exist on order cards

[ ] History screen has a RECALL button

[ ] Analytics/Performance screen exists

[ ] Language settings screen exists

[ ] All transitions and flows are designed

Reference documents attached: KDS_Design_Audit_Report.docx and KDS_Visual_Feedback_Report.docx

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://kds6.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3a5eb3d4-e432-4ee8-a856-17d95261c3ac).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
