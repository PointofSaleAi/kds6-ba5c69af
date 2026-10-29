# Timeline Flow: move a ticket only when every product reaches that status

## What changes
On the live All page with the Timeline Flow board (and the Ticket Studio Timeline preview), a ticket moves to a column only when **all** of its products have reached that column's status:

- **New** — while any product is still Unseen or only Seen.
- **Preparing** — only when every product is Preparing (or further).
- **Ready** — only when every product is Ready (or further).
- **Served** — only when every product is Served.

If one product lags behind, the whole ticket stays in the lagging product's column. Tapping a single product moves the ticket only when it is the last one to change. Products that were cleared are ignored. Tapping the ticket's main button (which changes every product at once) still moves it straight to the next column.

Applies to all ticket styles, desktop/tablet/phone, light and dark. Seen, Unseen, History, Expo and other boards are unchanged.

## Technical details
- `src/lib/ticket-board.ts` `laneForStates`: it already uses the least-progressed product, but `seen` is ranked as Preparing. Change the rank map so `unseen`/`new`/`seen` = New, `preparing` = Preparing, `ready`/`done` = Ready, `served` = Served.
- Both callers (`glass/TicketBoard.tsx` and `MainOrderView.tsx`) already pass every product's state, so no other change is needed. Then check in the preview that tapping one product of a multi-product ticket keeps it in place until the last product changes.
