
Fix scope: only adjust the Order Notes row layout in `src/components/kds/OrderNotesSection.tsx`.

Root cause:
- Product rows in `CourseSection`, `FlatItemList`, and `coursing/ItemRow` use `items-center`, zero right padding, and the action cell sits at the far right.
- `OrderNotesSection` still uses `items-start`, full `4px` padding on all sides, and a `paddingTop` offset on the icon wrapper. That makes the notes eye icon sit differently from the product eye icon.

Implementation:
1. Mirror the same row shell used by product items:
   - change the notes content row from `items-start` to `items-center`
   - change row padding from `4px` to `4px 0 4px 4px`
   - keep `gap: 0`
2. Make the action cell match the item rows:
   - add `ml-auto` to the icon wrapper
   - remove the `paddingTop: '1px'` offset
   - keep the existing `KdsActionIcon` unchanged so size, color, and background stay exactly the same
3. Leave everything else untouched:
   - do not change the "Order Notes" label
   - do not change note text styling, acknowledgment behavior, or card structure

Technical details:
- File to update: `src/components/kds/OrderNotesSection.tsx`
- Existing item row pattern to match: `src/components/kds/CourseSection.tsx`, `src/components/kds/FlatItemList.tsx`, `src/components/kds/coursing/ItemRow.tsx`
- No change needed in `src/components/kds/KdsActionIcon.tsx` because the icon itself is already correct in product rows
- Existing tests in `src/components/kds/__tests__/OrderNotesSection.test.tsx` already cover the acknowledge toggle behavior

Validation:
- Open a ticket with both order notes and product items visible
- Confirm the Order Notes eye icon sits flush to the right edge like the product eye icon
- Confirm both icons are vertically centered on their respective rows
- Confirm note acknowledgment still toggles correctly
