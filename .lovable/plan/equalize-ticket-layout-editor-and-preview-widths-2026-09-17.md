# Equalize Ticket Layout editor and preview widths

## Goal
Make the Ticket Layout workspace read as two equal-width sections while keeping the actual ticket preview at its current dimensions.

## Changes
- Replace the editor’s fixed desktop width with a true 50/50 split between the editor and Preview sections.
- Let every editor control expand to fill the wider left section, including the Layout selector and all segmented options.
- Keep the divider centered between both sections with the existing 8px page spacing.
- Keep the ticket preview itself at its current maximum width and center it within the wider Preview section.
- Preserve the stacked layout on narrow screens so controls and ticket remain readable without horizontal scrolling.

## Technical details
- Update only the Ticket Layout workspace classes in `DisplaySettings.tsx`.
- Use equal flexible columns at desktop/landscape widths rather than the current fixed 336px editor column.
- Preserve existing settings behavior, saved values, Glass ticket rendering, and ticket scaling.

## Verification
- Check desktop and landscape tablet widths for a centered divider and equal section dimensions.
- Check portrait/mobile stacking for no clipping or horizontal scrolling.
- Verify light and dark themes, including the real Glass ticket preview.
