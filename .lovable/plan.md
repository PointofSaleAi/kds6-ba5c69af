# Dynamic ticket layout for onboarding app cues

## Problem
The onboarding walkthrough sample ticket is currently hard-forced to the legacy `/default` (`OrderCard`) layout, because:
- `MainOrderView.renderOrderCard` renders any order with `id === ONBOARDING_SAMPLE_ORDER_ID` via `<OrderCard ... legacyActions />` regardless of the selected layout.
- `legacyActions` prop is also forced true whenever `onboardingActive` is true.
- Only `OrderCard` and its children (`CourseSection`, `FlatItemList`, `OrderCardActions`) have the `data-onboarding="..."` anchor attributes the walkthrough targets.

New user goal: the sample ticket used for app cues should follow the user's selected Ticket Layout (v1..v6). Default is v3 for first-time users (already the case system-wide).

## Changes

### 1. Stop forcing legacy layout for the onboarding sample
`src/pages/MainOrderView.tsx`
- Remove the special-case `if (displayOrder.id === ONBOARDING_SAMPLE_ORDER_ID) { render OrderCard ... }` block so the sample flows through the normal variant renderer and picks up `effectiveCardVariant` (v3 by default, or whatever the user selected).
- Remove `onboardingActive` from the `legacyActions` OR expression on the fallback `<OrderCard />` (line 1160). It should only be legacy when `effectiveLegacyActions` (route === Default) or a training sample.

### 2. Add walkthrough anchors to every card variant
Anchors the walkthrough targets on the sample ticket:
- `ticket-header`, `ticket-orderno`, `ticket-timer`
- `item-row`, `item-allergen`, `item-modifier`
- `item-eye`, `item-bell`, `item-check`
- `ticket-footer-btn`, `ticket-footer-undo`

Add matching `data-onboarding` attributes in each variant file, mapped to the closest existing element:
- `src/components/kds/variants/OrderCardV1.tsx`
- `src/components/kds/variants/OrderCardV2.tsx` (v3 route, the new default)
- `src/components/kds/variants/OrderCardV3.tsx`
- `src/components/kds/variants/OrderCardV4.tsx`
- `src/components/kds/variants/OrderCardV5.tsx`
- Shared subcomponents that render item rows/action icons within variants: `src/components/kds/variants/headers/V1Header.tsx`, `V2Header.tsx`, `V3Header.tsx`, and any per-variant item row component used inside them.

For variants where an anchor has no equivalent element (e.g. v5 header-less styles, or a variant that hides individual eye/bell/check icons), fall back to attaching the anchor to the nearest logical element (e.g., the whole item row) so the walkthrough tooltip still positions sensibly.

### 3. Walkthrough robustness across variants
`src/components/onboarding/OnboardingWalkthrough.tsx`
- Keep existing anchor selectors, but the current per-step skip logic (line 273 `if (!document.querySelector(step.anchor))`) already handles missing anchors, so nothing else changes structurally.
- Verify the "footer button" click helper (`clickSample('[data-onboarding="ticket-footer-btn"]')`) still triggers the seen/in-progress/done phase on the active variant. If a variant uses a different footer control, add the same `data-onboarding="ticket-footer-btn"` marker on its equivalent tappable footer element so the auto-advance keeps working.

### 4. Verify
- Reset onboarding flag, load `/` -> lands on `/kds/v3` -> walkthrough runs against the v3 sample ticket with tooltips anchored on the v3 card.
- Change Ticket Layout in Settings to v1, restart walkthrough, tooltips anchor on the v1 card.
- Repeat spot-check for v2, v4, v5, v6, and legacy Default.
- Run Playwright to confirm no anchors are missing (walkthrough advances past every step without silently skipping the ticket-level steps on v3).

## Technical notes
- No changes to data flow or business logic. Presentation-only: add DOM attributes and remove one override branch.
- `selectedTicketsRoute` already drives `effectiveCardVariant` via `getCardVariantForTicketsRoute`, so once the override branch is removed the sample ticket automatically matches the active layout.
- Training-mode sample tickets (`training-sample-*`) keep their existing forced-legacy behavior; only the onboarding sample changes.
