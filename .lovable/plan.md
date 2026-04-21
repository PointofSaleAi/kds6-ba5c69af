
## Goal
Make Language settings work end-to-end so Primary and Secondary languages visibly change in both the preview ticket and live KDS cards, and Language Scope reliably affects UI chrome, menu items, or both.

## What is broken now

### 1. Primary and Secondary selection is not fully controllable
In the current Language screen, the language list only changes:
- `secondaryLang` in dual mode
- `language` in single mode

There is no way to directly choose `primaryLang` from the list, so the preview often appears stuck even after selecting another language.

### 2. The preview ticket uses data that mostly has no translations
`InlineLanguageSettings` renders `previewTicket` through `<OrderCard />`, but many preview item names and modifiers are not present in `use-language.tsx` dictionaries:
- `Bruschetta`
- `Fresh Fruit Platter`
- several modifier strings like `Extra basil`, `No onion`, `Extra lemon`
- mixed allergen label formats like `Gluten`, `Dairy`, `Tree Nut`

Result: even when language state changes, much of the preview remains English, which makes it look broken.

### 3. Some live card content still bypasses or mismatches the translator layer
A few places still prevent visible language changes:
- `CourseSection` passes title-cased course names into `tc(...)` while dictionaries are primarily uppercase
- `AllergenBadge` receives title-case labels in preview data, but dictionaries are uppercase
- `ItemRow` in `src/components/kds/coursing/ItemRow.tsx` still renders `mod.text` directly instead of `tm(mod.text)`
- `tp`, `tm`, `tc`, `ta`, `to` are inconsistent in dual mode because only item and modifier translators use `primaryLang`, while course, allergen, and order-type translators still use `language`

### 4. Language Scope is partially wired, but the broken preview hides it
The `scope` state exists in `use-language.tsx`, but because the preview data and some render paths do not translate correctly, switching Interface / Menu / Both does not produce a trustworthy visible change.

## Implementation plan

### 1. Fix translator consistency in `src/hooks/use-language.tsx`
Update the translation helpers so all menu-facing translators use the same active menu language:
- In single mode: use `language`
- In dual mode: use `primaryLang`

Apply this to:
- `tp`
- `tm`
- `tc`
- `ta`
- `to`

Keep scope gating:
- `scope === 'interface'` returns source strings for menu content
- `scope === 'menu'` keeps UI chrome English via `t`
- `scope === 'both'` translates both

Also normalize lookup input before searching dictionaries:
- course labels: uppercase fallback support
- allergen labels: uppercase fallback support
- order-type labels: uppercase fallback support

### 2. Make the Language screen actually choose Primary vs Secondary
In `src/components/kds/InlineLanguageSettings.tsx`:
- Add explicit selection target for dual mode: `primary` or `secondary`
- Let the user tap the Primary card or Secondary card to decide which side they are editing
- Make the language list update the selected target, not always `secondaryLang`
- Keep swap behavior, but preserve the active selection target logically

Mirror the same fix in `src/pages/LanguageSettings.tsx` so both entry points behave the same.

### 3. Use preview data that is guaranteed to translate
Replace or revise `previewTicket` in `src/data/mock-preview-ticket.ts` so it only uses strings already covered by translation dictionaries for supported languages.

Example direction:
- items like `Grilled Salmon`, `Caesar Salad`, `Tiramisu`
- modifiers like `No Butter`, `+ Lemon Sauce`, `Medium Rare`
- allergens using canonical uppercase labels like `GLUTEN`, `DAIRY`, `SHELLFISH`

This ensures the preview is a reliable proof that language switching works.

### 4. Fix remaining live order-card translation gaps
Update components that still bypass translator helpers:

- `src/components/kds/coursing/ItemRow.tsx`
  - render modifiers with `tm(mod.text)`

- `src/components/kds/CourseSection.tsx`
  - normalize course lookup so `APPETIZER`, `ENTREE`, `DESSERT` translate correctly in both active and served labels

- `src/components/kds/AllergenBadge.tsx`
  - support canonical lookup regardless of incoming label case

If needed, apply the same normalization anywhere else menu labels are displayed from raw source strings.

### 5. Add automated tests for the real failure modes
Keep the existing hook test and extend coverage with component tests that verify visible UI:

#### New tests to add
- `InlineLanguageSettings`:
  - dual mode, selecting Primary changes preview main line
  - dual mode, selecting Secondary changes preview secondary line
  - Interface scope changes UI chrome but not menu item text
  - Menu scope changes menu item text but not UI chrome
  - Both changes both

- translator/component tests:
  - `CourseSection` translates course header in menu/both scope
  - `AllergenBadge` translates canonical allergen labels
  - `coursing/ItemRow` translates modifiers via `tm`

This closes the gap between hook-only tests and what the user actually sees.

## Files to update
- `src/hooks/use-language.tsx`
- `src/components/kds/InlineLanguageSettings.tsx`
- `src/pages/LanguageSettings.tsx`
- `src/data/mock-preview-ticket.ts`
- `src/components/kds/coursing/ItemRow.tsx`
- `src/components/kds/CourseSection.tsx`
- `src/components/kds/AllergenBadge.tsx`
- relevant test files under `src/components/kds/__tests__` and/or `src/hooks/__tests__`

## Acceptance criteria
- In dual mode, changing Primary visibly changes the main item line in preview and live order cards.
- In dual mode, changing Secondary visibly changes the secondary language line in preview and live order cards.
- Interface scope translates settings labels, buttons, and other app chrome, while menu item names stay in source language.
- Menu scope translates item names, modifiers, course labels, allergens, and order type labels, while UI chrome stays English.
- Both scope translates both UI chrome and menu content.
- Preview ticket always demonstrates the selected language clearly, with no misleading untranslated sample strings.
- Automated tests cover both translation state and visible rendered output.
