## Fix Expo course status colors

Swap the Queued and In Progress color treatments in `src/components/kds/ExpoView.tsx` so they match the intended status semantics.

### Current (incorrect)
- Queued → amber/warning (yellow-orange)
- In Progress → neutral text-primary (grey)

### Target
- Queued → muted grey (inactive, waiting)
- In Progress → warning amber (active, attention)
- Ready / Prepared → success green (unchanged)
- Overtime → destructive red (unchanged)

### Change

In the per-course block (around lines 551-568), update both `courseColorClass` and `courseBgClass`:

- Queued: `text-warning` / `bg-warning/10` → `text-text-muted` / `bg-muted/50`
- In Progress fallback: `text-text-primary` / `''` → `text-warning` / `bg-warning/10`

This applies to the course header label, the chevron, and the "X of Y ready" counter, which all already share `courseColorClass`. Item row styling (queued opacity, etc.) is unaffected.

No other files need changes.