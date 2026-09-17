# Make language changes show in the ticket preview (Glass ticket)

## What's happening

Your saved ticket layout is Glass View, so the Language screen preview shows the Glass ticket. On that ticket only the product names, their modifiers and the item note follow the language settings. Everything else on the card is hard-coded English:

- the order type line (DINE IN / TAKE OUT / DELIVERY / BANQUET)
- the server line
- the course rows (APPETIZERS / ENTREES / DESSERTS)
- the allergy chips on the ticket and on each product ("GLUTEN allergy")
- the message block labels ("Point of Sale terminal 1", the message text, "5m ago")
- the ticket action button wording

So when you switch language or add a secondary language, almost nothing on the preview changes — which reads as "the preview isn't updating".

## The fix

Wire the Glass ticket to the same language system the other ticket layouts already use, so a language change is visible immediately in the preview and on the live board:

- Order type, course names and allergy labels translate using the existing dictionaries.
- Server / guest names transliterate the same way they do on other layouts (proper nouns stay recognisable).
- Allergy chips translate both the allergen word and the word "allergy", on the ticket header and on each product.
- The message block labels and message text translate, with the secondary line shown underneath when a secondary language is on.
- The ticket action button label translates.
- Where a second language is active, the Glass ticket shows the second line under order type, course names and the message — matching how product names already behave.
- Right-to-left second languages (e.g. Arabic) keep the existing right-aligned handling.

Nothing changes about which layout is selected, the sample ticket used, spacing, colours, or timing.

## Technical notes

- `src/components/kds/glass/TicketCard.tsx`: consume `useLanguage()` — `to()` for `t.type`, `tperson()` for `t.server`, `ta()` for `t.allergies`, `tl()`/`tn()` for the POS block labels and message; add secondary lines guarded by `displayMode === 'dual' && showSecondaryMenu`, reusing the `secondaryDir` pattern from `TicketItem.tsx`.
- `src/components/kds/glass/CourseHeader.tsx`: accept an optional `secondaryLabel` and translate `label` via `tc()` at the call site in `TicketCard.tsx`.
- `src/components/kds/glass/TicketItem.tsx`: allergy chips use `ta(tag)` plus a translated "allergy" label instead of the raw tag string.
- Any missing dictionary keys for the Glass sample tickets (course names, order types, allergens, POS message strings) get added to the existing maps in `src/hooks/use-language.tsx` for the shipped languages; unknown strings still fall back to English.
- No change to `SelectedVariantPreview.tsx`, layout persistence, or the aging preview wiring.
- Verify on the Language screen and `/kds/glass` at desktop, tablet and mobile widths in light and dark themes, in single and dual language mode, including Arabic.
