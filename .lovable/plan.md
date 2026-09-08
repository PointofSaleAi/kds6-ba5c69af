# Plan: Full-screen blurred backdrop for Notifications drawer

## Goal
When the Notifications drawer is open, the blurred dimming overlay behind it should cover the **entire screen** (including the left rail, header, and footer areas), instead of only the dock-inset content region.

## Current state
In `src/pages/AlertsPanel.tsx` (lines 206–222), the backdrop `<motion.div>` is positioned using `getOverlayInsets(layout)`:
```tsx
left: insets.left,
right: insets.right,
top: `calc(${insets.top}px + var(--training-bar-h, 0px))`,
bottom: insets.bottom,
```
This insets the overlay to the docked content area, so the left rail, header, and footer remain un-dimmed/unblurred behind it.

## Change
Replace the inset-based positioning with a full-screen `inset: 0` so the backdrop covers the whole viewport:
- Set `left: 0, right: 0, top: 0, bottom: 0` (or `inset: 0` via inline style).
- Keep the existing theme-aware `--drawer-backdrop` background color, `--drawer-backdrop-opacity`, `blur(6px)` backdrop filter, z-index (`z-40`), opacity animation, and `onClick={onClose}`.
- Do **not** change the drawer panel itself — it still uses dock insets so it sits correctly within the app frame.

## Files
- `src/pages/AlertsPanel.tsx` — backdrop positioning only (lines ~206–222)

## Verify
- Open Notifications drawer in light and dark themes on desktop, tablet, and portrait — backdrop dims/blurs the entire screen.
- Tapping the backdrop still closes the drawer.
- Drawer panel position/height unchanged.
- Build remains clean.
