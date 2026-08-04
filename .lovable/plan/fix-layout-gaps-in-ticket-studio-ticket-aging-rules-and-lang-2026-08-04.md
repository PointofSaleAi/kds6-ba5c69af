# Fix layout gaps in Ticket Studio, Ticket Aging Rules and Language screens

## What's wrong

In Settings > Display, four sub-screens open from the same list, but they are built two different ways:

- **Ticket Layout** renders in-flow inside the Settings content card, so it fills the card edge to edge.
- **Ticket Studio**, **Ticket Aging Rules** and **Language** render as full-viewport pinned overlays that are pushed in by the left rail width (80px), the top header (44px) and the bottom bar (52px).

Because the Settings content card already sits inside those chrome elements and has its own outer spacing, the overlay insets get applied a second time — producing the large empty band at the top, the gap on the left next to the Settings rail, and the dead space at the bottom.

## The fix

Rebuild these three screens with the same in-flow container the Ticket Layout screen uses, so they inherit the Settings card's own padding instead of adding viewport-level offsets:

- Remove the pinned/full-viewport wrapper and the rail/header/bar inset calculation from all three screens.
- Use one shared shell: a column that fills the available height, a centred title row with the round back button on the left, and a scroll/overflow region beneath it — matching the Ticket Layout header spacing exactly.
- Keep every screen's inner content, controls and behaviour untouched; only the outer frame changes.
- Verify at desktop, tablet and mobile widths, in light and dark theme, and with the rail/bar docked on the alternate edges, that all four Display sub-screens line up identically.

## Technical notes

- File: `src/pages/settings/DisplaySettings.tsx` — the `statusOpen`, `languageOpen` and `ticketStudioOpen` early-return blocks.
- Replace `className="fixed z-40 ... " style={overlayStyle}` with the in-flow pattern already used by the `ticketSpacingOpen` block (`flex-1 flex flex-col overflow-hidden` + `relative flex items-center justify-center px-6 pt-2 pb-3 shrink-0` header).
- `getOverlayInsets` / `overlayStyle` stays available for true full-screen overlays; it is simply no longer used by these three panels (drop the local variable if nothing else in the file needs it).
- No changes to `StatusSettings`, `InlineLanguageSettings`, or `TicketStudioSkeleton` internals; `TicketStudioSkeleton` keeps its own height handling and should be checked for a `min-h-0` parent so it doesn't overflow the card.
