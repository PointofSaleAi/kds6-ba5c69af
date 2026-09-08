# Settings right section — seamless grey background, no visible outer container

## Current problem

The settings right pane renders as a distinct rounded card: rounded corners,
drop shadow, and a grey shade that contrasts with the surrounding window
background — producing the visible "frame" highlighted in the second screenshot.

## Target look (first screenshot)

The right section has no visible container edge. The light-grey background is
continuous and seamless behind the white pill cards and their helper text —
the pills look standalone on grey, exactly like the earlier implementation.

## Changes

In both settings shells — `src/pages/SettingsLayout.tsx` and the settings branch
of `src/pages/MainOrderView.tsx`:

1. Remove the visible card chrome from the right content pane (`<main>`):
   no rounded corners, no box-shadow, no border.
2. Make the background continuous light grey (`hsl(var(--surface-bg))`) that
   blends into the surrounding settings surface, so no panel edge is visible.
   Keep the inner content padding so pills don't touch screen edges.
3. Keep the white pill cards, helper text, the left KDS rail, and the settings
   navigation sidebar exactly as they are — they remain white rounded cards.
4. Preserve the iOS glass variant: when glass chrome is active, keep the
   existing `ios-glass-card` treatment.

Applies to all settings sub-pages (Account, System, Tickets, Hardware, Display)
since they all render through these two shells.

## Verification

- Screenshot Settings > Display and Settings > Account: right section shows
  seamless grey behind white pills, no rounded/shadowed outer frame.
- Confirm the layout still works in dark theme and portrait.
- Confirm `/tmp/observability/build-errors.log` shows a clean build.
