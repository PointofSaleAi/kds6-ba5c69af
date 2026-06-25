## Goal
On `/kds/v1`, make ticket columns scale responsively to screen width: 4 / 5 / 6 cards per row.

## Breakpoints (V1 only, landscape Grid and Stagger)
- < ~1100px → 4 columns
- ~1100–1400px → 5 columns
- ≥ ~1400px → 6 columns

(Smaller widths keep current 2–3 col behavior; portrait unchanged.)

## Changes
- `src/pages/MainOrderView.tsx`
  - V1 Grid className: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 min-[1100px]:grid-cols-5 min-[1400px]:grid-cols-6`
  - V1 Stagger column logic: width <1100 → 4, <1400 → 5, else 6.
- Apply to both active and history grids.

## Out of scope
V2, V3, default `/kds/full`, portrait, horizontal view, card internals.
