## Goal

When the user changes the Language (single mode) or Primary/Secondary pair (dual mode), every translatable string on the KDS, including the Language settings preview ticket, must update. Today, several values still render in English even after switching language.

## Root cause analysis

I traced every text source in `OrderCard`, `CourseSection`, `FlatItemList`, `OrderNotesSection`, `ModifierLine`, `AllergenBadge`, `OrderTypeBadge`, and `mock-preview-ticket.ts` against the dictionaries in `src/hooks/use-language.tsx`.

Three categories of gaps exist:

### A. Missing dictionary entries (data gap)

The `tp`, `tm`, `tc`, `ta`, `to` helpers fall back to the original English string when the key is absent. Several preview and live values are simply not present in the target dictionaries.

1. `productNames` is empty for `'en-GB'` and missing common items in `zh`/`vi` (`Roasted Vegetables`, `Espresso`, `Truffle Pasta`, `Soup of the Day` partially). The preview ticket includes `Truffle Pasta`, `Roasted Vegetables`, `Espresso`, none of which exist in `zh` or `vi` product dictionaries, so they stay English.
2. `modifierTexts` is missing entries used by the preview, for example `Dressing on Side` (zh), `+ Extra Parmesan` (ar/zh/vi), `+ Vanilla Ice Cream` (ar), `Well Done`, `Medium Rare` in some languages, `No Salt` (everywhere), `No Butter` (ar/zh/es).
3. `courseNames` has no `BEVERAGE` entries in `es` (only uppercase covered) but the preview uses `DESSERT` and `ENTREE` which exist; the live `mock-orders` contain `SALAD`, `SOUP`, `SIDE` which are missing in some languages.
4. `allergenLabels` is missing `TREE-NUT`, `SOY`, `SESAME` casing variants. The preview uses `EGG`, `GLUTEN`, `DAIRY`, `SHELLFISH` which exist, but live data sometimes uses lower-case `tree-nut`.
5. `orderTypeLabels` does not cover `take-out`, `phone-in`, `curb-side`, `drive-thru`, `scheduled`, `custom` in lower-case; only `TAKE OUT` upper-case form is mapped, so live cards using `'take-out'` enum values may bypass translation.

### B. Strings rendered without a translation helper (code gap)

These strings are hard-coded into JSX and never go through the language layer. They will never translate even if the dictionaries are filled.

1. `OrderCard.tsx` renders `order.serverName` and `order.guestName` directly. There is no helper or pass-through. These values should either remain as proper nouns (no translation expected) or be wrapped in a labeled translator (eg, label-only translation, value untouched).
2. `OrderCard.tsx` renders `order.orderNotes` via `OrderNotesSection`, which displays the raw string. The note text contains common phrases that the user expects to translate in the preview, for example `Birthday dinner, please bring candle with dessert` and `Allergy to nuts. Please prepare food separately and notify server`.
3. `tableName` (`TABLE 7`, `TABLE 4`) is rendered through `getLocationLabel` and reaches `OrderTypeBadge`, but only the `type` label is translated by `to()`. The word `TABLE` itself is never translated.
4. `OrderTypeBadge` translates the type label but the badge's appended `tableInfo` (eg `· TABLE 7`) is rendered raw.
5. `firedAgoLabel`, `prepTimerLabel`, `autoFireLabel` (`Queued`, `Auto-fires in ~10 min`, `8:00 ago`) are pre-baked English strings inside mock data and rendered raw in `CourseSection`. The translated `t.queued`, `t.served`, `t.active` exists but is only used for the status word, not for the embedded labels.

### C. Preview-ticket content not aligned with dictionaries

`mock-preview-ticket.ts` has a comment stating all strings MUST exist in the dictionaries. They do not. Specifically:
- `Truffle Pasta`, `Roasted Vegetables`, `Espresso` missing from `zh`/`vi`
- `+ Extra Parmesan`, `+ Vanilla Ice Cream` missing from several languages
- `Birthday dinner, please bring candle with dessert` (orderNotes) has no translation path at all
- `Sarah Chen`, `Alex M.` are proper nouns and should be kept as-is, but the user expects the preview to show the language has changed somehow (we will rely on labels for this, see below)
- `TABLE 7` is half-English: the word `TABLE` is the translatable part, `7` is data

## Fix plan

The fix is split into three layers so the work is small, targeted, and avoids reshaping data structures.

### 1. Add a notes/labels translation layer

Introduce two new helpers in `src/hooks/use-language.tsx`:
- `tn(text)` for free-form notes text (order notes and per-item notes)
- `tl(label)` for fixed labels embedded in mock-data strings, such as `TABLE`, `Auto-fires in`, `min`, `ago`, `Queued`, `Pickup`

Backed by two new dictionaries: `noteTexts` and `embeddedLabels`. They follow the same fall-back-to-input pattern as the existing helpers, so unknown notes simply pass through.

