# Glass light/dark theming for all Ticket Studio boards & layouts

Today only the Glass View board is fully theme-aware: it reads `LIGHT_SKIN` / `DARK_SKIN` from `glass-theme.tsx` and accepts a `themeOverride`. Every other board (Calm Board, Focus Lane, Distance View, Progressive Ticket, Safety First, Timeline Flow, Adaptive Density, Dark Command Center) and every ticket layout card (Hero number, Classic Hero, Section list, Standard layout, Priority View, Detailed grid, Clean sections, Itemized cards) uses hardcoded light hex values, so dark theme leaves white cards, dark-on-dark text, and light chrome.

Goal: the same iOS-glossy light/dark skin used on `/kds/glass` applies everywhere — Studio previews, the Studio board thumbnails, and the live ticket layouts.

## What will change

**1. Shared skin, one source of truth**
Promote the glass skin to the app-wide ticket skin: keep `LIGHT_SKIN` / `DARK_SKIN` in `glass-theme.tsx` as the canonical tokens, and expose a resolver that falls back to the app theme when no override is passed. Add the few tokens the non-glass boards need but glass doesn't have yet (order-type header surface, aging body wash, modifier blue / removal red / allergen red, note amber, timer ring track, footer/bar surface) with light and dark values in the same glossy language.

**2. Studio previews (`TicketStudioSkeleton.tsx`)**
- Thread the existing `theme` prop past Glass View into every branch: `BoardTicketPreview`, `FocusLaneBoard`, and the virtual-screen chrome.
- The virtual KDS screen (page background, `KDSSidebar`, `ItemSummaryPanel`, `BottomStatusBar`) currently renders light regardless of the selected theme — it will render in the selected skin, including the side-by-side compare mode where each pane can differ.

**3. Board ticket cards (`BoardTicketPreview.tsx`)**
Replace hardcoded card/text/chip colors in all board renderers with skin tokens: card surface + sheen + border, order-type header pill, allergen and note chips, modifier/removal colors, action-icon rail (unseen/preparing/ready/served), progress ring track, and the primary footer button. Boards designed dark (Dark Command Center, Safety First) keep their high-contrast identity in dark mode and get a legible light-mode equivalent instead of dark-on-light.

**4. Board thumbnails (`BoardThumb` SVGs)**
The mini SVG previews will read from the skin rather than fixed `#FFFFFF` / `#F0F2F5` / `#0D0D1A`, so thumbnails match the active theme.

**5. Live ticket layouts**
Apply the same skin to the layout cards used on the real ticket screens so a layout looks identical in Studio and in production: `OrderCard.tsx` and `variants/OrderCardV1`–`V5` (plus `RecipeModalV1`). Remaining hardcoded values there — `#FFFFFF` card, `#E5E7EB` hairlines, `#F3F4F6` chips, `#27AE60` served dot, `#6C7A89` icon grey, `bg-black/[0.02]` hovers — become tokens. Behaviour, spacing, and lifecycle logic stay untouched.

## Verification

Check each board and each layout in Studio under light and dark (including compare mode), then the live `/kds/*` layout routes in both themes, looking for: no white-on-white or dark-on-dark text, allergen chips still the loudest element, and touch targets/sizing unchanged.

## Technical notes

- Non-glass boards use Tailwind classes today, glass uses inline styles. To avoid a large rewrite, the boards will switch to CSS custom properties set once on the board root from the resolved skin (`--tkt-card`, `--tkt-text`, `--tkt-hairline`, ...), with Tailwind arbitrary values (`bg-[var(--tkt-card)]`) at the call sites. This keeps class-based markup while making a single override point per preview pane.
- Custom properties also make the Studio's per-pane theme override work without prop-drilling into every leaf.
- No changes to `use-theme.tsx` behaviour, no new dependencies, no backend work.
