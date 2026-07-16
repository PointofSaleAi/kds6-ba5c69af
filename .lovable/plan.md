
## Goal

Turn the 8 uploaded prototypes (Calm Board, Focus Lane, Distance View, Progressive Ticket, Safety First, Timeline Flow, Adaptive Density, Dark Command Center) into real, selectable ticket-card layouts that behave like the existing v1–v6 variants everywhere in the app.

## Naming & routing

Add 8 new route keys under Settings → Display → Ticket Layout, appended after the existing v6:

```text
v7  Calm Board
v8  Focus Lane
v9  Distance View
v10 Progressive Ticket
v11 Safety First
v12 Timeline Flow
v13 Adaptive Density
v14 Dark Command Center
```

Each gets its own URL: `/kds/v7` … `/kds/v14`, matching the existing pattern.

Note: current `/kds/v7` is the QR-scan duplicate of v2. I'll rename that internal route to `/kds/qr-scan` (still linked from the QR flow) so the numeric v7–v14 slots are free for the new layouts. No user-facing QR functionality changes.

## Files to add

For each of the 8 designs:

- `src/components/kds/variants/OrderCardV6.tsx` … `OrderCardV13.tsx`
  - Presentational card built from the uploaded HTML prototype, translated to React + Tailwind + our design tokens (no hardcoded hex — map prototype colors to existing semantic tokens in `index.css`).
  - Same props contract as `OrderCardV2` (order, onAdvance, onUndo, onItem86, onItemRecipe, secondary-language support, etc).

## Files to modify

- `src/lib/ticket-card-variant.ts`
  - Extend `CardVariant` union with `v6`–`v13`.
  - Extend `TicketsRouteKey` (in `use-kds-settings.tsx`) with `v7`–`v14`.
  - Update `ROUTE_TO_CARD_VARIANT`, `CARD_VARIANT_TO_ROUTE`, and `normalizeTicketsRoute` guard.

- `src/hooks/use-kds-settings.tsx`
  - Add v7–v14 to the tickets-route type and any option lists.

- `src/App.tsx`
  - Register `/kds/v7` … `/kds/v14` routes, each rendering `<Index cardVariant="vN" />`.
  - Rename the current `/kds/v7` QR-scan page's path to `/kds/qr-scan`, keep its component wiring untouched.

- `src/pages/Index.tsx` / `MainOrderView.tsx`
  - Extend the `cardVariant` switch to render the 8 new `OrderCardV*` components.

- `src/pages/SeenOrdersScreen.tsx`, `src/pages/UnseenOrdersScreen.tsx`, `src/pages/OrderHistoryScreen.tsx`
  - Already read the global variant via `getCardVariantForTicketsRoute`; extend their render switch to include the 8 new variants so History/Seen/Unseen stay in sync.

- `src/components/kds/SelectedVariantPreview.tsx`
  - Add preview cases for v7–v14 so the settings preview card updates when the user picks a new layout.

- Settings picker UI (Ticket Layout list in `DisplaySettings.tsx` or wherever the route options render)
  - Append the 8 new options with the names above and their preview thumbnails.

## Behavior preserved per variant

Each new variant reuses the shared lifecycle and interaction logic already used by V2/V3:

- Item lifecycle: Seen → Preparing → Ready → Served (via `useOrderStore` + `setItemLifecycle`).
- Long-press item → 86 popover + unified `Item86Modal`.
- Tap item → Recipe reference modal.
- Double-tap → undo.
- Secondary language rendering.
- Done items sorted to bottom (`sortDoneLast`).
- Coursing rules for Dine-In (active course expanded, others collapsed with fire time).
- Expo sync stays untouched — Expo already reads the shared item lifecycle.

Only the visual composition (layout, density, typography emphasis, color use per prototype) differs between variants.

## Out of scope

- No changes to Expo view, QR scan behavior, 86 drawer, or backend.
- No new business logic — purely presentational variants wired into the existing switcher.
- The 9th design mentioned earlier is not included; can be added the same way once received.

## Technical notes

- Prototypes use custom color palettes (e.g. Timeline Flow's pink/teal). I'll add semantic tokens per variant in `index.css` (HSL) and reference them from the variant component so light/dark theme both work — no raw hex in components.
- Each variant will be a single file under `src/components/kds/variants/` for consistency; shared sub-pieces (course header, item row) can be composed from existing kds components where they match, otherwise inlined to preserve the prototype's exact look.
- After wiring, verify by switching route in Settings → Display → Ticket Layout and confirming preview, `/kds/vN`, History, Seen, and Unseen all render the same variant.
