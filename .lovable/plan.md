
1. Root cause
- The earlier spacing-tightening removed the card-level bottom padding that used to create breathing room after the final product.
- In coursed tickets, `CourseItemTapRow` in `src/components/kds/CourseSection.tsx` now renders with effectively zero outer bottom padding, so the last modifier/add-on of the last visible item can sit too close to the card edge.
- In non-coursed tickets, `src/components/kds/FlatItemList.tsx` still has light row padding, but it should be normalized so the final visible product gets the same deliberate end spacing as coursed tickets.
- Re-adding a generic bottom padding on the whole course/card wrapper would bring back the previous bug: empty space under a Done course header even when there is no actual product content below it.

2. Targeted implementation
- Update `src/components/kds/CourseSection.tsx`
  - Keep the tight spacing between product name, allergen chips, modifiers, and notes exactly as-is.
  - Add a very small trailing bottom padding only when rendering the actual last visible product row in an expanded course.
  - Apply it at the row wrapper/content-block level so the gap appears after the last product content, not between internal metadata lines.
  - Preserve the current compact density for all non-last rows.

- Update `src/components/kds/FlatItemList.tsx`
  - Mirror the same “last visible product only” trailing spacing rule used in `CourseSection.tsx`.
  - Keep internal row spacing unchanged so allergens/modifiers remain tight.
  - Ensure the final item in non-coursed tickets does not end flush against the card bottom.

- Do not reintroduce global bottom padding in `src/components/kds/OrderCard.tsx`
  - Leave the card/course container flush so empty-course whitespace does not return.
  - Keep the fix localized to the final rendered product block.

3. What will change visually
- A small, clean breathing space will appear after the last product in a ticket.
- The spacing between:
  - product name and allergen chips
  - product name and modifiers/add-ons
  - stacked modifiers/add-ons
  will stay tight and unchanged.
- The previous unwanted empty area under Done course headers will remain removed.

4. Technical details
- Focus only on:
  - conditional bottom padding or margin for `isLastVisible` rows in `CourseSection.tsx`
  - matching last-row spacing logic in `FlatItemList.tsx`
- Avoid changing:
  - card-level padding
  - course header height
  - product typography
  - allergen/modifier styling
  - row ordering, lifecycle logic, expand/collapse behavior

5. Validation
- Verify in Dine-In coursed tickets:
  - Active course
  - Preparing course
  - Done/served course when expanded
  - last product with allergens/modifiers/add-ons at the bottom of the card
- Verify in non-coursed tickets:
  - last visible product has the same final bottom breathing room
- Confirm both:
  - there is no extra empty block under a Done course header
  - there is now a small, intentional space after the last product content only
