## Problem

Ticket Spacing toggles (Compact / Standard / Spacious) update the CSS variables `--kds-card-padding` and `--kds-item-gap`, but **no component actually reads those variables**. Item rows in `CourseSection.tsx` and `FlatItemList.tsx` use hardcoded `paddingTop: '2px'` / `paddingBottom: '2px'` and hardcoded gap values, so changing the setting has zero visible effect on either the preview or the home-screen tickets.

## Fix

Make item rows consume the spacing variables, then map the three modes to meaningful values that visibly change row density (the most noticeable spacing in a ticket).

### 1. `src/index.css` — redefine spacing tokens to row-padding semantics

Replace the existing `.ticket-spacing-*` blocks so each mode sets a row vertical padding token used by item rows. Keep card padding the same so card chrome doesn't shift dramatically.

```css
:root {
  --kds-row-py: 2px;        /* row vertical padding (Compact default) */
  --kds-item-gap: 4px;      /* gap between course/item blocks */
  --kds-card-padding: 8px;  /* outer card body padding */
}

.ticket-spacing-compact  { --kds-row-py: 2px; --kds-item-gap: 4px;  --kds-card-padding: 8px;  }
.ticket-spacing-standard { --kds-row-py: 6px; --kds-item-gap: 8px;  --kds-card-padding: 10px; }
.ticket-spacing-spacious { --kds-row-py: 12px; --kds-item-gap: 14px; --kds-card-padding: 12px; }
```

### 2. `src/components/kds/CourseSection.tsx` — consume `--kds-row-py`

In the item-row wrapper around line 502–505 replace the hardcoded `paddingTop: '2px'` / `paddingBottom: isLastVisible ? '6px' : '2px'` with:

```ts
paddingTop: 'var(--kds-row-py)',
paddingBottom: isLastVisible ? 'calc(var(--kds-row-py) + 4px)' : 'var(--kds-row-py)',
```

### 3. `src/components/kds/FlatItemList.tsx` — same change at lines 152–153

```ts
paddingTop: 'var(--kds-row-py)',
paddingBottom: isLastVisible ? 'calc(var(--kds-row-py) + 4px)' : 'var(--kds-row-py)',
```

### 4. `src/components/kds/OrderCard.tsx` — apply card body padding from the var

Line 674 currently hardcodes `padding: '12px'` on a card region. Change to:

```ts
padding: 'var(--kds-card-padding)',
```

(Only that header/body block — leave the small icon row paddings alone so they don't bloat.)

### 5. Verify the wrapper is in place

`MainOrderView.tsx` already wraps the board in `ticket-spacing-{compact|standard|spacious}` and `DisplaySettings.tsx` already wraps the preview the same way. No change needed there.

### 6. Update memory

Update `mem://style/ticket-spacing` to clarify the three modes change **row vertical padding** (primary visual effect), with a small bump to card body padding. Keep "Default Compact" rule.

## Files to edit
- `src/index.css`
- `src/components/kds/CourseSection.tsx`
- `src/components/kds/FlatItemList.tsx`
- `src/components/kds/OrderCard.tsx`
- `mem://style/ticket-spacing`

## Result
- Compact: today's dense look (unchanged).
- Standard: noticeably airier rows (~6px top/bottom per row).
- Spacious: clearly roomy rows (~12px top/bottom), good for line cooks reading from distance.
- Both the settings preview and the live KDS home screen reflect the change instantly.