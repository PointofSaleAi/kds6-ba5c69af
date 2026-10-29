# Timeline Flow lanes: New → Preparing → Ready → Served

## What changes
- **Lanes, left to right:** New → Preparing → Ready → Served. "Cooking" is renamed to Preparing, and the Plating lane is removed.
- **Lane rules:** a ticket sits in the lane of its least-progressed item.
  - **New:** some items are still unseen.
  - **Preparing:** everything is seen and at least one item is still being prepared.
  - **Ready:** every item is Ready.
  - **Served:** every item is Served.
- **Tapping through:**
  - On a ticket in the Ready lane, tapping the Ready button moves it to the Served lane.
  - On a ticket in the Served lane, tapping Served takes it off the board and puts it in the History page. It can still be recalled from History, as today.
- Lane colours: New red, Preparing orange, Ready green, Served grey.
- This applies to the live All page and to Ticket Studio's Timeline Flow preview. Glass and the other styles behave the same. It works on desktop, tablet and phone, in light and dark.
- Seen, Unseen and History pages stay unchanged.

## Technical details
- `src/lib/ticket-board.ts`: set `TIMELINE_LANES` to new / preparing / ready / served. `laneForStates` returns the least-progressed stage among active items:
  - unseen → new
  - seen/preparing → preparing
  - ready/done → ready
  - served → served
- Glass (`glass/TicketBoard.tsx`): use `ticketStage(t, itemStages)` for the lane. The existing `stepTicket` already moves ready → served → cleared, and cleared tickets drop off the home view into History. Confirm with Playwright that a served-stage ticket stays on home until Served is tapped.
- Non-Glass (`MainOrderView.tsx`): map item status the same way. Confirm the Ready-lane and Served-lane buttons on the existing cards move tickets the same way; if a card's final button currently skips the Served step, route it through it only in Timeline Flow.
- `TicketStudioSkeleton.tsx` preview: reuse the shared `TIMELINE_LANES` so the labels match.
- Check with Playwright: tap a ticket New → Preparing → Ready → Served → History on `/kds/glass` and `/kds/v3` at 1141×742, then check 1024×1366 and 390×844 in light and dark.
