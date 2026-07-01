I’ll fix the /kds/full product rows so allergen chips reliably render inline after the secondary language product name when dual language is enabled.

Plan:
1. Update `TightWidthBox` to allow the secondary line to grow wide enough for both the translated product name and inline allergen chips, instead of sizing only from the primary product name.
2. Apply this behavior only where allergens are intentionally rendered after secondary language in `FlatItemList.tsx` and `CourseSection.tsx`.
3. Keep the existing Arabic right-edge alignment behavior for the secondary product name, but prevent the chips from being clipped or forced outside the visible row.
4. Verify `/kds/full` in dual-language mode with allergen items across flat tickets and coursed tickets.