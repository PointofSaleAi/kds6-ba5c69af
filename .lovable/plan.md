

## Goal

Replace the current single-modal Settings sheet with a full-page, two-pane Settings layout modeled after the referenced POSAI 6.0 project, applied in light theme using existing POSAI KDS design tokens. All existing settings preserved, no functionality lost.

## Layout Structure

```text
+------------------------------------------------------------+
| /kds/full/settings                                          |
+--------------------+----------------------------------------+
|  LEFT NAV (260px)  |  RIGHT CONTENT PANEL                   |
|                    |                                         |
|  [Search bar]      |  +-- Header card ---------------+      |
|                    |  | [icon tile] Display          |      |
|  Display      *    |  | Customize layout, theme,...  |      |
|  Orders            |  +------------------------------+      |
|  Expo View         |                                         |
|  Hardware          |  +-- Option pill ---------------+      |
|  Account           |  | [tile] Display Mode    [seg] |      |
|                    |  +------------------------------+      |
|                    |  Helper text under each pill           |
|                    |                                         |
|                    |  +-- Option pill ---------------+      |
|                    |  | [tile] Cards per row  [+/-] |      |
|                    |  +------------------------------+      |
+--------------------+----------------------------------------+
```

- Light-theme tokens (`bg-surface`, `bg-surface-card`, `text-text-primary`, `border-border`).
- Colored rounded icon tiles (36px) matching the reference's per-row color coding.
- Pill rows: `rounded-full` containers, `py-3.5 px-4`, with helper subtitle below each row in `text-xs text-text-muted`.
- Header card per section: rounded-2xl, large 64px icon tile, title + description with "Learn more" toggle.

## Routes

New routes added under existing `/kds/full` shell:

- `/kds/full/settings` → redirects to `/kds/full/settings/display`
- `/kds/full/settings/display`
- `/kds/full/settings/orders`
- `/kds/full/settings/expo`
- `/kds/full/settings/hardware`
- `/kds/full/settings/account`

Existing sub-screens become child routes (preserves all current behavior):

- `/kds/full/settings/display/status-colors`
- `/kds/full/settings/display/order-type-colors`
- `/kds/full/settings/display/language`
- `/kds/full/settings/orders/category-filter`
- `/kds/full/settings/orders/revenue-center`
- `/kds/full/settings/orders/stagger-mode`
- `/kds/full/settings/hardware/printer-kot`
- `/kds/full/settings/hardware/printer-label`
- `/kds/full/settings/hardware/sound`
- `/kds/full/settings/hardware/connection`

The Settings cog in the sidebar opens this page instead of the modal.

## Section Mapping (preserves every existing row)

**Display**: Display mode, Cards per row, Text size, Ticket layout (Standard/Compact), Status colours, Theme (Light/Dark), Region/Language.

**Orders**: Category filter, Revenue center filter, Stagger mode, Servable modifiers, Allergen badges, Sort default.

**Expo View**: Show Send button (Always / When ready).

**Hardware**: KOT printer, Label printer, Sound settings, Connection.

**Account**: Device name, Dev mode toggle, Log out (with existing confirm dialog), version footer.

## Search

- Build `src/lib/settings-search-index.ts`: array of `{ id, label, description, group, path, keywords }` entries covering every row across all sections.
- Search input in left nav header. While typing, the right panel shows result rows (icon tile + label + parent path + chevron). Click navigates to the corresponding route and scrolls/highlights the row.
- No backend, purely client-side filter on the static index.

## Files to create

- `src/pages/SettingsLayout.tsx` — two-pane shell with `<Outlet />`.
- `src/components/settings/SettingsSidebar.tsx` — left nav with search and group items.
- `src/components/settings/SectionHeaderCard.tsx` — large icon + title + Learn more.
- `src/components/settings/SettingsPill.tsx` — single rounded pill row (icon tile + label + right control + chevron).
- `src/components/settings/SettingsIconTile.tsx` — colored rounded square with image/icon.
- `src/pages/settings/DisplaySettings.tsx`
- `src/pages/settings/OrdersSettings.tsx`
- `src/pages/settings/ExpoSettings.tsx`
- `src/pages/settings/HardwareSettings.tsx`
- `src/pages/settings/AccountSettings.tsx`
- `src/lib/settings-search-index.ts`

## Files to modify

- `src/App.tsx` — add nested routes under existing layout for the new settings pages.
- `src/components/kds/KDSSidebar.tsx` (or wherever the gear icon lives) — change settings button to `navigate('/kds/full/settings')` instead of opening the modal.
- `src/pages/MainOrderView.tsx` — remove modal-open state for Settings (or keep `SettingsScreen` only for legacy fallback during migration; final pass removes it).
- `src/pages/SettingsScreen.tsx` — remove after migration.

## Theme

- Force light theme tokens in the new pages regardless of global theme; section/page background `bg-surface`, cards `bg-surface-card`, dividers `bg-border`, text via `text-text-primary` / `text-text-muted`.
- Colored icon tile palette reused from reference (Display = `#525252`, Orders = `#F9900E`, Expo = `#7C3AED`, Hardware = `#5E4DD8`, Account = `#0A84FF`, etc.) on white tiles for contrast in light mode.
- All other surfaces in the app (KDS tickets, sidebar) untouched. Theme toggle in Account section continues to work for the rest of the app.

## Preserved Behavior

- All existing hooks (`useKDSSettings`, `usePrinterAssignments`, `useTheme`, `useLanguage`) wired into the new pages identically.
- Logout confirm dialog reused.
- Existing standalone sub-screens (`StatusSettings`, `LanguageSettings`, `PrinterSettings`, `SoundSettings`, `WebSocketSettings`, `CategoryFilterPanel`, `RevenueCenterFilter`, `StaggerModeSettings`, `OrderTypeColorsSettings`) reused as the destination of sub-page routes; only the surrounding container changes.
- Memory rule respected: no X close buttons on primary settings tabs, no em dashes.

## Out of Scope

- No new settings added or removed.
- No changes to ticket cards, summary panel, or kitchen surfaces.
- No copy of icon PNG assets from the reference project (lucide icons in colored tiles deliver the same visual hierarchy and avoid bloat).

