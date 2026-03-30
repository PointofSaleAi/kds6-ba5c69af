

## Wire Up Pagination Dots to Page-Based Navigation

### What Changes

The hardcoded 5 dots in the bottom status bar become functional page indicators. Orders display in fixed-size pages (based on the grid columns per view mode), and users can swipe left/right or tap dots to navigate between pages.

### Plan

**1. Add pagination state to MainOrderView**
- Compute `cardsPerPage` based on view mode (list: 8, grid: 16, horizontal: 4)
- Track `currentPage` state, reset to 0 when filter or view mode changes
- Slice `filteredOrders` into pages: `filteredOrders.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)`
- Compute `totalPages` from `Math.ceil(filteredOrders.length / cardsPerPage)`

**2. Add touch swipe support in the order cards area**
- Add `onTouchStart` / `onTouchEnd` handlers on the cards container
- Detect horizontal swipe (threshold ~50px) to go next/prev page
- Animate page transitions using framer-motion (slide left/right)

**3. Update BottomStatusBar to be interactive**
- New props: `currentPage`, `totalPages`, `onPageChange`
- Render `totalPages` dots (instead of hardcoded 5), highlight `currentPage`
- Each dot is a tappable button (44x44 touch target) that calls `onPageChange(index)`
- Add left/right chevron buttons on either side of dots for tap navigation
- Cap visible dots at ~7, show condensed indicators if more pages exist

**4. Files to modify**
- `src/pages/MainOrderView.tsx` - pagination state, swipe handlers, sliced orders
- `src/components/kds/BottomStatusBar.tsx` - interactive dots, chevrons, new props

### Technical Details
- Swipe detection uses raw touch events (no new dependency needed)
- Page transition: wrap the grid in `AnimatePresence` with `key={currentPage}` and directional slide animation
- `cardsPerPage` adapts to view mode but stays fixed within a mode to avoid layout jumps
- When orders change (bump/new arrival), clamp `currentPage` to valid range

