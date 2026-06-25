## Goal
In `/kds/v1` compact view, the chevron indicator (signaling hidden modifiers/add-ons/allergens) is currently appearing on nearly every product row because most mock products carry modifiers or allergens. Visually it looks noisy and loses meaning. We want chevrons to appear only on a smaller subset of rows per ticket so they stand out as a real signal.

## Approach
Keep the chevron logic itself untouched (still: show when product has modifiers OR allergens, compact mode only). Reduce the number of rows that qualify by trimming mock data in the V1 dataset path only, so other routes/variants are unaffected.

In `src/pages/MainOrderView.tsx` (V1 remap block where `timeReceived` is already overridden for V1), add a deterministic filter: for each ticket, keep modifiers/allergens on roughly 1-2 products per ticket and clear them on the rest. Selection is index-based (e.g., every 3rd product keeps its modifiers/allergens) so it stays stable across renders and aging buckets.

Net effect in compact V1:
- Most product rows render as clean qty + name only, no chevron.
- 1-2 rows per ticket keep their modifiers/allergens, so the chevron still appears there and correctly signals "tap to see more".
- Standard (non-compact) V1 view is unchanged because chevrons only render in compact mode.
- Other variants (V2, V3, full) untouched because the data trim is gated to V1.

## Technical notes
- File: `src/pages/MainOrderView.tsx`, inside the existing V1 mock remap.
- Change shape: map over `order.items`, and for items where `index % 3 !== 0`, return `{ ...item, modifiers: [], allergens: [] }`.
- No changes to `OrderCardV1.tsx` chevron rendering.
- No changes to shared mock fixtures, so V2/V3/full keep full modifier/allergen data.

## Open question
Confirm the density you want: keep modifiers/allergens on **every 3rd product** (roughly 1-2 chevrons per ticket), or a different ratio (e.g., every 2nd, or only the first product in each ticket)?