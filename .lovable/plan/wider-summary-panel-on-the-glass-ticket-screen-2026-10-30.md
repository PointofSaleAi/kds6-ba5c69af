# Wider Summary panel on the Glass ticket screen

## Current sizes (your 1140px-wide screen)

Worked out from the ticket screen's sizing rules. I haven't measured these on screen yet.

- Left rail: 56px
- Summary panel: 180px
- Ticket board: about 904px
- Space between tickets: about 10px (also about 10px at the left and right edges of the board)
- Ticket width: about 290px each, 3 per row
- Smallest a ticket is allowed to get: 250px. Below that, the board drops to fewer tickets per row.

The tickets stretch to fill whatever space is left. Any width the panel gains has to come from the tickets, the gaps, or the edges.

## Proposal

- Summary panel goes from 180px to 240px (60px wider).
- The edge space at the left and right of the board goes from about 10px to 0. Each ticket keeps the same 10px gap between its neighbours.
- Result on your screen: still 3 tickets per row, each about 277px wide (about 13px narrower than today, still well above the 250px minimum).
- Tablet and phone sizes: the same rules apply. Smaller screens keep their current number of tickets per row wherever there's still room for 250px tickets.
- The folded (collapsed) panel keeps its current size.

If you'd rather keep the tickets at exactly 290px, the only option is a panel that floats over the board while open and covers the rightmost tickets.

## Technical details

- `ItemSummaryPanel.tsx`: `w-[180px]` becomes `w-[240px]`. `ExpoSummaryPanel` gets the same change so Expo mode matches.
- `glass/TicketBoard.tsx`: drop the outer padding from the `colCount` and `columnWidth` calculations and from the board's padding. The gap between tickets stays as it is.
- Check at 1140, 1280, 1024 and 390 wide, in light and dark themes.
