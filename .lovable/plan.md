

## Analysis

The station-filtered Home screen logic exists but appears to not activate properly when navigating from Settings after selecting a station chip. The rendering flow in `MainOrderView.tsx` checks `kdsMode === 'Prep' && !!resolvedStationCourse` for station view, and shows `PrepBoard` when `kdsMode === 'Prep' && !resolvedStationCourse`. The screenshot confirms PrepBoard is rendering, meaning `resolvedStationCourse` is falsy at render time despite the Dessert chip being selected.

**Root cause hypothesis**: The SettingsPanel's `onClose` callback and `setStationCourse` are called in sequence, but the `onClose` triggers `settingsOpen = false` in Index.tsx (parent), which may cause a re-render cycle where the context update hasn't propagated yet. Additionally, `activeNav` is never explicitly set to `'home'` when exiting settings via station chip selection.

## Plan

### 1. SettingsPanel - Add navigation callback for station selection
- Add an optional `onNavigateHome?: () => void` prop to `SettingsPanel`
- When a station chip is tapped (and a station is selected), call `onNavigateHome?.()` in addition to `onClose()`
- Pass this from `MainOrderView` to explicitly set `activeNav` to `'home'`

### 2. MainOrderView - Wire up the navigation
- Pass `onNavigateHome` to SettingsPanel that calls `setActiveNav('home')` and `onCloseSettings?.()`
- This ensures the home screen renders with the station course already set in context

### 3. Defensive rendering fix
- In the rendering logic, reorder the conditional: check `isStationView` BEFORE checking `kdsMode === 'Prep' && !resolvedStationCourse` for PrepBoard, to guarantee the station-filtered view takes priority even during edge-case state transitions

### Files to modify
- `src/components/kds/SettingsPanel.tsx` - Add `onNavigateHome` prop and call it from station chip handler
- `src/pages/MainOrderView.tsx` - Pass `onNavigateHome` callback, ensure `activeNav` is set to `'home'`

