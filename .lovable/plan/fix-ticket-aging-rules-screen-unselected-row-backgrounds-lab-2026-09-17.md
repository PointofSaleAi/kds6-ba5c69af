# Fix Ticket Aging Rules screen — unselected row backgrounds & label legibility

## What's wrong

On the Ticket Aging Rules screen (Settings > Display > Ticket Aging Rules):

1. **Unselected status rule rows (Medium, Delay, Overtime)** have no base background — they only get `hover:bg-muted/40`. Against the transparent panel over the light-grey screen background, the unselected rows blend in and look flat/empty instead of reading as distinct selectable cards like the selected row does.

2. **Field labels** — "Status Rules", "Status name", "Time Range (minutes)", "Color", "Text color", "Live Ticket Preview" — all use `text-text-muted` (light theme: `210 10% 62%`), which is too pale against the light-grey screen background and hard to read. This is the same readability problem we fixed earlier for Settings pill descriptions, where we moved to `text-text-secondary`.

## The fix

### 1. Unselected status rule rows — give them a card background

File: `src/pages/StatusSettings.tsx` — the `DraggableStatusList` row `className` (around line 141).

- Selected rows already use `bg-muted ring-1 ring-ring shadow-sm`.
- Unselected rows currently use only `hover:bg-muted/40`.
- Change unselected rows to `bg-surface-card hover:bg-muted/50` so they read as distinct white cards against the grey screen background in light theme (and dark cards in dark theme), matching the selected row's elevation.
- Keep all other row behaviour (drag, errors, remove button) untouched.

### 2. Field labels — switch from `text-text-muted` to `text-text-secondary`

Change every field label on this screen from `text-text-muted` to `text-text-secondary` so the text is darker/more legible against the screen background, matching the approach used for Settings pill descriptions.

Files and locations:

- `src/pages/StatusSettings.tsx`
  - "Status Rules" header (line ~105)
- `src/components/kds/AgingEditPanel.tsx`
  - "Time Range (minutes)" label (line ~79)
  - "Status name" label (line ~253)
  - "Color" label (line ~268)
  - "Text color" label (line ~303)
  - "Live Ticket Preview" label (line ~326)

No layout, spacing, controls, or behaviour change — only the text color utility on these labels and the background utility on unselected rows.

## Technical notes

- Tokens: `--text-secondary` = `210 10% 45%` (light) / `210 10% 68%` (dark); `--surface-card` = `0 0% 100%` (light) / `228 13% 14%` (dark). Both adapt to dark theme automatically.
- Do not touch `--text-muted` token itself — other screens depend on it.
- Verify light + dark theme, and desktop/tablet/portrait widths, that rows read as distinct cards and labels are clearly legible.
