## Current Cause

The visible sequence is being driven by ticket age, not by order number. The current ticket sort maps `By time` to `newest`, which sorts by `timeReceived`. The mock tickets have sequential order numbers, but their `timeReceived` offsets are intentionally non-sequential, so the UI shows numbers like `21, 31, 33, 32...` when sorted old-to-new.

There is also a second issue in horizontal mode when `Ticket Flow Direction = Newest on right`: the code both reverses the order data and applies `flex-row-reverse`, which can make the visual order harder to reason about.

## Plan

1. **Add explicit numeric order sorting**
   - Update the main ticket ordering logic in `MainOrderView.tsx` so the default ticket list sorts by `orderNumber`, not by `timeReceived`.
   - Keep table/type sort options working as they do now.

2. **Preserve flow direction as placement only**
   - Make `Ticket Flow Direction` control where the sequence starts visually:
     - `Newest on left`: sequence displays left-to-right.
     - `Newest on right`: sequence starts from the right and the user scrolls right-to-left.
   - Avoid double-reversing the ticket array and the flex direction.

3. **Align history sorting behavior**
   - Apply the same order-number based default sorting to history, seen, and unseen ticket screens when they use the shared KDS ordering path.

4. **Keep new order generation intact**
   - Leave the existing sequential generator in `use-order-store.tsx` intact because it already assigns max existing number + 1 for newly added orders.
   - The fix is for display order, not number generation.

5. **Verify the result**
   - Check `/kds/v3` in horizontal and grid modes.
   - Confirm visible ticket numbers render in sequence.
   - Confirm `Newest on right` places the sequence from the right without scrambling the order.