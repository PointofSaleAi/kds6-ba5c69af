Problem
--------
In /kds/default ticket cards, the legacy action icons (eye / bell / check / undo) are currently vertically centered only against the first product-name row. When an item has modifiers, add-ons, notes or allergen chips below the name, the icon sits too high, aligned with the name instead of the full content block.

Root cause
----------
In `src/components/kds/CourseSection.tsx`, the action-icon container is nested inside the inner flex row that wraps the quantity, name and timestamp badges. It uses `absolute right-2 top-1/2 -translate-y-1/2`, so its `top-1/2` refers to the height of that inner row, not the full outer item container that also includes the allergens, modifiers and notes rendered afterwards.

Solution
--------
1. Move the legacy action icon block (and the 86 button block) so it is rendered as the last child of the outer item container, which already has `relative` positioning and `paddingRight: 56px` reserved for actions.
2. Keep the same `absolute right-2 top-1/2 -translate-y-1/2 z-10` positioning; now `top-1/2` will be the midpoint of the full row height (name + modifiers + allergens + notes).
3. Preserve the existing click handlers, stop-propagation wrapper, onboarding `data-onboarding` attributes, and the mutual exclusivity with the 86 button.
4. Keep the inner flex row free of the absolute icons to avoid layout drift and make the vertical centering reliable.

Files to edit
-------------
- `src/components/kds/CourseSection.tsx`

Validation
----------
- Type-check the project with `tsgo --noEmit`.
- Verify in the preview at `/kds/default` that items with modifiers (e.g., "FRIES · Seasoned") show the eye icon centered against the full row height, not just the name.
- Confirm the icon remains clickable and the recipe tooltip/flow still works.