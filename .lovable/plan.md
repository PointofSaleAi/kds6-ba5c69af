

## Goal
Use the full landscape width on the Settings page and scale up cards, typography, and controls so the layout fills the screen and is easier to read from a distance.

## Scope
File: `src/components/kds/SettingsPanel.tsx` only. No other screens, sidebars, sub-screens, or logic changes.

## Changes

### 1. Remove width cap, use full landscape width
- Replace `max-w-[1200px] mx-auto w-full` on the Settings container with full-width: `w-full` plus larger horizontal padding (e.g. `px-10 py-7`) so content stretches edge-to-edge with comfortable breathing room.
- The 3-column row grid already uses `repeat(3, 1fr)`, so cells will automatically expand to fill the new width.

### 2. Enlarge row cells (cards)
In `RowCell`:
- Padding: `12px 16px` → `18px 22px`
- Setting name font: `14px` → `17px`, weight stays `600`
- Subtitle font: `12px` → `14px`, marginTop `2px` → `4px`
- Min row height: add `minHeight: 76px` so all cells feel substantial

### 3. Enlarge controls to match
- `SmallToggle`: `w-10 h-5` → `w-12 h-6`, knob `w-4 h-4` → `w-5 h-5`, translate adjusted accordingly
- `ChipGroup`: fontSize `10px` → `13px`, padding `4px 8px` → `7px 14px`
- `EditIconButton` / `ChevronIconButton` / `ActionIconButton` containers: `32x32` → `40x40`, icon size `16` → `20`, border-radius `8px` → `10px`
- Section heading (`SectionHeading`): bump font-size and bottom margin one step up for the larger canvas

### 4. Page heading
- "Settings" h2: `text-lg` → `text-2xl`, `mb-4` → `mb-6`
- Version string at bottom: keep current size (10px) per existing spec

### 5. Log Out button
- Increase vertical padding so it visually balances the larger cards (e.g. add `py-4` and `text-base` if not already)

## Out of scope
- Sub-screens (Language, Status Colours, Order Type Colors): unchanged
- Sidebar, bottom status bar, navigation, all toggle/chip state logic: unchanged
- Icon button color theme (grey unified theme): unchanged

## Acceptance
- On the 1119px landscape preview (and wider), the Settings grid spans the full available width with no empty side gutters beyond the page padding.
- Card text, toggles, chips, and icon buttons all read clearly from ~2 metres.
- All Configure / Sync / Upload / Connection / Feedback actions still navigate or trigger exactly as before.

