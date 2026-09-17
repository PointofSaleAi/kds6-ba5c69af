# Hardware Readability for Fast-Paced Kitchens

## Goal
Make every label on the Hardware page and its four dialogs immediately readable at kitchen distance, in bright rooms and in both themes, without changing the workflows or layout.

## Changes

### Hardware page
- Strengthen the introductory description, printer assignment values, and every helper line beneath the settings rows.
- Use primary text for operational values such as **Not set** and a darker, semibold secondary treatment for supporting descriptions.
- Keep all informational text at 12px or larger and preserve the existing compact spacing.

### Printer dialogs
- Strengthen **Available Printers**, status text, IP addresses, and action labels.
- Keep printer names and selection state as the strongest elements, while ensuring secondary details remain clearly legible.
- Preserve status colors and selection behavior.

### Sound Settings dialog
- Strengthen section headings, option labels, upload guidance, volume information, and muted-state text.
- Raise the remaining 10px/11px informational text to the 12px minimum.
- Preserve all controls, sound behavior, and spacing.

### Connection Settings dialog
- Strengthen section headings, field labels, server details, sync history, and helper notes.
- Keep critical connection states and entered values visually stronger than supporting explanations.
- Preserve sync, backup, and device behavior.

## Technical approach
- Use the existing theme-aware primary and secondary text tokens; no hardcoded light-theme colors.
- Apply primary text to actionable or operational content and a higher-weight secondary style only to explanatory content.
- Scope changes to the Hardware page and its KOT Printer, Label Printer, Sound Settings, and Connection Settings dialogs.
- Do not alter backgrounds, spacing, modal dimensions, status colors, or functionality.

## Verification
- Check the Hardware page and all four dialogs at desktop, tablet, and phone widths.
- Check light and dark themes, including selected, unselected, online, offline, and low-paper states.
- Confirm no text is below 12px, no clipping or overflow appears, and the project remains build-clean.
