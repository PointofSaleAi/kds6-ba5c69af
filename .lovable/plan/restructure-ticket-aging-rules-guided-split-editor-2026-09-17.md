# Restructure Ticket Aging Rules: Guided Split Editor

## Direction

Use the **Guided Split Editor** structure for the Ticket Aging Rules screen.

This keeps the current rule-editing workflow, but separates the screen into clear working zones so kitchen managers can scan, edit, preview and save without the page feeling cramped or uneven.

## What will change

- Keep **Ticket Aging Rules** as one focused settings screen.
- Keep the existing behaviour: presets, course-level toggle, add/reset/remove rules, drag reorder, validation, colour controls, text colour controls, order-type preview buttons and Save Rules.
- Restructure the layout into three clear areas on wide screens:
  1. **Setup strip** at the top for Course Level and Presets.
  2. **Status Rules rail** on the left for the ordered aging stages.
  3. **Selected Rule workbench** with editing controls and a sticky **Live Ticket Preview**.
- Reduce the large unused grey space by letting the content areas use the available height more intentionally.
- Keep the real **Glass ticket** in the preview when Glass is the selected ticket layout.

## Proposed layout

```text
Ticket Aging Rules
┌────────────────────────────────────────────────────────────┐
│ Course Level toggle                    Presets             │
├───────────────┬────────────────────────┬───────────────────┤
│ Status Rules  │ Selected Rule Editor   │ Live Ticket        │
│               │                        │ Preview            │
│ New           │ Status name            │ Order-type chips   │
│ Medium        │ Time range             │ Glass ticket       │
│ Delay         │ Colour                 │                   │
│ Overtime      │ Text colour            │                   │
├───────────────┴────────────────────────┴───────────────────┤
│ Save Rules                                                  │
└────────────────────────────────────────────────────────────┘
```

## Screen behaviour

### Desktop and landscape tablet

- Use a three-column work area:
  - Left: compact Status Rules list with clear selected/unselected states.
  - Middle: selected rule fields grouped together.
  - Right: sticky Live Ticket Preview so changes are always visible.
- Keep Save Rules full-width at the bottom of the settings content.
- Keep all touch targets large enough for tablet use.

### Portrait tablet and mobile

- Stack the screen in this order:
  1. Setup strip
  2. Horizontal or compact Status Rules selector
  3. Selected Rule editor
  4. Live Ticket Preview
  5. Save Rules
- Avoid horizontal page scrolling.
- Keep labels and button text readable in light and dark themes.

## Visual cleanup

- Make the screen match the current Settings style: light grey page background, white pill/card surfaces, readable secondary text and consistent 8px spacing.
- Make selected and unselected rule rows visually distinct without relying on faint text.
- Keep labels such as **Status Rules**, **Status Name**, **Time Range**, **Color**, **Text Color** and **Live Ticket Preview** readable in both themes.
- Tighten spacing between the editor controls and the preview without crowding touch controls.

## Technical notes

- Main screen: `src/pages/StatusSettings.tsx`.
- Rule editor and preview: `src/components/kds/AgingEditPanel.tsx`.
- Preserve current state and save logic from `use-status-rules`.
- Rework layout classes only; do not change timing validation or saved rule data.
- Verify desktop, tablet and mobile widths, plus light and dark theme.
