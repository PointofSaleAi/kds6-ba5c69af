## Goal
Make `HistoryOrderCard` rows visually match the Home screen's `OrderCard` (via `CourseSection` / `FlatItemList`): tighter course header padding, dividers between products, and no gap between the allergen strip and the first course header on dine-in tickets.

## Files to edit
- `src/components/kds/HistoryOrderCard.tsx` (only)

## Reference (Home card patterns to mirror)
- Course header: `padding: '2px 8px'` with `bg-muted` (no `mt-1`) — see `CourseSection.tsx` L322–323.
- Item rows wrapper: `px-1` (see `CourseSection.tsx` L358).
- Each item row: bottom border `border-b border-border/50` except the last visible row; `paddingTop: 2px`, `paddingBottom: 2px` (`6px` on last) — see `FlatItemList.tsx` L147–155.

## Changes in `HistoryOrderCard.tsx`

### 1. Course header — remove top margin, use Home spacing
Replace the dine-in course header:
```
<div className="flex items-center justify-between bg-muted px-3 py-1.5 mt-1">
  <span className="text-section-label uppercase text-text-muted tracking-widest">
    {tl(courseGroup.course)}
  </span>
</div>
```
with the tighter Home style (no `mt-1`, `padding: 2px 8px`):
```
<div
  className="flex items-center justify-between bg-muted"
  style={{ padding: '2px 8px' }}
>
  <span
    className="uppercase text-text-primary tracking-wider"
    style={{ fontWeight: 600, fontSize: 'var(--kds-course-header)' }}
  >
    {tl(courseGroup.course)}
  </span>
</div>
```
This (a) removes the gap between the bottom horizontal line / allergen strip and the APPETIZER header (request #3) and (b) tightens the top space above the course label (request #1).

### 2. Items wrapper — reduce vertical padding
Change the items container from `px-3 py-1` to `px-1` (matching `CourseSection`) for both the dine-in (coursed) and non-coursed branches, so item rows hug the course header.

### 3. `HistoryItemRow` — add per-row divider + Home spacing (requests #1 & #2)
Update the row to:
- Accept `isLast: boolean` prop from the parent map (compute `idx === items.length - 1`).
- Apply `-mx-1 px-1` so the divider spans the inner padding edge (matches Home's `-mx-2 px-2`).
- Add `border-b border-border/50` when `!isLast`.
- Use inline `paddingTop: 2px` and `paddingBottom: isLast ? 6px : 2px` (matches `FlatItemList.tsx` L150–154).
- Keep existing tap-to-recall handlers and strikethrough styling.

Resulting wrapper (replacing the current `className="flex items-start gap-2 py-0.5 ..."`):
```
<div
  role={...} tabIndex={...} onClick={...} onKeyDown={...}
  className={`-mx-1 px-1 ${isLast ? '' : 'border-b border-border/50'} ${item.isCancelled ? 'opacity-50' : ''} ${interactive ? 'cursor-pointer active:bg-muted/40 hover:bg-muted/30' : ''}`}
  style={{ paddingTop: '2px', paddingBottom: isLast ? '6px' : '2px' }}
>
  <div className="flex items-start gap-2">
    {/* existing inner content: quantity + name + allergens + modifiers */}
  </div>
</div>
```

Pass `isLast` from both call sites:
- Dine-in: `courseGroup.items.map((item, idx, arr) => <HistoryItemRow ... isLast={idx === arr.length - 1} />)`
- Non-coursed: `allItems.map((item, idx, arr) => <HistoryItemRow ... isLast={idx === arr.length - 1} />)`

## What this delivers
1. ✅ Tighter top/bottom space between the course label (e.g. APPETIZER) and the first product name — course header is now `2px 8px` with `px-1` items wrapper instead of `py-1.5` + `py-1`.
2. ✅ Horizontal divider between each product row, matching Home's `border-b border-border/50` with the same row padding.
3. ✅ Dine-in tickets: the `mt-1` gap between the allergen strip's bottom border and the APPETIZER section is removed, so the section starts flush against the divider — same as Home.

No changes to interaction (tap-to-recall on row & header), translation handling, layout-mode logic, or any other component.
