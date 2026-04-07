

## Problem

The spacing between product names and modifier lines persists because:
1. The product name uses `leading-tight` (line-height 1.25) at 13px, creating ~3px bottom space
2. The `text-modifier` Tailwind utility sets `line-height: 1.3`, adding top space
3. The current `-mt-1` (4px) negative margin is not enough to overcome the combined spacing

## Plan

**File: `src/components/kds/ModifierLine.tsx`**
- Change `leading-tight` to `leading-none` (line-height: 1) to eliminate internal top padding
- Increase negative margin from `-mt-1` to `-mt-1.5` (6px) to pull modifier text flush against product name

**File: `src/components/kds/CourseSection.tsx`**
- Change product name span from `leading-tight` to `leading-none` to reduce bottom spacing that pushes modifiers down

These two changes together eliminate the visual gap from both sides: the product name's bottom space and the modifier's top space.

