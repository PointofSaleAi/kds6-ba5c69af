## Make Stagger the default view

Two independent "stagger" defaults exist and both are currently off:

1. **Footer view mode** (`src/pages/MainOrderView.tsx:88`) — `useState<ViewMode>('grid')` renders Grid on first load.
2. **Stagger Mode release logic** (`src/hooks/use-kds-settings.tsx:101`) — `staggerMode: false` in the manufacturer defaults.

### Changes

1. `src/pages/MainOrderView.tsx` — change initial state to `useState<ViewMode>('stagger')` so the footer view mode selector lands on Stagger on fresh launch and after "Reset to default".
2. `src/hooks/use-kds-settings.tsx` — change `staggerMode: false` to `staggerMode: true` in the `defaults` object, and bump `STORAGE_KEY` from `posai-kds-settings-v5` to `posai-kds-settings-v6` (adding `v5` to `LEGACY_STORAGE_KEYS`) so existing devices pick up the new default without losing other tweaks.

Nothing else is touched — Settings UI already has no Stagger Mode toggle or Display mode picker, so no settings-screen edits are needed.
