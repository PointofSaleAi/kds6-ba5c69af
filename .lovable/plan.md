## Why only 2 columns now

In `src/pages/MainOrderView.tsx` the Grid view hard-locks portrait orientation to 2 columns:

```tsx
isPortrait ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
```

This same rule is applied in two places (lines 1159 and 1251) and is also baked into the project memory ("Portrait Layout — Grid locked 2-col"). That is why iPad Pro portrait (1024px wide) still shows only 2 cards even though there is clearly room for a 3rd.

## Goal

Portrait Grid view should adapt to device width:
- iPad Mini (768px) and iPad Air (820px) → 2 columns (unchanged)
- iPad Pro (1024px) → 3 columns

Stagger and Horizontal view rules stay as they are. Only the Grid view's portrait branch changes.

## Change

Replace the locked `grid-cols-2` portrait class in both spots with a width-responsive variant. iPad Air is 820px wide, iPad Pro portrait is 1024px wide, so a breakpoint at `min-[960px]` cleanly separates them:

```tsx
isPortrait
  ? 'grid-cols-2 min-[960px]:grid-cols-3'
  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
```

Two occurrences in `src/pages/MainOrderView.tsx` (Home/Expo Grid block and the Station/Prep Grid block).

No other view modes are touched. Stagger stays forced to 2 columns in portrait (per existing memory and code).

## Memory update

Update `mem://ui/portrait-orientation-layout` so the rule reflects: Grid is 2-col on Mini/Air portrait and 3-col on iPad Pro portrait (≥960px). Stagger and Horizontal rules are unchanged. Also refresh the matching one-liner in `mem://index.md`.

## Verification

After the edit, check the preview at iPad Mini (768), iPad Air (820), and iPad Pro (1024) portrait widths to confirm 2 / 2 / 3 columns respectively, and that landscape behavior is unchanged.
