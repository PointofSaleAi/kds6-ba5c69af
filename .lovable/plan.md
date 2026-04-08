

# Plan: Fix Text Size and Status Colors Reflecting on Home Screen

## Issues Found

### 1. Status Colors - NOT connected to custom rules
The `OrderCard` uses a hardcoded `urgencyBorderMap` for the left border color:
```
ok → border-l-success (green)
warning → border-l-warning (orange)
critical → border-l-destructive (red)
overtime → border-l-status-overtime (dark red)
```
These are static Tailwind classes based on a fixed ratio calculation (`getTimerUrgency`), completely ignoring the custom status rules from `StatusRulesProvider`. Only the `TimerBadge` timer text color uses the custom rules. When a user changes status colors in Settings > Status Colours, only the timer digit color changes, not the card border or any other visual element.

**Fix:** Update `OrderCard` to use `getStatusForElapsed()` from `useStatusRules()` for the left border color (inline style instead of hardcoded class). Also update `StatusChip` to reflect the active status rule color.

### 2. Text Size - Works but may appear broken
The CSS classes `.text-scale-compact` (85%) and `.text-scale-large` (115%) ARE applied correctly. However, the settings panel replaces the order view when open, so users cannot see changes in real-time. The font scaling also only affects the order grid container, not the order card's internal elements which use fixed pixel sizes (`text-order-num`, `text-modifier`, etc.), making the change nearly invisible.

**Fix:** Apply text scaling at the individual card level using a `style={{ fontSize }}` override so it cascades into the card's relative-sized elements. Convert key card typography from fixed `px` to `em` units so they respond to the parent scale factor.

## Files to Change

1. **`src/components/kds/OrderCard.tsx`** - Use `getStatusForElapsed()` for border color via inline `style.borderLeftColor`. Wrap card in a container that applies text size scaling.

2. **`src/components/kds/TimerBadge.tsx`** - Already correct (uses status rules). No change needed.

3. **`src/components/kds/StatusChip.tsx`** - Optionally derive chip color from status rules instead of hardcoded status config, so custom colors show in the chip too.

4. **`src/index.css`** - No change needed, CSS classes are fine as a fallback.

## What Already Works
- Cards Per Row, Show Allergens, Sort Default, Stagger Mode, Enable Badge, Mode Switcher, Language, Sound - all functional.

