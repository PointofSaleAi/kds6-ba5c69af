## Issue

In the screenshot, `GRILLED BARRAMUNDI` is marked Seen (green tint, "Seen at 15:22"), but its non-servable modifiers `Crispy Skin` and `No Fennel` stay on plain white. Visually the product appears Seen while its components look untouched, even though they are not independently actionable.

## Root Cause

In `src/components/kds/CourseSection.tsx`, when Servable Modifiers is ON the parent product's background tint is intentionally confined to the product header row only:

```ts
const isolateModifierRows = !!servableModifiersEnabled && hasModifiers;
// product background only applied when !isolateModifierRows (or to header div)
```

This isolation was added so that **servable** modifiers (which carry their own independent status) don't get visually swallowed by the parent's Seen/Done background. But the rule is currently applied to **all** modifiers under that product, including non-servable ones (`Crispy Skin`, `No Fennel`). Non-servable modifiers have no independent status of their own, so they should follow the parent product's visual state.

## Intended Behavior

When Servable Modifiers is ON, under a product that has both kinds of modifiers:

- **Non-servable modifiers** (extras, removes, neutral notes like `Crispy Skin`, `No Fennel`) inherit the parent product's tint and Done strikethrough/opacity, exactly as they did before Servable Modifiers existed. They are "part of" the product visually.
- **Servable modifiers** (uppercase, independently tappable) keep their current visual independence: their own background based on their own status, never inheriting the parent's tint, strikethrough, or opacity.

So in the screenshot, once the product is Seen, both `Crispy Skin` and `No Fennel` should also pick up the green Seen tint along with the product, while any servable modifier above/below them stays on its own state.

## Plan

### 1. Split modifier rendering into two visual groups
File: `src/components/kds/CourseSection.tsx` (and mirror in `src/components/kds/FlatItemList.tsx` if it duplicates the logic).

In the product item renderer:
- Compute `hasServableModifiers = servableModifiersEnabled && item.modifiers.some(m => m.isServable && m.type !== 'remove' && m.id)`.
- Change `isolateModifierRows` from `!!servableModifiersEnabled && hasModifiers` to `hasServableModifiers`. The product background should be confined to the header row **only when there is at least one servable modifier** that needs visual independence. Pure non-servable modifier lists go back to the pre-existing behavior where the product tint covers the whole block.

### 2. Render non-servable modifiers inside the product's tinted container
File: `src/components/kds/CourseSection.tsx`

Inside the product wrapper:
- Render non-servable modifiers (and allergens/notes that already followed product state) inside the same wrapper that carries the product's `productRowBg`, so they inherit the green Seen tint and Done strikethrough/opacity. This is the existing branch when `isolateModifierRows` is false; the change in step 1 reuses that branch whenever there are no servable modifiers.
- Render servable modifiers in a sibling block that sits **outside** the tinted wrapper (or with `backgroundColor: 'transparent'` overriding the parent), so they keep their own independent status background and never inherit the product's strikethrough/opacity. This matches today's isolation for servable rows.

### 3. Done-state inheritance for non-servable rows only
File: `src/components/kds/CourseSection.tsx`

The line-through and reduced opacity on Done products should apply to non-servable modifier text (current `isDone && !servableModifiersEnabled ? 'line-through' : ''` becomes `isDone && !isServableModifierLine ? 'line-through' : ''`), so non-servable modifiers strike through with the product while servable ones keep their independent text styling.

### 4. No changes to behavior or data model
- No changes to how status is tracked: product status stays in `itemStatuses`, servable modifier status stays in `modifierStatuses`. We are only fixing visual inheritance.
- No changes to `ModifierLine.tsx` rendering itself; the servable vs non-servable branch already exists there.
- No changes to spacing, fonts, or timestamp formatting.
- Tap behavior unchanged: product tap advances product (and any non-servable rows visually follow); servable modifier tap advances only that modifier.

## Out of Scope

- Cascading status from product taps down to servable modifiers. Servable modifiers remain independently actionable; that was the whole point of the earlier rework.
- Settings UI, toggle behavior, or the rule that servable modifiers render in uppercase.
- Allergen chip styling.