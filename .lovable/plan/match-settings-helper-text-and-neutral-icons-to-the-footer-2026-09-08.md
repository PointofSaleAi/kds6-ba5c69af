# Match Settings helper text and neutral icons to the footer

## Change
- Update the description text below every Settings pill to use the same theme-aware foreground treatment as the footer icons: the current foreground color at 70% opacity.
- Apply that same color treatment to neutral Settings pill icons such as navigation chevrons, so text and utility icons remain visually consistent.
- Keep the colored square icon tiles and their white glyphs unchanged, since those identify each setting category.
- Apply the shared styling through `SettingsPill` so Account, System, Tickets, Hardware, and Display all update together.

## Theme and screen coverage
- Preserve strong dark-grey contrast in light theme and soft white contrast in dark theme.
- Check desktop, tablet, and portrait Settings layouts without changing spacing, pill backgrounds, or the recently lightened page background.

## Verification
- Compare the Settings descriptions and neutral icons with the footer icon tone in light and dark themes.
- Confirm helper text is clearly legible beneath each pill at all supported sizes.
- Confirm the app reports a clean build.
