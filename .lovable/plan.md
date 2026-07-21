## Goal
Make History, Seen Orders, and Unseen Orders render tickets with the same layout, sizing, spacing, and selected ticket-card design as the main Tickets screen.

## Verified issues from the current code
- The main Tickets screen uses `staggerMode || viewMode === 'stagger'`, but Seen and Unseen only use `viewMode`. This can make Tickets render as stagger while Seen and Unseen render as grid.
- Seen Orders has a different stagger layout implementation than the main Tickets screen. It uses a flex-wrap layout, while Tickets uses distributed columns.
- History still has a default-layout special case that renders `HistoryOrderCard`, which is a separate card design from the main ticket card.
- Card rendering is shared partially, but the screen layout wrappers are still separate enough to drift.

## Plan
1. Add one shared effective board mode in `MainOrderView`:
   - If Stagger Mode is enabled, all four screens use stagger.
   - Otherwise they use the selected footer view mode.

2. Use the same board layout rules everywhere:
   - Tickets
   - History
   - Seen Orders
   - Unseen Orders

3. Update Seen and Unseen screens to use the same stagger column distribution as the main Tickets screen instead of their own flex-wrap layout.

4. Remove the default-only History card visual mismatch:
   - History should render through the same selected ticket-card layout as Tickets.
   - Keep recall behavior at ticket level and product level, but do not swap to a separate card design just for History.

5. Keep existing behavior intact:
   - Selected ticket layout from Settings still controls all screens.
   - Station filtering remains applied consistently.
   - Summary panel remains unchanged.
   - Expo path remains untouched because it is intentionally different.

## Validation
After implementation, check the four screens at the same layout setting:
- Tickets
- History
- Seen Orders
- Unseen Orders

Confirm card header, row density, column width, spacing, and selected ticket variant match across screens.