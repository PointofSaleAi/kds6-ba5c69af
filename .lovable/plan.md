## Why the icons are there today

You're right — this is an inconsistency. Products (item rows) and tickets (cards) follow a **tap-to-advance** pattern: a single tap on the row/card moves the lifecycle forward (Unseen → Preparing → Done), and an undo control appears only after the first advance.

Servable modifiers were built earlier as a separate path in `src/components/kds/ModifierLine.tsx`. When `isServable` is true, the row renders explicit `KdsActionIcon` buttons (eye / bell / done + undo) on the right side and **does not** participate in the row-tap system. That's why they look heavier and behave differently than every other lifecycle-bearing element in the app.

## Proposed fix: align servable modifiers with the tap pattern

Treat a servable modifier row exactly like an item row.

### Behaviour
- **Single tap on the modifier row** → advance one step (Unseen → Preparing → Done).
- **After the first advance**, show only a small **undo** affordance on the right (same as item rows do today). No eye icon, no bell icon, no static "done" tick.
- **Done state** keeps the existing strikethrough + 50% opacity treatment so it still reads as completed at a glance.
- Tap target stays ≥44px tall (already satisfied by row padding + name size).
- `e.stopPropagation()` is preserved on the undo control so tapping undo doesn't also advance the parent ticket.

### Visual result per state

```text
Unseen      [ EXTRA CHEESE ........................................ ]   (tap row to advance)
Preparing   [ EXTRA CHEESE ........................................ ⟲ ] (tap row to advance, ⟲ to undo)
Done        [ E̶X̶T̶R̶A̶ ̶C̶H̶E̶E̶S̶E̶ .................................... ⟲ ] (tap ⟲ to undo)
```

### Files to change
- `src/components/kds/ModifierLine.tsx` — in the `isServable` branch:
  - Wire the row's `onClick` to advance via the existing `onAdvanceModifier` handler (use the same `useRowTap` hook products use, so a future double-tap-to-jump-to-done can be added consistently).
  - Replace the three-icon cluster with: nothing in Unseen, a single `undo` icon in Preparing and Done.
  - Keep the strikethrough/opacity for Done.
  - Keep `stopPropagation` on the undo button.

### Files intentionally NOT changed
- `OrderCard.tsx`, `FlatItemList.tsx`, `CourseSection.tsx` — they already pass the right handlers; no API change needed.
- `KdsActionIcon.tsx` — still used for the remaining undo affordance.
- Settings copy for "Servable modifiers" — behaviour description ("Track Queued, Preparing, and Done state on each modifier individually") still accurate.

### QA
- Toggle Servable Modifiers ON in Settings → Orders.
- On a ticket with a servable modifier (e.g. demo data), tap the modifier row: Unseen → Preparing → Done. Undo returns one step.
- Confirm tapping the modifier does not also advance the parent item or ticket.
- Verify in Light + Dark theme, and at Compact / Standard / Spacious ticket spacing.
- Confirm non-servable modifiers (extras/removes) are unchanged.
