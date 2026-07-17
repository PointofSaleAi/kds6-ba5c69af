## Update Ticket Studio board selector

Replace the current 9-item `BOARDS` array in `src/components/kds/TicketStudioSkeleton.tsx` with the 8 layouts from the PDF, using the exact names and a short subtitle drawn from each concept.

### New board list (in PDF order)

1. **Calm Board** — Balanced operations, low visual noise
2. **Focus Lane** — Priority ticket centered, context at edges
3. **Distance View** — Maximum readability from several feet
4. **Progressive Ticket** — Reveals detail for the active course
5. **Safety First** — Allergen and cross-contact controls lead
6. **Timeline Flow** — New, Cooking, Plating, Ready lanes
7. **Adaptive Density** — Comfortable, Balanced, Rush modes
8. **Dark Command Center** — High-contrast focused operations

### Changes

- Replace `BOARDS` entries with new `id`/`name`/`subtitle` tuples matching the list above (ids: `calm-board`, `focus-lane`, `distance-view`, `progressive-ticket`, `safety-first`, `timeline-flow`, `adaptive-density`, `dark-command-center`).
- Mark a small subset as `featured: true` (Calm Board, Safety First, Dark Command Center) to keep the star treatment consistent.
- Update default `selectedBoard` state to `'calm-board'` so the preview opens on the general-purpose default.
- The header caption "Choose from {BOARDS.length} boards" will auto-update to "Choose from 8 boards".

No other files affected; layout, sizing, and preview behavior stay unchanged.
