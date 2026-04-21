
## Goal
Make Settings > Language work visibly and reliably so:
- changing Primary/Secondary languages updates the preview ticket and live KDS cards,
- Language Scope clearly affects app chrome vs menu content,
- saving is no longer misleading.

## Root issue summary

### 1. The state layer is mostly present; the visible UI layer is what is broken
`src/hooks/use-language.tsx` already persists:
- `primaryLang`
- `secondaryLang`
- `displayMode`
- `scope`

So the main failure is not “save doesn’t store it”. The bigger problem is that many rendered surfaces still do not show those state changes clearly or consistently.

### 2. The preview and seeded live cards contain many untranslated strings
Several strings used in preview/live data are not covered by the current dictionaries, so the card appears unchanged even when language state changes.

Examples found in seeded data:
- `Bruschetta`
- `Cheesecake`
- `Mango Sticky Rice`
- `Pan-Seared Salmon`
- `Greek Salad`
- `Chicken Wrap`
- `Chocolate Brownie`
- modifiers like `No Dill`, `No Onions`, `Vanilla Ice Cream`, `Extra Croutons` without the canonical `+ ` prefix

This affects:
- `src/data/mock-preview-ticket.ts`
- `src/data/mock-orders.ts`
- `src/data/mock-coursing-order.ts`
- `src/data/mock-expo-orders.ts`

### 3. Some visible order-card labels are still hardcoded English
Even with scope gating in the hook, parts of the ticket UI stay English because they do not use translated keys:
- `CourseSection.tsx` hardcodes `Served`, `Active`, `Queued`, `Done at`
- Language screen labels are also partly hardcoded: `Display mode`, `Single language`, `Dual language`, `Language pair`, `Select language`, `Request a language`, `Save`, `Preview - KDS ticket`

That makes “Interface / Menu / Both” look broken, because important chrome text ignores the translator.

### 4. Dual mode still shows a second line even when scope excludes menu translation
When `scope === 'interface'`, menu translators intentionally return source text. In dual mode that can produce two identical lines, which makes it look like Primary/Secondary selection is not doing anything.

This affects live card renderers such as:
- `src/components/kds/coursing/ItemRow.tsx`
- `src/components/kds/CourseSection.tsx`
- `src/components/kds/FlatItemList.tsx`
- `src/components/kds/ItemRoutingModal.tsx`

### 5. Existing tests validate hook output, not what the user actually sees
Current coverage proves the hook can return translated strings, but not that:
- the preview ticket changes,
- the live order card changes,
- the app chrome changes,
- scope visually behaves correctly.

## Implementation plan

### 1. Make the language system expose what the UI needs
Update `src/hooks/use-language.tsx` to provide a small, explicit render contract for components:
- keep current persistence for `language`, `primaryLang`, `secondaryLang`, `displayMode`, `scope`
- add a helper/flag for whether secondary menu text should render in the UI when scope excludes menu translation
- expand `Translations` with missing interface strings used in the Language screen and order-card chrome

Add translation keys for items like:
- display mode labels
- single/dual language labels
- language pair labels
- select language labels
- preview title
- request language CTA
- save button text
- course status words such as active/queued/served
- timestamp labels like done/seen where they are part of UI chrome

### 2. Replace hardcoded Language-screen text with translated UI strings
Update:
- `src/components/kds/InlineLanguageSettings.tsx`
- `src/pages/LanguageSettings.tsx`
- any related Settings header text if needed

So the Language settings screen itself responds to scope correctly:
- Interface scope: Language screen chrome translates
- Menu scope: Language screen chrome stays English
- Both: both change as expected

### 3. Fix order-card chrome so scope is visibly correct
Update `src/components/kds/CourseSection.tsx` to stop mixing translated course names with hardcoded English status labels.

Use:
- `tc(...)` for course names
- `t...` keys for card chrome/status words like `Active`, `Queued`, `Served`, `Done at`, `Seen`

This makes scope behavior intuitive:
- Interface only: status/chrome can translate while menu names stay source
- Menu only: item/course/order-type/allergen content translates while chrome stays English

### 4. Hide or suppress duplicate secondary lines when scope is Interface
In dual mode, if menu translation is excluded, do not render a misleading second line that is identical to the primary line.

Apply consistently in:
- `src/components/kds/coursing/ItemRow.tsx`
- `src/components/kds/CourseSection.tsx`
- `src/components/kds/FlatItemList.tsx`
- `src/components/kds/ItemRoutingModal.tsx`

Result:
- Primary/Secondary changes are obvious when scope includes menu
- Interface scope no longer looks “stuck” because duplicate English lines disappear

### 5. Normalize preview and seeded demo data to strings that are actually translatable
Revise preview and seeded mock data so visible demo items/modifiers/allergens use canonical dictionary-backed values.

Priority files:
- `src/data/mock-preview-ticket.ts`
- `src/data/mock-orders.ts`
- `src/data/mock-coursing-order.ts`
- `src/data/mock-expo-orders.ts`

Two acceptable approaches:
- add missing dictionary entries for all currently used strings, or
- replace mock strings with already-supported canonical strings

Preferred approach:
- keep the preview strictly canonical and translation-safe
- optionally expand dictionaries for live seeded data where needed

### 6. Do a translation sweep on visible live KDS surfaces
Audit the main user-visible KDS surfaces and move any remaining hardcoded UI chrome to `t`:
- Language screen
- Settings sub-screen titles where relevant
- order-card chrome
- any nearby ticket labels surfaced in preview/live KDS

This is a focused sweep, not a full app rewrite.

### 7. Add rendered component tests for real user behavior
Add component-level tests that render actual UI, not only the hook.

#### New tests
1. `InlineLanguageSettings`
- dual mode + changing Primary updates preview main line
- dual mode + changing Secondary updates preview secondary line
- Interface scope changes UI chrome but not menu item text
- Menu scope changes menu item text but not UI chrome
- Both changes both

2. Live KDS card rendering
- render a real `OrderCard` with `previewTicket` or a controlled mock
- verify primary line, secondary line, course label, allergen, and order type react correctly to scope/language changes

3. Course chrome test
- `CourseSection` shows translated course name and correct scope-gated status words

## Files to update
- `src/hooks/use-language.tsx`
- `src/components/kds/InlineLanguageSettings.tsx`
- `src/pages/LanguageSettings.tsx`
- `src/components/kds/CourseSection.tsx`
- `src/components/kds/coursing/ItemRow.tsx`
- `src/components/kds/FlatItemList.tsx`
- `src/components/kds/ItemRoutingModal.tsx`
- `src/data/mock-preview-ticket.ts`
- `src/data/mock-orders.ts`
- `src/data/mock-coursing-order.ts`
- `src/data/mock-expo-orders.ts`
- new/updated tests under `src/components/kds/__tests__` and `src/hooks/__tests__`

## Acceptance criteria
- Changing Primary language visibly changes the main item line in the preview ticket and live KDS cards.
- Changing Secondary language visibly changes the secondary line when dual mode is active and scope includes menu translation.
- Interface scope changes Language-screen/UI chrome and ticket chrome, while menu item names/modifiers/course names stay source language.
- Menu scope changes menu-facing content on preview/live cards, while UI chrome remains English.
- Both changes both.
- In Interface scope, dual mode does not show a confusing duplicate secondary line.
- Preview/demo data always demonstrates language changes clearly.
- Rendered tests cover preview and live order-card behavior, not just hook return values.
