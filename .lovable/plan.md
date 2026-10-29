# Make the Focus Lane center ticket big in Glass View style

## What will change
- In Ticket Studio, Focus Lane board, with Glass View style: the center (focused) ticket fills the big center area, the same way it does for the other styles.
- The smaller tickets around it stay their current size and fill their own slots.
- Text size, spacing, identifier, theme and wait-time colours keep working. Desktop, tablet and phone, light and dark.

## Why it happens
The single Glass ticket preview is centered inside a shrink-to-fit wrapper, so it keeps its standard narrow card width instead of stretching to the space it is given.

## Technical details
- `SelectedVariantPreview.tsx` `GlassPreview`: let the board stretch to its container (wrapper child gets `w-full`/`min-w-0`, so `TicketBoard` measures the full slot width; with one ticket its fluid column fills it).
- Confirm other screens using this preview (Ticket Aging Rules, Language) still look right; if the stretch makes them too wide, add an opt-in `fill` prop used only by Ticket Studio's Focus Lane.
- Verify with Playwright at 1141×742, 1024×1366, 390×844, light and dark.
