## Plan

1. Update the shared product-name wrapper so wrapped names shrink to the actual widest rendered line, not the available row width.
2. Keep the current single-line behavior intact for names that do not wrap.
3. Apply the fix in the shared `TightWidthBox` / `CourseSection` path so it covers default and compact ticket layouts on `/kds/default`.
4. Verify with browser measurements against examples like `LOBSTER LINGUINE`, checking that:
   - each product-name wrapper width matches the widest text line,
   - no extra highlighted/hover area remains after the line ends,
   - compact and default layouts both pass.

## Technical approach

- The remaining issue is likely caused by `width: max-content` measuring the unwrapped text width, then clamping to `max-width: 100%`. For two-line names, that leaves the first line box as wide as the original unwrapped name instead of the visible line text.
- Replace that with a measured width based on `Range.getClientRects()` for the primary text, using the widest rendered line after wrapping.
- Apply that measured width to the primary container when available, while preserving `maxWidth: '100%'` and `minWidth: 0` for safe wrapping.