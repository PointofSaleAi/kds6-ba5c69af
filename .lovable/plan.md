# Make Timeline Flow look like a timeline board

## Why it happens
Timeline Flow is described as "New, Cooking, Plating, Ready lanes", but Ticket Studio never builds those lanes. It shows the same plain 4-across ticket grid as Distance View. The small "Cooking Lane" label that used to sit on each ticket also disappeared once the Style choice started controlling the ticket design.

## What will change
- The Timeline Flow board shows four side-by-side lanes, left to right: **New → Cooking → Plating → Ready**.
- Each lane has a header with its name, a coloured marker and a ticket count, plus a thin arrow or connector between lanes so the left-to-right flow is clear.
- The sample tickets are split across the lanes (2 per lane) and stack top-to-bottom inside each lane. Wait-time colours get older from left to right, so Ready tickets show as the oldest.
- The tickets use whatever Style is picked (Glass View included). Spacing, text size, identifier, theme and order-type colours keep working.
- Lanes scroll vertically on their own. On phones and narrow tablets, the lanes scroll sideways instead of squashing the tickets.
- Distance View and Focus Lane stay the same.

## Technical details
- `TicketStudioSkeleton.tsx`: add a `TimelineFlowBoard` component (like `FocusLaneBoard`), shown when `boardId === 'timeline-flow'`, including for Glass style. Build a 4-column flex/grid of lanes with `gap={boardGap}`, lane headers using semantic tokens, and tickets rendered through `BoardTicketPreview` with `styleRoute`, each ticket's aging set to `base + laneIndex * 120s`.
- Lane minimum width is about 220px, with `overflow-x-auto` on narrow screens.
- Check with Playwright at 1141×742, 1024×1366 and 390×844, in light and dark, using Glass and one other style.
