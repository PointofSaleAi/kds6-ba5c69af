# Remove the gap on the right of the left nav box

Remove the 10px gap between the right side of the rounded nav box and the tickets. The top, bottom and left gaps stay at 10px, and the box keeps its size and look. The tickets still sit 10px from the box, because the ticket area has its own left gap.

## Technical details
- `src/components/kds/KDSSidebar.tsx`: outer `glass-rail` `p-2.5` → `py-2.5 pl-2.5`, and width `w-[84px]`/`w-[196px]` → `w-[74px]`/`w-[186px]`, so the inner box stays 64px / 176px.
- This applies on every screen, in both themes, and on all sizes.
