# Fix dropdown arrow touching the edge (Ticket Layout)

## Problem
The Layout `<select>` on the Ticket Layout settings screen uses `px-3` (12px) padding on both sides. Native browser dropdown arrows render on the right edge, so with only 12px of right padding the arrow visually touches the border.

## Fix
In `src/pages/settings/DisplaySettings.tsx` (line ~200), change the select's horizontal padding from `px-3` to `pl-3 pr-8` so the right side has 32px of room for the native arrow, while the left side stays at 12px. No other selects exist in this file, so no siblings need the same change.

## Verification
- Check `/tmp/observability/build-errors.log` after the edit.
- Playwright screenshot of the Ticket Layout screen at desktop width in light theme to confirm the arrow no longer touches the edge.
