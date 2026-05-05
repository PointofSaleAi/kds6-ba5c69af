## Goal

Make the inside of every History ticket use the same spacing/alignment as the Home ticket (`CourseSection` / `CourseItemTapRow`). Visual rules (strikethrough, opacity 0.5 modifiers, "Done at" course timestamp, allergens fully visible) stay exactly as they are today. Only spacing and alignment change.

## Current mismatch (History vs Home)

Home rows (`src/components/kds/CourseSection.tsx`, `CourseItemTapRow`) use:
- Row vertical padding: `var(--kds-row-py, 4px)` top + bottom
- Item header line: `flex items-center flex-nowrap`, `gap: 4px`, `lineHeight: 1.1`
- Quantity in its own fixed column: `width: 1.5ch` (compact) / `2.25ch` (standard), right-aligned, `font-normal`
- Product name as separate `font-bold uppercase` span, breaks inside its column
- Allergens row: invisible `0x` spacer (same width as qty column) + flex-wrap badges, `marginTop: var(--kds-child-gap, 1px)`
- Modifiers block: `paddingLeft: 16px` (compact) / `0px` (standard), `marginTop: var(--kds-child-gap, 1px)`, `gap: var(--kds-child-gap, 1px)`
- Notes row: invisible `0x` spacer + italic text, `paddingLeft: 16px` (compact) / `0px` (standard), `marginTop: var(--kds-child-gap, 1px)`

History rows (`src/components/kds/HistoryOrderCard.tsx`, `HistoryItemRow`) currently use:
- Row vertical padding default `2px` (different token default than Home's 4px)
- Item header: `flex items-center gap-2` (8px gap, wraps differently)
- Quantity is inlined in the name span as `{quantity}× {name}` (no fixed qty column, so allergens/modifiers/notes do not align under the name)
- Allergens use `pl-5 mt-1 gap-1` (hardcoded, not aligned to qty column, ignores `--kds-child-gap`)
- Modifiers have no left indent, no qty-column alignment
- Notes already use the qty-spacer + 16px paddingLeft pattern (only notes match Home today)

## Changes (single file: `src/components/kds/HistoryOrderCard.tsx`)

Update only `HistoryItemRow` and the surrounding course/items wrappers. Do not touch headers, course label row, "Done at" timestamp, recall logic, selection UI, OrderTypeBadge, OrderAllergenStrip, or OrderNotesSection.

1. **Row vertical padding** — switch from default `2px` to `4px` so it matches Home:
   - `paddingTop: 'var(--kds-row-py, 4px)'`
   - `paddingBottom: isLast ? 'calc(var(--kds-row-py, 4px) + 4px)' : 'var(--kds-row-py, 4px)'`

2. **Read `ticketLayout`** in `HistoryItemRow` (pass `isCompactLayout` as a prop from the parent, which already reads `useKDSSettings`). Use it to mirror Home's compact vs standard widths/indents:
   - `qtyColWidth = isCompactLayout ? '1.5ch' : '2.25ch'`
   - `detailIndent = isCompactLayout ? '16px' : '0px'`

3. **Item header line** — replace the current single-span `{quantity}× {name}` with the same two-span column layout Home uses:
   - Outer: `flex items-center flex-nowrap min-w-0`, `gap: 4px`, `lineHeight: 1.1`
   - Quantity span: `font-normal shrink-0`, `fontSize: var(--kds-item-qty)`, `width: qtyColWidth`, `textAlign: right`, `display: inline-block`, keep strikethrough class for done/cancelled parity (already always struck-through on History).
   - Name span: `font-bold uppercase min-w-0 flex-1 break-words` plus existing `line-through text-text-muted` (or `text-text-secondary` in selection mode). Keep current selection-mode and cancelled color logic.
   - Keep the existing `CANCELLED` chip; move it to the same row as a `shrink-0` element (matches Home).

4. **Allergens row** — replace `mt-1 pl-5 gap-1` with Home's aligned pattern:
   - Wrapper: `flex items-start`, `gap: 4px`, `marginTop: var(--kds-child-gap, 1px)`, `lineHeight: 1`
   - Invisible `0x` spacer span with the same `width: qtyColWidth` and `fontSize: var(--kds-item-qty)`
   - Inner badges container: `flex flex-wrap items-start`, `gap: 4px`, `rowGap: 2px`
   - Allergens stay fully visible (no opacity/strikethrough) per existing rule.

5. **Modifiers block** — wrap the existing `ModifierLine` map (which keeps `line-through` + `opacity: 0.5` per the prior fix) in a flex column that matches Home's spacing:
   - `display: flex`, `flexDirection: column`
   - `marginTop: var(--kds-child-gap, 1px)`
   - `gap: var(--kds-child-gap, 1px)`
   - `paddingLeft: detailIndent`
   - Pass `compactQtyCol={isCompactLayout}` to each `ModifierLine` so its internal qty column matches the new product row column. Continue passing `parentQuantity={item.quantity}` for parity with Home.

6. **Notes row** — keep the existing structure but switch its `paddingLeft` to `detailIndent` and its spacer `width` to `qtyColWidth` (currently hardcoded to `16px` / `1.5ch`, which only matches compact). Keep `marginTop: var(--kds-child-gap, 1px)` and existing italic + line-through styling.

7. **Container wrapper** — keep `-mx-1 px-1` and the `border-b border-border/50` divider exactly as is (Home uses an equivalent `-mx-2 px-2` + same divider). Do not change the items wrapper `px-1` around the map, and do not change course header `padding: '2px 8px'` or the `Done at HH:MM` element.

## Out of scope (do not touch)

- Order header (order number / guest / server / duration pill layouts)
- `OrderTypeBadge`, `OrderAllergenStrip`, `OrderNotesSection`
- Course label row, chevron, and `Done at HH:MM` timestamp
- Selection mode footer (Cancel / Recall N)
- Compact summary card branch (`compact === true`)
- Any color, font, opacity, or strikethrough rules

## Verification

- Open History at `/kds/full` → History, side-by-side with Home; confirm:
  - Row top/bottom padding matches Home for both Compact and Standard ticket layouts
  - Quantity column is right-aligned and the same width as Home; product name wraps in the name column
  - Allergen badges sit indented to the start of the name column (under the product), not under the quantity, and do not lose visibility
  - Modifier lines (including add-on green / remove red) align under the name column with the same left indent as Home and remain struck-through at 0.5 opacity
  - Notes align identically to Home in both Compact and Standard
- Re-check at Text Size = Compact / Standard / Large and Ticket Spacing = Compact / Standard / Spacious — spacing should scale via the same CSS variables as Home.
