

## Problem

The product names and modifier lines are colliding/overlapping on order cards. Root cause:

1. The `text-modifier` Tailwind utility (defined in `tailwind.config.ts` line 110) sets `line-height: 1.3` — but the inline `leading-none` class cannot override it because `text-modifier` is a `fontSize` utility that bundles its own line-height.
2. The `-mt-1.5` (6px) negative margin pulls the modifier text too far up, causing it to overlap with the product name above.
3. The product name also uses `leading-none`, compressing everything vertically.

## Plan

**File: `src/components/kds/ModifierLine.tsx`**
- Remove `leading-none` (it's being overridden anyway by `text-modifier`)
- Change `-mt-1.5` back to `-mt-0.5` (2px) — enough to keep items close but not overlapping
- This gives a clean 2px gap consistent with the design philosophy of dense but readable spacing

**File: `src/components/kds/CourseSection.tsx`**
- Change product name `leading-none` back to `leading-tight` — `leading-none` at 13px makes the text box too short, causing the modifier to visually collide
- This restores proper vertical rhythm while keeping the layout dense

These changes fix the collision by restoring appropriate line-heights while maintaining tight (but not overlapping) spacing between product names and modifiers.

