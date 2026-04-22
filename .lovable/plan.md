
Fix the remaining vertical gap by tightening the actual row box heights, not just the outer margins.

1. Root cause
- The gap is still visible because the surrounding wrappers already use `marginTop: 0px`, but the rendered height is coming from inside the rows:
  - `AllergenBadge.tsx` still gives each badge a non-trivial badge box via border, padding, and `lineHeight: 1.1`
  - `ModifierLine.tsx` still renders a full flex row with its own line box and quantity spacer, so even with `marginTop: -1px` there is still extra vertical height
  - In both `CourseSection.tsx` and `FlatItemList.tsx`, allergens and modifiers are rendered as separate stacked blocks, so their own internal line-height and alignment rules are what keep the visible gap

2. Targeted implementation
- Update `src/components/kds/AllergenBadge.tsx`
  - Reduce item badge vertical footprint slightly more for `variant="item"`
  - Keep the same colors, border style, typography weight, and chip appearance
  - Tighten only the chip height by lowering line-height and vertical padding for item badges

- Update `src/components/kds/ModifierLine.tsx`
  - Reduce the effective row height for non-servable modifiers by tightening the wrapper and text line-height
  - Remove the remaining extra vertical space introduced by the flex row alignment
  - Keep modifier colors, text style, and servable modifier behavior unchanged

- Update `src/components/kds/CourseSection.tsx`
  - Pull the modifier block closer to the allergen row by tightening the wrapper that renders modifiers, not just the modifier row itself
  - Keep Standard and Compact logic unchanged
  - Do not alter item actions, timestamps, or expansion behavior

- Update `src/components/kds/FlatItemList.tsx`
  - Apply the same wrapper-level tightening used in `CourseSection.tsx` so non-coursed tickets match coursed tickets
  - Keep ticket layout modes and item interactions unchanged

3. What will change visually
- Smaller vertical gap between:
  - product name and allergen chips
  - allergen chips and first modifier/add-on
  - stacked modifier/add-on rows
- No change to:
  - item name font size
  - allergen colors/styles
  - modifier colors
  - ticket logic, layout mode behavior, or tap actions

4. Technical details
- Focus on these properties only:
  - badge line-height and vertical padding in `AllergenBadge.tsx`
  - modifier wrapper line-height, alignment, and top offset in `ModifierLine.tsx`
  - parent wrapper spacing around modifier groups in `CourseSection.tsx` and `FlatItemList.tsx`
- Avoid changing any card-level layout, section borders, row ordering, or item lifecycle logic

5. Validation
- Verify in Standard ticket layout on both:
  - coursed tickets rendered by `CourseSection`
  - non-coursed tickets rendered by `FlatItemList`
- Confirm the spacing is visibly tighter in cases like the screenshot:
  - item name
  - allergen chip row
  - first modifier/add-on directly beneath
- Confirm there are no regressions to Compact mode expand/collapse behavior or servable modifiers
