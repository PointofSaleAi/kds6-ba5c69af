## Goal
On `/kds/v1` (full view), show 6 ticket cards per row in grid mode at the current viewport (~1138px), instead of the current 3.

## Current behavior
`MainOrderView.tsx` uses a shared grid for all variants:
`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`
So 6-up only kicks in at ≥1536px. V1 cards are visually denser than the default and can comfortably fit narrower.

## Change
Apply a V1-specific grid that reaches 6 columns much earlier, only when `cardVariant === 'v1'` and in landscape grid mode. No changes to V2, V3, default, stagger, or horizontal views.

Proposed V1 grid (landscape):
`grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-6`

Portrait stays at `grid-cols-2 min-[960px]:grid-cols-3` (small screens can't fit 6 legibly).

## Files
- `src/pages/MainOrderView.tsx` — branch the grid className on `cardVariant` at line 1303 (active orders grid) and line 1203 (history grid).

## Out of scope
- Card internal sizing/typography (already tightened in prior turn).
- V2 / V3 / default `/kds/full` grid.
- Portrait/tablet breakpoints.