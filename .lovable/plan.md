## Root cause

`OrderCardV2` tracks item state in two places:
- Local `rowStates` (drives the card UI)
- Shared `itemLifecycles` in `useOrderStore` (drives Seen/Unseen screen filtering in `MainOrderView`)

Per-item taps go through `toggleRow` / `undoRow`, which call `syncLifecycle`, so the Seen screen updates correctly.

The ticket-level SEEN → PREPARING → READY → SERVED button uses different paths that mutate only local state:
- `handleTicketAdvance` calls `setAllRows('cooking' | 'ready', ...)` and `runBumpAnimation`, none of which call `syncLifecycle`.
- `handleTicketRecall` calls `setRowStates({})` to walk backwards, again without touching `itemLifecycles`.

Because `MainOrderView.seenScreenOrders` filters by `itemLifecycles[item.id]`, a ticket advanced via its ticket-level button never appears in the Seen screen (and if one item was individually seen before, tapping the ticket button doesn't add the rest either).

## Fix

Make every ticket-level state change also sync the shared lifecycle so the Seen/Unseen screens match the card.

### `src/components/kds/variants/OrderCardV2.tsx`

1. `setAllRows(target, from?)`: after computing `next`, for every item whose row state actually changed, call `syncLifecycle(order.id, item.id, next[item.id])`. This covers the SEEN → PREPARING and PREPARING → READY ticket transitions.

2. `runBumpAnimation`: in the per-item `setTimeout` that flips a row to `'done'`, also call `syncLifecycle(order.id, p.id, 'done')`. This covers READY → SERVED via the ticket button. (The initial `'loading'` sweep can stay local, since `rowStateToLifecycle('loading')` already maps to `preparing`; syncing on the final `'done'` is what the Seen screen needs.)

3. `handleTicketRecall`: before `setRowStates({})` in each branch (`done → ready`, `ready → preparing`, `preparing → seen`), sync each item's lifecycle to the target row state. For the `preparing → seen` recall, sync to `null` (idle) so those items leave the Seen screen, matching how `undoRow` already behaves for individual products.

No changes to `MainOrderView`, `SeenOrdersScreen`, `UnseenOrdersScreen`, or the order store are needed. `OrderCardV3` and other variants use their own paths and are out of scope for this bug.

## Verification

1. On `/kds/v3`, open a fresh ticket and tap the ticket-level SEEN button once.
   - Seen screen now lists the ticket with all its items.
   - Unseen screen no longer lists them.
2. Tap the eye icon on a single item first, then tap the ticket-level advance button.
   - Seen screen shows the full ticket (all items), not just the one item.
3. Advance the ticket all the way to SERVED, then use ticket-level recall.
   - Items reappear in Unseen after the final recall step (preparing → seen).
4. Confirm the Tickets screen still shows all items unchanged and Expo view mirrors the same lifecycle states.
