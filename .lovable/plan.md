I found why it still breaks in portrait. The previous change used `max-@[280px]/pill:*` container-query classes, but the installed Tailwind container-query plugin only supports min-width variants like `@[280px]/pill:*`. Because of that, the narrow-width rules that should move the controls to the next line are not being generated.

Plan:

1. Update only the Display settings row component behavior
   - Edit `src/components/settings/SettingsPill.tsx`.
   - Make the narrow layout the default layout.
   - At narrow panel widths, each pill will render as:

```text
[ icon ]  Label text
          control / value / segmented toggle
```

2. Preserve desktop and landscape layout
   - Use supported min-width container queries to restore the existing horizontal layout once the pill has enough room.
   - This keeps desktop and landscape unchanged:

```text
[ icon ]  Label text                         control / value / chevron
```

3. Prevent labels from disappearing
   - Give the icon + label row a real width in narrow mode.
   - Allow labels to wrap instead of shrinking to zero width.
   - Keep the control on the next line, indented to align under the label.

4. Scope the fix tightly
   - Do not change the left settings sidebar.
   - Do not change KDS home, footer, bottom bar, colors, content, or desktop layout.
   - Do not redesign controls.
   - No data, API, or routing changes.

5. Verify after implementation
   - Check the Display settings route in portrait at 768px wide.
   - Check the narrow right-panel behavior against the 180px minimum target.
   - Confirm labels like `Text size`, `Ticket layout`, `Ticket Identifier`, and `Mode Switcher` stay visible and controls drop below when needed.
   - Confirm landscape and desktop still use the original one-line layout.