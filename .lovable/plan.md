## Problem

On the `/v3` ticket layout, enabling a Secondary language (dual display) does not add a secondary line under products, and even the primary language translation is not applied. Other layouts (default, v5, coursing) already do this via `useLanguage()` helpers.

Root cause: `src/components/kds/variants/OrderCardV2.tsx` renders `product.name`, `m.text`, and `product.notes` as raw strings. It only imports `formatTimeForKDS`/`timeFormat` from `useLanguage`, never `tp`, `tpSecondary`, `tm`, `tmSecondary`, `tn`, `tnSecondary`, `displayMode`, or `showSecondaryMenu`.

## Fix (v3 card only, presentation layer)

In `src/components/kds/variants/OrderCardV2.tsx`, inside the item row component that renders the product:

1. Pull the translation helpers from `useLanguage()`:
   `tp`, `tpSecondary`, `tm`, `tmSecondary`, `tn`, `tnSecondary`, `displayMode`, `showSecondaryMenu`, `secondaryLang`.
2. Replace `{product.name}` with `{tp(product.name)}`.
3. When `displayMode === 'dual' && showSecondaryMenu && !product.isCancelled`, render a secondary line under the product name using `tpSecondary(product.name)`, matching the styling used in `CourseSection.tsx` / `FlatItemList.tsx` (smaller size, muted color, proper `dir` for `ar`).
4. Translate modifiers: use `tm(m.text)` for the primary line and render a `tmSecondary(m.text)` secondary line under each modifier in dual mode (mirroring `FlatItemList`).
5. Translate notes: use `tn(product.notes)` and add a `tnSecondary(product.notes)` secondary line in dual mode.
6. Course header labels in v3 already use `tc` elsewhere; if v3 headers show a raw course name, wrap with `tc(...)` for consistency. Verify during implementation and only change if needed.

No changes to state, store, or business logic. Purely rendering updates so v3 respects the global Language settings the same way the default layout does.

## Verification

- Set Primary = Spanish, Secondary off, layout = v3: product names render in Spanish.
- Set dual mode with Secondary = Vietnamese: each product/modifier/note shows a secondary line beneath the primary.
- Cancelled items still skip the secondary line.
- Switch back to English single mode: unchanged.
