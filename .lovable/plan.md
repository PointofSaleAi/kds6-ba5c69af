## Goal
Stop the blinking pulse on items (Meatballs, Grilled Salmon, etc.) in the Expo view ticket cards.

## Cause
`ExpoItemRow` applies `animate-new-item` whenever `item.isNew` is true and the id isn't in `acknowledgedNewItemIds`. Expo only handles already-cooked items, so the new-item alert is not meaningful here.

## Change
In `src/components/kds/ExpoView.tsx`:
- Force `isNewUnacked` to `false` inside `ExpoItemRow` so the pulse class is never applied and the row isn't treated as an unacknowledged new item.
- Remove the `if (isNewUnacked) onAcknowledgeNewItem?.(item.id)` branch from the tap handler (no longer reachable), keeping advance/revert behavior unchanged.

No other views (V1–V4, Seen/Unseen, History) are affected — the new-item indicator remains active in kitchen station cards per existing product rules.
