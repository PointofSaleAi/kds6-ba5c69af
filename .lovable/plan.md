# KDS UI/UX Tracker Population Plan

## Goal
Populate the attached template `POSAI - Kitchen Display System (KDS) (UI UX) Ver. 1.0 (p) 17 June 26 in (1).xlsx` with rows describing the current Lovable KDS, one module at a time, and deliver an updated `.xlsx` after each module.

## Confirmed preferences
- **Deliverable:** Updated `.xlsx` file (template preserved, rows appended).
- **Cadence:** One module per message (you send screenshots, I draft rows).
- **Granularity:** One row per Sub-Sub Module (section). Each screen becomes a small set of section-level rows, not per-button rows.
- **Vertical columns:** `✓` / blank (no "Yes/No" text).

## Per-module workflow
For every module you send (Home, History, Alerts, Settings, etc.):

1. You upload the old-KDS screenshot(s) for that module.
2. I audit the matching screens in the current codebase (routes, components, state machines, settings dependencies) to ensure parity.
3. I draft rows in this exact column order:
   `Module | Sub Module | Sub-Sub Module | Section Description | Use Case (If) | Edge Cases Considered | Form Fields (If) | Validations (If) | Test Case | Documentation | Settings Dependency (Yes/No) | ALL Verticals | Full Service | QSR | Food Truck | eatOS 5.0 Implemented? | New Requirement | UI Completion (%) | Lovable Status | Old KDS (Before) | New KDS (After) | Lovable Link | Notes / QA / Open Questions`
4. Filling rules:
   - `Old KDS (Before)`: short description of what the screenshot shows.
   - `New KDS (After)`: description of how it works in our Lovable build (with component/route reference).
   - `Lovable Link`: relative route, e.g. `/kds/full`, `/kds/full/settings/display#language`.
   - `Settings Dependency`: `Yes` / `No`.
   - `UI Completion (%)`: 0–100 based on parity.
   - `Lovable Status`: one of `Done`, `In Progress`, `Pending`, `New Requirement`.
   - Verticals: `✓` or blank.
   - Empty fields stay blank (no placeholders).
5. I append the rows into the existing template (header row and formatting preserved) using openpyxl, then run formula recalculation to guarantee zero errors, and hand back the updated `.xlsx`.
6. We repeat for the next module.

## What I need from you next
Send the first module's old-KDS screenshots (you mentioned starting with **Home**). Include any module name / sub-module name you want me to use in column A/B so naming stays consistent across the sheet.

## Technical notes
- Library: `openpyxl` (preserves template styling).
- Source-of-truth for "New KDS (After)" comes from the current repo: `src/pages/MainOrderView.tsx`, `src/pages/Index.tsx`, `src/pages/settings/*`, `src/components/kds/*`, plus project memory rules (terminology, lifecycle states, dock layout, etc.).
- Output file naming: `POSAI - Kitchen Display System (KDS) (UI UX) Ver. 1.0 - <Module>.xlsx` per delivery, with the previous module's rows retained so the file keeps growing into the final master sheet.
