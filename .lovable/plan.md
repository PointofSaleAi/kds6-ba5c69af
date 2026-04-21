

## Finding: Language Scope is NOT wired

In `InlineLanguageSettings.tsx`, the "Language Scope" segmented control (App Interface / Menu Items / Both) only updates a local `useState` (`scope`). It is:
- Not stored in the `useLanguage` context
- Not persisted to localStorage
- Not read by any translation function (`t`, `tp`, `tm`, `tc`, `ta`, `to`)
- Not read by the preview ticket or any consumer in the app

Result: changing scope today does nothing. Currently every translation function translates regardless of scope, so it behaves as if "Both" is permanently selected.

## Goal
Wire Language Scope so it actually controls what gets translated across the KDS:
- **App Interface**: only UI chrome (sidebar, buttons, settings labels, status chips, empty states) translates. Menu data (item names, modifiers, courses, allergens, order types) stays in the source language (English).
- **Menu Items**: only menu data translates. UI chrome stays English.
- **Both** (default): everything translates (current behaviour).

## Scope of changes

### 1. `src/hooks/use-language.tsx` (context)
- Add type `LanguageScope = 'interface' | 'menu' | 'both'`.
- Add `scope` state with localStorage persistence (`posai-language-scope`, default `'both'`).
- Expose `scope` and `setScope` on the context.
- Gate translators by scope:
  - `t` (UI strings): when `scope === 'menu'`, return `translations['en-US']` instead of the active language.
  - `tp`, `tm`, `tc`, `ta`, `to`, `tpSecondary`, `tmSecondary` (menu data): when `scope === 'interface'`, return the source key (English) instead of looking up the active language.
- `'both'` keeps the existing behaviour for all translators.

### 2. `src/components/kds/InlineLanguageSettings.tsx`
- Remove the local `useState` for `scope`.
- Read `scope` and `setScope` from `useLanguage()`.
- The segmented control already calls `setScope`; no UI rework needed.
- The right-column preview ticket will automatically reflect the new behaviour because `OrderCard`/`ItemRow` already use `tp` / `tpSecondary`.

### 3. `src/pages/LanguageSettings.tsx` (legacy modal)
- Same swap as InlineLanguageSettings: replace local `scope` state with context-backed `scope`/`setScope` so the two entry points stay in sync.

### 4. Sanity sweep
- Verify all UI chrome strings already go through `t.*` (sidebar, settings, bottom bar, empty states, history). Spot-check a handful; no string changes required.
- Verify all menu-derived strings go through `tp/tm/tc/ta/to`. The grep already shows usage in `ItemRow`, `OrderCard`, `CourseSection`, `OrderTypeBadge`, `AllergenBadge`, etc.

## Out of scope
- No new translations added.
- No changes to the language list, dual-language pair, swap button, date/time format, currency, or "Request a language" modal.
- No changes to `OrderCard` or `ItemRow`; the gating happens inside the translator hooks so all consumers update for free.
- No changes to the Settings panel layout or the preview ticket sizing.

## Acceptance
- Switching scope in Settings > Language now produces a visible change in the preview ticket and across the live KDS:
  - **Interface** + Spanish: sidebar / buttons / settings labels show Spanish, item names stay English.
  - **Menu Items** + Spanish: sidebar / buttons stay English, item names show Spanish.
  - **Both** + Spanish: everything shows Spanish (matches today).
- Choice persists across reloads (localStorage `posai-language-scope`).
- Dual-language mode still shows secondary translations for menu data when scope includes menu; secondary line is hidden/source when scope is `interface`.
- No regressions to language switching, swap, save toast, or other settings.

