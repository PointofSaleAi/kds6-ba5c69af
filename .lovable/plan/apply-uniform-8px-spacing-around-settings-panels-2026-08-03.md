# Apply uniform 8px spacing around Settings panels

## Problem
The previous fix removed all spacing between the KDS left rail and the Settings rail. The user now wants a consistent, uniform spacing that matches the left rail's own left-side outer spacing (8px) on all sides: top, bottom, left, right, and between the rail and the Settings panels.

## Root cause
- `KDSSidebar` currently drops its right padding when `settingsOpen` is true, collapsing the gap.
- The settings wrapper in `MainOrderView.tsx` uses `pl-0 pr-4 py-4 gap-4`, so the right/top/bottom spacing is 16px and the left gap is 0px.
- `SettingsLayout.tsx` was also adjusted to zero left spacing.

## Changes
1. **`src/components/kds/KDSSidebar.tsx`**  
   Revert the `settingsOpen` conditional padding so the sidebar always uses `px-2`. This restores 8px of right padding and keeps the left rail's outer spacing consistent.

2. **`src/pages/MainOrderView.tsx`**  
   In the `settingsOpen` branch, change the wrapper from `pl-0 pr-4 py-4 gap-4` to `pl-0 pr-2 py-2 gap-2`. Combined with the sidebar's `pr-2`, this produces an 8px gap between the left rail glass panel and the Settings rail, and 8px spacing on the top, bottom, and right.

3. **`src/pages/SettingsLayout.tsx`**  
   Apply the same uniform spacing: change the wrapper to `pl-0 pr-2 py-2 gap-2` so the standalone settings route matches the inline settings view.

## Verification
- Open `/kds/v1/settings/display`.
- Confirm the gap between the KDS left rail and the Settings rail is the same width as the gap between the screen left edge and the rail.
- Confirm top, bottom, and right spacing are all the same 8px size.
- Verify in both light and dark themes.
