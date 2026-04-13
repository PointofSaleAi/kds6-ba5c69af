

## Problem

When a user taps the "SEEN" button on a ticket card, the order is not added to the `seenOrderIds` set in the global store. The Seen/Unseen screens filter orders based on this set, so tickets never move between screens.

`toggleOrderSeen` exists in the order store but is never called from `OrderCard`.

## Plan

### 1. Wire `toggleOrderSeen` into OrderCard

- Add an `onMarkSeen` optional prop to `OrderCardProps`
- In `handleTicketAdvance`, when `ticketState === 'seen'` (the first tap), call `onMarkSeen?.(orderId)` to mark the order as seen in the global store
- In `handleTicketRecall`, when recalling back to the initial "seen" state (clearing all statuses), call `onMarkSeen?.(orderId)` again to toggle it back to unseen

**File**: `src/components/kds/OrderCard.tsx`

### 2. Pass `toggleOrderSeen` from MainOrderView to OrderCard

- Destructure `toggleOrderSeen` from `useOrderStore()` in MainOrderView
- Pass it as `onMarkSeen={toggleOrderSeen}` to every `<OrderCard>` rendered on the Home screen

**File**: `src/pages/MainOrderView.tsx`

### 3. Pass `toggleOrderSeen` in SeenOrdersScreen and UnseenOrdersScreen

- Import and use `toggleOrderSeen` from the order store in both screens
- Pass it as `onMarkSeen` to every `<OrderCard>` rendered in those screens
- This ensures tapping the eye/recall button on Seen or Unseen screens also syncs state

**Files**: `src/pages/SeenOrdersScreen.tsx`, `src/pages/UnseenOrdersScreen.tsx`

### What stays unchanged
- KDS Home screen layout and behaviour (unchanged)
- Sidebar navigation structure (unchanged)
- Summary panel (unchanged)
- Order store shape (no new fields, just wiring existing `toggleOrderSeen`)

