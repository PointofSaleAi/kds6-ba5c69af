
Scope

Tighten only the Home screen ticket header block shown in the screenshot, which is the shared colored block under the order type bar in `src/components/kds/OrderCard.tsx`. No other card sections or screens will be changed.

What I found

- The affected block is in the kitchen header layout branch of `OrderCard.tsx`.
- That container already uses `padding: '12px'` and vertical centering.
- The block still feels too tall because the right-side rows use default text line-height, so the employee name, guest name, and timer create extra vertical space even when the gap is small.
- The employee and guest rows are already in a compact flex column, so the fix should target row line-height and stack spacing, not the broader card layout.

Implementation plan

1. Update only the kitchen header block in `src/components/kds/OrderCard.tsx`
   - Keep the order number, colors, radius, header bar, allergens, items, actions, and all other card behavior unchanged.

2. Make the block feel evenly padded on all four sides
   - Preserve the existing 12px outer padding on the colored header container.
   - Remove any visual extra height caused by inner row spacing, not by changing the card height or adding fixed sizing.

3. Tighten the employee and guest name spacing
   - Add explicit compact line-height to the employee row and guest row.
   - Keep the right-side group right-aligned and vertically centered.
   - Reduce the visual space between employee and guest names without changing their font size, weight, color, or icon opacity.

4. Keep the timer prominent but compact
   - Keep the timer size and styling unchanged.
   - Apply compact line-height so it does not add unnecessary top or bottom space inside the block.

Technical details

- Primary file: `src/components/kds/OrderCard.tsx`
- Likely changes:
  - add `leading-none` or equivalent compact line-height to the employee name row
  - add `leading-none` or equivalent compact line-height to the guest name row
  - pass compact line-height to `TimerBadge` through its existing `className` prop
  - keep the colored header container padding at 12px and its `items-center` alignment intact

Validation

- Verify a Home screen ticket with employee name, guest name, and timer visible.
- Confirm the colored block looks evenly padded top, right, bottom, and left.
- Confirm the employee and guest names sit closer together.
- Confirm nothing else changed in the ticket card, History, Expo, or other layouts.
