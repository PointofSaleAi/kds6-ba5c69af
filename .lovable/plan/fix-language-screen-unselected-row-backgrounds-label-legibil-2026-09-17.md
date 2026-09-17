# Fix Language screen — unselected row backgrounds & label legibility

## What's wrong

On the Language screen (Settings > Display > Language), the same two issues that were just fixed on the Ticket Aging Rules screen are present:

1. **Unselected items have no base background.** Language list buttons, display-mode cards, and Region-tab option buttons (date format, time format, temperature, week start) only show a border with no fill. Against the light-grey screen background they blend in and don't read as distinct selectable cards.

2. **Field labels use `text-text-muted`**, which is too pale against the light-grey screen background. All the uppercase section headers ("Language Scope", "Display Mode", "Language Pair", "Select Language", "Preview KDS", "Date Format", "Time Format", "Currency", "Temperature Unit", "Week Start Day") and the request-modal labels ("Language name", "Dialect", "Why do you need it?") are hard to read.

## The fix

### 1. Unselected items — give them a card background

File: `src/components/kds/InlineLanguageSettings.tsx`

Add `bg-surface-card` to every unselected selectable item so it reads as a distinct white card (light theme) / dark card (dark theme), matching the approach used for unselected status-rule rows in `StatusSettings.tsx`.

- **Language list buttons** (line ~347): unselected items currently have `border-border` only. Add `bg-surface-card` to the unselected state.
- **Display mode cards** (Single/Dual, lines ~254–281): add `bg-surface-card` to unselected cards.
- **Region-tab option buttons** (Date Format, Time Format, Temperature, Week Start — lines ~588–688): add `bg-surface-card` to unselected buttons.
- **Request language button** (line ~365): add `bg-surface-card` for consistency.

Selected states keep their existing styling (brand tint, border, etc.).

### 2. Field labels — switch from `text-text-muted` to `text-text-secondary`

Change every uppercase section-header label from `text-text-muted` to `text-text-secondary` so the text is darker and more legible against the screen background, matching the Ticket Aging Rules fix.

Labels to change:
- "Language Scope" (line ~234)
- "Display Mode" (line ~252)
- "Language Pair" (line ~287)
- "Select Language" (line ~327)
- "Preview KDS" (line ~544)
- "View as" (line ~548)
- "Date Format" (line ~586)
- "Time Format" (line ~609)
- "Currency" (line ~632)
- "Temperature Unit" (line ~648)
- "Week Start Day" (line ~671)
- Request modal: "Language name *" (line ~402), "Dialect" (line ~494), "Why do you need it?" (line ~509)
- Request dropdown section headers: "Popular" (line ~442), "More Languages" (line ~463)

Small inline text (descriptions, hints, placeholders, helper notes, native-language subtitles) stays as `text-text-muted` — only the uppercase header labels change.

## Technical notes

- Tokens: `--text-secondary` = `210 10% 45%` (light) / `210 10% 68%` (dark); `--surface-card` = `0 0% 100%` (light) / `228 13% 14%` (dark). Both adapt to dark theme automatically.
- Do not touch `--text-muted` token itself — other screens depend on it.
- No layout, spacing, controls, or behaviour change — only the text color utility on header labels and the background utility on unselected items.
- Verify light + dark theme, and desktop/tablet/portrait widths, that items read as distinct cards and labels are clearly legible.
