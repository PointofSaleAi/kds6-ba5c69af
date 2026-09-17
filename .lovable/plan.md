# Equalize Display Settings Page Gutters

## Goal
Make Ticket Layout, Ticket Studio, Status Colors, Order Type Colors, and Language use the same narrow, even left/right spacing as the 8px gap between the KDS rail and Settings navigation.

## Changes
- Replace the current 24px inner side gutters on all five screens with a shared 8px responsive gutter.
- Align each title, back button, and content area to the same left and right edges.
- Preserve the existing 8px spacing between the two navigation areas and use it as the visual spacing reference.
- Expand each screen’s usable content width into the recovered space rather than leaving empty margins.
- Let Ticket Layout’s controls and preview, Ticket Studio’s workspace, Status Colors’ editor and preview, Language’s columns, and Order Type Colors’ card grid reflow within the wider area.
- Keep narrow-screen safeguards so controls stack or scroll cleanly on tablets and phones without clipping.

## Scope
- Presentation and layout only.
- No changes to ticket settings, status rules, colors, languages, previews, or saved behavior.
- Preserve the real Glass ticket preview wherever Glass is selected.

## Verification
- Check all five screens at desktop, landscape tablet, portrait tablet, and mobile widths.
- Verify equal left/right gutters, aligned headers and content, no horizontal clipping, and efficient use of the wider workspace.
- Check both light and dark themes and confirm the project builds cleanly.
