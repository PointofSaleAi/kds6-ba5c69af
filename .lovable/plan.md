

## Portrait/Vertical Mode for KDS Home Screen

### Overview
Add a responsive portrait layout that activates when the device is in portrait orientation (height > width). The main changes: single-column ticket cards, summary panel becomes a bottom drawer, and a dev-only portrait preview toggle.

### Technical Approach

**1. Portrait Detection Hook** (`src/hooks/use-portrait.ts`)
- Create a custom hook `useIsPortrait()` that uses `window.matchMedia('(orientation: portrait)')` 
- Also expose a `forcePortrait` override state for dev preview toggle
- Store the force-portrait flag in a React context so it can be toggled from settings and consumed in MainOrderView

**2. MainOrderView Layout Changes** (`src/pages/MainOrderView.tsx`)
- Consume `useIsPortrait()` 
- When portrait mode is active:
  - The main content area renders tickets in a single-column vertical scroll (full width, one card per row)
  - The `<ItemSummaryPanel>` is NOT rendered as a right sidebar
  - Instead, render a new `<SummaryDrawer>` component at the bottom

**3. Summary Drawer Component** (`src/components/kds/SummaryDrawer.tsx`)
- A bottom-anchored collapsible drawer
- **Collapsed state**: A small tab/handle bar showing "SUMMARY {count} ↑" positioned above the footer bar
- **Expanded state**: Slides up to ~50% screen height, contains the existing `<ItemSummaryPanel>` content (reusing the same component)
- Toggle on tap of the handle bar
- Uses CSS transform + transition for the slide animation

**4. Footer Bar**
- No changes. Footer stays fixed at bottom. Summary drawer handle sits just above it.

**5. Left Sidebar**
- No changes. Works as-is in portrait.

**6. Portrait Preview Toggle** (`src/pages/DevScenarioSelector.tsx` or MainOrderView)
- Add a small dev-only toggle button (visible only in dev/preview) in the top-right area of the KDS view
- When toggled, forces the portrait layout regardless of actual orientation
- Uses the context from the portrait hook

### Files to Create/Edit

| File | Action |
|------|--------|
| `src/hooks/use-portrait.tsx` | **Create** - Portrait detection hook + context with force override |
| `src/components/kds/SummaryDrawer.tsx` | **Create** - Bottom collapsible drawer wrapping ItemSummaryPanel |
| `src/pages/MainOrderView.tsx` | **Edit** - Conditionally render single-column layout + SummaryDrawer in portrait mode |

### Layout Behavior

```text
LANDSCAPE (current, unchanged)        PORTRAIT (new)
┌──┬──────────────────┬────┐          ┌──┬────────────────────┐
│  │ Card Card Card   │ S  │          │  │ Card (full width)  │
│  │ Card Card Card   │ U  │          │  │ Card (full width)  │
│S │ Card Card        │ M  │          │S │ Card (full width)  │
│B │                  │ M  │          │B │ Card (full width)  │
│  │                  │    │          │  │                    │
│  ├──────────────────┤    │          │  ├────────────────────┤
│  │ Footer Bar       │    │          │  │ SUMMARY 88 ↑      │
└──┴──────────────────┴────┘          │  ├────────────────────┤
                                      │  │ Footer Bar         │
                                      └──┴────────────────────┘
```

### Implementation Details

- Portrait grid: `grid-cols-1` with cards at full width
- Summary drawer uses `fixed` positioning with `bottom` offset equal to footer height (52px)
- Drawer expanded height: `50vh`
- Drawer handle: 40px tall, dark background, centered text "SUMMARY {count} ↑"
- Transition: `transform 300ms ease-in-out`
- The dev portrait toggle will be a small phone-rotation icon button rendered conditionally when `import.meta.env.DEV` is true

