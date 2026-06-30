## Goal
On the `/old` KDS route only, replace the current circular per-product action icons with the rounded-square "pill" action buttons shown in the screenshots, and align the footer SEEN / IN PROGRESS / DONE button colors to match.

Scope is strictly visual + per-product icon swap on the legacy-actions code path. Behavior, lifecycle, and other routes (`/kds/full`, `/v1`–`/v5`) are unchanged.

## Per-product icon spec (rounded-square, ~40×30, radius 4)

| Product state | Right-side controls |
| --- | --- |
| Unseen (initial) | Single **Eye** pill: light-blue bg `#D9EAFF`, eye icon `#176ACA`. Tap → mark Seen / In Progress. |
| In Progress (seen) | **Undo** pill (`#BDC1CD` bg, white undo arrow) + **Bell** pill (light-red `#FADBD8` bg, red `#E74C3C` bell). Bell → mark Done. Undo → back to Unseen. |
| Done | **Undo** pill + **Check** pill (light-purple `#E8DAEF` bg, purple `#7D3C98` check). Undo → back to In Progress. |

Reuse the existing SVG assets where they match (`seen-icon.svg`, `undo-icon.svg`); render the bell and check states as the same rounded-square wrapper with a Lucide `ConciergeBell` / `Check` icon recolored per spec.

## Footer button colors (legacy-actions only)
Match the screenshots:
- SEEN button: blue `#3F6FD8`
- IN PROGRESS button: red `#E74C3C`
- DONE button: purple `#7D3C98`
Undo mini-button remains the grey square already present.

## Implementation

1. **New component** `src/components/kds/LegacyActionPill.tsx`
   - Props: `variant: 'seen' | 'bell' | 'check' | 'undo'`, `onClick`, `title`.
   - Renders a 40×30 rounded-`[4px]` button with the correct bg + icon color from the table above.

2. **`src/components/kds/FlatItemList.tsx`** (lines ~295–311)
   - Replace the `KdsActionIcon` block with logic that renders:
     - `seen` pill when status is unseen
     - `undo` + `bell` pills when status is `preparing`
     - `undo` + `check` pills when status is `done`
   - Wire `onAdvanceItem` / `onUndoItem` accordingly.

3. **`src/components/kds/CourseSection.tsx`** (lines ~706–720) – mirror the same replacement inside `CourseItemTapRow` so coursed tickets behave identically.

4. **`src/components/kds/OrderCardActions.tsx`**
   - Accept an optional `legacyActions?: boolean` prop (passed from `OrderCard` only when the route is `/old`).
   - When true, override `buttonColorClass` / inline bg with the blue / red / purple values above.

5. **`src/components/kds/OrderCard.tsx`** – forward existing `legacyActions` prop into `OrderCardActions`.

## Out of scope
- Any change to `/kds/full`, `/v1`–`/v5`, history, or expo views.
- Lifecycle / status logic, long-press 86 behavior, allergens, modifiers.
- Settings, theming tokens, or dark mode.

## Verification
- Visit `/kds/old`: confirm the three product-row states render as the pill set in the screenshots and that tapping each pill advances/undoes the product as before.
- Confirm footer button color cycles blue → red → purple as ticket state advances.
- Visit `/kds/full` and `/kds/v1`: confirm visuals are unchanged.
