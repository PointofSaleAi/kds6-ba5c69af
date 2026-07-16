Plan to fix the product count alignment without changing ticket behavior:

1. Create one shared item-row alignment pattern for V3 and Expo rows
   - Use a 2-column grid for the count and product text.
   - Column 1: fixed quantity width.
   - Column 2: product name plus modifiers, add-ons, notes, allergens.
   - Align the quantity and first product-name line by baseline, not by top edge or visual guessing.

2. Replace the current fragile flex alignment
   - V3 currently mixes `items-start` / `items-center`, nested inline-blocks, and manual line-height values.
   - Expo uses a similar structure, so the same visual offset repeats there.
   - I will remove the alignment dependency on the whole row height and align only the quantity against the first product-name line.

3. Keep action icons independent
   - The count/name alignment will not affect the existing product action icons, prep timer chip, ready icon, served icon, or Expo status icon.
   - Those controls will remain in their current row action area.

4. Apply to all relevant V3 ticket cases
   - Normal items.
   - Items with modifiers.
   - Items with add-ons.
   - Items with product notes.
   - Items with allergen chips.
   - Done/Served items.
   - Secondary-language rows, including Arabic.

5. Apply the same fix to Expo tickets
   - Ready tickets.
   - Recalled tickets.
   - Wrapped product names.
   - Products with modifiers, notes, allergens, and TO GO badges.

6. Verify visually with browser screenshots
   - Open `/kds/v3` and inspect short names, long wrapped names, and detailed rows.
   - Switch to Expo mode and inspect the same cases.
   - Confirm the quantity sits on the same horizontal text baseline as the product name in all cases.

Technical detail:
```text
Before:
flex row
  qty span
  content block
  action icons

Problem:
The qty is aligned to the row or top edge, while the product name sits inside nested blocks. Rows with details make the mismatch more visible.

After:
outer flex row
  count + text grid, baseline-aligned
    fixed qty column
    product text column
  action icons

Result:
The quantity aligns to the first product-name line consistently, regardless of row height or wrapping.
```