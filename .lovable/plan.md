# Fix the Ticket Layout dropdown arrow

## Change
- Replace the browser-controlled dropdown arrow with a fixed `ChevronDown` icon.
- Wrap the Layout selector in a relative container, hide the native arrow, and position the new icon 12px from the right edge.
- Keep enough right-side text padding so “Glass View” never overlaps the icon.

## Verification
- Confirm the arrow is evenly inset and vertically centered in light and dark themes.
- Check desktop, tablet, and mobile widths without changing the selector’s current dimensions or behavior.
