## V3 product-level tap progression

Wire the per-item action button in `OrderCardV3.tsx` to cycle through three local visual states on tap. V1 and V2 are untouched.

### State cycle (per item)

1. **UNSEEN (default)** — outlined square button, `Check` icon in grey. Tappable.
2. **PREPARING** — after 1st tap, icon swaps to `CookingPot` (lucide), button tinted orange (`#E67E22` border + light fill). Tappable.
3. **DONE** — after 2nd tap, icon swaps to a filled green check (`Check` on `#16A085` background, white stroke). Button becomes disabled (`pointer-events-none`, `cursor-default`) and item name gets `opacity-60` + `line-through` for visual "served" feedback. Further taps do nothing.

### Implementation

File: `src/components/kds/variants/OrderCardV3.tsx`

- Add local state map inside `OrderCardV3`: `const [itemStates, setItemStates] = useState<Record<string, 'unseen' | 'preparing' | 'done'>>({})`.
- Add `cycle(itemId)` handler: unseen → preparing → done; done is terminal.
- Update `ItemRow` to accept `state` and `onTap` props. Render the correct icon, colors, and disabled styling per state. Apply `line-through` + dimmed text on `done`.
- Pass `state={itemStates[item.id] ?? 'unseen'}` and `onTap={() => cycle(item.id)}` from both the dine-in course branch and the non-dine-in flat branch.

### Out of scope

- No changes to V1 or V2.
- No wiring to the real order store / global lifecycle — state is local to the card, matching the existing variant-only pattern.
- No long-press, double-tap, or row-body tap. Only the existing right-side icon button is the hit target.
