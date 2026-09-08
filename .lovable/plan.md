# Notifications drawer background and overlay

## Changes
- Change the full Notifications drawer surface to the same shared ticket-board background used on the All screen (`tickets-bg`), so it automatically matches both light and dark themes.
- Replace the current fixed black backdrop with a theme-aware overlay treatment that provides clear separation from the screen behind without making the underlying interface look dirty or uneven.
- Preserve the drawer’s existing border, shadow, tabs, notification rows, actions, animation, position, and dock-aware sizing.

## Verification
- Check the drawer over the All screen and Settings screen in both light and dark themes.
- Confirm the backdrop covers only the usable app area, respects the header/sidebar/footer docking offsets, and closes the drawer when tapped.
- Check desktop, tablet, and portrait widths for consistent drawer contrast and no overlap regressions.
