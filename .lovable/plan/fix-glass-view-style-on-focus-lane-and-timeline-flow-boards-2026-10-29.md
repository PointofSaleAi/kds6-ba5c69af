# Fix Glass View style on Focus Lane and Timeline Flow boards

## Why it happens
When the Style is Glass View, Ticket Studio always shows the same full Glass board. It ignores which board you picked, so Focus Lane and Timeline Flow look the same as Distance View.

## What will change
- **Distance View + Glass:** stays as it is now (full Glass board).
- **Focus Lane + Glass:** the Focus Lane layout (big center ticket with smaller tickets around it) shows Glass-style tickets.
- **Timeline Flow + Glass:** the Timeline Flow layout shows Glass-style tickets, one per order type, with the right header colours.
- Spacing, text size, ticket identifier, theme and wait-time colours keep working on all three boards.
- Works on desktop, tablet and phone, in light and dark.

## Technical details
- `TicketStudioSkeleton.tsx`: render the full `TicketBoard` only when `styleRoute === 'glass' && boardId === 'distance-view'`; otherwise fall through to the Focus Lane / grid branches.
- `BoardTicketPreview.tsx`: remove the `styleRoute !== 'glass'` exclusion so Glass goes through `StyledRouteTicket` → `SelectedVariantPreview` with `routeOverride="glass"` (its single-ticket Glass preview), passing order type and aging override so each ticket matches.
- Check the Focus Lane center ticket fits without overflow; verify with Playwright at 1141×742, 1024×1366, 390×844 in light and dark.
