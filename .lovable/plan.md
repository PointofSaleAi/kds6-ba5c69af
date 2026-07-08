I understand: every selected ticket layout must use the same shared ticket lifecycle as `/default`, not local-only behavior.

Plan:

1. Create one shared lifecycle contract for all ticket cards
   - Home, Seen, Unseen, and History will all render through the same `renderOrderCard` path.
   - The selected layout, Default, v1, v2, v3, v4, v5, will only change appearance.
   - Actions will always update the shared order state.

2. Match Default behavior for Seen and Unseen
   - Tapping or advancing an unseen ticket in any layout marks that order as seen.
   - The ticket immediately leaves Unseen and appears in Seen.
   - The same seen state applies everywhere instantly.

3. Match Default behavior for done products
   - Product lifecycle will use the shared state, not only local row state.
   - When a product reaches done, it becomes completed in the shared order.
   - When a done product is tapped again, it is removed from the active ticket and added to History, matching Default behavior.
   - Apply this to v1, v2, v3, v4, and v5.

4. Keep History as the served/completed destination
   - Bumping a whole ticket in any layout marks the full ticket served and sends it to History.
   - Dismissing a done product in any layout sends that product to History.
   - History cards should show completed data consistently and not break Seen or Unseen counts.

5. Fix local state mismatch in variant cards
   - Initialize each variant row from shared item completion state.
   - If an item was completed in one screen, it appears completed in all screens.
   - If an item was removed in one screen, it disappears from all active ticket screens.

6. Verify real-time flow across layouts
   - Test Default, v1, v2, v3, v4, and v5.
   - For each layout:
     - ticket starts in Unseen
     - tap/advance moves it to Seen
     - mark product done
     - tap done product again removes it from ticket and adds it to History
     - bump full ticket moves it to History
     - switching layouts updates all screens instantly

Technical details:

- Update `OrderCardV1` through `OrderCardV5` so they support the same callback surface as `OrderCard`.
- Add `onItemDismiss` support to layouts currently missing it, especially v1, v4, and v5.
- Stop relying on variant-only `rowStates` as the source of truth. Use shared `order.courses[].items[].isCompleted` to derive done rows.
- Keep `MainOrderView.renderOrderCard` as the single adapter that passes `toggleOrderSeen`, `markItemDone`, `handleItemDismiss`, and `handleBump` into every layout.
- Avoid changing visual design or ticket layout picker behavior.