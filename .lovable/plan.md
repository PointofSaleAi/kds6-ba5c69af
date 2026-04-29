## Goal

Make **Text Size**, **Ticket Spacing**, and **Ticket Layout** apply consistently to every order surface: Home, **Expo**, **Station view**, **History**, **Seen**, and **Unseen**.

## What's happening today

All three settings are stored globally in `useKDSSettings` (`textSize`, `ticketSpacing`, `ticketLayout`) and persisted to localStorage, so the values themselves are shared. The gap is in how they are applied to the DOM:

- `MainOrderView.tsx` (line 718) wraps the active board in a div that sets the text-scale and ticket-spacing CSS classes. Home, Expo, Station, History (inline), Seen, and Unseen all render inside this wrapper, so in theory they inherit the CSS variables.
- `OrderCard`, `CourseSection`, `FlatItemList`, and `HistoryOrderCard` already read `ticketLayout` from the hook.
- However, several spots bypass these tokens:
  1. `ExpoView` items use `var(--kds-item-qty)` etc. but several rows in `ExpoView.tsx` still hard-code widths/line-heights tied to the Standard size (e.g. `width: '2.25ch'`, fixed pixel paddings) instead of switching with `ticketLayout` like `FlatItemList` does.
  2. `HistoryOrderCard` reads `ticketLayout` but doesn't actually re-render the item rows differently for `compact`; the `isCompactLayout` value is computed and then unused for the row layout (only the header path uses it). Spacing tokens (`--kds-row-py`, `--kds-child-gap`) are also not consumed here.
  3. The standalone `src/pages/OrderHistoryScreen.tsx` uses `fixed inset-0` and never wraps content in the `text-scale-*` / `ticket-spacing-*` class. (Currently not the active history route, but it should be safe-defaulted.)
  4. `PrepBoard` (Station view) renders order cards without ensuring the spacing/text classes are present on its own root, so when the Station view is reached through a path that doesn't go through the line 718 wrapper (e.g. portrait fallback), it loses scaling.

## Plan

1. **Single source-of-truth wrapper utility**
   - Add a small helper `getKdsScaleClasses(textSize, ticketSpacing)` in `src/lib/kds-scale.ts` that returns the same className string used at `MainOrderView.tsx:718`.
   - Replace the inline ternary at line 718 with this helper.

2. **Guarantee the wrapper is applied on every order surface**
   - `PrepBoard.tsx`: add the helper classes to its root `div` so Station view scales even when used outside the main wrapper.
   - `ExpoView.tsx`: add the helper classes to its outermost board container.
   - `SeenOrdersScreen.tsx`, `UnseenOrdersScreen.tsx`: add the helper classes to their root `flex-1 flex flex-col` container so they remain correct if ever rendered as a standalone route.
   - `OrderHistoryScreen.tsx` (standalone fallback): add the helper classes to its `fixed inset-0` root.

3. **Honor `ticketLayout` (Standard vs Compact) everywhere a card renders**
   - `HistoryOrderCard.tsx`: actually use `isCompactLayout` to:
     - collapse item-row padding (use `--kds-row-py` token, smaller qty column width `1.5ch` vs `2.25ch`, indent modifiers `16px` vs `0px`) matching `FlatItemList` behavior.
     - reduce header padding when compact.
   - `ExpoView.tsx`: read `ticketLayout` from `useKDSSettings`, then mirror the compact behavior already present in `FlatItemList` (qty column width, modifier indent, child gap).

4. **Honor `ticketSpacing` tokens in the expo and history rows**
   - Replace hard-coded `gap`, `marginTop`, `paddingY` values in `ExpoView.tsx` and `HistoryOrderCard.tsx` rows with the existing CSS tokens (`var(--kds-row-py)`, `var(--kds-child-gap)`, `var(--kds-item-gap)`, `var(--kds-card-padding)`) so Compact / Standard / Spacious actually move the layout.

5. **Verification**
   - From Display Settings, switch Text Size → Compact / Standard / Large and Ticket Spacing → Compact / Standard / Spacious and Ticket Layout → Standard / Compact, then visit:
     - Home (default)
     - Expo (kdsMode = Expo)
     - Station view (kdsMode = Prep with a station selected)
     - History tab
     - Seen Orders
     - Unseen Orders
   - Confirm fonts, row padding, and qty column width all change in lockstep on every screen.

## Technical notes

- No new settings, no schema changes. Only DOM wrappers and rendering branches.
- Keep the existing CSS variables in `index.css` unchanged; this plan only ensures every surface inherits them and that `ticketLayout` actually rewires the row markup in the two cards (Expo, History) that currently ignore it.
- No em dashes used. No hardcoded data introduced.
