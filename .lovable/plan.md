

## Problem
The "Recalled" tab in Expo view only shows locally tracked sent-out orders (tickets sent out from Expo that can be recalled back). It does not show orders recalled from History, which have `status: 'recalled'` in the order store. The user wants the Recalled tab to show ALL recalled orders/items from any source.

## Plan

### Update Recalled filter in `sortedTickets` memo (`ExpoView.tsx`)
Currently the recalled filter sets `base = []` and only appends `sentOutOrders`. Change it to:
1. Include orders with `status === 'recalled'` from the active tickets in the base list
2. Continue appending `sentOutOrders` (sent-out tickets awaiting recall-back) at the end

The logic change in the `sortedTickets` memo:
```
const base = filter === 'ready'
  ? allTickets.filter(t => allItemsDone(t))
  : filter === 'recalled'
  ? allTickets.filter(t => {
      const order = orders.find(o => o.id === t.id);
      return order?.status === 'recalled';
    })
  : allTickets;
```

This ensures:
- "All tickets" tab: shows everything (unchanged)
- "Ready only" tab: shows tickets with all items done (unchanged)
- "Recalled" tab: shows orders recalled from history (status `recalled`) plus sent-out orders available for recall-back

### Files to edit
- `src/components/kds/ExpoView.tsx` - Update recalled filter branch in `sortedTickets` memo

