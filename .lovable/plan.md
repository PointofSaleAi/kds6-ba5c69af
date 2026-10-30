# Make the two allergen toggles work on every ticket style

## What's wrong today
- **Glass View:** neither toggle is checked. The allergy chips at the top of the ticket and the chips under each product always show.
- **Every other ticket style:** "Ticket Header Allergen Summary" works. "Allergen Badges" only half works. Turning it off hides the top strip, but the chips under each product still show.

## What each toggle will do (all styles, Glass included)
- **Allergen Badges** shows or hides the red allergy chips under each product.
- **Ticket Header Allergen Summary** shows or hides the combined allergy strip at the top of the ticket.
- The two toggles work on their own, so you can turn off one and keep the other. This matches the description under each toggle. Today, turning off Allergen Badges also hides the top strip.
- These changes cover the live ticket screens (All, Seen, Unseen, Expo), Ticket Studio, and the Ticket Aging Rules and Language previews, in both themes and on all sizes.
- "No …" removal lines and modifiers are not changed.

## Technical details
- `glass/TicketCard.tsx`: show the ticket-level `t.allergies` block only when `showHeaderAllergens` is on. `glass/TicketItem.tsx`: show the item allergy chips only when `showAllergens` is on. Both read from `useKDSSettings()`.
- `variants/OrderCardV1–V5.tsx`: show the product allergen chips only when `showAllergens` is on. V2 also needs its details-block condition updated. V5 also needs its allergen text line updated. In each header-strip condition, change `showAllergens && showHeaderAllergens` to `showHeaderAllergens`.
- `OrderCard.tsx` (Default): same header-strip change. `CourseSection` already respects `showAllergens`.
- Verify with Playwright: toggle each setting off and on for Glass and one Standard style, and confirm the chips and strip appear and disappear.
