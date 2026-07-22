Plan:

1. Update the settings side panel used by the visible KDS settings overlay.
   - Current confirmed width in `MainOrderView` is `182px`.
   - Increase it by 15% to `209px`.

2. Keep the standalone settings layout aligned.
   - Current confirmed landscape width in `SettingsLayout` is `171px`.
   - Increase it by 15% to `197px`.
   - Current portrait width is `160px`.
   - Increase it by 15% to `184px`.

3. Verify the restaurant profile area can show more of `Bollywood Bites`.
   - Check the settings route after the width update.
   - Confirm the selected left panel is wider, not the wrong sidebar.

Technical details:
- Files to change after approval:
  - `src/pages/MainOrderView.tsx`
  - `src/pages/SettingsLayout.tsx`
- No changes to settings content, navigation labels, or the main KDS left rail.