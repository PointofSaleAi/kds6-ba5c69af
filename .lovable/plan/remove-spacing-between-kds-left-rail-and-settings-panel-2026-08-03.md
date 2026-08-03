# Remove spacing between KDS left rail and Settings panel

## Problem
In the Settings view, there is visible empty spacing between the KDS left sidebar and the Settings navigation card (highlighted in the screenshot). The user wants the Settings panel to sit flush against the left rail.

## Root cause
The gap is created by two layers of padding:
1. `KDSSidebar` has `px-2` horizontal padding around its inner glass panel.
2. The settings wrapper in `MainOrderView.tsx` uses `p-4`, which adds 16 px of padding on all sides — including the left edge next to the sidebar.

## Changes
1. **`src/pages/MainOrderView.tsx`**  
   In the `settingsOpen` branch (around lines 1255–1280), change the wrapper class from `p-4 gap-4` to `pl-0 pr-4 py-4 gap-4` so the Settings sidebar card touches the left rail while keeping top/right/bottom spacing intact.

2. **`src/components/kds/KDSSidebar.tsx`**  
   When `settingsOpen` is true, remove the right outer padding so the glass panel extends to the sidebar's right edge. Keep left/top/bottom padding and the internal glass panel padding unchanged. This makes the Settings card flush with the sidebar surface.

3. **`src/pages/SettingsLayout.tsx`** (consistency)  
   Apply the same left-padding removal to the standalone settings layout so both routes behave identically: change the outer wrapper to remove left padding and remove right padding from the rendered `KDSSidebar` when settings is open.

## Verification
- Open `/kds/v1/settings/display`.
- Confirm the Settings card now touches the KDS left rail with no highlighted gap.
- Check that the rounded corners of the Settings card and sidebar glass panel still look clean.
- Verify the fix in both light and dark themes.
