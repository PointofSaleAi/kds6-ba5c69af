

# Customizable Order Type Header Colors

## Overview
Add a new "Order Type Colors" settings sub-screen accessible from Settings > Display, allowing users to customize the header colors for Dine In, Take Out, Delivery, and Banquet order cards. Colors persist via the existing KDSSettings context and localStorage.

## Changes

### 1. Extend KDSSettings with order type colors
**File: `src/hooks/use-kds-settings.tsx`**
- Add `orderTypeColors` field: `Record<OrderType, string>` storing hex colors
- Defaults: `{ 'dine-in': '#1A1A2E', 'take-out': '#2980B9', 'delivery': '#16A085', 'banquet': '#F39C12' }`
- Add `setOrderTypeColors` setter
- Persisted to localStorage automatically via existing mechanism

### 2. Create Order Type Colors settings screen
**New file: `src/pages/OrderTypeColorsSettings.tsx`**
- Full-screen panel matching the existing StatusSettings pattern (slide-up modal with header, back/close button)
- Title: "Order Type Colors"
- Four rows, one per order type, each showing:
  - Color swatch (circle) with the current color
  - Label (DINE IN, TAKE OUT, DELIVERY, BANQUET)
  - Color picker input (native HTML color picker triggered by tapping the swatch)
- "Reset to Defaults" button at the bottom
- Live preview: a small sample header strip for each type showing the chosen color
- Save is instant (updates context on change, no separate save button needed)

### 3. Add settings row in SettingsScreen
**File: `src/pages/SettingsScreen.tsx`**
- Add a new row under "Status Colours" in the Display section:
  - Icon: `Palette`, Label: "Order Type Colors", Description: "Customise order type header colors"
  - onClick opens `'order-type-colors'` sub-screen

### 4. Wire sub-screen routing
**File: `src/pages/MainOrderView.tsx` (or wherever sub-screen routing lives)**
- Add case for `'order-type-colors'` to render `OrderTypeColorsSettings`

### 5. Apply custom colors in OrderTypeBadge
**File: `src/components/kds/OrderTypeBadge.tsx`**
- Import `useKDSSettings` and read `orderTypeColors`
- Replace the Tailwind `bg-order-*` class with an inline `style={{ backgroundColor }}` using the custom color
- Keep the Tailwind class as fallback if no custom color is set

### 6. Wire in other components using order type colors
- Search for any other usage of `bg-order-dine-in` etc. (ExpoOrderCard, HistoryOrderCard) and apply the same inline style override

## Testing
- Open Settings > Display > Order Type Colors
- Change each order type color and confirm the card headers on the home screen update immediately
- Reload the page and confirm colors persist
- Reset to defaults and confirm original colors return

