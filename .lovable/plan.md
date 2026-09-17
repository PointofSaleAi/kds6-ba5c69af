# Remove the empty space in Grid and Stagger views

## Goal
Use the available ticket-board width efficiently so the shown landscape kitchen display presents four tickets across instead of three tickets followed by a large empty strip.

## Changes
- Replace the rigid Glass ticket-column sizing shared by Grid and Stagger with container-aware column sizing.
- Use four evenly distributed columns when the board has enough room, allowing each ticket frame to flex slightly while keeping its text, controls, and touch targets unchanged.
- Keep Grid rows aligned and apply the same column widths to Stagger’s shortest-column packing, so both modes use the board consistently.
- Retain responsive fallbacks: reduce the column count on narrower tablet and mobile widths rather than compressing tickets below a kitchen-readable minimum.
- Preserve Horizontal view, the Summary panel, navigation rail, ticket lifecycle, sorting, and saved view choice.

## Technical details
- Update the width-to-column calculation and the fixed column styles in `TicketBoard` only.
- Account for the left navigation and 180px Summary panel through the ticket board’s measured container width, not viewport-specific guesses.
- Keep the existing Glass scale and ticket internals unchanged; distribute residual width across tracks instead of leaving it unused.

## Verification
- Check Grid and Stagger at the supplied landscape size with the Summary panel open: four tickets across and no large right-side gap.
- Check expanded/collapsed navigation and Summary panel states.
- Check desktop, landscape tablet, portrait tablet, and mobile in light and dark themes.
- Confirm no clipping, horizontal overflow, overlapping text, undersized controls, or changes to Horizontal view.
