# Apply the Ticket Studio board to the live All tickets page

## What you'll get
- The board you pick in Ticket Studio (Distance View, Focus Lane or Timeline Flow) is saved and used on the live **All** tickets page.
- Everything chosen under Personalize (Style, Layout spacing, Text Size, Ticket Identifier, Theme, Ticket Aging, Order Type colours) already reaches the live tickets and keeps doing so.
- Only the arrangement of tickets changes. Ticket buttons and gestures stay the same: Seen → Preparing → Ready → Served, recall, hold, 86, recipe, long-press, undo. The footer, summary panel, filters, sort and Expo stay the same too.
- The Seen, Unseen and History pages stay exactly as they are today.

## How each board looks on the All page
- **Distance View:** today's All page, unchanged. It's the default.
- **Focus Lane:** the most urgent ticket (oldest first, or the one at the top of your chosen sort) sits large in the center, with the next tickets around it. Tap a side ticket to bring it to the center. Extra tickets appear in a scrollable row underneath.
- **Timeline Flow:** four lanes, left to right, built from each ticket's real state:
  - **New:** nothing on the ticket has been seen yet.
  - **Cooking:** at least one item is Seen or Preparing.
  - **Plating:** some items are Ready, but not all.
  - **Ready:** every item is Ready and the ticket is waiting to be Served.

  Tickets move to the next lane on their own as you tap them through. Each lane scrolls on its own and shows a count.
- The Grid, Horizontal and Stagger buttons in the footer still work for Distance View. In Focus Lane and Timeline Flow, the board sets the arrangement.
- Works on desktop, tablet and phone in light and dark. On phones, Focus Lane stacks the center ticket on top, and the Timeline lanes swipe sideways.

## Technical details
- New `src/lib/ticket-board.ts`: `readStoredBoard()` / `writeStoredBoard()` using the key `posai-ticket-board` (default `distance-view`), plus a small subscribe event so open screens update live. `TicketStudioSkeleton.tsx` reads its initial `selectedBoard` from this and writes to it whenever the board changes.
- New shared layout wrappers, `LiveFocusLane` and `LiveTimelineLanes`, that take the already filtered and sorted ticket list plus a `renderTicket(ticket)` callback. Real ticket cards are reused, so all actions are untouched.
- Glass: in `glass/TicketBoard.tsx`, when `view === 'all'` and the saved board isn't distance-view, pass its tickets (each card rendered with its existing `TicketCard`) into the matching wrapper. The lane is worked out from each ticket's item stages.
- Other styles: in `MainOrderView.tsx`, apply the same switch only for the All filter, rendering each ticket with its current variant card.
- Seen, Unseen, History and Expo code paths are left alone.
- Check with Playwright: pick each board in Ticket Studio, open the All page, tap a ticket through Seen → Ready, and confirm it moves lanes. Confirm Seen, Unseen and History are unchanged. Check at 1141×742, 1024×1366 and 390×844, in light and dark, using Glass and one other style.
