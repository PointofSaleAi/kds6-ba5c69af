## Goal

Let the chef long-press (hold 500ms) on any ticket card, course header, or product row to open a **manual 86 modal**. The AI/system-suggested 86 flow (red pulsing circle on flagged rows) stays exactly as it is today. The manual flow is visually the same modal, but messaged as "pending manager approval on POS".

## Scope

In scope:
- New `useLongPress` hook (500ms, cancels on move/scroll/pointer-up, suppresses the click that fires after release).
- Wire long-press into:
  - Product row (in `FlatItemList.tsx` and `CourseSection.tsx` `CourseItemTapRow`)
  - Course header (in `CourseSection.tsx`, the active course header — not served/pending headers)
  - Ticket card (top-level wrapper in `OrderCard.tsx` / `ExpandedOrderCard.tsx` / `CompactOrderCard.tsx` whichever renders the home grid)
- Generalize the existing 86 modal into a standalone `Flag86Modal` that accepts a `scope`: `'item' | 'course' | 'ticket'` and a target list of items.
- Manual modal copy: title reflects scope (e.g. product name, `ENTREE · 4 items`, `Table 15 · Order #33`), amber line reads `Pending manager approval on POS`, primary button reads `Request 86` instead of `86 it`.
- On confirm, call existing `confirm(itemId)` on every targeted item id so the row(s) flip to the static `86'd` pill (same visual as today).

Out of scope:
- No real POS round-trip, no approval state machine. `Request 86` immediately confirms locally and logs `console.log('Manual 86 requested:', scope, ids)`. Approval wiring is a future prompt.
- No change to: AI-flagged red circle, modal styling, tap cycle (single tap advance, double tap undo), bump/seen buttons, sidebar, summary panel, status bar.

## UX behavior

- Hold 500ms anywhere on the target → modal opens. The click that would fire on pointer-up is swallowed (a tap-cycle advance must not also fire).
- Pointer movement >8px or scroll cancels the long-press.
- Short tap behavior unchanged everywhere.
- Long-press on a row whose item is already AI-flagged (red circle) does nothing extra — the existing tap-to-open-circle-modal handles it. Long-press on an already-confirmed `86'd` row does nothing.
- Long-press on the course header is only enabled for the active course (not served/pending).
- Long-press on the ticket card targets all non-cancelled, non-served, non-already-86'd items in the ticket.
- Backdrop tap or `Not now` dismisses without confirming, same as today.

## Modal copy by scope

| Scope | Title | Subtext |
|---|---|---|
| item | `{productName}` | `Pending manager approval on POS` |
| course | `{COURSENAME} · {n} items` | `Pending manager approval on POS` |
| ticket | `{tableName} · Order #{orderNumber}` followed by a compact bullet list of items being 86'd | `Pending manager approval on POS` |

Primary button label switches from `86 it` (AI-suggested) to `Request 86` (manual). The existing pending-orders count line stays for the item scope; for course/ticket scope it's omitted (count is implicit in the title).

## Technical details

Files to add:
- `src/hooks/use-long-press.tsx` — returns handlers `{ onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onPointerLeave, onClickCapture }`. Internally uses `setTimeout(500)`. On fire, sets a ref flag so the next click is `preventDefault`/`stopPropagation`'d in `onClickCapture`.

Files to refactor:
- `src/components/kds/Flag86Button.tsx` — extract the modal JSX into an exported `Flag86Modal` component that takes `{ open, onClose, onConfirm, scope, title, subtitleItems?, pendingCount?, primaryLabel }`. `Flag86Button` keeps using it for the AI flow with `primaryLabel="86 it"`. No visual change.
- `src/hooks/use-flag86.tsx` — add `confirmMany(ids: string[])` helper that sets all ids confirmed in one state update.

Files to edit:
- `src/components/kds/FlatItemList.tsx` — attach `useLongPress` to `ItemTapRow` root, opens `Flag86Modal` with `scope: 'item'`.
- `src/components/kds/CourseSection.tsx` — attach `useLongPress` to:
  - `CourseItemTapRow` root (item scope)
  - active course header (course scope, computes eligible item ids from `courseGroup.items`)
- `src/components/kds/OrderCard.tsx` (and `ExpandedOrderCard.tsx` / `CompactOrderCard.tsx` if they render the outer card on the home view) — attach `useLongPress` to the card root, collects eligible item ids across all courses, opens modal with `scope: 'ticket'`.

State: each long-press host owns its own `const [manualOpen, setManualOpen] = useState(false)` and renders `<Flag86Modal>` inline. No global context changes beyond `confirmMany`.

## Verification

- Short tap on a product row still advances Unseen → Preparing → Done.
- Double tap still undoes.
- Holding 500ms on a product row opens modal titled with that product, primary `Request 86`. Confirming flips the row to the static `86'd` pill; the tap that would have followed is suppressed.
- Holding 500ms on the `ENTREE` header of an active course opens modal titled `ENTREE · N items`. Confirming flips every eligible row in that course to `86'd`.
- Holding 500ms on a ticket card opens modal titled with table/order number listing items. Confirming flips every eligible row in the ticket.
- AI-flagged red circle behavior, modal styling, and all other interactions remain unchanged.
