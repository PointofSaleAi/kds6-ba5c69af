## Goal
The right-side Cooking Summary panel currently renders only on the Home (and Expo) screen. Show the same panel on History, Seen, and Unseen screens, but feed it ONLY the tickets visible on that screen so categories/products reflect what the user is actually looking at.

## Scope
File: `src/pages/MainOrderView.tsx` (panel mount + per-screen order source)
File: `src/pages/SeenOrdersScreen.tsx` (accept an optional `orders` prop, mirroring `UnseenOrdersScreen`)

No changes to `ItemSummaryPanel` itself — it already accepts an `orders` prop and computes categories/items dynamically.

## Changes

### 1. `MainOrderView.tsx` — always mount the panel (except Settings)
Currently the right-side panel is gated by `!settingsOpen && !isSubScreen`, which hides it on History/Seen/Unseen. Drop the `!isSubScreen` part so it stays visible on those screens.

### 2. `MainOrderView.tsx` — pick the order source per screen
Add a memo `summaryPanelOrders` that selects which list to feed into `ItemSummaryPanel`:

- Home (default): `ordersWithItemStatuses` (current behavior)
- Expo: unchanged (uses `ExpoSummaryPanel`)
- History: `filteredHistory` (already respects search, date tabs, station view, category/revenue chips)
- Unseen: `filteredOrders` filtered to `!seenOrderIds.has(o.id)` (matches what `UnseenOrdersScreen` renders, including its station-view item filtering)
- Seen: `activeOrders` filtered to `seenOrderIds.has(o.id)` plus the same station-view item filtering used by `SeenOrdersScreen`

Wire the panel:
```tsx
<ItemSummaryPanel
  orders={summaryPanelOrders}
  stationCourse={resolvedStationCourse}
  selectedItems={selectedSummaryItems}
  onItemToggle={handleSummaryItemToggle}
  selectedCategories={selectedSummaryCategories}
  onCategoryToggle={handleSummaryCategoryToggle}
  onClearAll={handleSummaryClearAll}
  matchingTicketCount={matchingTicketCount}
/>
```

### 3. `SeenOrdersScreen.tsx` — accept optional `orders` prop
Mirror the pattern already used by `UnseenOrdersScreen`:
```tsx
interface SeenOrdersScreenProps {
  orders?: Order[];
  // ... existing props
}
const sourceOrders = ordersProp ?? storeOrders;
```
Then update `MainOrderView` to pass the seen-filtered list:
```tsx
<SeenOrdersScreen orders={seenScreenOrders} ... />
```
This keeps the screen content and the Summary panel feeding from the exact same ticket set.

### 4. Notes / non-goals
- Summary item/category selection already reorders `filteredOrders` on Home; on History/Seen/Unseen the selection will continue to highlight matching items inside `ItemSummaryPanel`. Reordering tickets on those sub-screens is out of scope for this change.
- The standalone `src/pages/OrderHistoryScreen.tsx` is not used inside the KDS shell (the History view is rendered inline by `MainOrderView`), so it does not need editing here.
- Dock layout (`dockLayout.summaryPanel`) and collapse behavior are inherited automatically.

## Verification
- Navigate to History, Seen, Unseen — the right-side Summary panel renders with the same styling as Home.
- Counts and category/item rows reflect only the visible tickets on each screen.
- Switching date tabs, search, or station view on History updates the panel in real time.
- Acknowledging an unseen order moves it from the Unseen panel summary to the Seen panel summary.
- Settings screen still hides the panel.
