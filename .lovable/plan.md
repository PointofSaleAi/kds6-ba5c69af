## Goal
Every ticket layout (Default and v1–v6) must react to the shared order store the same way. Marking a product done should push it into History; acknowledging a ticket should move it to Seen; bumping should archive it. Layout selection in Settings should apply instantly to Home, Seen, Unseen and History.

## Why it's broken today
`OrderCardV1…V5` only accept `onBump`. All other lifecycle events (item-done, mark-seen, item-dismiss, step-back) are handled with local component state. Since `MainOrderView` never passes those callbacks to the variants, the shared `useOrderStore` never learns about the action:
- Product marked "done" inside a v-card → stays local, never appears in History.
- Ticket viewed on Unseen → tap does not call `toggleOrderSeen`, so it never moves to Seen.
- Bump animation calls `onBump` correctly, but only for the whole ticket.

Layout selection wiring already exists (`readStoredTicketsRoute` + `TICKETS_ROUTE_CHANGE_EVENT` + `renderOrderCard`), so the remaining work is behavioural parity, not routing.

## Plan

1. **Extend variant card props (shared shape)**
   Add optional callbacks to `OrderCardV1…V5` matching the Default card:
   ```ts
   onBump?: (orderId: string) => void;
   onMarkSeen?: (orderId: string) => void;
   onItemDone?: (orderId: string, itemId: string) => void;      // per-product done
   onItemDismiss?: (orderId: string, item: OrderItem) => void;  // per-product remove
   onStepBack?: (orderId: string) => void;
   isSeen?: boolean;
   ```

2. **Route local interactions through the store**
   Inside each variant:
   - The 3-step product tap (Unseen → Preparing → Done) calls `onItemDone(order.id, product.id)` on the final tap instead of only updating local state.
   - The tap-again "remove" on a done product calls `onItemDismiss(order.id, item)`.
   - First tap on the ticket header/body (or the existing "mark seen" affordance) calls `onMarkSeen(order.id)`; visual seen state derives from the `isSeen` prop.
   - Keep the existing bump animation, but ensure it fires `onBump(order.id)` when every product is done (already true; verify).

3. **Wire callbacks from `MainOrderView.renderOrderCard`**
   In every `withSelectedTicketSettings(<OrderCardV# … />)` branch, pass:
   ```tsx
   onBump={handleBump}
   onMarkSeen={toggleOrderSeen}
   onItemDone={markItemDone}
   onItemDismiss={handleItemDismiss}
   onStepBack={handleStepBack}
   isSeen={seenOrderIds.has(displayOrder.id)}
   ```
   Use the original `displayOrder.id` (not the derived `v#Order`) so store lookups match.

4. **History rendering in variants**
   `MainOrderView` already routes History through `renderOrderCard`, and `useOrderStore` moves served orders into `historyOrders`. Once `onBump` and `onItemDismiss` are wired, served tickets and dismissed items will appear in History automatically. Verify the History branch (`isHistory`) still calls `renderOrderCard(order)` for the selected variant — no code change expected, only confirmation.

5. **Seen / Unseen parity**
   `SeenOrdersScreen` / `UnseenOrdersScreen` already receive `renderCard={renderOrderCard}` and derive lists from `seenOrderIds`. After step 3, tapping a variant card in Unseen calls `toggleOrderSeen`, which moves it into Seen on the next render. No prop-shape change needed in these screens.

6. **Live layout switching**
   Already implemented via `TICKETS_ROUTE_CHANGE_EVENT` + `storage` listener in `MainOrderView`. Confirm during QA that changing the layout in Settings re-renders all four screens without a refresh.

7. **QA (Playwright)**
   Reproduce end-to-end on `/kds/v3`:
   - Tap a product 3× → verify it appears in History.
   - Tap the ticket to seen → verify it moves from Unseen to Seen.
   - Bump full ticket → verify it disappears from Home and appears in History.
   - Change layout in Settings to v5 → verify Home, Seen, Unseen and History all switch immediately.
   Repeat for one other variant to confirm parity. Run `bunx tsgo --noEmit`.

## Files to touch
- `src/components/kds/variants/OrderCardV1.tsx`
- `src/components/kds/variants/OrderCardV2.tsx`
- `src/components/kds/variants/OrderCardV3.tsx`
- `src/components/kds/variants/OrderCardV4.tsx`
- `src/components/kds/variants/OrderCardV5.tsx`
- `src/pages/MainOrderView.tsx` (only the variant branches inside `renderOrderCard`)

## Out of scope
- Visual redesign of any variant.
- Changing the Default card behaviour.
- Changing the layout-picker UI in Settings.
