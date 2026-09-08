# Improve Settings description readability

## Change
- Update the description text beneath every Settings pill from translucent foreground text to the solid, theme-aware secondary text color.
- Increase the description weight from regular to medium while retaining the existing 12px minimum size and spacing.
- Keep pill labels, colored icon tiles, neutral chevrons, backgrounds, and layout unchanged.

## Coverage
- Apply the change through the shared Settings pill so Account, System, Tickets, Hardware, and Display update consistently.
- Confirm readability in light and dark themes on desktop, tablet, and portrait layouts.

## Technical details
- In `src/components/settings/SettingsPill.tsx`, replace `hsl(var(--foreground) / 0.7)` on helper text with the solid `hsl(var(--text-secondary))` token and add medium font weight.
- Leave the chevron styling unchanged because the reported issue is limited to description text.

## Verification
- Visually confirm descriptions remain clearly readable against the Settings background in both themes.
- Confirm no text clipping or spacing changes at supported screen sizes.
- Confirm the app reports a clean build.
