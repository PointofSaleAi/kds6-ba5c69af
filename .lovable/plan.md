
Goal: make the Order Notes row use the exact same inner row shell as product rows so the eye icon lands in the identical position.

What I found:
- `OrderNotesSection.tsx` already matches some product-row spacing: `items-center`, `padding: '4px 0 4px 4px'`, `gap: 0`, and `ml-auto`.
- The remaining difference is structural. Product rows live inside the same `px-2 py-0.5` content wrapper and use the same row pattern: `flex items-center border-b border-border/50` with a left content block and a right action block.
- `OrderNotesSection` currently has its own standalone body row under a separate section header. That means it is still not literally using the same row container pattern as the product section, which can leave subtle width/alignment differences.

Plan:
1. Rebuild only the Order Notes body row to mirror the product row shell exactly
   - use the same row container classes as product items: `flex items-center border-b border-border/50`
   - keep the same item-row inline spacing: `padding: '4px 0 4px 4px'` and `gap: 0`
   - keep the same two-child structure:
     - left `flex-1 min-w-0` content cell
     - right action cell `flex items-center shrink-0 ml-auto`

2. Put the notes row inside the same outer content wrapper pattern used by product lists
   - wrap the notes row in `px-2 py-0.5` so its horizontal bounds match the product section body
   - keep the existing "Order Notes" header untouched above it

3. Preserve notes-specific behavior and styling
   - keep the note text styling and acknowledgment toggle as-is
   - keep `KdsActionIcon` unchanged
   - keep the dimmed acknowledged state on the row

4. Validate the intended visual match
   - compare a ticket that shows both order notes and product items
   - confirm the notes eye icon shares the same right edge and vertical centering as the product eye icon
   - confirm clicking still toggles between `seen` and `acknowledged`

Technical details:
- File to update: `src/components/kds/OrderNotesSection.tsx`
- Reference shell to mirror: product rows in `src/components/kds/CourseSection.tsx` and `src/components/kds/FlatItemList.tsx`
- No test logic changes expected because current tests cover render and toggle behavior, not layout

Why this is the safest fix:
- It follows your request literally by reusing the same container structure as the product section
- It avoids changing icon assets, sizes, labels, or other ticket UI
- It targets only the source of the remaining alignment mismatch: the notes row wrapper structure
