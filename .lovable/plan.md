In `src/components/kds/variants/OrderCardV1.tsx` `V1ProductRow`, change the quantity `<span>` so the number is centered within its fixed-width column instead of left-aligned.

- Add `text-align: center` (e.g. `className="... text-center"`) to the quantity span.
- Keep `minWidth: 18` (or bump slightly to 20) so single and double digits share the same column width.
- Leave the `gap-1` between quantity and product name unchanged.

No other variants, files, or behavior affected.