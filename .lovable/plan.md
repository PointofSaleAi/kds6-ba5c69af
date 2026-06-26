## Goal
Add a new "Ticket header" section at the top of the Ticket Layout page (Settings → Display → Ticket Layout) with a segmented pill: Default / V1 / V2 / V3. Selecting an option swaps only the header region of the standard OrderCard with the header UI from OrderCardV1, V2, or V3. No changes to ticket card body, products, or actions.

## Changes

### 1. New setting: `ticketHeaderStyle`
`src/hooks/use-kds-settings.tsx`
- Add type `TicketHeaderStyle = 'default' | 'v1' | 'v2' | 'v3'`.
- Add field `ticketHeaderStyle` (default `'default'`) + setter, persisted in the same localStorage blob.

### 2. Extract header-only components from variants
Create three small presentational components that render only the header portion currently inside OrderCardV1/V2/V3 (order type strip + order number/guest + timer pill + any metadata row). Pure JSX + props, no tap/done/long-press logic. Files:
- `src/components/kds/variants/headers/V1Header.tsx`
- `src/components/kds/variants/headers/V2Header.tsx`
- `src/components/kds/variants/headers/V3Header.tsx`

Each takes `{ order, effectiveStatusColor, elapsedSeconds }` (plus whatever the existing header needs from settings/status rules, read internally via hooks). The original V1/V2/V3 OrderCards then import these so there is one source of truth.

### 3. Wire header swap into the default `OrderCard`
`src/components/kds/OrderCard.tsx`
- Read `ticketHeaderStyle` from `useKDSSettings`.
- When it is `v1` / `v2` / `v3`, replace ONLY the existing header JSX block (the OrderTypeBadge + order number/guest header around lines 800–910) with `<V1Header/>` / `<V2Header/>` / `<V3Header/>`.
- When `default`, render today's header unchanged.
- Everything below the header (allergen strip, courses, products, actions) is unaffected.

### 4. Settings UI
`src/pages/settings/DisplaySettings.tsx` (inside the `ticketSpacingOpen` overlay, left options column)
- Add a new field at the TOP of the options stack, above "Ticket spacing":
  ```
  Ticket header
  [ Default | V1 | V2 | V3 ]   (SegmentedToggle)
  ```
- Bind to `ticketHeaderStyle` / `setTicketHeaderStyle`.
- The right-side preview already renders `<OrderCard order={previewTicket} .../>`, so it will automatically show the chosen header style.

### 5. No other surfaces change
- V1/V2/V3 route pages keep using their own OrderCardVx (unchanged behavior, just refactored to import the shared header).
- Right-edge value on the outer "Ticket Layout" pill stays as the current density label.

## Technical notes
- Header components stay purely visual; tap-to-complete, recipe long-press, compact toggling, and bump logic remain in their respective OrderCard files.
- Status color / aging values passed into headers come from the same `effectiveStatusColor` + `useElapsedSeconds` already computed in OrderCard, so aging pill colors continue to work in Default card too.
- Persisted key reuses existing `posai-kds-settings-v2`; default `'default'` keeps current look for all existing users.
