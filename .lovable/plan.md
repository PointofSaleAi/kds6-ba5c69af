I found why it still looks unresolved. The previous fix updated `FlatItemList.tsx`, but the course-section ticket rows are rendered through `CourseSection.tsx` in the course layout path. That file still has the old chevron offsets: the row uses `items-start`, and the chevron slot has `marginTop: '3px'`. This affects Entree, Appetizer, Dessert, and long product names inside course sections.

Plan:

1. Update `src/components/kds/CourseSection.tsx`
   - Change the Compact product row container from top-aligned to center-aligned for the item name line.
   - Remove the hardcoded `marginTop: '3px'` from both chevron variants.
   - Use the same 12x12 inline-flex centered chevron slot pattern already applied in `FlatItemList.tsx`.
   - Add the same stable `data-chevron-slot="line"` marker so tests cover this path too.

2. Keep the scope limited
   - Do not touch course headers, ticket headers, allergen tags, modifier rows, timestamps, timer chips, colors, fonts, or spacing outside the product-row chevron alignment.

3. Update visual regression coverage
   - Add or extend a test for `CourseSection.tsx` Compact layout with Appetizer, Entree, Dessert, and long product names.
   - Assert no hardcoded top offsets remain on chevron slots.
   - Assert row alignment uses center alignment and chevron slots remain 12x12.

4. Verify after implementation
   - Re-check the KDS page visually at the current viewport size.
   - Confirm the chevron aligns with product names in all course sections and with wrapped or longer product names.