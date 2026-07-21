## Diagnosis

The mismatch is caused by the layout route being reset to `/kds/v1` when leaving the Tickets screen or Settings, even though the selected Ticket Layout is `/v3`.

Confirmed from the code:
- `/kds/v3` renders `Index cardVariant="v2"`, but `/kds/v1` renders default `/v1` UI (`src/App.tsx:80-95`).
- `Index` hardcodes `basePath = '/kds/v1'`, and Settings close currently navigates back to that base route (`src/pages/Index.tsx:56`, `src/pages/Index.tsx:205-206`).
- `MainOrderView` sets History/Seen/Unseen via internal `activeNav`, but then calls `onCloseSettings?.()` for those screens, which navigates to `/kds/v1` even when the user is not in Settings (`src/pages/MainOrderView.tsx:903-914`).
- `selectedTicketsRoute` prefers `activeTicketsRoute`, so once the URL becomes `/kds/v1`, `effectiveCardVariant` becomes the `/v1` ticket UI (`src/pages/MainOrderView.tsx:126-139`).
- The settings route `/kds/v1/settings/...` is also interpreted as active ticket route `v1` by `pathToRouteKey`, so Settings can accidentally override the selected layout context (`src/hooks/use-kds-settings.tsx:183-188`).

## Fix plan

1. **Stop sub-screen navigation from forcing `/kds/v1`**
   - In `MainOrderView`, update `handleNavigate` so `history`, `seen-orders`, and `unseen-orders` only change `activeNav` when already on the ticket board.
   - Only close Settings when `settingsOpen` is actually true.

2. **Return from Settings to the selected ticket layout, not `/kds/v1`**
   - In `Index`, replace the hardcoded settings close target with `getTicketsRoutePath(readStoredTicketsRoute('v3'))`.
   - Keep the existing Settings URL if needed, but make leaving Settings return to the selected `/kds/v3` route.

3. **Prevent Settings routes from pretending they are `/v1` tickets**
   - In `use-kds-settings.tsx`, update `pathToRouteKey` so `/kds/v1/settings/...` returns `null` instead of `v1`.
   - This makes Settings use the saved selected ticket layout rather than clobbering the active layout with the settings wrapper route.

4. **Make layout selection the single source of truth for all KDS sub-screens**
   - Ensure `selectedTicketsRoute` resolves in this order:
     1. direct ticket route (`/kds/v3`, `/kds/v4`, etc.)
     2. saved Ticket Layout preference
     3. safe fallback `v3`
   - Then History, Seen, Unseen, and Tickets all pass through the same `renderOrderCard` path already in `MainOrderView`.

5. **Verification**
   - Use Playwright with `kds-tickets-route = v3`.
   - Open `/kds/v3` and verify Tickets renders V3 ticket UI.
   - Click History, Seen, and Unseen from the sidebar and verify the URL does not degrade to `/kds/v1` and cards still render V3 UI.
   - Open Settings > Display, select V3, close Settings, then repeat Tickets/History/Seen/Unseen verification.

<presentation-actions>
<presentation-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</presentation-link>
</presentation-actions>