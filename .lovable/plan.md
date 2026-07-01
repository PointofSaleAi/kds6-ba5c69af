## Goal
Make the order-notes wrapper in `OrderCardV5.tsx` shrink to the actual rendered width of the wrapped primary text (so the box ends at the last line's right edge), and have the secondary Arabic text right-align to that same edge.

## Approach
Replace the current `inline-grid` / `max-content` wrapper with a JS-measured tight width.

### Changes in `src/components/kds/variants/OrderCardV5.tsx` (order notes block, ~L330-368)

1. Add a `useTightTextWidth` hook (small local helper or inline `useLayoutEffect`):
   - Attach a `ref` to the primary text `<div>`.
   - Use `Range.getBoundingClientRect()` (or iterate `getClientRects()` and take `Math.max(width)` across lines) to get the widest rendered line of the wrapped text.
   - Set that pixel value as `width` on the shared wrapper.
   - Re-measure on:
     - `ResizeObserver` for the parent container (card resize, sidebar dock changes).
     - Font load (`document.fonts.ready`).
     - Changes to `order.orderNotes`, `displayMode`, `showSecondaryMenu`, and the active language (primary + secondary).

2. Wrapper structure:
   ```
   <div ref={wrapperRef} style={{ width: measuredWidth, maxWidth: '100%', minWidth: 0 }}>
     <div ref={primaryRef} className="break-words">{tn(order.orderNotes)}</div>
     {secondary && (
       <div style={{ textAlign: 'right' for rtl, flex-direction row-reverse for icon }}>
         <Languages /> <div dir={secondaryDir}>{tnSecondary(...)}</div>
       </div>
     )}
   </div>
   ```
   - Before measurement completes, fall back to current `max-content` capped at 100% to avoid layout flash.

3. Keep all existing color, padding, icon, and RTL behavior unchanged. Only the wrapper sizing changes.

### Out of scope
- No change to product modifier/add-on/note alignment (already handled separately).
- No change to other variants (V1–V4, /full, /old) — this is V5 only, matching the screenshot.

## Technical notes
- Use `useLayoutEffect` to avoid flicker.
- Guard `ResizeObserver` for SSR (not needed here, CSR only, but cheap to guard).
- Round measured width up by 1px to avoid sub-pixel re-wrap.