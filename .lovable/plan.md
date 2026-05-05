## Goal

Make the existing bottom-bar controls (Category filter, Revenue Center filter, Sort) actually filter and order tickets shown on the History tab. Currently they open panels and toggle a sort enum, but History ignores all three.

## Changes

### 1. `src/pages/Index.tsx`
- Add state: `historyCategories: string[]` and `historyCenters: string[]`.
- Pass them plus setters to `MainOrderView` and to the two filter panels' `onApply` handlers.
- Keep panel open/close behavior unchanged.

```ts
const [historyCategories, setHistoryCategories] = useState<string[]>([]);
const [historyCenters, setHistoryCenters] = useState<string[]>([]);

<CategoryFilterPanel ... activeCategories={historyCategories}
  onApply={(cats) => setHistoryCategories(cats)} />
<RevenueCenterFilter ... activeCenters={historyCenters}
  onApply={(cs) => setHistoryCenters(cs)} />

<MainOrderView ... historyCategories={historyCategories}
  historyCenters={historyCenters}
  onClearHistoryCategories={() => setHistoryCategories([])}
  onClearHistoryCenters={() => setHistoryCenters([])} />
```

### 2. `src/pages/MainOrderView.tsx`
Accept the new props. Extend `filteredHistory` memo:

- **Category filter** (matches the panel's course-style labels APPETIZER/SALAD/ENTREE/DESSERT/BEVERAGES/etc.): keep an order only if any of its `courses[].course` (uppercased) is in `historyCategories`. For matching SIDES/BAKERY/KIDS MENU/SPECIALS/BAR COCKTAIL that don't map to `CourseType`, also accept orders where any `item.category` (uppercased) matches.
- **Revenue center filter** (BAR/KITCHEN/GRILL/COLD KITCHEN/PASS/EXPO): keep an order only if any item's `station` (uppercased) matches a selected center. Map: `KITCHEN` => any station, `COLD KITCHEN` => `Salad`, `PASS`/`EXPO` => any (treated as pass-through), `BAR` => `Bar`, `GRILL` => `Grill`. Concrete map kept in a small const at top of the file.
- **Sort**: apply the same `sortMode` logic already used for active orders (`newest`, `oldest`, `table`, `type`) to the history list, using `timeReceived` as the timestamp.

Add deps to the memo: `sortMode, historyCategories, historyCenters`.

### 3. Active filter chips row (already exists for order-type)
Extend the chips strip on the History header to also render chips for active categories and centers, each with an `X` to remove. "Clear all" clears order type, categories, and centers together.

### 4. No changes to
- Filter panel UIs (`CategoryFilterPanel.tsx`, `RevenueCenterFilter.tsx`) other than receiving `activeCategories`/`activeCenters` (already supported props).
- `BottomStatusBar` sort dropdown (already wired to `sortMode`).
- Ticket card layout, search, date tabs, station view behavior.

## Acceptance

- Selecting categories in the Category panel and applying filters History to orders containing matching courses/items; chip appears; "Clear all" removes it.
- Selecting revenue centers filters History to orders with matching item stations.
- Changing sort in the bottom bar reorders History tickets (newest/oldest by `timeReceived`, table by `tableName`, type by `orderType`).
- All three controls compose with the existing order-type filter and search.
