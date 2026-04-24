
## Goal

Make the Language screen preview truly independent from the saved Display > Ticket Layout setting, and fully resolve the left-nav tooltip overlap while keeping the existing Language screen structure unchanged.

## Root Cause

The preview toggle is only partially decoupled today.

- `InlineLanguageSettings.tsx` does keep a local `previewLayout` state
- `OrderCard.tsx` does accept `layoutOverride`
- But nested ticket renderers still read the global `ticketLayout` directly from `useKDSSettings()`

This means the preview card can switch at the top level, while inner item/course rendering still follows the saved Display setting. That is why the Language screen preview feels overridden or inconsistent.

The tooltip issue is also only partially fixed. Raising tooltip `z-index` alone is not enough if the tooltip content remains inside a lower stacking context than the Language overlay.

## Changes

### 1. Make preview layout fully local and authoritative

#### `src/components/kds/InlineLanguageSettings.tsx`
- Keep `previewLayout` as local state
- Keep its default as `'standard'` when the Language screen opens
- Continue using the local `View as` toggle only for preview rendering
- Remove any remaining dependence on the global saved `ticketLayout` for preview UI text or branching

### 2. Propagate layout override through the whole ticket tree

#### `src/components/kds/OrderCard.tsx`
- Replace the current partial override approach with a single resolved layout value:
  - `resolvedTicketLayout = layoutOverride ?? ticketLayout`
- Use that resolved value everywhere inside `OrderCard`
- Stop mixing `compact` and `layoutOverride` in a way that creates two separate rendering paths with different logic
- Pass the resolved layout down to child components instead of letting them read global settings

#### `src/components/kds/FlatItemList.tsx`
- Add a prop like `ticketLayoutMode?: 'standard' | 'compact'`
- Use that prop to compute compact item-row behavior
- Fall back to global settings only when no override is provided

#### `src/components/kds/CourseSection.tsx`
- Add the same `ticketLayoutMode?: 'standard' | 'compact'` prop
- Use it instead of reading the saved global layout directly
- Pass the value through to any nested compact/detail logic so course rows match the preview mode exactly

## Implementation detail for compact preview

The current preview uses:
- local branch in `InlineLanguageSettings`
- `compact` prop on `OrderCard`
- `layoutOverride="compact"`

That creates overlapping control paths.

I will simplify this so there is one source of truth:

- Standard preview renders the standard ticket using `previewLayout = 'standard'`
- Compact preview renders the compact ticket using `previewLayout = 'compact'`
- Both modes are driven by the same resolved layout pipeline, not by a mix of preview-only wrappers plus global child settings

This will guarantee:

- Ticket Layout = Compact, View as = Standard → preview shows Standard
- Ticket Layout = Compact, View as = Compact → preview shows Compact
- Ticket Layout = Standard, View as = Standard → preview shows Standard
- Ticket Layout = Standard, View as = Compact → preview shows Compact

## 3. Fix sidebar tooltip overlap properly

#### `src/components/ui/tooltip.tsx`
- Render tooltip content inside a Radix `Portal`
- Keep a high z-index on the tooltip content
- This removes the tooltip from the sidebar’s local stacking context so it can appear above the Language overlay

#### `src/pages/settings/DisplaySettings.tsx`
- Keep the Language screen overlay below tooltip level
- Preserve the current left offset and bottom offset so the left rail and footer remain visible

## 4. Verify alignment with project knowledge

No layout changes will be made to:
- Language scope tabs
- Display mode cards
- Language pair section
- Language list
- Save button
- Global Display > Ticket Layout behavior

The fix is scoped to preview rendering and tooltip layering only.

## Files to update

- `src/components/kds/InlineLanguageSettings.tsx`
- `src/components/kds/OrderCard.tsx`
- `src/components/kds/FlatItemList.tsx`
- `src/components/kds/CourseSection.tsx`
- `src/components/ui/tooltip.tsx`

## Technical notes

```text
Language preview toggle
        ↓
InlineLanguageSettings.previewLayout
        ↓
OrderCard.resolvedTicketLayout
        ↓
CourseSection / FlatItemList / nested rows
        ↓
Render standard or compact consistently
```

```text
Tooltip trigger in sidebar
        ↓
Tooltip content rendered in Portal
        ↓
High z-index outside sidebar stacking context
        ↓
Visible above Language overlay
```

## Validation checklist

- Open Settings > Display > Language
- Toggle View as between Standard and Compact
- Confirm the preview switches every time, regardless of saved Display ticket layout
- Change global Display > Ticket Layout and confirm the Language preview does not change until View as is changed locally
- Hover collapsed left-nav icons while Language screen is open
- Confirm tooltip appears above the overlay
- Confirm left rail and footer remain visible
