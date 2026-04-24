## Issue

When **Display Mode = Dual**, **Primary = English**, **Secondary = Arabic**, **Scope = Both**, the UI chrome (sidebar, settings labels, buttons, etc.) renders in **Arabic** instead of English.

## Root Cause

In `src/hooks/use-language.tsx` (line 2016), the UI translations object `t` is selected like this:

```ts
t: scope === 'menu' ? translations['en-US'] : translations[language],
```

It uses the standalone `language` state (which only drives **single** mode). It ignores `displayMode` and `primaryLang` entirely.

Meanwhile, every menu translator (`tp`, `tc`, `ta`, `to`, `tl`, `tn`, `tcat`, `tperson`, `tpSecondary`) correctly does:

```ts
const lang = displayMode === 'dual' ? primaryLang : language;
```

So in dual mode:
- Menu items follow `primaryLang` (English) — correct
- UI chrome (`t`) follows `language` — which was last set to Arabic when the user previously picked Arabic in single mode, or got bumped via `setLanguage` somewhere

That mismatch is exactly the reported bug: items are English, but the chrome stays Arabic.

## Fix

Make UI chrome selection mirror the same rule the menu translators already use.

**File: `src/hooks/use-language.tsx`** (line 2016)

Change:
```ts
t: scope === 'menu' ? translations['en-US'] : translations[language],
```

To:
```ts
const interfaceLang = displayMode === 'dual' ? primaryLang : language;
// ...
t: scope === 'menu' ? translations['en-US'] : translations[interfaceLang],
```

Also expose `interfaceLang` (or compute inline) consistently so future contributors don't repeat the bug.

## Verification

1. Settings → Language: set Display Mode = Dual, Primary = English, Secondary = Arabic, Scope = Both → sidebar, footer, settings labels render in **English**, ticket items show English + Arabic.
2. Switch Primary to Arabic → chrome flips to Arabic immediately.
3. Switch Display Mode back to Single (Arabic) → chrome stays Arabic (uses `language`).
4. Existing test `Dual mode: switching primary updates the main translator` still passes; add an assertion that `result.current.t.settings` follows `primaryLang` in dual mode.

## Scope

Single 3-line change in `src/hooks/use-language.tsx` plus one new test assertion. No component changes required — every consumer already reads `t` from context.
