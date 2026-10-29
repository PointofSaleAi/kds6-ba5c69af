# Replace Point of Sale Ai logo with the uploaded one

## What changes
- Use the uploaded logo ("POINTOFSALE" lettering with a gold dot and gold "AI") everywhere the logo shows. That covers the PIN pad, splash, set PIN, forgot password, device activation, device activated, personal device login, dev scenario screen and recipe page.
- **Light screens:** black lettering, gold dot and gold "AI" (as uploaded).
- **Dark screens:** white lettering, keeping the gold dot and gold "AI".
- Same sizes as today, on desktop, tablet and mobile.

## Technical details
- Remove the white background from the upload and save it as a clean see-through image, `src/assets/posai-logo.png`.
- Make the dark-theme version by recoloring the black pixels to white and leaving the gold pixels alone. Save it as `src/assets/posai-logo-white.png`.
- Because the file names stay the same, `PosaiLogo.tsx` and `RecipeDetailPage.tsx` pick up the new logo without code edits.
- The new logo is a wide strip, not a box, so on each screen I'll swap its fixed height for a width that keeps it readable.
- Check the result on the light PIN pad and the dark splash screen.
