

## Issues Found

**1. Recalled tab shows all tickets**
In `sortedTickets` (line 900-933), the `recalled` filter has no dedicated branch. When `filter === 'recalled'`, it falls through to the else of `filter === 'ready'`, which returns `allTickets` (all active tickets). Then `sentOutOrders` are appended at the end. The Recalled tab should only show sent-out orders that can be recalled, not all active tickets.

**2. Demo ticket 104 (Dine In) missing courses**
Demo tickets like #104 don't have a `courses` array on the `ExpoTicket` object. Line 272 explicitly skips courses for demo tickets (`!demoTicket && ...`). Since demo dine-in tickets should also show courses per the rule "dine-in and banquet always show courses", we need to auto-generate course data for demo tickets that lack it.

## Plan

### Fix 1: Recalled filter logic
In `sortedTickets` memo, add a branch for `filter === 'recalled'` that sets `base` to an empty array (no active tickets), so only the appended `sentOutOrders` are shown.

```
const base = filter === 'ready'
  ? allTickets.filter(t => allItemsDone(t))
  : filter === 'recalled'
  ? []
  : allTickets;
```

### Fix 2: Auto-generate courses for demo dine-in tickets
In the `ExpoTicketCard` component, update the `realCourses` derivation to also generate a single course for demo dine-in/banquet tickets that have no `coursing` data. Group all items into one "Main Course" (or derive from station grouping). This gives demo tickets the same course section UI as real orders.

Alternatively, add `courses` data directly to the demo ticket definitions in `mock-expo-demo.ts` for tickets 101, 102, 103, 104, 105.

**Recommended approach**: Add explicit `courses` arrays to all dine-in/banquet demo tickets in `mock-expo-demo.ts`. This is cleaner than runtime derivation and gives full control over course names and status.

### Files to edit
- `src/components/kds/ExpoView.tsx` - Fix recalled filter logic
- `src/data/mock-expo-demo.ts` - Add `courses` arrays to dine-in/banquet demo tickets (101, 103, 104, 105)

