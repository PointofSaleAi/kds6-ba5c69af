## Problem
The `HeaderOnlyDrawer` currently nests a full `OrderCard` with `rounded-lg bg-surface-card shadow-sm` styling inside the already-styled sidebar. This creates a "card inside a card" look. Additionally, an `X` close button sits on top of the content.

## Changes

### 1. Add a `bare` prop to `OrderCard`
- New optional boolean prop `bare?: boolean` in `OrderCardProps`.
- When `bare` is true, remove the outer wrapper classes `rounded-lg overflow-hidden bg-surface-card shadow-sm transition-all duration-300`.
- Keep all internal content (header, courses, flat list, actions, bump button) exactly as-is.
- Prevent the card-level `ticketLongPress` handler from attaching when `bare` is true to avoid competing with sidebar interactions.

### 2. Update `HeaderOnlyDrawer` in `OrderCard.tsx`
- Remove the `<button>` containing `<X className="..." />` from the drawer entirely.
- Keep the backdrop click-to-dismiss behaviour.
- Change the nested `OrderCard` to pass `bare` instead of `layoutOverride="standard"` and `forceEmphasizedV1Header`. Wait — the user said "show full ticket but without card border". The drawer should still show the full ticket. But what layout should it use?

Actually, looking back: the user previously said "just open the exact ticket in a modal with same actions". So the drawer should show the ticket with its current configured layout settings (which might be standard, compact, or header), not force standard. But showing header inside header would be weird. However, the user explicitly said "Show full ticket but without card border", which means they want the complete ticket content directly in the sidebar.

So in the drawer, we should pass `bare` to the `OrderCard`, and remove the `layoutOverride` and `forceEmphasizedV1Header` overrides, letting it respect the user's current `ticketLayout` and `ticketHeaderStyle` settings. But we need to prevent recursion: if `ticketLayout` is "header", the nested OrderCard would also show a header-only view and try to open another drawer.

To fix this: pass `layoutOverride="standard"` (or better, pass the user's current layout but if it's "header", default to "standard") while also passing `bare`. Or simply keep `layoutOverride="standard"` but add `bare` to strip the card border.

Given the user's answer "Show full ticket but without card border", I think the safest interpretation is: keep `layoutOverride="standard"` (so we see the full ticket) but strip the card border with `bare`. The user previously specifically wanted the full ticket in the sidebar.

### Wait — actually the user said in the original message:
"why you show the actual ticket in right side bar. use the right side bar as ticket layout container."

This suggests they don't want a nested OrderCard at all. They want the sidebar to BE the container. So instead of:
```
<Sidebar> → <OrderCard>...</OrderCard> → content
```
They want:
```
<Sidebar> → content directly
```

But to avoid massive duplication, the pragmatic approach is adding a `bare` prop that renders the same content without the outer card wrapper. This effectively makes the sidebar the container.

### 3. Ensure no recursive drawer
- In the `OrderCard` component, the `isHeaderOnly` check triggers the drawer open. If `bare` is true and `layoutOverride` is standard, `isHeaderOnly` would be false (since resolvedTicketLayout would be standard), so no recursion issue.

### File changes
- `src/components/kds/OrderCard.tsx`: add `bare` prop to `OrderCardProps`, conditionally strip outer card wrapper, update `HeaderOnlyDrawer` to remove X button and pass `bare` to nested `OrderCard`.

### No other files needed
This is a self-contained change within `OrderCard.tsx`.
