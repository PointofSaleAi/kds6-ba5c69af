## Scope
V5 ticket card allergen display in `src/components/kds/variants/OrderCardV5.tsx`.

## What to change
Inside `ProductPill`, replace the current per-allergen `ModifierRow` loop with a single row that joins all allergen labels with commas. Remove the word "Allergen:" from the label text.

### Current behavior
Each allergen renders as a separate tree-style row:
```
└─ ! Allergen: Peanut
└─ ! Allergen: Gluten
```

### Desired behavior
One combined row:
```
└─ ! Peanut, Gluten
```

## Implementation
1. In `ProductPill`, collect `product.allergens` into a single comma-separated string.
2. Render one `ModifierRow` with prefix `"!"` and the joined labels.
3. Remove the `"Allergen: "` prefix from the joined string.
4. Keep the same `tone="allergen"` styling so the text remains in the allergen warning color.

## Files
- `src/components/kds/variants/OrderCardV5.tsx`