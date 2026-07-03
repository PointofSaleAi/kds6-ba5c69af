## Problem
In the default ticket card view (`CourseItemTapRow` inside `CourseSection.tsx`), the primary-language product name span has `display: block` (via the Tailwind `block` class on line 642). This makes the element fill the full width of its `flex-1` parent, leaving empty space to the right of the text. The user sees this as unwanted trailing space in the browser inspector and it can affect layout.

## Fix
Change the `className` on the primary name `<span>` in `src/components/kds/CourseSection.tsx` (line 642) from `block` to `inline-block`. This keeps the element on its own line within the flex column while making it shrink-wrap to the text width instead of stretching to fill the container.

## Files changed
- `src/components/kds/CourseSection.tsx` — one class change on the primary name span

## Verification
After the change, the product name element in the default view should hug the text content with no trailing empty space, while text wrapping and the `TightWidthBox` secondary-language width measurement remain intact.