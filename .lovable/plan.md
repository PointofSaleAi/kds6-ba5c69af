# Fix Language screen footer text visibility

## Problem
On the Language settings screen, the line under the preview — `Showing English (US) only on the KDS.` — is hard to read. It currently uses `text-[10px] text-text-muted` (10px, below the 12px minimum, in the palest muted tone).

## Fix
In `src/components/kds/InlineLanguageSettings.tsx` (line ~573), change the preview footer text:
- `text-[10px]` → `text-xs` (12px, meets the minimum)
- `text-text-muted` → `text-text-secondary` (darker, more legible)

This matches the fix already applied to the "Preview-only…" info line directly above it (line 565, `text-[12px] text-text-secondary`).

## Verify
- Check light + dark theme on desktop, tablet, and mobile.
- Confirm the footer text is clearly readable and no other element is affected.
