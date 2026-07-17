Plan to fix the remaining product action icon alignment issue:

1. **Refactor the V3 item row structure**
   - Move the product-level action area into the same first-line row as the quantity and product name.
   - Use a 3-column layout:

```text
[qty] [product name] [action icons]
      [modifiers / notes / allergens below]
```

2. **Lock the action icon rail to the product-name line box**
   - Replace the current `minHeight` action wrapper with an explicit first-line height based on `var(--kds-item-name) * 1.2`.
   - Keep icons centered inside that line-height box so they align with the first line of the product name, not with modifiers, notes, allergen chips, timers, or wrapped details.

3. **Prevent timer/expand chips from shifting the main action icon**
   - Keep the chevron, prep timer chip, and state icon visually grouped, but prevent the tallest chip from changing the vertical alignment reference.
   - This addresses cases where some products still look misaligned because extra chips make the right-side action group taller.

4. **Keep detail rows aligned under the product name**
   - Preserve the existing `24px` left offset for allergens, modifiers, add-ons, and notes so they remain aligned under the product name column.

5. **Verify edge cases**
   - Check products with: no modifiers, modifiers, add-ons, notes, allergen chips, Arabic secondary language, long wrapped names, prep timer visible, and served/ready/preparing states.
   - Confirm the action icon center matches the product-name first-line center across those cases.