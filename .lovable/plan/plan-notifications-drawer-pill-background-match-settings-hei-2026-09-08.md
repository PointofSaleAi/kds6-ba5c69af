# Plan — Notifications drawer: pill background + match settings height

## Goal
Make the Notifications drawer use the same white card background as the settings pills, and make its panel height match the settings left navigation section.

## Changes (single file: `src/pages/AlertsPanel.tsx`)

### 1. Background color → settings pill color
- Line 214: change `bg-tickets-bg` → inline `style={{ background: 'hsl(var(--surface-card))' }}` (the same token the `SettingsPill` rows and the settings left rail use). Keeps light/dark theme correctness.

### 2. Panel height → match settings left section
- The settings content area uses `py-2` (8px top + 8px bottom) around the left rail, so the left section height = frame height − 16px.
- Line 211: change the wrapper padding from `p-[10px] pl-0` → `p-2 pl-0` so the drawer panel gets the same 8px top/bottom gap as the settings left rail, matching its height exactly.

No other layout, spacing, header, tab, or list changes.
