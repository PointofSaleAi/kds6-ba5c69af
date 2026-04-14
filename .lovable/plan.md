

# Kitchen Messages Feature — Implementation Plan

## Overview
Port the "Communicate Message to KDS" feature from the reference project (pointofsaleai-6.0) into this KDS project. This adds two surfaces for kitchen messages sent from POS:

1. **Inside ticket cards** — order-linked messages appear on the matching ticket with Acknowledge and Reply actions
2. **In the Alerts panel** — all messages (linked and unlinked) appear with Acknowledge and Reply

Since this project has no Supabase backend, all data will use mock messages and local state (same pattern as existing mock orders).

---

## New Files

### 1. `src/types/kitchen-message.ts`
- `KitchenMessage` interface: `message_id`, `message_text`, `employee_name`, `employee_role?`, `terminal_name?`, `linked_order_id?`, `linked_order_number?`, `table_number?`, `timestamp`, `status: 'pending' | 'acknowledged'`, `acknowledged_at?`
- `KitchenReply` interface: `reply_id`, `message_id`, `reply_text`, `timestamp`, `source: 'kds'`

### 2. `src/data/mock-kitchen-messages.ts`
- 4-5 mock messages: some linked to existing mock order IDs (e.g. `ord-001`, `ord-003`), some unlinked (general kitchen messages)
- Messages from different employees/terminals

### 3. `src/hooks/use-kitchen-messages.tsx`
- Context provider wrapping the app with message state
- `messages`, `replies` state arrays
- `acknowledgeMessage(id)` — sets status to acknowledged
- `sendReply(messageId, text)` — adds reply to local state
- `getMessagesForOrder(orderId)` — returns linked messages
- `pendingCount` — number of unacknowledged messages

### 4. `src/components/kds/KitchenMessageSection.tsx`
- Renders inside ticket cards (below Order Notes, above items)
- Shows violet/purple gradient header bar with Megaphone icon and "Message from [terminal]"
- Message text body
- Acknowledge button (white, full-width) and Reply button (outlined)
- Once acknowledged: shows green checkmark + timestamp, reply still available
- Threaded replies shown below with left border indent
- Styled to match reference project's look adapted to this project's light theme

### 5. `src/components/kds/KitchenReplyDialog.tsx`
- Modal dialog for composing replies
- Left column: original message reference, chip-based input with preset suggestions ("Got it", "On its way", "5 mins", "Need more time", "Out of stock"), free-text input, character counter (100 max), Cancel + Send buttons
- No QR code column (simplification for this project — no backend)

---

## Modified Files

### 6. `src/components/kds/OrderCard.tsx`
- Import `useKitchenMessages` and `KitchenMessageSection`
- After `OrderNotesSection`, render `KitchenMessageSection` for each message linked to this order
- Pass acknowledge/reply handlers

### 7. `src/pages/AlertsPanel.tsx`
- Add a "Kitchen Messages" tab/section alongside existing alerts
- Add two filter pills at top: "Alerts" | "Kitchen Messages"
- Kitchen Messages view: list all messages (pending first) with violet card styling matching the reference
- Each message card shows: header (Megaphone icon, terminal name, timestamp), meta row (employee name/role, order number if linked, table if linked), message body, Acknowledge + Reply buttons
- Pending count badge on Kitchen Messages filter pill
- Reply opens `KitchenReplyDialog`

### 8. `src/components/kds/KDSSidebar.tsx`
- Update Alerts badge count to include pending kitchen message count (existing alert count + pending messages)

### 9. `src/App.tsx` or `src/main.tsx`
- Wrap app with `KitchenMessagesProvider`

---

## Technical Details

- **No backend required** — all state is local React context with mock data, matching the project's existing pattern
- **Styling** — adapted from the reference project's dark theme to this project's light theme (violet/indigo accents kept for message branding)
- **Reply presets** — hardcoded chip suggestions: "Got it", "On its way", "5 mins", "Need more time", "Out of stock", "Cooking now"
- **Flash animation** — new pending messages get a brief pulse animation on arrival (reuse existing `animate-pulse` utility)
- **Touch targets** — all buttons minimum 44x44px per project guidelines

