# Hide scrollbars globally across the app

Apply a single global CSS rule in `src/index.css` so every scrollable element — main content, sidebars, dialogs, popovers, dropdowns, command palettes, sheets, drawers, the Radix ScrollArea, and any custom scroll containers — has its scrollbar hidden while still being scrollable via touch/wheel.

## Implementation

Edit `src/index.css` and extend the existing `.scrollbar-hide` block to cover the universal selector.

Add inside the file (near the existing `.scrollbar-hide` definition):

```css
/* Hide scrollbars everywhere — keep scroll functionality */
* {
  -ms-overflow-style: none;   /* IE/Edge */
  scrollbar-width: none;       /* Firefox */
}
*::-webkit-scrollbar {
  display: none;               /* Chrome, Safari, Opera */
  width: 0;
  height: 0;
}

/* Also target Radix ScrollArea internal scrollbar element so the thin track doesn't render */
[data-radix-scroll-area-scrollbar] {
  display: none !important;
}
```

## Why this approach

- One change covers every component (Dialog, Popover, DropdownMenu, Sheet, Drawer, Command, Sidebar, ScrollArea, settings pages, order panels, modals like RevenueCenterFilter, AlertsPanel, etc.) without editing 30+ files.
- Scroll behaviour is preserved — only the visible scrollbar UI is suppressed.
- The Radix ScrollArea custom scrollbar (used in `src/components/ui/scroll-area.tsx`) is also suppressed so it doesn't draw its own track.

## Files changed

- `src/index.css` — append the global scrollbar-hide rules.

## Verification

After approval I will:
1. Apply the CSS change.
2. Spot-check by reviewing the rendered settings page, an open dialog, and a dropdown to confirm no scrollbar is visible while scrolling still works.
