## Goal
Add a new route **`/kds/old`** that duplicates `/kds/full` but restores the legacy interaction model:
- A per-product **KdsActionIcon** (the circular Eye / Bell / Check button) on the right of each product row, used to cycle status (unseen → preparing → done) and undo.
- The existing footer **Seen / In Progress / Done** ticket-level buttons (`OrderCardActions`) remain visible (they're already part of `OrderCard.tsx` in default mode).
- Whole-row tap-to-cycle behavior is disabled for product rows on this route (so users interact via the icon, like before). Long-press to 86 stays.

Everything else (header, allergens, modifiers, settings, summary panel, sidebar, footer) is identical to `/kds/full`.

## Changes

1. **Routing** (`src/App.tsx`)
   - Add `<Route path="/kds/old" element={<Index legacyActions />} />` next to the existing `/kds/full` route.
   - Add a matching settings parent route `/kds/old/settings` mirroring `/kds/full/settings`.

2. **Prop plumbing**
   - `src/pages/Index.tsx`: accept `legacyActions?: boolean`, pass to `MainOrderView`.
   - `src/pages/MainOrderView.tsx`: accept `legacyActions?: boolean`, pass to each `OrderCard`.
   - `src/components/kds/OrderCard.tsx`: accept `legacyActions?: boolean`, pass to `FlatItemList` and `CourseSection`.
   - `FlatItemList.tsx` and `CourseSection.tsx` product rows: accept `legacyActions`.

3. **Legacy icon row** (in `FlatItemList.tsx` and the product-row block in `CourseSection.tsx`)
   - When `legacyActions` is true:
     - Render a `<KdsActionIcon />` at the right edge of each non-cancelled product row.
       - status `unseen` → `seen` icon (Eye, outline) → click sets status to `preparing`
       - status `preparing` → `preparing` icon (Bell) → click sets status to `done`
       - status `done` → `done` icon (filled green Check) → click reverts to `preparing` (undo)
     - Skip the `onClick={handleTap}` wiring on the row container (icon owns the action). Keep long-press for 86 and keep modifier/allergen layout untrouched.
   - When `legacyActions` is false: current behaviour is unchanged.

4. **Sidebar nav** (`src/components/kds/KDSSidebar.tsx`)
   - No nav entry added (route is reachable by URL only, matching how `/kds/v1`..`v5` are exposed). If you want a visible link, say so and I'll add it.

## Out of scope
- No visual or behaviour changes to `/kds/full`, `/kds/v1..v5`, settings, summary panel, AI panel, or any other surface.
- No data model changes. Status transitions reuse existing `onItemStatusChange` / `onMarkSeen` handlers already wired through `OrderCard`.

## Files touched
- `src/App.tsx`
- `src/pages/Index.tsx`
- `src/pages/MainOrderView.tsx`
- `src/components/kds/OrderCard.tsx`
- `src/components/kds/FlatItemList.tsx`
- `src/components/kds/CourseSection.tsx`
