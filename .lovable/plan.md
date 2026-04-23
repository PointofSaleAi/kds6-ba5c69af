

## Add slight top padding to "Seen at" / "Done at" / "Preparing at" labels

### Goal
Push the timestamp labels (e.g. "Seen at 16:17", "Done at 16:17") down a tiny bit so they don't sit flush at the top of the product row, while leaving the product name (e.g. "OSSO BUCO", "GRILLED BARRAMUNDI") unchanged.

### Scope
Apply only to the timestamp `<span>` elements. Do not change product name typography, row padding, or allergen/modifier spacing.

### Files & changes

1. `src/components/kds/CourseSection.tsx`
   - On the two timestamp spans inside `CourseItemTapRow` (lines ~562-577 for `seenAt` and `doneAt`), add a small inline top padding (`paddingTop: '3px'`) and `alignSelf: 'flex-start'` so the label aligns with the top of the product name but is nudged down slightly.

2. `src/components/kds/FlatItemList.tsx`
   - On the matching `seenAt` and `doneAt` timestamp spans (lines ~199-207), apply the same `paddingTop: '3px'` and `alignSelf: 'flex-start'` for consistency.

3. `src/components/kds/CourseSection.tsx` (course header timestamps)
   - The course-level "Done at" (line ~270-273) and "Preparing at" (line ~336-339) header chips are inside the header row, not next to a product, so leave them untouched. Only the per-product labels get the padding.

### Visual outcome
- Product name stays vertically centered/anchored as today.
- "Seen at HH:MM" and "Done at HH:MM" labels next to each product appear slightly lower, giving them visual separation from the product name baseline.
- No change to allergen chips, modifiers, row height, or card spacing.

