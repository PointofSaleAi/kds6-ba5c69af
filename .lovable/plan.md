## Goal

Today the home-screen ticket cards use spacing tokens that come from the text-size scale. Treat that current density as the new "Compact" baseline and add two new spacing levels (Standard, Spacious) that the Display > Ticket Spacing screen drives live.

## How spacing works today

`src/index.css` defines `--kds-card-padding` and `--kds-item-gap` inside the text-scale rules:

```text
:root (Standard text)         card-padding 12px  item-gap 6px
.text-scale-compact            card-padding  8px  item-gap 4px
.text-scale-large              card-padding 18px  item-gap 10px
```

These two tokens are consumed by `OrderCard` and friends. The text-size class is applied by `MainOrderView.tsx` line 717 on the board wrapper.

User intent: the spacing that ships on the home screen right now equals "Compact" in the new Ticket Spacing setting. Standard adds breathing room, Spacious adds more.

## Changes

### 1. Persist Ticket Spacing (`src/hooks/use-kds-settings.tsx`)

- Add type `TicketSpacing = 'Compact' | 'Standard' | 'Spacious'`
- Add `ticketSpacing` to `KDSSettings` and `setTicketSpacing` setter
- Default value: `'Compact'` (matches current home-screen density)
- Persists via existing `localStorage` writer

### 2. Decouple spacing from text scale (`src/index.css`)

Remove `--kds-card-padding` and `--kds-item-gap` from the three text-scale rule blocks (`:root`, `.text-scale-compact`, `.text-scale-large`) so text size only controls type. Add three dedicated spacing classes:

```text
.ticket-spacing-compact   card-padding  8px   item-gap  4px
.ticket-spacing-standard  card-padding 12px   item-gap  8px
.ticket-spacing-spacious  card-padding 18px   item-gap 12px
```

Compact reuses today's tight values so the home screen looks unchanged on first load.

### 3. Apply spacing class in the board wrapper (`src/pages/MainOrderView.tsx`)

- Read `ticketSpacing` from `useKDSSettings`
- On the wrapper at line 717, append the matching `ticket-spacing-*` class alongside the existing `text-scale-*` class
- Apply the same class on the History panel wrapper (mirrored branch a few lines above) so spacing is consistent there too

### 4. Wire the Display > Ticket Spacing sub-screen (`src/pages/settings/DisplaySettings.tsx`)

- Replace the local `useState` for `ticketSpacing` with the value+setter from `useKDSSettings`
- Remove the local `spacingTokens` map and the inline `--kds-card-padding` / `--kds-item-gap` style overrides on the preview wrapper
- Apply the matching `ticket-spacing-*` class on the preview wrapper instead, so the preview uses the same tokens the home screen uses

### 5. Memory

Update `mem://style/legibility` (or add `mem://style/ticket-spacing`) to record:
- Spacing is now an independent setting from Text Size
- Tokens: Compact 8/4, Standard 12/8, Spacious 18/12
- Default is Compact to preserve existing density

## Out of scope

- No new UI on the main Display list (the row already exists and opens the sub-screen)
- No changes to the Compact/Standard ticket-layout setting (different control)
- No changes to OrderCard internals; it already consumes the two CSS variables
