

## Add alternating tap-state colors to non-Dine-In tickets

### Problem
In Dine-In (coursed) tickets, tapped products alternate between green and amber backgrounds for adjacent "preparing" items, making it easy to visually distinguish which item is which at a glance. In non-Dine-In tickets (Take Out, Delivery, Banquet — which use `FlatItemList`), tapped products only get a single flat green tint. There is no alternation, so adjacent tapped rows blur together.

### Solution
Mirror the exact alternation logic from `CourseSection.tsx → CourseItemTapRow` into `FlatItemList.tsx → ItemTapRow`.

### Files & changes

1. `src/components/kds/FlatItemList.tsx`
   - Track a running `seenIdx` (a 0-based counter of items currently in `preparing` state) as we map over `visibleItems`. Each preparing item gets an index; items in other states are skipped in the counter.
   - Pass `seenIdx` into `ItemTapRow`.
   - Inside `ItemTapRow`, replicate the same constants used in `CourseSection.tsx`:
     - `useTeal = isSeen && seenIdx % 2 === 1`
     - `seenBgGreen = rgba(29, 158, 117, 0.14)`
     - `seenBgTeal = rgba(245, 158, 11, 0.18)`
     - `seenTextGreen = #0F5132`
     - `seenTextTeal = #92400E`
   - Replace the current single `rowBg = 'rgba(29, 158, 117, 0.10)'` for preparing with `useTeal ? seenBgTeal : seenBgGreen`. Keep the done grey tint as-is.
   - Update the inline `seenAt` timestamp color to match (`useTeal ? seenTextTeal : seenTextGreen`) so the label stays readable on the amber background.

2. `src/components/kds/__tests__/FlatItemList.highlight.test.tsx`
   - The existing visual-regression test asserts the preparing row MUST be exactly `rgba(29, 158, 117, 0.1)` and forbids any other background. With alternation enabled, that contract no longer holds.
   - Update the test to accept either the green tint (`rgba(29, 158, 117, 0.14)`) for even-indexed preparing rows or the amber tint (`rgba(245, 158, 11, 0.18)`) for odd-indexed ones.
   - Keep all the other guards (no dark `#1E2438`/`#161B28` backgrounds, no `#888` / `#555` text colors, no strikethrough on the item name, no dim opacity).

### Visual outcome
- Take Out / Delivery / Banquet tickets now show the same alternating green/amber tap highlight pattern that Dine-In tickets already use.
- First tapped (preparing) item: green. Second: amber. Third: green. And so on.
- Done rows continue to use the neutral light-grey tint in both flat and coursed lists.
- All other typography, spacing, and lifecycle behavior unchanged.

### Out of scope
- No changes to `CourseSection.tsx` (already correct).
- No changes to `OrderCard.tsx`, allergen styling, or course header chips.

