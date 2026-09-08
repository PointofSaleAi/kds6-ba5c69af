# Match Settings right-section outer spacing

## Confirmed issue
The Settings shell already uses 8px around the left navigation, but the right content adds 16px of its own padding. This makes the header and pill rows sit farther from the top, right, and shared center gap than the left navigation card.

## Changes
1. **Main Settings view**
   - Reduce the right content wrapper padding from 16px to 8px.
   - Keep the existing transparent background so only the standalone header and pill rows remain visible.

2. **Alternate Settings entry path**
   - Apply the same 8px right-content padding so both Settings routes remain visually identical.

3. **Preserve existing design**
   - Do not change the internal padding of the header, pill rows, or left navigation.
   - Do not restore an outer right-side container, border, background, radius, or shadow.

## Verification
- Compare the top, bottom, right, and center spacing around the Settings right section with the 8px spacing around the left navigation.
- Verify the Display and Account sections in light and dark themes.
- Check desktop, tablet, and portrait layouts for consistent spacing and no clipping.
