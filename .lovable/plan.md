## Problem

The `KDSTopHeader` is `position: fixed` at the top of the viewport with `height: 44px`. Content on left-nav screens (Settings, Account, History, Seen/Unseen, Alerts) is rendering underneath it — for example, the "Settings" H2 in the settings sidebar and the small blue Account icon in the account page both have their top edges clipped by the header.

## Root cause (to confirm on first fix step)

`src/pages/MainOrderView.tsx` (line 1204–1205) tries to reserve the header space by absolutely offsetting its outer container:

```tsx
<KDSTopHeader ... />
<div
  className="fixed inset-0 flex ..."
  style={{ top: 'calc(var(--training-bar-h, 0px) + var(--kds-header-h, 0px))' }}
>
```

Two problems with this approach:

1. `--kds-header-h` is set from `KDSTopHeader`'s `useEffect` after mount. On first paint the value is `0px`, so the container starts at `top: 0` and only shifts down after the effect runs — causing content to sit under the header. Even after the shift, on some routes (measured on `/kds/v1/settings/account` the settings H2 sits at y≈46 CSS, i.e. right at the header's bottom edge with no visible gap), the offset is effectively lost.
2. Tailwind's `fixed inset-0` sets the `inset` shorthand; combined with the inline `top` calc, the offset is fragile across the app and doesn't cascade to sibling screens that render outside `MainOrderView` (e.g. `QrStickersPage`, `RecipeDetailPage`, `KdsReplyPage`).

## Fix

Reserve header space with layout, not absolute positioning, and set the CSS var synchronously so the first paint is correct.

### 1. Set `--kds-header-h` before first paint

In `src/components/kds/KDSTopHeader.tsx`:
- Export `KDS_HEADER_H = 44` constant.
- Set `document.documentElement.style.setProperty('--kds-header-h', '44px')` in a module-level side effect (or `useLayoutEffect`) so the var exists on first render, not after mount.

### 2. Replace absolute offset with padding on the app shell

In `src/pages/MainOrderView.tsx`:
- Change the outer container from `fixed inset-0 ... style={{ top: calc(...) }}` to `fixed inset-0 flex ... style={{ paddingTop: 'calc(var(--training-bar-h, 0px) + var(--kds-header-h, 44px))' }}`.
- Use a `44px` fallback in the `var()` so pre-mount paint is already correct.

### 3. Apply the same offset to standalone screens

The header is rendered globally, but these screens live outside `MainOrderView` and currently ignore the header entirely:
- `src/pages/QrStickersPage.tsx`
- `src/pages/RecipeDetailPage.tsx`
- `src/pages/KdsReplyPage.tsx`
- `src/pages/SettingsLayout.tsx` (currently uses `h-screen` with no top inset)

Add `paddingTop: 'var(--kds-header-h, 44px)'` (plus training bar var where relevant) to each screen's root, or wrap them in a small shared `KdsScreenShell` component that renders `KDSTopHeader` + a padded main region. Prefer the shared component to keep the header behavior consistent going forward.

### 4. Verify

- Load `/kds/v1/settings/account`, `/kds/v1/settings/system`, `/kds/v1/settings/hardware`, `/kds/v1/settings/display`, `/kds/v1/settings/orders`, `/kds/v1/settings/expo`, the Alerts panel, Seen/Unseen screens, and `/kds/v7` — confirm the "Settings" H2, section header cards, and the small circular icons sit fully below the header on first paint (no scroll, no clipping).
- Toggle training mode and re-check that both bars stack correctly without overlap.

## Out of scope

- No visual redesign of the header, sidebar, or settings pages.
- No changes to routing or state management.
