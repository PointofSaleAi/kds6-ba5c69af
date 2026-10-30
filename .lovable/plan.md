# Fix Settings menu touching the left nav

## Cause
When I removed the gap on the right of the left nav box, I didn't account for Settings. Its screen had no left gap of its own, so the Settings menu now touches the nav box. The other ticket styles' ticket screen has the same issue. Glass View is fine because its ticket area has its own left gap.

## Fix
- Settings gets an 8px gap between the left nav box and the Settings menu. That matches the gap between the Settings menu and the right content. On phones the gap is 4px.
- The ticket screen for the non-Glass styles gets the same gap.
- This applies to every Settings page, in both themes and on all sizes.

## Technical details
- `src/pages/SettingsLayout.tsx` line 52 and `src/pages/MainOrderView.tsx` line 1268: change `pl-0` to `pl-2 max-[640px]:pl-1`.
- Check with a screenshot at 1141×742 and 390×844.
