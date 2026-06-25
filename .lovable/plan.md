## Goal
Make the elapsed-timer pill in `/kds/v1` ticket card headers fully driven by the Status Colors configured in Settings > Display > Status Colors, including the first (new) bucket. No other route or component is affected.

## Change
In `src/components/kds/variants/OrderCardV1.tsx`:

- Remove the hardcoded `rgba(255,255,255,0.15)` fallback for the first aging bucket.
- Always set the pill background to `status.color` returned by `useStatusRules().getStatusForElapsed(elapsed)`.
- Always set the pill text to `status.textColor` (already returns a hex for white/grey/black), so contrast matches whatever the user picked in Settings.
- Keep the same pill shape, size, font, and placement. Real-time updates already work because `elapsed` ticks every second.

## Out of scope
- `/kds/full`, `/kds/v2`, `/kds/v3`, `/kds/home-onlineordering`
- Status rule editor / thresholds / defaults
- Any other header element (order number, fired time, table row)
- Sidebar, footer, summary panel
