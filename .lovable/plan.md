## Fix empty space below Notifications popover

**Problem:** The header Notifications popover (`src/components/kds/NotificationsPopover.tsx`) uses a fixed `max-h-72` on its scroll region, so on tall screens there's a large empty gap between the popover and the footer (visible in the screenshot as the grey area with the red circle).

**Fix (single file: `src/components/kds/NotificationsPopover.tsx`):**

1. Replace the fixed `max-h-72` list container with a flex layout so the popover stretches from just below the KDS header down to just above the footer.
2. Set the outer container height via:
   `height: calc(100vh - var(--training-bar-h,0px) - var(--kds-header-h,44px) - var(--kds-footer-h,52px) - 12px)`
   with a sensible `max-height` (e.g. 560px) so it doesn't feel oversized on very tall screens.
3. Make the popover a `flex flex-col` with:
   - header (fixed)
   - scroll list `flex-1 min-h-0 overflow-y-auto` (remove `max-h-72`)
   - footer actions (fixed)
4. Keep width, positioning, colors, and behavior unchanged. No other files touched.

**Result:** The Notifications popover fills the available vertical space between header and footer, matching the Alerts drawer behavior, and the empty grey gap below it disappears.