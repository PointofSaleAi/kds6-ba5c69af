## Goal
Eliminate the thin white gap around the ticket sidebar so the ticket content sits flush against the screen edges, matching a true "ticket-as-sidebar" feel.

## Cause
In `src/components/kds/OrderCard.tsx` → `HeaderOnlyDrawer`, the outer motion container uses `p-[10px] pl-0` (10px padding on top/right/bottom) and the inner card uses `rounded-2xl border border-border`. Combined, this produces the visible thin white frame around the ticket.

## Change
In `HeaderOnlyDrawer` only:
1. Remove `p-[10px] pl-0` from the outer motion container.
2. Remove `rounded-2xl` and `border border-border` from the inner card (keep `shadow-2xl` for depth).

Result: the ticket header (navy bar) and body fill the full 440px drawer edge-to-edge, top to bottom, with no white padding ring.

No other panels (Notifications, AI) are touched, and no ticket layout logic changes.