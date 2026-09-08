# Remove the Settings right-side outer container

## Goal
Match the supplied reference exactly: the right side shows only the standalone section header and individual setting pills over the page background. There will be no enclosing right-side box, panel, border, corner radius, shadow, tint, or glass effect.

## Changes
1. **Flatten the active Settings content pane**
   - Update the Settings branch in `MainOrderView` so the right-side scrolling area is a transparent structural wrapper only.
   - Remove the conditional glossy-card class and rounded styling from that right-side wrapper, including when Glass ticket style is active.
   - Keep only the spacing needed to position the header and pills; do not give that spacing layer its own visual surface.

2. **Make the page background continuous**
   - Ensure the area behind and below the Settings pills inherits the same page background as the surrounding KDS workspace.
   - Retain the separate white Settings navigation rail on the left.
   - Retain the existing self-contained styling of the section header and each pill row.

3. **Keep both Settings entry paths consistent**
   - Apply the same flat right-pane rule to the alternate Settings layout shell so no route or device size can reintroduce the enclosing panel.

4. **Verify the exact visual result**
   - Check Display and Account settings in light and dark themes.
   - Check desktop, tablet, and mobile/portrait widths.
   - Confirm the right side has no outer edge, radius, border, shadow, or distinct panel background—only the header container and pill rows remain visible.
   - Confirm scrolling, controls, and the left navigation continue to work and the app remains error-free.
