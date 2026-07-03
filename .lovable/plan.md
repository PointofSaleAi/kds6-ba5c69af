## Goal

Make the first-login walkthrough teach the ticket card and the Summary panel piece by piece, the same way it already walks the footer. Each cue gets its own spotlight and short caption instead of highlighting the whole ticket or the whole panel.

## Sample data

Enrich `src/data/onboarding-sample-order.ts` so every cue we teach is visibly present on the one sample ticket:

- 1 dine-in ticket, TABLE 1, "Trainer" server
- 1 course (ENTREE), fired
- 3 items so the panel has enough to teach:
  - Grilled Salmon x1, allergen: FISH, modifier: "+ Extra lemon" (blue extra)
  - Caesar Salad x1, modifier: "No croutons" (red strike removal)
  - Truffle Fries x2 (higher qty so Summary shows a count > 1, and one item shows as overtime by giving it an older `firedAt` / large `elapsedSeconds` so it lands in the Summary Overtime section)

## Anchors to add

Add stable `data-onboarding` attributes on:

- `OrderCard` header (order type strip)
- Order/table number block
- Order timer
- First item row (whole row)
- Allergen chip on the salmon row
- Modifier line on the salad row
- Item eye button (seen)
- Item bell button (cooking)
- Item check button (done)
- `OrderCardActions` ticket footer button (already tagged)

In `ItemSummaryPanel`:

- Overtime section container
- One category header row
- One product row inside the category
- Filter status bar area (shown after tapping a product)

Only one instance per attribute so the walkthrough selector is unambiguous.

## Walkthrough steps

Replace the current 18-step list in `src/components/onboarding/OnboardingWalkthrough.tsx` with a grouped sequence. Sample ticket must render before ticket steps run (already handled by the injection effect).

Ticket card group (spotlight + caption for each):
1. Order type header — "Order type. Color tells you Dine-in, Take-out, Delivery, Banquet at a glance."
2. Order/table number — "Order or table number. Big and centered so you can read it across the kitchen."
3. Order timer — "Ticket timer. Turns amber, then red as it gets older."
4. Item row — "Each row is one item on the order."
5. Allergen chip — "Allergens always show as a red chip. Never miss one."
6. Modifier line — "Extras show in blue, removals in red with a strikethrough."
7. Item eye — "Tap the eye to mark just this item as seen."
8. Item bell — "Tap the bell to mark it cooking."
9. Item check — "Tap the check when the item is done."
10. Ticket footer button — "Or tap the ticket button to move every item at once: seen, then cooking, then remove from the queue."

Summary panel group:
11. Panel header — "Summary panel shows what's still to cook."
12. Overtime section — "Overtime lists items that have been open too long. Fire these first."
13. Category header — "Items grouped by category."
14. Product row — "Tap a product to filter the queue to only tickets with that product. Tap again to clear."

Footer group: keep the existing footer steps (queue count, filter, revenue, sort, view modes, language, sound, theme, AI, datetime) unchanged.

Total ~28 steps. Progress dots and Skip stay as-is.

## Behavior details

- Preferred tooltip side: `right` for ticket-card cues, `left` for Summary panel cues, `top` for footer cues (already correct).
- Spotlight padding stays 6px; small chips (allergen, eye, bell, check) render fine at that size.
- If an anchor is not found for a step (e.g. no overtime item present), auto-advance to the next step instead of showing an empty tooltip.
- Sample ticket stays injected for the whole ticket + summary portion and is removed on finish/skip (already handled).

## Files touched

- `src/data/onboarding-sample-order.ts` — enrich sample items with allergen, modifiers, quantities, and an overtime item.
- `src/components/onboarding/OnboardingWalkthrough.tsx` — new step list, auto-skip when anchor missing.
- `src/components/kds/OrderCard.tsx` — anchors on header, order/table number, timer.
- `src/components/kds/FlatItemList.tsx` and/or `src/components/kds/CourseSection.tsx` — anchors on item row, allergen chip, modifier line, and the eye/bell/check buttons for the first item of the sample ticket only (guard by `data-order-id`).
- `src/components/kds/ItemSummaryPanel.tsx` — anchors on panel header, overtime section, first category, first product row.

No changes to real ticket behavior, Summary filtering, or footer controls — the walkthrough only points at them.
