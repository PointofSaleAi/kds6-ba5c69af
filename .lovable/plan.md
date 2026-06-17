## Problem
In `MainOrderView.tsx`, the footer language icon's `onOpenLanguageSettings` handler currently does `window.location.assign('/kds/full/settings/display#language')`, which redirects the user to the Settings page. It should instead open the Language Settings modal directly, which is already rendered in `Index.tsx`.

## Fix
Change the single prop line in `src/pages/MainOrderView.tsx` (around line 1327):

```jsx
onOpenLanguageSettings={() => { window.location.assign('/kds/full/settings/display#language'); }}
```

to:

```jsx
onOpenLanguageSettings={() => onOpenSub?.('language-settings')}
```

This reuses the existing `onOpenSub` callback that `Index.tsx` already handles for `'language-settings'`, opening the `LanguageSettings` overlay directly without any route change.