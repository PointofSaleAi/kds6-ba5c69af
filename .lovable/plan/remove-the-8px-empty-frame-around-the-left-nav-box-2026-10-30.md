# Remove the 8px empty frame around the left nav box

Remove the 8px empty frame around the rounded glass box in the left nav (the area outlined in blue).

## What changes
- The empty 8px frame on all four sides is removed.
- The rounded glass box keeps its size, corners, glass look and icons.
- The rail gets 16px narrower (the frame's width), so the tickets get that space.
- Applies on every screen that uses the left nav, in light and dark theme, on phone, tablet and desktop.

## Technical details
- `src/components/kds/KDSSidebar.tsx` line 112: remove `py-2 px-2` from the outer `glass-rail` wrapper. Change its width from `w-20`/`w-48` to `w-16`/`w-44` so the inner box stays the same size.
- Check at 1141×742, 1024×1366 and 390×844 in light and dark theme.
