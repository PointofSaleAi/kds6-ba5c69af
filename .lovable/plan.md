## Goal
Align the KDS Settings right pane with the reference `pointofsaleai-6.0` layout: no outer card wrapper around the right pane, no per-pill backgrounds/borders, and properly aligned sub-screen headers (back chevron flush left, title centered, no inner card padding).

## Findings (current state)
1. `SettingsLayout.tsx` wraps the right pane (`<main>`) in a `rounded-3xl` card with `bg-surface-card` and shadow, plus `max-w-2xl mx-auto px-2 py-6` content constraint. Reference shows the right pane as a flat extension of the page background, no card, full width with only horizontal page padding.
2. `SettingsPill.tsx` renders each row as a `rounded-full` pill with `surface-card` background + 1px border + helper text below. Reference rows have NO surrounding card/border, just the icon tile + label + control inline, with helper text underneath as plain muted text.
3. `SectionHeaderCard.tsx` wraps the section header in a bordered `rounded-2xl` card. Reference uses a plain header (icon tile + title + description) with NO card chrome.
4. Sub-screens (`OrderTypeColorsSettings`, the inline Language wrapper in `DisplaySettings.tsx`) use a circular muted back button + title in a flex row. Reference uses a borderless chevron-left button flush to the left edge with the title perfectly centered above content, no inset card around it.

## Proposed Changes

### 1. `src/pages/SettingsLayout.tsx`
- Remove the `rounded-3xl`, `bg-surface-card`, and `boxShadow` styling from `<main>`. Keep it as a transparent scroll container.
- Drop `max-w-2xl mx-auto`. Reference uses full available width with consistent horizontal padding (`px-8 py-6`).
- Outlet wrapper becomes: `<main className="flex-1 overflow-y-auto scrollbar-hide"><div className="px-8 py-6"><Outlet/></div></main>`.

### 2. `src/components/settings/SectionHeaderCard.tsx`
- Remove the card wrapper styles: drop `rounded-2xl p-5 mb-5`, `background`, and `border`.
- Replace with a plain block: `<div className="mb-6">` with the icon tile, title, and description rendered directly on the page background, matching the reference's borderless intro block.

### 3. `src/components/settings/SettingsPill.tsx`
- Remove the outer `rounded-full overflow-hidden` wrapper with `surface-card` background and border.
- Render the row directly: `<div className="flex items-center justify-between gap-3 py-3">` with icon tile + label on left and control + chevron on right.
- Keep the `highlighted` state as a subtle ring (e.g., a translucent rounded background) only when actively highlighted via hash, since reference has no default border but still needs deep-link feedback.
- Helper text: change wrapper margins to `mt-1 mb-4 px-1` and keep muted color so groupings read clearly.
- Add a thin bottom divider (`border-b border-border/40`) between rows OR rely purely on spacing, matching the reference (reference uses spacing only, no dividers — go with spacing).

### 4. Sub-screen headers
**`src/pages/OrderTypeColorsSettings.tsx`**
- Remove the `relative` + `absolute` positioning hack.
- Use a single flex row: back button flush left (small chevron-left, borderless or very subtle), title centered using `flex-1 text-center`, and a same-width spacer on the right to keep the title visually centered.
- Drop the bulky 44x44 muted circle in favor of a borderless `ChevronLeft` icon button (still 44x44 hit area for touch, but no background fill) to match reference.
- Container should not add extra horizontal inset beyond the page padding already provided by `SettingsLayout`.

**`src/pages/settings/DisplaySettings.tsx` (inline Language sub-screen)**
- Remove the inner `rounded-3xl` card wrapper around the inline Language view; use the same flat header pattern as `OrderTypeColorsSettings`.
- Keep the `fixed top-0 right-0 left-20 bottom-[52px]` overlay shell (per persistent-nav memory) but drop the inset card so the surface matches the rest of Settings.

## Files to Edit
- `src/pages/SettingsLayout.tsx`
- `src/components/settings/SectionHeaderCard.tsx`
- `src/components/settings/SettingsPill.tsx`
- `src/pages/OrderTypeColorsSettings.tsx`
- `src/pages/settings/DisplaySettings.tsx`

## Verification
- Visit `/kds/full/settings/display`: right pane should sit flat on the page background with no card outline, rows borderless, helper text below each row, full-width layout.
- Tap "Order Type Colors": back chevron sits flush left, title perfectly centered, no inner card chrome.
- Tap "Language": same flat header treatment as Order Type Colors.
- KDS left rail and bottom footer remain visible (per persistent-nav memory).
- No regressions in dark mode (the surface variables already handle both themes).