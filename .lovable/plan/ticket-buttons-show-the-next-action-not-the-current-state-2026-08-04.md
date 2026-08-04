# Ticket buttons show the next action, not the current state

## The problem (confirmed in the running app)

On /kds/glass the footer button prints the ticket's **current** stage. A fresh ticket reads "Seen", then "Preparing", then "Ready" — and tapping the button labelled "Ready" is what actually serves the ticket and removes it from ALL. So the ticket leaves the board one tap earlier than expected, and no button ever reads "Served" before it disappears.

The same "label = current state" convention is used by the other layouts (shared footer actions and the Standard/Detailed cards), so the fix applies everywhere.

## Intended behaviour

Three taps, each button naming the action it performs:

```text
tap 1  [ Preparing ]  -> all products preparing, ticket stays in ALL
tap 2  [ Ready ]      -> all products ready,     ticket stays in ALL
tap 3  [ Served ]     -> whole ticket served,    ticket moves to History
```

- Tapping Ready never removes the ticket from ALL.
- A ticket only leaves ALL and appears in History when Served is tapped (or when every product is individually served).
- Product level is unchanged in principle: tapping a single product to Served moves that product alone out of ALL; the rest of the ticket stays.
- The back/undo button keeps stepping the ticket one stage backwards.

## Scope

All ticket layouts: Glass, Hero number, Classic Hero, Section list, Standard layout, Priority View, Detailed grid, Clean sections, Itemized cards, plus Expo cards that reuse the same footer.

## Technical notes

- `src/components/kds/glass/glass-tickets-data.ts`: change the `CTA` map from current-stage names to next-action names (`unseen -> "Preparing"`, `preparing -> "Ready"`, `ready -> "Served"`); `served` keeps a terminal label since the card is no longer on the active board.
- `src/components/kds/glass/TicketCard.tsx`: pick the footer icon/fill from the next stage so glyph and label agree.
- `src/components/kds/OrderCardActions.tsx`: derive `buttonLabel`, `IconComponent` and the button colour from the next action instead of `ticketState`.
- `src/components/kds/variants/OrderCardV2.tsx`: `FOOTER_STATE_CONFIG` keyed to the next action; `handleTicketAdvance` transitions stay as they are (seen -> preparing -> ready -> served), so only the presentation changes.
- Board filtering already keeps a ticket in ALL until every product is served and surfaces it in History once served, so no filtering changes are needed.
- No data-model or business-logic changes; label/icon presentation only.
