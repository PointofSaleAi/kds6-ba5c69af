Reduce the width of the settings navigation panel so it matches the narrow, compact proportions shown in the reference screenshot.

## Current state
- `SettingsLayout.tsx` sets the nav section to `w-[190px]` in landscape and `w-[160px]` in portrait.
- The reference screenshot shows a tighter mobile-style sidebar with small icon tiles and minimal horizontal padding.

## Proposed change
1. In `src/pages/SettingsLayout.tsx`, narrow the settings nav container:
   - Landscape: from `190px` to `160px`
   - Portrait: from `160px` to `140px`
2. In `src/components/settings/SettingsSidebar.tsx`, reduce the horizontal padding (`px-3.5`) to `px-2.5` so the content still fits cleanly and the text does not feel cramped.
3. Keep the profile card, group nav, and search input behavior unchanged.

## Verification
- Preview the `/kds/v1/settings/display` route to confirm the sidebar looks balanced and labels remain readable.
- Check both landscape and portrait viewports if possible.