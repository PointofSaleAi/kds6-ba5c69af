# Fix Maya AI drawer on the Glass ticket screen

## Problem
On the Glass ticket screen, tapping the Maya icon in the header (or the footer AI button) flips an "open" flag, but the AI drawer itself is never placed on that screen, so nothing appears. Other ticket screens include the drawer and work.

## Fix
- Add the same Maya AI drawer used on the other ticket screens to the Glass screen, opened by the header Maya icon and the footer AI button, closed by its own close control.
- Works on desktop, tablet and phone, in light and dark themes, with the left rail and footer staying visible.

## Technical details
- `src/pages/KdsGlassPage.tsx`: import `AIAssistantPanel` from `@/components/kds/AIAssistantPanel` and render `<AIAssistantPanel open={aiAssistantOpen} onClose={() => setAiAssistantOpen(false)} />` inside `GlassShell`, mirroring `MainOrderView.tsx`.
- Verify with Playwright on /kds/glass at 1280, 1024 and 390 in both themes: tap Maya icon → drawer opens; close → drawer closes.
