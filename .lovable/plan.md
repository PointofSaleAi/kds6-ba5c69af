# Even spacing around the left nav and the tickets

Use one even 10px gap everywhere, the same as the gap between tickets:

```text
| 10 | nav box | 10 | tickets ... tickets | 10 | Summary |
```

## What changes
- **Left nav:** 10px on all sides of the rounded glass box (top, bottom, left, right). The box keeps its size and look.
- **Tickets:** 10px between the first ticket and the nav, and 10px between the last ticket and the Summary panel. Today the tickets touch both edges.
- The number of tickets per row stays the same. Each ticket gets a few pixels narrower to make room.
- Applies to Grid, Stagger and Horizontal views and to every board, in light and dark theme, on phone, tablet and desktop.

## Technical details
- `src/components/kds/KDSSidebar.tsx`: outer `glass-rail` gets `p-2.5`, and its width becomes `w-[84px]` / `w-[196px]` so the inner box stays 64px / 176px.
- `src/components/kds/glass/TicketBoard.tsx` line 192: padding `${GAP}px 0` → `${GAP}px`. Column math subtracts the horizontal padding so the column count doesn't change.
- Check at 1140×714, 1024×1366 and 390×844 in light and dark theme.
