

### Goal
Make the "Ticket Density" setting clearly visible and unambiguous in the Settings panel, since it currently sits directly below "Text Size" with a near-identical Large/Compact toggle and gets overlooked.

### Root cause
In `src/pages/SettingsScreen.tsx`, the Ticket Density row was added immediately under "Text Size" inside the DISPLAY section. Both rows use the same `Monitor` icon and a `SegmentedToggle` with very similar labels (Text Size: Compact / Standard / Large vs Ticket Density: Large / Compact). Visually the new row blends in and is easy to miss, especially on a small panel where users do not scroll carefully.

### Changes

1. `src/pages/SettingsScreen.tsx`
   - Promote Ticket Density into its own dedicated section so it stands apart from "Text Size":
     - Add a new section header "Ticket Layout" (or place it as the first row of DISPLAY, above Text Size).
   - Use a distinct icon (for example `LayoutGrid` or `Rows3` from lucide-react) instead of `Monitor` so it does not look like a duplicate of Text Size.
   - Make the row label clearer, for example: "Ticket Density" with description "Switch between Large default and Compact denser tickets".
   - Keep the same `SegmentedToggle` with Large / Compact, wired to `ticketDensity` and `setTicketDensity` from `useKDSSettings`.
   - Confirm the row is rendered unconditionally (not gated by any flag).

2. No changes to:
   - `src/hooks/use-kds-settings.tsx` (already exposes `ticketDensity` and `setTicketDensity`)
   - `src/components/kds/OrderCard.tsx` (already applies `kds-density-compact` class)
   - `src/index.css` (compact CSS already in place)

### Verification
- Open Settings from the sidebar.
- Confirm a clearly labelled "Ticket Density" row appears with a different icon from Text Size and a Large / Compact toggle.
- Toggle to Compact and confirm Home Screen tickets shrink fonts and tighten rows immediately.
- Toggle back to Large and confirm tickets return to default layout.
- Refresh the page and confirm the choice persists.

