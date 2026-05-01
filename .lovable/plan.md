## Problem

The Settings → Display screen has a "Mode switcher" pill with three options (Standard / Expo / Station), but when the user picks **Station**, there is no UI to choose **which station** (Meat, Desserts, Salad, etc.) to view.

In the pre-refactor `SettingsPanel.tsx` (commit `81a6afa`, April 21) the Mode switcher was a card that included:
- Helper text per mode
- A row of category "chips" populated from active orders (via `availableCategories`)
- A confirmation line "Showing station view for X station"

When the layout was flattened into single-row pills and later migrated to the new iPad-style settings, only the three-way toggle survived. The data plumbing still works (`useKDSMode().stationCourse` drives `MainOrderView` filtering, and `BottomStatusBar` shows the active station), but there is no longer any in-Settings way to pick one. Users currently can only clear the station via the "Exit Station view" link on the main view header — they cannot pick one from Settings at all.

## Fix

Restore the station picker directly under the Mode switcher pill on `src/pages/settings/DisplaySettings.tsx`, shown only when `mode === 'Prep'` (Station). Keep it visually consistent with the new dense iPad Settings style — no card chrome, just a compact sub-row beneath the Mode switcher pill.

### Behaviour

- Visible only when Station mode is active.
- Lists every distinct, in-progress `item.category` from current orders (same logic that already exists in `SettingsPanel.tsx` lines 247-258 — lift it into DisplaySettings or a small shared hook).
- Each category renders as a tappable chip. Tapping selects it (`setStationCourse(cat)`); tapping the active chip clears it (`setStationCourse(null)`), matching prior behaviour.
- Active chip uses the existing primary brand fill; inactive chips use the muted surface, consistent with other chip groups in the new UI.
- When no categories are available yet, show a 12px muted line: "No stations available. Categories will appear once orders are loaded."
- When a station is selected, show a small helper line: "Showing station view for {category}".

### Where the data comes from

```ts
// already proven in src/components/kds/SettingsPanel.tsx (lines 247-258)
const availableCategories = useMemo(() => {
  const cats = new Set<string>();
  for (const order of orders) {
    if (order.status === 'served') continue;
    for (const cg of order.courses) {
      for (const item of cg.items) {
        if (item.category && !item.isCompleted && !item.isCancelled) {
          cats.add(item.category);
        }
      }
    }
  }
  return Array.from(cats).sort();
}, [orders]);
```

`orders` is available via the existing `useOrderStore()` hook used elsewhere in the project. `stationCourse` / `setStationCourse` come from `useKDSMode()` (already imported in DisplaySettings).

## Files to change

- `src/pages/settings/DisplaySettings.tsx`
  - Pull `stationCourse`, `setStationCourse` from `useKDSMode()` (already gets `mode`, `setMode`).
  - Pull active orders from `useOrderStore()`; compute `availableCategories` with the snippet above.
  - Render a new compact sub-row under the existing Mode switcher pill, conditional on `mode === 'Prep'`. Use `flex flex-wrap gap-1.5` chips matching the existing chip styling used in other Settings pills, plus the helper line(s) described above.

No changes required to `useKDSMode`, `MainOrderView`, `BottomStatusBar`, or `NotificationStationSync` — the picker only writes into existing state that the rest of the app already reads.

## Out of scope

- No changes to the sidebar, hero card, bottom toolbar, or any other Settings section.
- No changes to the Mode switcher pill itself (label, helper, three-way toggle stay as-is).
- No changes to the active-state colours, icons, or row spacing rules established in the previous iPad-density passes.
