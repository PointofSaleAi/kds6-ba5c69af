

## Rename View Modes: List → Grid, Grid → Horizontal, Horizontal → Stagger

The current three view modes (`list`, `grid`, `horizontal`) need to be renamed and re-mapped to match the existing KDS software's terminology and layouts.

### Mapping

| Current | New | Layout |
|---|---|---|
| `list` → fixed grid (4 cols) | **Grid** — fixed-column grid, all cards same width | Screenshot 1 |
| `grid` → compact grid (8 cols) | **Horizontal** — single scrollable row | Screenshot 2 |
| `horizontal` → horizontal scroll | **Stagger** — masonry/column-flow layout | Screenshot 3 |

### What Changes

**1. `src/types/kds.ts`** — Rename the type:
```
ViewMode = 'grid' | 'horizontal' | 'stagger'
```

**2. `src/components/kds/BottomStatusBar.tsx`** — Update mode labels and icons:
- `grid` with `LayoutGrid` icon → "Grid"
- `horizontal` with `Columns3` icon → "Horizontal"
- `stagger` with `LayoutList` (or similar) icon → "Stagger"

**3. `src/pages/MainOrderView.tsx`** — Update all `viewMode ===` checks:
- `'list'` → `'grid'` (the standard multi-column grid)
- `'grid'` → `'horizontal'` (single-row horizontal scroll, showing fewer larger cards)
- `'horizontal'` → `'stagger'` (masonry column-flow layout)

For the **Stagger** layout specifically, change from horizontal scroll to a CSS masonry-style column flow using `columns: 5` with `break-inside: avoid` — this creates the waterfall/stagger layout seen in screenshot 3 where cards of varying heights fill columns top-to-bottom.

For **Horizontal** mode, change from the tiny compact grid to a true single-row horizontal scroll with larger cards (matching screenshot 2 showing ~4 cards visible at once).

**4. Default mode** — Change initial state from `'list'` to `'grid'`.

### Files to edit
- `src/types/kds.ts`
- `src/components/kds/BottomStatusBar.tsx`
- `src/pages/MainOrderView.tsx`

