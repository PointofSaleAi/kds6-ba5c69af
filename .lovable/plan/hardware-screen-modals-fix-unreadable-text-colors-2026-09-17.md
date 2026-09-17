# Hardware screen modals: fix unreadable text colors

## Problem
All four modals opened from the Hardware settings screen render secondary text in the palest grey token (`text-text-muted`, ~62% lightness in light theme), which is nearly invisible against the light modal card background (`bg-surface-card`). The screenshots confirm it: section headers ("VOLUME", "AVAILABLE PRINTERS (4)", "LOCAL BACKUP SERVER", etc.), status labels ("Online"/"Offline"/"Low paper"), IP addresses, field labels ("Device Name", "Backup Server Address"), and helper notes ("Accepted formats: MP3, WAV - Max size: 2MB", "Keeps Kitchen Display System working...") all wash out.

## Fix
Switch every unreadable `text-text-muted` occurrence to the darker, theme-aware `text-text-secondary` token (45% light / 68% dark) — the same token already used for readable secondary copy across the rest of Settings. This is a class swap only; no layout, spacing, or behaviour changes.

### Files and specific changes

**`src/pages/PrinterRoutingModal.tsx`** (KOT + Label printer modal)
- Header icon `Printer` (line ~119): `text-text-muted` → `text-text-secondary`.
- "Available printers (n)" section header (line ~140): → `text-text-secondary`.
- StatusDot label text "Online/Offline/Low paper" (line ~51): → `text-text-secondary` (the colored dot stays).
- Printer IP address line (line ~167): → `text-text-secondary`.

**`src/pages/SoundSettings.tsx`** (Sound modal)
- Header icon `Volume2` (line ~189): → `text-text-secondary`.
- Section headers "Volume" (206), "New Order Alert Sound" (233), "Other Alert Sounds" (337), "Master" (344): → `text-text-secondary`.
- Upload icon `Upload` (line ~310): → `text-text-secondary`.
- "Accepted formats: MP3, WAV - Max size: 2MB" helper (line ~314): → `text-text-secondary`.
- Mute icon `VolumeX` (line ~350): → `text-text-secondary`.

**`src/pages/WebSocketSettings.tsx`** (Connection modal)
- Header icon `Server` (line ~48): → `text-text-secondary`.
- Section headers "Local Backup Server" (58), "Cloud Server" (90), "Device Info" (104), "Sync" (127), "Recent Sync Events" (147): → `text-text-secondary`.
- Helper text "Keeps Kitchen Display System working..." (65): → `text-text-secondary`.
- Field labels "Backup Server Address" (77), "Device Name" (106), "Last Order Number" (116): → `text-text-secondary`.
- "Server: ws.posai.com" (99): → `text-text-secondary`.
- RefreshCw icon (120): → `text-text-secondary`.
- "May Cause a Brief Interruption" (141): → `text-text-secondary`, and bump from `text-[10px]` to `text-xs` (12px) to meet the project's 12px minimum.
- Sync-log timestamp (151): → `text-text-secondary`.

### Out of scope
- Radio-circle borders (`border-text-muted`) — borders, not text; leave unchanged.
- Modal backdrop, card background, layout, spacing, touch targets, and button colors — unchanged.
- The `PrinterSettings.tsx` standalone page (not opened from Hardware; its StatusDot uses `bg-green-500`/`bg-destructive`/`bg-amber-500` dots with `text-text-muted` labels — same readability issue but a separate screen).

## Verification
- Open each Hardware modal (KOT Printer, Label Printer, Sound, Connection) on desktop (1280), tablet (1024), and mobile (390) in light and dark themes.
- Confirm all section headers, status labels, IP addresses, field labels, and helper notes are clearly readable against the modal background in both themes.
- Confirm no text is clipped and no spacing changes.
- Confirm `/tmp/observability/build-errors.log` reports a clean build.
