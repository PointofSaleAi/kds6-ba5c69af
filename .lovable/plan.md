# Ticket Studio Style = Ticket Layout tickets

## Goal
Whatever you pick in Ticket Studio's Style dropdown shows exactly the same ticket design as the same choice in Settings > Ticket Layout > Layout.

## What changes
- **Same options, same order, same names** as the Ticket Layout dropdown: Section list, Standard layout, Priority View, Detailed grid, Itemized cards, Glass View. Labels translated the same way.
- **The style applies to every board.** Right now only Focus Lane, Distance View and Timeline Flow change with Style. The others keep their own design. After this change, every board's tickets use the chosen style.
- **Every ticket on the board matches**, including the big center ticket in Focus Lane. It gets scaled so it fits without overflowing.
- **Same ticket data and behaviour** as the Ticket Layout preview: same sample order, order-type header colours, aging colours, identifier (order number or guest name), text size and language.
- Picking a style in either place updates both, since they share one saved choice.
- Works on desktop, tablet and phone, in light and dark themes.

## Technical details
- Make `TicketStudioSkeleton.tsx` STYLE_OPTIONS reuse one shared option list (exported from `ticket-card-variant.ts`) that `DisplaySettings.tsx` also uses, so the two can't drift apart.
- In `BoardTicketPreview.tsx`, drop the `STYLE_DRIVEN_BOARDS` limit. When `styleRoute` is set, render `SelectedVariantPreview` (the Ticket Layout renderer, including the Glass branch) for every board, passing orderTypeKey, identifier and agingOverrideSeconds.
- Focus Lane center ticket: pass `styleRoute` and wrap it in a fit-to-width scale container in place of the fixed 1.55× scale.
- Check with Playwright: Ticket Studio for each style, compared against Ticket Layout at 1206×674, 1024×1366 and 390×844, in light and dark.
