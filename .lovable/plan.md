## Problem

The mock orders in `src/data/mock-orders.ts` are defined out of order (23, 24, 25, 22, 26, 21, 27...). The queue renders them in array order, so the ticket numbers look scrambled on screen.

## Fix

Renumber the entries in `src/data/mock-orders.ts` so `orderNumber` matches array position — the first ticket gets the lowest number and each subsequent ticket increments by 1 (e.g. 21, 22, 23, 24, ... through the last entry).

No other files change. `MainOrderView` already reverses the visible queue when "Newest on Right" is set, so sequence will read left-to-right or right-to-left based on that setting.

## Out of scope

- History mock (`OrderHistoryScreen.tsx`) numbering
- Any change to sorting logic in `MainOrderView`
