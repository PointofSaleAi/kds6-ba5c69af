

# Align Server Name and Timer with Order Number

## Change

In `src/components/kds/OrderCard.tsx` (lines 184-195), adjust the right column so the server name and timer visually align with the top and bottom edges of the order number:

- Add `mt-1` (or `pt-1`) to the server name `<span>` to push it slightly down, aligning it with the top of the large order number text
- Add `mb-1` (or `pb-1`) to the `TimerBadge` wrapper (or reduce gap) to pull the timer slightly up, aligning it with the bottom of the order number

The right-side flex column already uses `justify-between self-stretch`, so fine-tuning margins on the children will achieve horizontal alignment with the order number on the left.

