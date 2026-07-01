I found the issue in both `/kds/full` row renderers: `CourseSection.tsx` and `FlatItemList.tsx` put the language icon inside the same RTL flex row as the Arabic product name and allergen chips. In an RTL flex container, the visual order is reversed, so the chips can appear between the icon and the product name even when the JSX order looks correct.

Plan:
1. Replace the secondary-language inline markup in `CourseSection.tsx` and `FlatItemList.tsx` with a safer structure:
   - Product name first, anchored to the same right edge as the primary name for Arabic.
   - Allergen chips immediately after the secondary product name.
   - Language icon after the chips, never between the icon and the translated product name.
2. Avoid relying on `dir="rtl"` on the full flex row for visual ordering. Keep RTL only on the Arabic text span, and control row order with normal LTR flex layout plus right alignment.
3. Keep the existing `TightWidthBox` right-edge behavior for Arabic, without truncating longer Arabic names.
4. Verify `/kds/full` on Arabic dual-language mode for both coursed rows and flat product rows, including the selected `Tres Leches` allergen case.