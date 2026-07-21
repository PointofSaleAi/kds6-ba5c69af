
## Problem

In Ticket Studio, `KdsScreenMock` embeds the real full-size `KDSSidebar` (80px), `ItemSummaryPanel`, and `BottomStatusBar` into a small preview container. Because only the tickets are scaled (not the chrome), the sidebar/summary/footer dominate the preview and overlap content. The grid is also hardcoded to `grid-cols-3`, while the real Tickets screen renders 4 columns.

## Fix (single file: `src/components/kds/TicketStudioSkeleton.tsx`)

Treat the mock as a fixed "virtual KDS screen" (e.g. 1440×900) that gets uniformly `transform: scale()`d into the preview container. This keeps every element (sidebar, summary, footer, tickets) proportional to what the real Tickets screen looks like.

1. **Wrap `KdsScreenMock` output in a scaled virtual viewport**
   - Outer div: `w-full h-full relative overflow-hidden` + `ResizeObserver` measuring container size.
   - Inner div: fixed `width: 1440px; height: 900px`, `transformOrigin: 'top left'`, `transform: scale(min(containerW/1440, containerH/900))`, centered via computed translate (or left-aligned with margin).
   - This replaces the current per-ticket scaling logic.

2. **Grid becomes 4 columns × 2 rows**
   - Change `grid-cols-3` → `grid-cols-4`.
   - Extend `SCREEN_ORDER_TYPES` to 8 entries (add `phone-in` and `scheduled`, which already exist as order type icons) so the 4×2 grid fills naturally.
   - Remove the per-ticket `transform: scale(ticketScale)` and inline `width: 320` — tickets render at natural production size inside the virtual 1440px canvas, matching real Tickets screen density.
   - Drop the custom `gridTemplateRows` calc; use `grid-rows-2` with `min-h-0`.

3. **Remove obsolete scaling state**
   - Delete `gridRef`, `fitScale`, `textScale`, `ticketScale`, and the associated `useLayoutEffect`.
   - Keep `textSize` support by passing it through to `BoardTicketPreview` if it already reads it, or drop the prop usage here (it's a chrome-level concern, not needed for viewport scaling). Verify prop is still consumed elsewhere before removing.

4. **Preserve behavior**
   - Sidebar, summary panel, footer keep their real components and props unchanged — they just render inside the scaled virtual viewport.
   - `data-ts-preview` / `data-ts-ticket` markers preserved so the onboarding walkthrough scoping still works.

## Result

Preview looks like a miniature, faithful screenshot of the real Tickets screen: narrow-looking sidebar/footer/summary relative to tickets, 4-column ticket grid, no overlap, and it stays crisp at any container size because it uses CSS transform scaling.
