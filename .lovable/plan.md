## Problem

On the History screen, selecting a Category or Revenue Center filter currently hides all tickets (or doesn't change anything) instead of filtering them. Two reasons:

1. **Category mismatch.** Filter options use singular UPPERCASE labels (`SALAD`, `DESSERT`, `APPETIZER`), but mock history items use mixed-case plurals (`Salads`, `Desserts`, `Appetizers`, `Meat`, `Poultry`, `Seafood`, `Pasta`, `Vegetarian`). Exact `toUpperCase()` comparison never matches item categories.
2. **Revenue Center mismatch.** Filter requires `item.station`, but history mock items don't have a `station` field, so any selected revenue center filters out every ticket.

## Fix (in `src/pages/MainOrderView.tsx`, `filteredHistory` memo)

1. **Normalize category comparisons** by uppercasing and stripping a trailing `S` on both sides, so `SALAD` matches `Salads`, `DESSERT` matches `Desserts`, etc. Also still match against the course label (`APPETIZER`, `ENTREE`, `DESSERT`).
2. **Add a category to revenue-center fallback map** for when `item.station` is absent:
   - `MEAT / POULTRY / SEAFOOD` to GRILL/KITCHEN
   - `SALAD` to COLD KITCHEN/KITCHEN
   - `APPETIZER / PASTA / VEGETARIAN / DESSERT` to KITCHEN
   - `BEVERAGE / COCKTAIL / BAR COCKTAIL` to BAR
3. A ticket passes the revenue center filter if any item either:
   - has a `station` in the allowed station set, OR
   - has a `category` that maps to one of the selected centers.

No UI changes. Order Type filter, sort, search, and chips behavior remain unchanged.