# Notifications drawer: cover the header, use full height

## What's wrong now
- The blurred layer sits below the top header (header is drawn at a much higher stacking level), so the header stays sharp while everything else blurs.
- The drawer starts below the header and stops above the footer, so it doesn't fill the screen.

## Changes
1. Raise the blurred backdrop above the header and footer so the whole screen — including the top header — is dimmed and blurred.
2. Raise the drawer itself above that backdrop so it stays fully sharp and tappable.
3. Make the drawer span the full screen height: start at the very top and end at the very bottom (keeping the small 8px breathing gap and its right-edge position), instead of starting under the header.

Nothing else changes: panel colour, rounded corners, tabs, rows, actions, open/close animation and tap-outside-to-close all stay as they are.

## Technical notes
In `src/pages/AlertsPanel.tsx`:
- Backdrop `<motion.div>`: `z-40` → `z-[9997]` (header is `z-[9996]`).
- Drawer wrapper: `z-50` → `z-[9998]`; style `top` becomes `0` (plus training-bar offset) and `bottom` becomes `0`, dropping the `insets.top`/`insets.bottom` dependency; `right: insets.right` retained.
- Verify light/dark themes at desktop, tablet and portrait sizes.
