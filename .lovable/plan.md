## Goal

For tickets that have unacknowledged POS/kitchen messages or unseen order notes, do not remove the ticket from Home even after the last product is 3rd-tapped. Keep the ticket pinned (showing only the message and/or note) until the kitchen acknowledges the message and sees the note. Once both are cleared, the ticket auto-removes from Home and moves to History.

Tickets with no notes/messages keep current behavior: 3rd-tapping the last product removes the ticket immediately.

## Behavior Rules

1. **3rd-tap on a product** still moves that product to History as it does today.
2. **Order becomes "empty of products"**: if the ticket has unacknowledged messages OR unseen notes, keep the ticket on Home as a stub showing the remaining message banner and/or note. Hide the (now empty) courses area.
3. **Acknowledge message** + **mark note seen**: when the last pending acknowledgment is cleared on an empty-of-products ticket, auto-remove the ticket from Home and append it to History.
4. **3rd-tap on the ticket header** (bulk dismiss): if any message is unacknowledged or any note is unseen, block the dismissal and show a brief inline toast: "Acknowledge messages and notes before clearing the ticket." Otherwise behave as today.
5. Applies uniformly to Orders 22, 23, and any future ticket with messages/notes.

## Files to Change

- `src/pages/MainOrderView.tsx`
  - Update `handleItemDismiss` so that when removing the last product makes `updatedCourses.length === 0`, check whether the ticket has any unacknowledged kitchen messages (from `useKitchenMessages.getMessagesForOrder(orderId)`) or any unseen order notes. If so, keep the ticket in `orders` (with empty courses) instead of dropping it. Otherwise drop as today.
  - Add an effect that watches `orders`, `kitchenMessages`, and the notes-acknowledged state. For any ticket with empty courses AND no pending messages AND all notes seen, move it to History and remove from Home.
  - Pass an `isAcknowledgmentPending(orderId)` helper into `OrderCard` so it can block bulk-header dismissal and show the toast.

- `src/components/kds/OrderCard.tsx`
  - In `handleBump` (and the header tap that triggers dismissal at the 3rd-tap stage), call the helper. If pending, show toast and bail out. Otherwise proceed.
  - Render the card body gracefully when `order.courses` is empty: hide the courses container, keep the header, message banner, allergen strip, and notes section visible.

- `src/hooks/use-kitchen-messages.tsx` (read-only use)
  - Use existing `getMessagesForOrder(orderId)` and `m.status === 'pending'` to determine unacknowledged messages. No changes needed here.

- Order notes acknowledgement
  - Use the existing notes-acknowledged state already wired through `OrderNotesSection` / `onAcknowledgeNotes`. Lift or expose it to `MainOrderView` so we can read per-order acknowledgement status. If currently local to `OrderCard`, promote it to a `Map<orderId, boolean>` in `MainOrderView`.

## Edge Cases

- Recalled tickets (status `recalled`): same rule applies.
- Cancelled items: count as removed (do not block).
- Tickets that start with no products but do have a message (rare): kept on Home until the message is acknowledged.
- Step-back (undo) on a product after acknowledgment is fine, products reappear and the normal flow resumes.

## Out of Scope

- No design changes to the message banner or note section visuals.
- No change to History card display.
- No change to Expo view (tickets there already follow `status === 'served'`).

## Technical Notes

The auto-remove effect should be guarded by a stable check (compare the set of pending IDs before mutating state) to avoid render loops. The "empty + pending" stub ticket retains its `id`, `orderNumber`, `timeReceived` so messages stay linked correctly.
