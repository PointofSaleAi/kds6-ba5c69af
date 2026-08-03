# iOS 26 glossy chrome for /kds/glass

Extend the Glass ticket board's glossy look to the surrounding app chrome — top header, summary panel, bottom footer, notifications popover and the settings screens reached from Glass — in both light and dark theme. Everywhere else (other ticket layouts) keeps its current solid chrome.

## What changes visually

- **Top header**: translucent blurred bar instead of the solid dark brand bar. Hairline bottom border, subtle top sheen, chips/icon buttons become frosted pills.
- **Bottom footer (status bar)**: same frosted treatment; pills, toggles and the view-mode segmented control get the inset gloss style, active state as a solid dark/light fill (like the ticket action buttons).
- **Summary panel**: frosted panel with translucent section headers, hairline dividers and gloss chips for counts. Section accent colours (Overtime red, Unseen blue/amber) stay but are tinted rather than flat blocks.
- **Left rail**: frosted vertical bar, active nav item as a soft glossy fill with a bright hairline.
- **Notifications popover / shift profile popup**: floating frosted card with blur, hairline border, soft drop shadow.
- **Settings (when opened from Glass)**: sidebar and content cards use the frosted surface; controls keep current layout and spacing.
- Light theme uses white-tinted glass with bright inner highlight; dark theme uses a smoked-glass tint with a faint white top edge. Text switches to the Glass text tokens so contrast stays legible in both themes.
- Layout, spacing, sizes, touch targets and all existing controls stay unchanged — this is purely a surface/skin change.
- Applied consistently across desktop, tablet and mobile breakpoints (blur and shadows scaled down slightly on mobile for performance).

## Technical approach

1. **Chrome tokens and utilities** in `src/index.css`: new classes `ios-glass-bar`, `ios-glass-panel`, `ios-glass-card`, `ios-glass-pill`, `ios-glass-pill-active` built on `backdrop-filter: blur(24px) saturate(180%)`, a translucent gradient background, hairline border, `inset 0 1px 0` sheen and a soft outer shadow. Each has a `.dark` variant. Values are derived from the existing `LIGHT_SKIN` / `DARK_SKIN` values in `src/components/kds/glass/glass-theme.tsx` so the chrome matches the tickets exactly.
2. **Scope flag**: new `src/hooks/use-glass-chrome.tsx` exposing `useGlassChrome()` — true when the active ticket layout/route is Glass (route match for `/kds/glass`, plus the stored tickets-route key so Settings opened from Glass also gets it). `KdsGlassPage` sets a `data-glass-chrome` attribute on `document.documentElement` so portalled overlays (notifications, popovers, modals) can opt in via CSS.
3. **Component updates** (class swaps only, no logic changes): `KDSTopHeader.tsx`, `BottomStatusBar.tsx`, `ItemSummaryPanel.tsx`, `KDSSidebar.tsx`, `NotificationsPopover.tsx`, `ShiftProfilePopup.tsx`, `SettingsLayout.tsx` + `settings/SettingsSidebar.tsx` — conditionally apply the glass classes and swap hardcoded `bg-brand-dark` / `text-white` style surfaces for the glass surface plus `text-foreground`-based tokens.
4. **Verification**: Playwright screenshots of `/kds/glass` and `/kds/v1/settings` in light and dark theme at 1280px, 1024px tablet and 390px mobile widths; confirm text contrast and that other layouts (`/kds/v3`) are visually unchanged.
