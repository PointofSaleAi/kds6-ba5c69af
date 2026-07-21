## Why the blink isn't visible

Route `/kds/v3` is wired in `src/App.tsx` to `<Index cardVariant="v2" />`, which renders `src/components/kds/variants/OrderCardV2.tsx` — not `OrderCardV3.tsx`. The `isNew` row-blink logic was previously added only to `OrderCardV3.tsx` (an unused file), so the mock `isNew: true` items never blink in the ticket you're viewing.

The mock data already carries the flag (verified in `src/data/mock-orders.ts`: Meatballs, Grilled Salmon, Lobster Tail, Beef Wellington, Pork Belly, Chicken Caesar Wrap), and `use-order-store.tsx` preserves `item.isNew` end-to-end — the flag just isn't consumed by the visible row component.

## Fix

Port the exact row-blink behavior from `OrderCardV3.tsx` into `V2ProductRow` inside `OrderCardV2.tsx`:

1. Add `isNewBlink?: boolean` prop to `V2ProductRow`.
2. On the row `<div>` (line 231), append `animate-row-blink` when `isNewBlink` is true and inject the `--row-blink-rgb: 127 140 141` CSS var via `style`.
3. At the three `<V2ProductRow>` call sites (course-expanded list, completed items list, flat list), pass:
   ```
   isNewBlink={!reducedMotion && !!product.isNew && getRowState(product) === 'idle' && !isHistory}
   ```
   using the already-available `reducedMotion` from `useKDSSettings()` (it's already destructured in this file per earlier work).
4. No other change: the `animate-row-blink` keyframe already exists in `tailwind.config.ts`, and blink stops automatically as soon as the row leaves `idle` state (advance, undo, or served).

Scope is presentation-only, one file (`src/components/kds/variants/OrderCardV2.tsx`). No mock, store, or settings changes needed.
