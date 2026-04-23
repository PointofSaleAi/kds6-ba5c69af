

## Goal

Replace the outdated full-screen `LanguageSettings` opened from Settings → Display → Language with the latest `InlineLanguageSettings` component (the same one used in `SettingsPanel`), so the user sees the new design with two-column layout, search, language pair editor, and live preview.

## Changes

### `src/pages/settings/DisplaySettings.tsx`

- Remove import of `LanguageSettings` from `@/pages/LanguageSettings`.
- Import `InlineLanguageSettings` from `@/components/kds/InlineLanguageSettings`.
- Replace the `if (languageOpen) return <LanguageSettings .../>` early-return with an inline render that:
  - Shows a small back header (ArrowLeft + "Language") matching the Status/OrderTypeColors back pattern.
  - Renders `<InlineLanguageSettings activeTab="language" />` inside the settings content card (NOT full-screen, settings nav stays visible).
- Keep `languageOpen` state and the `Language` `SettingsPill` trigger unchanged.

### Notes

- `LanguageSettings.tsx` file itself is left untouched (no other references to remove in this scope).
- No changes to routing, hooks, or sidebar.
- Light/dark theme handling already inherited by `InlineLanguageSettings` since it uses theme tokens.

## Out of Scope

- No edits to `InlineLanguageSettings` content.
- No changes to `SettingsPanel` or other settings sections.
- No removal of the old `LanguageSettings.tsx` file.

