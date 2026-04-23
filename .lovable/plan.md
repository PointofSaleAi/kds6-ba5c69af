
## Scope

Fix the compact-layout row spacing so the expand/collapse chevron sits tightly against the quantity prefix on every product row, across all ticket cards and all category sections. Standard layout remains untouched.

## Root Cause

The previous spacing change was only applied in `src/components/kds/FlatItemList.tsx`, which covers the flat item list path.

But many compact rows are rendered through `src/components/kds/CourseSection.tsx` (`CourseItemTapRow`), and that component still uses the older, looser chevron spacing:
- `mr-1`
- `width: 18, height: 18`

That is why the gap still appears across compact tickets.

## Implementation Plan

1. Update the compact expandable row control in `src/components/kds/CourseSection.tsx`
   - Tighten the chevron button footprint.
   - Remove the extra Tailwind right margin (`mr-1`) and replace it with the same tighter spacing used for compact rows.
   - Keep this change scoped only to the compact expandable-row case (`ticketLayoutCompact && hasDetails`).

2. Normalize the compact chevron spacing in both row renderers
   - Ensure `CourseSection.tsx` and `FlatItemList.tsx` use the same compact chevron dimensions and the same minimal trailing space before the quantity prefix.
   - This keeps spacing visually identical for:
     - Dine-In / course-based rows
     - Flat list rows
     - All compact ticket cards

3. Do not change anything else
   - No changes to quantity text styling
   - No changes to row typography, colors, spacing tokens, allergens, modifiers, notes, footer, or standard layout
   - No changes to header behavior

## Files to Update

- `src/components/kds/CourseSection.tsx`
- `src/components/kds/FlatItemList.tsx` (only if needed to fully align both compact row paths)

## Technical Notes

Current mismatch:
```tsx
// FlatItemList.tsx
style={{ width: 14, height: 14, marginRight: 2 }}

// CourseSection.tsx
className="shrink-0 mr-1 ..."
style={{ width: 18, height: 18 }}
```

Target outcome:
```text
Compact expandable rows use one shared tight chevron footprint
with minimal trailing gap before the quantity prefix.
```

## Verification

After implementation, compact layout should show:
- chevron and `1x / 2x / 3x` sitting noticeably closer together
- identical spacing in all category sections and all ticket cards
- no visual change in standard layout