Apply them where relevant:
- `OrderNotesSection.tsx` wraps `notes` with `tn(notes)`
- `FlatItemList.tsx` and `CourseSection.tsx` wrap per-item `item.notes` with `tn(item.notes)`
- `OrderTypeBadge.tsx` translates the leading `TABLE` token of `tableInfo` via `tl('TABLE')`, keeping the trailing number untouched
- `CourseSection.tsx` runs `firedAgoLabel`, `prepTimerLabel`, `autoFireLabel` through `tl()` token-by-token (eg split on space, translate known tokens like `Auto-fires`, `in`, `min`, `ago`, `Queued`)

Server name and guest name remain proper nouns and are not translated. This matches restaurant industry expectations and avoids translating customer identity.

### 2. Backfill dictionary entries

Add the missing keys to `src/hooks/use-language.tsx`:

- `productNames` for `zh`, `vi`, `es`, `ar`, `en-GB`: add `Truffle Pasta`, `Roasted Vegetables`, `Espresso`, plus any other live mock items currently missing per language
- `modifierTexts` for all languages: add `Dressing on Side`, `+ Extra Parmesan`, `+ Vanilla Ice Cream`, `No Salt`, `No Butter`, `Well Done`, `Medium Rare` where missing
- `courseNames` for `es`, `zh`, `vi`, `ar`: add lowercase and Title-case variants for every `CourseType` enum value (`APPETIZER`, `SALAD`, `ENTREE`, `DESSERT`, `BEVERAGE`)
- `allergenLabels`: add lowercase enum variants (`peanut`, `gluten`, `dairy`, `shellfish`, `soy`, `egg`, `tree-nut`, `sesame`)
- `orderTypeLabels`: add lowercase enum variants for every `OrderType` (`dine-in`, `take-out`, `delivery`, `banquet`, `drive-thru`, `curb-side`, `scheduled`, `phone-in`, `custom`)
- `noteTexts` for the preview note `Birthday dinner, please bring candle with dessert` and the live mock notes (`Allergy to nuts. Please prepare food separately and notify server`, etc) so the preview reliably demonstrates note translation
- `embeddedLabels` for `TABLE`, `BAR`, `BANQUET`, `Auto-fires`, `in`, `min`, `ago`, `Queued`, `Pickup`, `Delivery`

### 3. Align the preview ticket with translation coverage

Update `src/data/mock-preview-ticket.ts` only where needed to keep the comment's promise true: every string on the preview must have an entry in the dictionaries above. No structural change to the preview, just text that is now guaranteed to exist in `productNames`, `modifierTexts`, `noteTexts`, etc.

Add a small banner above the preview header (inside `InlineLanguageSettings.tsx`, not the OrderCard) that explicitly notes proper nouns (server name, guest name) are not translated. This sets correct expectations and prevents repeat reports about Sarah Chen / Alex M not changing.

## Files to update

- `src/hooks/use-language.tsx` — add `tn`, `tl`, `noteTexts`, `embeddedLabels`; backfill `productNames`, `modifierTexts`, `courseNames`, `allergenLabels`, `orderTypeLabels`
- `src/components/kds/OrderNotesSection.tsx` — wrap `notes` with `tn`
- `src/components/kds/OrderTypeBadge.tsx` — translate `TABLE` token in `tableInfo`
- `src/components/kds/CourseSection.tsx` — translate per-item notes and embedded course labels via `tn`/`tl`
- `src/components/kds/FlatItemList.tsx` — translate per-item notes via `tn`
- `src/components/kds/InlineLanguageSettings.tsx` — small helper note clarifying proper nouns are not translated
- `src/data/mock-preview-ticket.ts` — adjust strings only where they currently lack any dictionary entry, keep structure identical

## Out of scope

- No change to `OrderCard` header layout, status flow, ticket lifecycle, or any visual ordering
- No change to the global Display > Ticket Layout setting
- No change to server name or guest name rendering, these stay as proper nouns
- No change to language scope tabs, language pair section, language list, save button, or display mode cards on the Language screen

## Validation checklist

1. Settings > Display > Language: switch single language to `Spanish` and confirm preview product names, modifiers, allergens, course headers, `TABLE 7`, and order notes all switch to Spanish
2. Switch to `Arabic` and confirm same coverage with RTL text rendering correctly
3. Switch to `Chinese` and `Vietnamese`, confirm `Espresso`, `Truffle Pasta`, `Roasted Vegetables` are now translated
4. Confirm Sarah Chen and Alex M stay unchanged and a small note explains why
5. Open live KDS Home, switch language, confirm every order card translates: product names, modifiers, allergens, table label, course headers, item notes, order notes
6. Confirm dual-language mode still renders the secondary line for menu strings only
7. Confirm `scope = 'interface'` leaves all menu strings English while still translating UI chrome
