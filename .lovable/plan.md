# Revenue Center picker on the Clock In/Out PIN pad — match Mobile APP

## What changes
Tapping the REVENUE CENTER button on the PIN pad opens a dark panel above the bottom row, spanning the full keypad width, the same as in the "6.0 - Mobile APP" project:
- Title "SELECT REVENUE CENTER" centered at the top.
- 3-column grid of tiles. Each tile shows a coloured icon with the name underneath.
- The selected tile has a lighter fill and outline. Tapping a tile selects it and closes the panel.
- The panel fades and slides in and out.

Centers (same list and icons as Mobile APP): Dine Center (utensils, gold), Main Hall (pin, blue), Outdoor Patio (tree, green), Private Dining (lock, violet), Bar Area (wine glass, pink), Takeout Counter (bag, cyan).

The button itself keeps its current look ("REVENUE CENTER" label, the selected name and an arrow).

## Kitchen rules kept
- Tile names are 12px, not 11px like in Mobile APP, to meet the 12px minimum.
- Tiles are at least 78px tall, so they are easy to tap.
- Names are never cut off; long names wrap.
- Works the same on desktop, tablet and phone. The panel is dark in both themes, like the PIN pad.
- Names go through the translation system.

## Technical
- New `src/components/kds/RevenueCenterIcon.tsx`, ported from the Mobile APP project (list, icon map, colour tokens).
- Add `--revenue-center-*` HSL tokens to `src/index.css` (`:root` and `.dark`).
- `ClockInOutOverlay.tsx`: replace the `rcOpen` list with an AnimatePresence/motion panel positioned `absolute bottom-full left-0 right-0` on the biometrics row, with grid-cols-3 tiles. The default stays "Dine Center".
- Add the new center names to the ui-auth i18n dictionary.
