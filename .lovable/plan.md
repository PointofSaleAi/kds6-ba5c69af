
Scope

- Adjust only the colored ticket header block in `src/components/kds/OrderCard.tsx` for the Home screen kitchen layout.
- Leave the order type bar, allergens row, ticket body, compact cards, History, Expo, and all other screens untouched.

What is still causing the uneven top and bottom space

- The block already has `padding: 12px`.
- The remaining extra height is coming from the content box inside it, not from the outer padding:
  - the large order number still has a tall font box, so the header height is being driven by the number more than the visible digits
  - the employee, guest, and timer rows are close, but their text rows can still contribute a bit of vertical bulk
- Because both sides are vertically centered, the right-side group sits inside that taller number-driven area, which makes the top and bottom feel larger than the left and right.

Implementation plan

1. Tighten the order number line box
   - In the kitchen header branch, apply an explicit compact line-height to the order number so the visible digits sit closer to the top and bottom bounds.
   - Keep the same font size, weight, color, and left-side position.

2. Compress the right-side stack
   - Keep it as a right-aligned vertical column with centered placement.
   - Reduce the employee and guest rows to an explicit compact line-height.
   - Keep the gap between employee, guest, and timer at exactly 2px.
   - Do not change icon size, text size, weight, or color.

3. Keep the timer visually compact
   - Keep the current timer size and styling.
   - Ensure the timer row and `TimerBadge` use compact line-height so the monospace digits do not add hidden vertical space.

4. Preserve equal outer padding
   - Keep the colored block at `12px` on all four sides.
   - Do not add a fixed height or any extra top or bottom padding.
   - Let the final height be driven only by the tightened content plus the existing 12px padding.

Validation

- Confirm the colored block now looks evenly padded on top, bottom, left, and right.
- Confirm the guest name sits closer to the employee name.
- Confirm the order number remains the same size and position.
- Confirm nothing else in the ticket card or other screens changes.

Technical details

- Primary file: `src/components/kds/OrderCard.tsx`
- Likely updates:
  - tighten the order number line-height
  - keep header padding at `12px`
  - keep the right-side stack as `flex-col`, `items-end`, `justify-center`
  - keep stack gap at `2px`
  - apply compact line-height to employee, guest, and timer rows
