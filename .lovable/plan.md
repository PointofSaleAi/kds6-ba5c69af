
Goal

- Make the Language name dropdown in the Request a Language popup render outside the popup boundary so it can extend beyond the modal and stay fully usable.
- Keep the popup UI, CTA, spacing, and all other fields unchanged.

What I found

- On the live `/kds/full` settings flow, this screen is powered by `src/components/kds/InlineLanguageSettings.tsx` through `SettingsPanel`.
- The current Language name menu is a custom dropdown inside the Request a Language popup subtree. Even with fixed positioning, it still behaves visually like part of the popup stack, so it can end up competing with the footer CTA area.
- There is also a separate `src/pages/LanguageSettings.tsx`, but it is not the active path for this screen, so I would leave it untouched.

Implementation plan

1. Keep the Request a Language popup exactly as it is and only change how the Language name dropdown is rendered.
2. Move the dropdown list to a true portal layer attached to `document.body`, local to `InlineLanguageSettings.tsx`.
3. Anchor that portaled dropdown to the search field using `getBoundingClientRect()` so it matches the field width and horizontal position.
4. Make the menu prefer opening below the field, outside the popup boundary, and flip above only if the viewport does not have enough space.
5. Raise the dropdown z-index above the popup and footer CTA so no part of the list is hidden.
6. Reposition the dropdown while open on resize and scroll so it stays aligned with the input.
7. Tighten outside-click handling so the trigger and the portaled menu are treated as one interactive area, while overlay click, X close, option select, and submit keep working as they do now.
8. Do not change any labels, button styling, modal sizing, or other settings UI.

Technical details

- Primary file: `src/components/kds/InlineLanguageSettings.tsx`
- Likely changes:
  - add a portal render path for the dropdown
  - store measured dropdown position in local state
  - add refs for trigger, popup body, and dropdown layer
  - update open/close and outside-click logic for the portaled menu
- No shared UI primitive changes are required.
- No changes should be made to unrelated screens or the legacy `LanguageSettings` page.

Verification

- Open Settings > Language & Region > Language > Request a language.
- Open the Language name dropdown and confirm it extends beyond the popup instead of opening inside it.
- Confirm the full list is visible and scrollable, with no part hidden behind Submit Request.
- Search/filter the list, select a language, and verify the value fills the field correctly.
- Select Chinese or Portuguese and confirm Region / Dialect still appears.
- Test X, overlay click, and submit toast to confirm the popup behavior still works end to end.
