## Root cause

`MainOrderView.tsx` already builds `seenScreenOrders` and `unseenScreenOrders` using the correct per-item lifecycle rule and passes them into the two screens. But both `SeenOrdersScreen.tsx` and `UnseenOrdersScreen.tsx` re-apply a ticket-level filter on the `orders` prop:

- `SeenOrdersScreen` line 56: `.filter(o => o.status !== 'served' && seenOrderIds.has(o.id))`
- `UnseenOrdersScreen` line 56: `.filter(o => o.status !== 'served' && !seenOrderIds.has(o.id))`

`seenOrderIds` is only set when **every** item in a ticket has been touched (see `OrderCardV2.tsx` `allTouched` check). So when a user marks a single product as seen, the ticket has one item with a lifecycle but its id is not in `seenOrderIds`. `SeenOrdersScreen` then discards the whole ticket, which is exactly the reported symptom.

## Fix

Have each screen trust the pre-filtered `orders` prop from `MainOrderView` and apply only station-view refinement.

### `src/pages/SeenOrdersScreen.tsx`
- Remove `seenOrderIds` from the store destructure.
- Change the base list to `orders.filter(o => o.status !== 'served')`. Do not check `seenOrderIds`.
- Keep the station-view refinement block unchanged.

### `src/pages/UnseenOrdersScreen.tsx`
- Remove `seenOrderIds` from the store destructure.
- Change the base list to `sourceOrders.filter(o => o.status !== 'served')`. Do not check `!seenOrderIds`.
- Keep the station-view refinement block unchanged.

`MainOrderView`'s memos already:
- Seen: keep tickets containing at least one item with a lifecycle, and inside each ticket keep only those seen items.
- Unseen: strip items whose lifecycle is set; drop tickets with no unseen items remaining.

Tickets screen is untouched by this change.

## Verification

1. Open `/kds/v3`, tap the eye icon on one product in a ticket.
2. Navigate to Seen: that ticket now appears, containing only the touched product.
3. Navigate to Unseen: the same ticket appears without that product; other unseen products remain.
4. Advance / recall the item and confirm it moves between Seen and Unseen correctly.
5. Confirm the main Tickets screen still shows every product on every ticket.
