# Standalone left nav (no surrounding background)

## What changes
- The tinted strip behind the left nav's rounded glass box goes away. The box floats directly on the page, the same way the tickets do.
- The rounded glass box itself is unchanged: its icons, badges, logo, version number, drag handle, and expand/collapse behaviour all stay as they are.
- The small gap around the box stays, so it never touches the screen edge, header, or footer.
- Applies to every screen that shows the left nav, in light and dark themes, and on desktop, tablet, and phone sizes.

## Technical details
- `src/components/kds/KDSSidebar.tsx` line 112: on the outer wrapper, remove `bg-tickets-bg` and make it `bg-transparent`. Keep the `glass-rail` class (it carries the glass tokens), the width, and the padding.
- Check `/kds/glass` and `/kds/v3` at 1140 and 390 widths, in light and dark themes.
