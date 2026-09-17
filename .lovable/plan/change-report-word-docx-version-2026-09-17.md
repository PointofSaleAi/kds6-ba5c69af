# Change Report — Word (DOCX) Version

## What you get
A downloadable Word document of today's change report (same content as the Markdown report already delivered), with every change tagged by its exact screen, view or modal.

## Structure (mirrors the delivered report)
1. **UI/UX & Typography Fixes** — Ticket Aging Rules, Language, AI Integration, Hardware + KOT/Label/Sound/Connection modals
2. **Spacing & Layout Adjustments** — AI Integration chip gaps, 8px Settings gutters, Ticket Layout 50/50 split + dropdown arrow, Glass Grid/Stagger 4-column rows, guided split editor
3. **Localization & Multi-language Infrastructure** — ~700 phrases in es/ar/zh/vi, RTL, per-area screen coverage, Language preview fix, Korean/Japanese gap noted
4. **Screen-Specific Fixes** — Notifications drawer, Settings shell, 86 drawer/badge, KDS footer, Glass previews, PIN pad, Glass ticket lifecycle/icons/badges
5. **Default System Configuration** — Glass View default for preview + published app
6. **Verification Summary** — typecheck/build clean; 390/1024/1280/1494 px, light + dark

## Formatting
- Title page header block (product name, date, scope)
- Numbered section headings, screen names in bold at the start of each bullet
- Proper Word bullet lists (not text symbols), Arial, US Letter, 1-inch margins

## Technical details
- Generate with docx-js in /tmp, validate, save to /mnt/documents/kds-change-report-2026-09-17.docx
- No app code changes; the Markdown version stays as-is
