Copy the font sizes, weights, and spacing from `SettingsNavigation.tsx` (project: 6.0 - Mobile APP / Point of Sale) into the KDS `src/components/settings/SettingsSidebar.tsx`. No new icons, no logic changes — visual tokens only.

## Changes in `src/components/settings/SettingsSidebar.tsx`

**Container padding (was `px-4 pt-4 pb-3` / `px-2`)**
- Outer scroll area uses `px-3.5 pt-3.5 pb-24` (matches POS tablet layout).
- Search bar moves into the same padded column at the bottom.

**Header "Settings" (was `text-xl font-bold`)**
- Change to `text-[1.65rem] font-bold mb-3` to match POS.

**Nav row button (was `h-44px px-2 rounded-full gap-12`, label `text-[15px]`)**
- Row: `flex items-center gap-3.5 w-full py-[0.55rem] px-3 rounded-full active:opacity-70 transition-all`.
- Active state keeps current `hsl(var(--surface-bg))` background.
- Remove the fixed `height: 44` inline style — vertical rhythm comes from `py-[0.55rem]`.
- Icon tile: `w-[2.15rem] h-[2.15rem] rounded-[0.55rem]` (update `SettingsIconTile` call to a custom-sized wrapper, or wrap inline with these classes; size prop stays `xs` only if it already maps to ~2.15rem, otherwise switch to inline sizing).
- Label: `text-[0.95rem] font-medium leading-tight`.

**Search-result row (was `gap-3 px-2 py-2.5 rounded-xl`, label `text-sm`, sub `text-xs`)**
- Row: `flex items-center gap-3 w-full py-2 px-3 rounded-xl active:opacity-70 transition-all text-left`.
- Icon tile: `w-[1.9rem] h-[1.9rem] rounded-[0.5rem]` (compact size, matches POS compact variant).
- Primary label: `text-[0.9rem] font-medium leading-tight truncate`.
- Secondary: `text-[0.7rem] leading-tight truncate`.
- Results header count line: keep but tighten to `text-[0.7rem] font-medium uppercase tracking-wider px-3 py-2`.

**Search bar (was `px-3.5 py-2.5 gap-2 rounded-full`, input `text-sm`, icons size=16)**
- Container: `rounded-full px-3.5 py-[0.45rem] flex items-center gap-2.5` (keep `hsl(var(--surface-bg))` background).
- Search + Mic icons: `size={18}` → use inline `w-[1.1rem] h-[1.1rem]` via className on the lucide icons.
- Input: `text-[0.9rem] flex-1 min-w-0 bg-transparent outline-none`.
- Outer wrapper around the search bar uses `px-3.5 pt-3 pb-3` (matches the column padding).

## Notes
- All color tokens stay as-is (`hsl(var(--text-primary))`, `--text-muted`, `--surface-bg`) — only sizing/spacing/weights change.
- `SettingsIconTile` may need a quick check to confirm `size="xs"` matches ~2.15rem; if not, pass explicit width/height props or override via `className`. (Will verify the component during build.)
- No changes to routing, search index, or `GROUP_COLOR` mapping.
