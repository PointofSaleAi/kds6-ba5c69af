**Core issue**
- The ticket card design is driven by the route prop, `cardVariant`, but the Settings screen saves the chosen layout separately in `localStorage` as `kds-tickets-route`.
- History, Seen, and Unseen are not separate routes. They are internal tabs inside the already-mounted `MainOrderView`, so they keep using the old `cardVariant` from the current URL instead of the layout selected in Settings.
- There is also a naming mismatch: the Settings preview and route mapping are offset, for example `v3` maps to `OrderCardV2`, while `/kds/v3` also maps to `cardVariant="v2"`. This makes it easy for different screens to render different cards.

**Plan**
1. Add one central helper for ticket layout mapping.
   - Convert the saved Settings route key, `Default`, `v1`, `v2`, `v3`, `v4`, `v5`, `v6`, into the actual card variant used by the app.
   - Use this same helper everywhere instead of duplicating the offset mapping.

2. Make `MainOrderView` resolve the effective card variant from the saved Settings choice.
   - If the user selected a ticket layout in Settings, `MainOrderView` will use that selected layout for Home, History, Seen, and Unseen.
   - This removes the dependency on the initial URL prop after the app is already mounted.

3. Update `renderOrderCard` to use the effective variant.
   - Replace checks against `cardVariant` with the resolved effective variant.
   - This ensures History, Seen, Unseen, and Home all render the same ticket card component.

4. Update all grid width rules to use the same effective variant.
   - History and Home currently adjust columns for certain variants. Those rules should use the resolved selected layout too.
   - Seen and Unseen will keep their screen-specific wrappers, but their actual ticket card will match the selected layout.

5. Fix Settings preview to use the same central mapping.
   - The preview card shown in Settings will render the exact same component that Home, History, Seen, and Unseen will render.
   - This prevents the preview from showing one layout while the board renders another.

6. Validate the fix.
   - Select a non-default layout in Settings.
   - Check Home, History, Seen, and Unseen render the same ticket design.
   - Verify layout-specific grid sizing still behaves correctly.