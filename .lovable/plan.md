
Goal: fix the Summary panel by making its Overtime logic use the same source of truth as the ticket cards, so products like Tiramisu appear correctly and category-row styling no longer gives false overtime signals.

1. Unify the aging logic
- Extract the ticket aging decision into a shared helper used by both `OrderCard.tsx` and `ItemSummaryPanel.tsx`.
- Base the helper on the real ticket rules:
  - Dine-in + course-level aging on: only the current active course can become overtime
  - All other cases: use order-level elapsed time
- Stop relying on `ItemSummaryPanel`'s separate approximation of overtime from raw `_startedAt` and quantity totals.

2. Move course activation timing out of local card-only state
- The current card uses local `courseActivatedAt` state inside `OrderCard.tsx`, which the Summary panel cannot see.
- Persist course activation timing in shared order data so both the cards and Summary read the same timestamps.
- Likely implementation:
  - update the order/course data in `MainOrderView.tsx` or `use-order-store.tsx`
  - set the active course start when a course becomes active
  - let `OrderCard.tsx` read from that shared timestamp instead of its private state

3. Rebuild Summary aggregation from item-level overtime facts
- Refactor `ItemSummaryPanel.tsx` so it first builds a normalized list of visible active items with:
  - product name
  - category
  - quantity
  - overtime boolean
  - overtime occurrence count
  - oldest elapsed seconds
- Then derive:
  - Overtime section = only overtime items, grouped by product name
  - Category sections = all products, still grouped by category, with overtime products also marked inside their category

4. Fix the Overtime count definition
- Show overtime counts as overtime item occurrences, not summed product quantity.
- Example:
  - one overtime ticket with `Tiramisu x8` should contribute `1` to the Overtime section
  - two overtime tickets containing Tiramisu should show `2`

5. Remove misleading quantity-based urgency styling in Summary rows
- The current red/orange category-row styling is driven by total quantity (`remaining >= 10`, `>= 5`), not real overtime.
- Replace that with overtime-aware styling so a row is highlighted because it is actually overtime, not because many are ordered.
- Keep rows static, with no pulse or blink effect for Panna Cotta or any other Summary item.

6. Keep the existing interaction model
- Preserve the current tap behavior:
  - tapping an overtime product filters tickets and moves matching tickets to the top
  - tapping a category still filters by category
- Keep the existing category-header layout, spacing, and typography as the visual reference.

7. Files to update
- `src/components/kds/ItemSummaryPanel.tsx`
- `src/components/kds/OrderCard.tsx`
- `src/pages/MainOrderView.tsx` and/or `src/hooks/use-order-store.tsx`
- possibly a new shared helper file such as `src/components/kds/aging-utils.ts` or `src/lib/kds-aging.ts`

8. Regression tests
- Add focused tests for the shared aging helper and Summary aggregation:
  - active dine-in dessert becomes overtime and appears in Overtime section
  - Tiramisu count reflects overtime occurrences, not quantity
  - overtime products also remain visible inside their normal category
  - Panna Cotta Summary row has no animation class
  - category-row styling reflects overtime state, not quantity thresholds

9. Expected result after implementation
- Tiramisu appears in the Overtime section whenever the same ticket logic marks it overtime
- The Overtime number is correct
- The same product also remains visible in Desserts
- Panna Cotta is static
- Summary and ticket cards stay synchronized because both read the same aging state
