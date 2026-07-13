# Fix onboarding walkthrough Back navigation

## What Step 16 is
Step 16 is the Summary panel **"Product"** cue: "Tap a product to filter the queue to only tickets with that product. Tap again to clear." Anchor: `[data-onboarding="summary-product"]`.

## Root cause of the "can't go back to Step 16" glitch
By Step 17, the sample ticket has been walked through seen → in progress → done by Steps 10–12. A done ticket has no items in the Summary panel, so the anchors for Steps 13–16 (`summary-header`, `summary-overtime`, `summary-category`, `summary-product`) no longer exist. When the user presses Back, `prev()` moves the index correctly, but the auto-skip effect in `OnboardingWalkthrough.tsx` (line 270) sees the missing anchor after 600 ms and calls `next()`, snapping the user forward again. This affects every ticket layout because the sample ticket goes through the same lifecycle regardless of variant.

Secondary issues found while tracing:
- `ONBOARDING_TOTAL_STEPS = 27` in `use-onboarding.tsx` but `STEPS` in `OnboardingWalkthrough.tsx` has 29 entries. Last two footer cues are unreachable and the "Step X of 27" counter is wrong.
- `handlePrev` only rewinds the sample ticket when leaving index 10 or 11. Leaving index 10 back to 9 doesn't undo the "seen" tap, so Step 10's tooltip shows against an already-progressed footer button.

## Changes

### 1. `src/components/onboarding/OnboardingWalkthrough.tsx`
- **Fix auto-skip on Back**: only auto-skip when the user is moving forward. Track the last navigation direction (`'next' | 'prev' | 'init'`) in a ref; `handleNext` sets it to `'next'`, `handlePrev` sets it to `'prev'`. In the auto-skip effect, if direction is `'prev'`, do nothing (let the user press Back again to keep going backward past a missing anchor, instead of the walkthrough deciding for them).
- **Rewind sample ticket on Back through the whole footer progression**: extend `handlePrev` so leaving index 10 → 9 also fires an undo click, matching the existing 11 → 10 and 12 → 11 behavior. Result: rewinding from Step 12 all the way back to Step 10 leaves the ticket in its original "new" state, which restores the Summary panel content and makes anchors for Steps 13–16 reappear.
- **Belt and braces**: derive `total` from `STEPS.length` in the tooltip counter so it always matches the array.

### 2. `src/hooks/use-onboarding.tsx`
- Export `ONBOARDING_TOTAL_STEPS` as the actual length (29 with the current array) instead of a hardcoded 27, so the "Finish" button appears on the true last step and the counter is correct. Simplest: import `STEPS` length via a small shared constant, or expose a setter and have the walkthrough component report the real total on mount. Prefer keeping the constant, and bump it to the real value (29) with a code comment tying it to `STEPS`.

## Verification
- Reset onboarding (`localStorage.removeItem('kds-onboarding-seen-v1')`), reload `/kds/v3`.
- Walk forward to Step 17, then press Back repeatedly. Confirm each of Steps 16, 15, 14, 13 stays put (no auto-skip), tooltip anchors to the correct summary element, and the sample ticket rewinds so Summary items exist.
- Repeat on `/kds/v1`, `/kds/v2`, `/kds/v4`, `/kds/v5`, and `/kds/default` to confirm the fix is layout-independent.
- Confirm counter reads "Step N of 29" and the last footer cue ("Date and time") is now reachable with a "Finish" button.
- Run existing Playwright happy-path if one exists; otherwise a manual pass is sufficient since this is presentation-only.

## Notes
No business logic or data changes. Purely walkthrough presentation and navigation behavior.
