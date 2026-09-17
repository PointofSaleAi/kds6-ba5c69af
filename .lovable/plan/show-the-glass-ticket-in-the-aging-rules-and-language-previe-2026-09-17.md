# Show the Glass ticket in the Aging Rules and Language previews

## The problem

Both the **Ticket Aging Rules** preview ("Live Ticket Preview") and the **Language** preview ("Preview - KDS ticket") share one preview component. That component understands every ticket layout except Glass View — when Glass is selected it silently falls back to the Section list card, so you see a different ticket than the one your kitchen screens use.

The Ticket Layout screen itself already renders the real Glass ticket, which is why the preview only looks wrong on these two screens.

## The fix

Teach the shared preview to render the real Glass ticket when Glass View is the selected layout, exactly as the Ticket Layout screen does — same card, same theme, light and dark.

To keep both previews useful with the Glass ticket:

- **Aging Rules**: the Dine In / Take Out / Delivery / Banquet buttons pick the matching Glass sample ticket, and the ticket's wait time is driven by the rule being edited, so its colour still changes live as you adjust the time range and colours.
- **Language**: the Glass ticket already supports the second language and right-to-left scripts, so the translated preview works as-is; the standard / compact preview toggle keeps applying where it is meaningful.

The saved layout, spacing, text size and identifier settings continue to drive both previews, so what you see matches the live board.

## Technical notes

- `src/components/kds/SelectedVariantPreview.tsx`: add a `glass` branch that wraps `GlassBoardProvider` + `TicketBoard` (`maxTickets={1}`, `viewModeOverride="grid"`), passing spacing / text-scale / appearance / identifier from KDS settings, mirroring the branch in `src/pages/settings/DisplaySettings.tsx`. Non-glass routes keep their current behaviour.
- `src/components/kds/glass/TicketBoard.tsx`: add optional `elapsedSecondsOverride` (applies to the pinned ticket only) so the aging preview can drive the status colour; default keeps existing sample timings.
- `src/components/kds/AgingEditPanel.tsx`: map the order-type buttons to Glass ticket ids (`t23` table, `t45` take out, `t36` delivery, `t42` banquet) and pass the edited rule's elapsed time through the preview when the route is `glass`.
- No changes to status-rule logic, layout persistence, or the live boards.
