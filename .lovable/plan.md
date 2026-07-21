
## Goal
Convert all user-facing UI labels across the app from sentence case ("Ticket studio") to Title Case ("Ticket Studio"), while keeping small connector/function words lowercase (unless first word).

## Casing rule
- Capitalize the first letter of every word.
- EXCEPT these connector words stay lowercase when not the first word:
  `a, an, the, and, or, but, nor, for, of, to, in, on, at, by, as, is, are, with, from, into, per, vs, via, if, all`
- Always capitalize the first word of a label regardless.
- Preserve existing ALL-CAPS tokens (e.g. `KDS`, `AI`, `POS`, `QR`, `RTL`, `SEEN`, `PREPARING`, `READY`, `SERVED`, `86`).
- Preserve brand/product names ("Point of Sale Ai", "EdgeOS", "Lovable Cloud").

## Scope (UI text only)
Titles, section headers, pill labels, buttons, tabs, menu items, tooltips, toast/notification titles, empty-state headings, modal titles, settings labels/helpers where they read as titles.

Do NOT change:
- Body/helper sentences (they follow normal sentence grammar).
- Code identifiers, keys, enums, translation keys, route paths.
- User-generated data (order notes, product names from mock data / API).
- The status lifecycle tokens already in ALL CAPS.
- Any strings the workspace rules already govern (em-dash rule, brand name).

## Files to sweep
Primary targets containing label strings:
- `src/pages/**` — especially `settings/*.tsx`, `MainOrderView.tsx`, `SettingsScreen.tsx`, `LanguageSettings.tsx`, `OrderTypeColorsSettings.tsx`, `StatusSettings.tsx`, `SoundSettings.tsx`, `StaggerModeSettings.tsx`, `PrinterSettings.tsx`, `WebSocketSettings.tsx`, `AlertsPanel.tsx`.
- `src/components/settings/**` (SectionHeaderCard titles, SettingsPill labels, SettingsSidebar group names).
- `src/components/kds/**` — panels, modals, sheets, buttons (TicketStudioSkeleton, EightySixSheet, ItemSummaryPanel, ExpoSummaryPanel, RecipeReferenceModal, OrderTypeFilterModal, KitchenReplyDialog, BottomStatusBar, KDSSidebar, AIAssistantPanel, etc.).
- `src/components/onboarding/OnboardingWalkthrough.tsx` (step titles).
- `src/hooks/use-language.tsx` — the `t.*` translation table entries for `en-US` / `en-GB` (labels), leaving other-locale values alone.

## Approach
1. Build a small internal Title-Case helper mentally and apply per string; do NOT introduce a runtime helper (avoid touching non-presentation code).
2. Edit in place with targeted line replaces per file. Batch parallel edits across files.
3. Preserve punctuation, emojis, and trailing "…".
4. Skip helper/description sentences (those starting with capital and ending in "."/full sentences).

## Verification
- Grep for known offenders after edits (e.g. `"Ticket studio"`, `"Order hold"`, `"Language region"`, `"Two-up"`, `"Currently 86'd"` → decide per rule) to confirm zero remaining lowercase-second-word titles.
- Spot-check key screens: Settings home, Display, Orders, System, Expo, Ticket Studio, 86 sheet, Summary panel, Bottom bar, Onboarding.

## Out of scope
- Copy rewrites, translations for non-English locales, body paragraphs, dynamic data.
