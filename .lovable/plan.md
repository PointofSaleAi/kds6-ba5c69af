

## Scope

Fix the dual-language secondary row alignment in compact view so the secondary language name aligns vertically with the primary product name, matching the user's marked vertical line.

## Root Cause

In compact layout, the primary quantity column is `1.5ch` wide, but the secondary-language icon spacer is hardcoded to `2.25ch`. That extra `0.75ch` pushes the language icon (and the secondary name after it) right of the primary name's left edge.

This bug exists in two places:
- `src/components/kds/FlatItemList.tsx` (line 227)
- `src/components/kds/CourseSection.tsx` (line 592)

## Changes

For both files, update the secondary-language qty-spacer `<span>` width to match the primary qty column:

```tsx
// before
style={{ fontSize: 'var(--kds-item-qty)', width: '2.25ch', ... }}

// after
style={{ fontSize: 'var(--kds-item-qty)', width: ticketLayoutCompact ? '1.5ch' : '2.25ch', ... }}
```

This places the Languages icon directly under the `1x / 2x` quantity prefix, so `tpSecondary(item.name)` lines up exactly with `tp(item.name)` above it.

## Verification

In compact view with dual language ON:
- Languages icon sits centered under the quantity number column
- Secondary language name's left edge aligns with the primary name's left edge
- Standard layout unchanged
- Behavior consistent across all category sections, all ticket cards, and both component code paths

