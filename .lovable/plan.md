# Repositionable Docking for Sidebar, Summary Panel, and Bottom Bar

Add Windows-taskbar-style drag-and-dock behavior so users can move the three persistent chrome surfaces around the screen edges.

## What the user gets

- **Left sidebar (KDSSidebar):** drag to dock on Left or Right edge.
- **Right summary panel (ItemSummaryPanel / ExpoSummaryPanel):** drag to dock on Left or Right edge.
- **Bottom bar (BottomStatusBar):** drag to dock on Top or Bottom edge.

Behavior mirrors the Windows taskbar:
- Grab a dedicated drag handle (a small grip area) on each surface.
- While dragging, a translucent drop-zone overlay highlights the valid edges for that surface.
- Release over a highlighted edge to dock there. Release elsewhere to snap back.
- Position persists across reloads via `localStorage`.
- Includes a "Reset layout" action in Display settings.

Constraint kept intact: the left rail and bottom footer remain visible on every screen (per Persistent Nav rule). Only their dock edge changes.

## Layout model

`MainOrderView` currently uses a vertical stack: header, then a horizontal flex row containing `KDSSidebar` + main content + summary panel, then `BottomStatusBar` underneath. To allow top/bottom for the bar and left/right swaps for the two side panels, we restructure into a CSS grid shell:

```text
+--------------------------------------------------+
|              header (unchanged)                  |
+--------------------------------------------------+
|  [bar?top]                                       |
|  [side1] [   board content   ] [side2]           |
|  [bar?bottom]                                    |
+--------------------------------------------------+
```

Where `side1`/`side2` slots are filled based on each panel's docked edge (left/right), and the bar slot is rendered above or below the middle row based on its docked edge (top/bottom).

If both side panels dock to the same edge, the main sidebar wins the outer slot and the summary panel sits inboard of it (Windows-style: last dropped goes adjacent).

## Technical implementation

### 1. New hook: `src/hooks/use-dock-layout.tsx`

- React Context provider `DockLayoutProvider` storing:
  ```ts
  type SideEdge = 'left' | 'right';
  type BarEdge  = 'top'  | 'bottom';
  interface DockLayout {
    mainSidebar: SideEdge;   // default 'left'
    summaryPanel: SideEdge;  // default 'right'
    bottomBar: BarEdge;      // default 'bottom'
  }
  ```
- Persists to `localStorage` key `kds.dock-layout.v1`.
- Exposes `setDock(panel, edge)` and `resetLayout()`.
- Wrap the app in `src/App.tsx` alongside existing providers.

### 2. New component: `src/components/kds/DockDragLayer.tsx`

- Renders during an active drag.
- Shows four edge drop-zones (left strip, right strip, top strip, bottom strip) as translucent overlays with hover highlight.
- Listens on `pointermove` / `pointerup` on `window` while a drag is active.
- Filters which edges are valid per `panel`:
  - mainSidebar / summaryPanel: left + right
  - bottomBar: top + bottom
- On release over a valid edge, calls `setDock(panel, edge)`. Otherwise no-op.
- Exposes context: `useDockDrag()` returning `{ startDrag(panel), dragging }`.

### 3. Drag handles on each surface

Add a small grip handle (lucide `GripVertical` / `GripHorizontal`) that calls `startDrag(panel)` on `pointerdown`:

- `KDSSidebar`: vertical grip pinned at top edge of the rail.
- `ItemSummaryPanel` and `ExpoSummaryPanel`: vertical grip at top edge.
- `BottomStatusBar`: horizontal grip on the leftmost slot.

Handles are subtle (muted color, hover brightens), small touch target but >=24px so they don't compete with normal controls.

### 4. Restructure `MainOrderView.tsx`

- Read `mainSidebar`, `summaryPanel`, `bottomBar` from `useDockLayout()`.
- Build the chrome row dynamically:
  ```tsx
  const leftSlots  = [];
  const rightSlots = [];
  if (mainSidebar  === 'left')  leftSlots.push(<KDSSidebar/>);  else rightSlots.unshift(<KDSSidebar/>);
  if (summaryPanel === 'left')  leftSlots.push(<SummaryPanel/>); else rightSlots.unshift(<SummaryPanel/>);
  ```
- Render `<BottomStatusBar/>` either above or below the middle flex row based on `bottomBar`.
- Sticky-positioning logic in `KDSSidebar` (currently `fixed`-style left rail) becomes `relative` flex children; widths preserved (80px rail, 280px summary).
- Update the `fixed top-0 right-0 bottom-0 left-20` overlay convention used in settings sub-views to compute `left`/`right`/`top`/`bottom` insets from the current dock layout via a small helper `getOverlayInsets(layout)`. Apply in `DisplaySettings.tsx` overlays and any other place using the hardcoded `left-20` / `bottom: 52px` pattern.

### 5. Reset action

Add a "Reset chrome layout" `SettingsPill` at the bottom of `DisplaySettings.tsx` calling `resetLayout()`.

## Files to add

- `src/hooks/use-dock-layout.tsx`
- `src/components/kds/DockDragLayer.tsx`
- `src/lib/dock-insets.ts` (helper for overlay insets)

## Files to edit

- `src/App.tsx` (wrap provider, mount `DockDragLayer` once)
- `src/pages/MainOrderView.tsx` (slot-based chrome layout)
- `src/components/kds/KDSSidebar.tsx` (drag handle)
- `src/components/kds/ItemSummaryPanel.tsx` (drag handle)
- `src/components/kds/ExpoSummaryPanel.tsx` (drag handle)
- `src/components/kds/BottomStatusBar.tsx` (drag handle)
- `src/pages/settings/DisplaySettings.tsx` (overlay inset helper + reset pill)
- `src/pages/SettingsLayout.tsx` (consume layout for sidebar slot)

## Out of scope

- Free-floating / undocked windows. Only edge-docking, like Windows taskbar.
- Resizing panel widths via drag (separate feature).
- Per-user server-side persistence (uses local storage only).

## Memory updates

Add a new memory `mem://ui/dock-layout` describing the docking model and update `Persistent Navigation` core rule to note that edges are user-configurable but rail + footer must always remain mounted.
