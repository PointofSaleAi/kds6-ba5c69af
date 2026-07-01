
## Goal

For the versioned Tickets layouts **v2, v3, v4, v5, v6** (rendered by `OrderCardV1`–`OrderCardV5`), make every change in **Settings → Ticket Layout** update the actual card — both in the settings preview and on the live `/kds/v2`…`/kds/v6` (and their Seen / Unseen / History) screens:

- **Spacing** → card padding, row padding, gap between rows/children
- **Text size** → order number, product name, qty, modifiers, allergen chips
- **Appearance** → Standard / Compact / **Header** (header-only)
- **Identifier** → `#orderNumber` vs guest name in the card header

The per-route storage (`routeOverrides`) and preview scoping (`KDSSettingsPreviewScope`) are already correct. The gap is that the variant cards use hardcoded inline `fontSize` / `padding` and ignore `ticketHeaderLayout`, and only V5 respects `ticketLayout === 'header'`.

## Changes

### 1. Bind variants to the CSS scale tokens (Spacing + Text size)

The Default card already consumes CSS vars defined in `src/index.css` (`--kds-item-name`, `--kds-item-qty`, `--kds-modifier`, `--kds-order-num`, `--kds-card-padding`, `--kds-row-py`, `--kds-item-gap`, `--kds-child-gap`). `text-scale-*` and `ticket-spacing-*` classes are already applied by `MainOrderView`, `SeenOrdersScreen`, `UnseenOrdersScreen`, `OrderHistoryScreen`, and the settings preview wrapper.

Refactor these files to swap hardcoded `style={{ fontSize: N, padding: '…' }}` for the tokens (with the current numbers kept as `Standard` defaults via existing CSS):

- `src/components/kds/variants/OrderCardV1.tsx`
- `src/components/kds/variants/OrderCardV2.tsx`
- `src/components/kds/variants/OrderCardV3.tsx`
- `src/components/kds/variants/OrderCardV4.tsx`
- `src/components/kds/variants/OrderCardV5.tsx`

Mapping:
- product name → `var(--kds-item-name)`
- qty → `var(--kds-item-qty)`
- modifier / note → `var(--kds-modifier)`
- order-number pill in header → `var(--kds-order-num)` (scaled) or keep header-specific size but scale via same class
- card padding / row py → `var(--kds-card-padding)`, `var(--kds-row-py)`
- inter-row gap → `var(--kds-item-gap)`

Leave decorative/monospace timer sizes alone.

### 2. Wire Identifier (`ticketHeaderLayout`)

Currently each variant hardcodes `#{order.orderNumber}` in its header. Update each card so it reads `ticketHeaderLayout` from `useKDSSettings()` and renders:

- `'kitchen'` → `#{order.orderNumber}` (current behavior)
- `'guest'` → `order.guestName || order.customerName || order.serverName || 'Guest'`

Apply to the header component of V1, V2, V3, V4, V5 (including V2/V3's `V2Header` / `V3Header` files as needed).

### 3. Wire Appearance = **Header**

V5 already handles `ticketLayout === 'header'` (header-only + drawer). Add the same behavior to V1–V4:

- When `ticketLayout === 'header'`, render only the header row(s); do not render product list, notes, allergens, or footer.
- Keep tap-to-bump behavior on the header itself so cards remain actionable.
- Preview already receives the same override via `KDSSettingsPreviewScope`.

Standard and Compact keep their current behavior.

### 4. No changes needed to routing/state

- `use-kds-settings.tsx` already exposes route-effective values based on `pathname` and via `KDSSettingsPreviewScope` for the preview, so cards on `/kds/v2`…`/kds/v6` and inside the preview both pick up the correct per-route override automatically once the variants stop hardcoding sizes/labels.
- Seen / Unseen / History screens already apply `getKdsScaleClasses`, so once variants consume the tokens they will scale there too.

## Technical notes

- Use inline `style={{ fontSize: 'var(--kds-item-name)' }}` etc. instead of new Tailwind classes to keep the diff minimal and match the Default card's approach.
- Keep line-heights and `fontWeight` unchanged; only size/padding move to tokens.
- For `ticketHeaderLayout === 'guest'` where a variant header has both order # and guest name, swap the primary slot and drop the redundant one.
- No changes to `DisplaySettings.tsx`, `use-kds-settings.tsx`, or `index.css`.

## Out of scope

- The Default card (`/kds/default`) already works and won't be touched.
- Order-type colors, status color thresholds, allergen visibility toggles.
