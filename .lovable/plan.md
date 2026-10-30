# Remove the gap around the left nav box

The left nav's rounded glass box sits inside an 8px empty frame on all sides (the area outlined in blue in your screenshot). Remove that frame so the box fills the whole left rail edge to edge.

## What changes
- The rounded glass box touches the header above, the footer below, the screen edge on the left and the tickets on the right.
- Rail width stays the same (80px collapsed, 192px expanded), so tickets per row and ticket widths don't change. The icons get a little more room.
- Rounded corners and the glass look stay as they are.
- Applies on every screen that uses the left nav, in light and dark theme, on phone, tablet and desktop, and when the rail is docked on the right.

## Technical details
- `src/components/kds/KDSSidebar.tsx`: remove `py-2 px-2` from the outer `glass-rail` wrapper (line 112). The inner `rounded-2xl ios-glass-panel` box keeps `h-full`, so it fills the rail.
- Check at 1141×742, 1024×1366 and 390×844 in light and dark theme.
