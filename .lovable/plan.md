
## What I found

The icon image size is already the same in the live code:
- Product buttons in `FlatItemList` and `CourseSection`: container `min-w-[44px] min-h-[33px]`, icon `40x30`
- Order Notes button in `OrderCard`: container `min-w-[44px] min-h-[33px]`, icon `40x30`

So the mismatch you still see is not the SVG size. It comes from the button wrapper styles:
- Order Notes uses `rounded-lg`
- Order Notes adds an extra button background (`bg-success/15` or `bg-order-take-out/15`)
- Product buttons use `rounded-[3px]` and no extra outer background, so only the SVG background is visible

That extra outer fill makes the Order Notes action look larger and softer, even though the raw dimensions match.

## Updated plan

1. Update `src/components/kds/OrderCard.tsx`
   - change the Order Notes acknowledge button to use the exact same shell styling as product action buttons
   - use `rounded-[3px]`, `overflow-hidden`, `min-w-[44px]`, and `min-h-[33px]`
   - keep the same `seenIcon` at `40x30`

2. Preserve acknowledgment state without changing perceived size
   - remove the current filled background classes from the button
   - if a state cue is still needed, use a non-size-changing treatment such as a subtle ring, opacity shift, or title change instead of an outer filled background

3. Optional consistency cleanup
   - normalize `src/components/kds/coursing/ItemRow.tsx`, which still uses `min-h-[44px]`, so other coursing-related views do not reintroduce a different eye button height elsewhere

## Expected result

After this change, the Order Notes eye button and the product eye button will look identical in:
- visible blue background area
- corner radius
- perceived padding
- overall touch target footprint

## Technical detail

Files involved:
- primary: `src/components/kds/OrderCard.tsx`
- optional consistency pass: `src/components/kds/coursing/ItemRow.tsx`

Exact reason for the current mismatch:
```text
Product button = transparent 44x33 shell + 40x30 SVG
Order Notes    = colored 44x33 shell + 40x30 SVG
```

Because the SVG already contains its own light blue background, the extra shell background on Order Notes creates a double-background effect and makes it look bigger.
