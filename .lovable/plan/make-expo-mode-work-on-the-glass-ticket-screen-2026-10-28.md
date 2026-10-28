# Make Expo mode work on the Glass ticket screen

## Problem
When Expo mode is turned on, the other ticket screens switch to the Expo board (ready tickets, recalled tickets, Expo summary). The Glass screen never checks which mode is on, so it keeps showing the normal kitchen tickets and Summary panel. Expo looks like it does nothing.

## Fix
On the Glass ticket screen, when the mode is Expo:
- Show the Expo board in place of the kitchen tickets. Expo tickets already use the Glass ticket style.
- Replace the right-hand Summary panel with the Expo Summary panel, keeping pin, product filter and "send all" working.
- Make the left nav filters work in Expo: Home shows All, the Ready filter shows Ready, the Recalled filter shows Recalled. These match the Expo nav items that already exist.
- Keep the header, footer, Maya AI drawer, notifications, view toggle (Grid/Stagger/Horizontal) and theme working as they do now.
- Kitchen and Station modes on Glass stay the same.

Applies to desktop, tablet and phone, in light and dark themes.

## Technical details
- `src/pages/KdsGlassPage.tsx`: read `mode` from `useKDSMode()`. If it is `'Expo'`, render `ExpoView` (`controlledFilter` set from the nav, `hideTopControls`) and `ExpoSummaryPanel`. Their pinned, all-tickets and selected-products state and handlers mirror `MainOrderView.tsx` lines 247-290. Pass `expoTickets` from `useOrderStore()` as the fallback.
- Map sidebar `onFilterChange`/`onNavigate` targets (home / seen-orders / unseen-orders) to the expo filter, as in MainOrderView lines 935-937.
- Verify in the browser: switch to Expo on /kds/glass, check the board and summary at 1280, 1024 and 390, in light and dark.
