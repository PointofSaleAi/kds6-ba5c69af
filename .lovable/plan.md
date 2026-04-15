

## Plan: Replace Expo item "Send" button with runner icon circle

### What changes

Replace the text "Send" button next to each prepared item in the Expo ticket card with a circular icon button using the runner SVG (`person-simple-run-bold.svg`), styled identically to how `KdsActionIcon` renders its circle buttons (colored circle background, centered icon, same sizing pattern).

### Design

- Circle with green (`#16A34A`) background, white runner icon inside
- Same diameter as the existing KDS eye icon circles (~24-26px)
- Same 150ms scale animation on tap as `KdsActionIcon`
- Replaces the current `px-2 py-0.5 rounded-full border border-success text-success text-[10px]` text button

### Technical details

**File: `src/components/kds/ExpoView.tsx`** (single file change)

- Lines 289-294: Replace the `<button>Send</button>` with a circular icon button
- Import the runner SVG (already imported as `runnerIcon`)
- Render a ~26px green circle with the runner icon centered, white-colored via CSS filters
- Add `min-width`/`min-height` for touch target compliance
- onClick behavior stays identical: `onItemSend?.(ticket.id, item.id)`

No other files, components, or screens are affected.

