## Screen Mode: Switch to Point of Sale

Selecting **Point of Sale** in the header's Screen Mode dropdown will replace the KDS surface with the hosted POS app (`https://mobileposapp.lovable.app`) embedded in an iframe, after the user enters any 4-digit manager PIN.

### Behavior

1. In `ScreenModeChip`, tapping **Point of Sale** opens a PIN prompt overlay (same visual style as `ClockInOutOverlay`'s PIN pad, compact modal variant).
2. Any 4 digits + Enter unlocks the switch. Cancel closes the overlay and keeps KDS mode.
3. On success, the app enters "POS mode":
   - The KDS chrome (left rail, top header, footer, tickets) is hidden.
   - A full-viewport iframe loads `https://mobileposapp.lovable.app`.
   - A small floating pill in the corner shows "Point of Sale" with a **Return to KDS** button (also PIN-gated).
4. Selecting KDS / CFD / Kiosk in the chip: KDS switches instantly (current behavior), CFD/Kiosk stay as no-op placeholders for now.

### Technical

- **New context** `src/hooks/use-screen-mode.tsx`: holds `mode: 'kds' | 'pos' | 'cfd' | 'kiosk'` and `setMode(next, pin)`. Wrap in `App.tsx` provider tree.
- **New component** `src/components/kds/PosModeShell.tsx`: full-viewport `<iframe src="https://mobileposapp.lovable.app">` with a floating "Return to KDS" pill that opens the PIN overlay.
- **New component** `src/components/kds/ManagerPinOverlay.tsx`: reusable 4-digit PIN modal (extract PIN pad styling from `ClockInOutOverlay`). Accepts any 4 digits.
- **`ScreenModeChip`** (`src/components/kds/ScreenModeChip.tsx`): read/write via `useScreenMode`, open `ManagerPinOverlay` when selecting a different mode.
- **`App.tsx`**: render `<PosModeShell />` above the router when `mode === 'pos'`, else render the existing `<BrowserRouter>` tree. This keeps KDS state alive when returning.

### Out of scope

- Real PIN validation against a users table (any 4 digits accepted).
- CFD and Kiosk views (chip selection stays a no-op for those).
- Deep-linking / SSO into the embedded POS app.
