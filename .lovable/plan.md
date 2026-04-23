

## Fix Compact Card Header to match screenshot

### Problem
The current `CompactOrderCard` renders a light card with only a thin 3px left stripe. Your screenshot shows the full order-type-colored header background (e.g. dark navy for DINE IN) with the restructured content inside it.

### Fix
Rewrite `src/components/kds/CompactOrderCard.tsx` so the header uses the same full colored background as the standard card, with the new compact content layout inside.

### Changes (single file: `src/components/kds/CompactOrderCard.tsx`)

1. **Header background**: use the order-type color (from `orderTypeColors[order.orderType]` / `DEFAULT_ORDER_TYPE_COLORS`) as the full header `backgroundColor`, matching how `OrderCard.tsx` standard view paints it (line 669, `effectiveStatusColor.color` equivalent — for compact we use the order type color directly per the screenshot).
2. **Remove the 3px left stripe** — your screenshot has no stripe, just a fully-filled colored header.
3. **Inner layout** inside the colored header (padding `12px`):
   - Left column (`flex flex-col`):
     - Top: order type / table label (e.g. "TABLE 15") in white, `text-badge-type` size, uppercase, tracking-wider, `text-white/80`
     - Bottom: order number (e.g. "33") in white, `text-order-num`, font-black, tight line-height
   - Right column (`flex flex-col items-end`):
     - Top: `TimerBadge` (elapsed) — keep existing component, white text variant
     - Bottom: placed-at time (e.g. "04:38 PM") in white, `text-badge-type`, `text-white/70`
4. **Label content**: prefer `tableName` when present (e.g. "TABLE 15"), otherwise fall back to `typeLabels[order.orderType]` ("DINE IN", "TAKE OUT", etc.). This matches the screenshot which shows "TABLE 15" not "DINE IN".
5. **Keep removed**: server name, guest name — stay out of compact header.
6. **Allergen row below header**: keep existing `hasAllergens` strip as-is.
7. **Card wrapper**: `rounded-lg overflow-hidden bg-surface-card shadow-sm` (no border on left, since the full header is colored).

### Out of scope
- Standard `OrderCard` view: untouched.
- TimerBadge component: untouched (it already renders white-on-dark fine inside colored headers per standard view).
- Allergen strip, body, footer, course rows: untouched.
- All fonts, sizes, weights, tokens: unchanged — only structure and background fill change.

### Visual outcome
Compact card header matches your screenshot: full dark navy (or order-type color) background, white "TABLE 15" small label top-left, large white "33" order number bottom-left, white "00:38" timer top-right, dim white "04:38 PM" bottom-right. No server name, no guest name, no left stripe.

