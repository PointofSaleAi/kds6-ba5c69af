

# Order Type Colors - Two-Column Layout

## Goal
Reorganize the Order Type Colors settings into a side-by-side layout: color pickers on the left, live preview cards on the right.

## Changes

### File: `src/pages/OrderTypeColorsSettings.tsx`

**Layout restructure:**
- Wrap content in a two-column grid (`grid-cols-2`) with equal widths
- **Left column**: All 9 color picker rows (color swatch + label + hex value) stacked vertically, plus the "Reset to Defaults" button at the bottom
- **Right column**: All 9 live preview cards stacked vertically, each showing the corresponding order type with its current color applied to the header

This gives a clear 1:1 visual mapping - each color picker on the left corresponds to the preview card at the same vertical position on the right. Both columns scroll together within the existing scrollable container.

