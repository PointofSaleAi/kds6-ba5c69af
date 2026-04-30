# Plan: Auto-remove served work from active tickets

## Problem
Products marked Done currently sit visible in the ticket until the user taps them again. Courses linger after all their items are done. Whole tickets stay on screen even when fully served. Result: active board fills with already-completed work.

## Goal
- Tap an item to Done → it disappears from the ticket and is recorded in History.
- All items in a course Done → course confirms automatically and disappears, next course activates.
- All courses Served → ticket disappears from active view and moves to History.

## Behaviour rules

1. **Item Done = auto-remove**
   - When an item transitions from `preparing` → `done`, immediately call `onDismissItem(item.id)` (which already notifies the parent for History).
   - Exception: if the item has Servable Modifiers that are not all Done, keep the item visible. It auto-removes the moment the last servable modifier is Done.

2. **Course auto-confirm**
   - In `OrderCard`, watch each active course. When every non-cancelled item in it has been dismissed (or is `done` + all servable mods done), automatically add the course to `confirmedCourses`.
   - This flips its lifecycle to `served`, the existing collapse logic hides it, and the next course becomes active.

3. **Ticket auto-move to History**
   - In the order-store / parent that renders `OrderCard`, when every course of a ticket is `served` (or, for non-coursed tickets, every item dismissed), trigger the existing "remove ticket → push to history" path automatically. No second tap on the ticket Done button required.

4. **Undo path preserved**
   - Double-tap-to-undo still works on the row right up to the moment of dismissal. Once the item is gone it can be recovered through History → Recall (existing flow). No new undo UI.

## Files to change

- `src/components/kds/CourseSection.tsx` (`CourseItemTapRow`)
  - In `handleSingle`: when advancing causes status to become `done`, immediately call `onDismissItem` (respecting the servable-modifier guard).
  - In the servable-modifier completion effect: when the last servable mod for a parent item turns Done and the parent is already `done`, call `onDismissItem` for the parent.

- `src/components/kds/FlatItemList.tsx`
  - Mirror the same single-tap auto-dismiss + servable-mod completion auto-dismiss.

- `src/components/kds/OrderCard.tsx`
  - Add an effect: for each course in `displayCourses`, if all its non-cancelled items are in `dismissedItemIds` (or `done` with all servable mods done), add the course name to `confirmedCourses`. This triggers the existing served/collapse path.
  - Add an effect: when every course is `served` (or non-coursed ticket has all items dismissed), call the existing ticket-dismiss handler that moves it to History.
  - Remove the now-redundant "tap done item again to remove" branch path's user-facing wording (tooltips); it still functions as a no-op safety net.

- `src/components/kds/CourseSection.tsx` collapse effect
  - Re-enable auto-collapse when `collectiveState === 'done'` (since the course will immediately auto-confirm and disappear, this matches the new flow). Replace my prior change.

## Edge cases

- **Cancelled items**: ignored when computing "all items done", as today.
- **Servable modifiers pending**: parent item stays visible and Done; only auto-removes once mods complete. Course/ticket auto-confirm waits on this too.
- **Recall from History**: existing recall path restores the ticket; no change needed.
- **Expo / non-coursed orders**: ticket-level auto-dismiss fires when all items are dismissed.

## Out of scope
- No new settings toggle (behaviour is universal, matching the requested rule).
- No animation changes beyond existing fade/strikethrough.
- No History UI changes.
