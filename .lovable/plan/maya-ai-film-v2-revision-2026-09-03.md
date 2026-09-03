# Maya AI film — v2 revision

Same 9-scene film and voiceover, revised per your notes: pink/white text only, static text, real screen recordings instead of stills, the "e" logo lockup at the end, and a product-suite montage before the close. One deliverable: 720p with voiceover.

## Text rules (applies to every scene)

- Colour: white `#FFFFFF` for the main line, pink `#FF3D8B` for the accent line and eyebrow. No blue, violet, teal or cream text anywhere.
- No horizontal motion. Text fades and holds in place — entrances become opacity-only (plus a very small vertical settle at most), never a left/right slide or wipe-in.
- Always fully readable: text sits in a fixed safe-area position with a soft dark scrim behind it so it never fights the footage, and it stays on screen for the whole voiceover line rather than exiting early.
- Type stays Montserrat 900, large and bold, one short line plus one accent line.

## Footage swaps (video instead of screenshots)

| Scene | New source |
| --- | --- |
| 2 — Demand & labour | `eatOS-dashboard_demo` clip |
| 3 — Co-pilot | `dashboard.mp4` clip |
| 4 — Ordering | `KDS.mp4` clip |
| 5 — Reports | `eatOS-dashboard_demo` (different segment) |
| 6 — Upselling | `KDS.mp4` (different segment) |
| 7 — Menu management | `eatOS-point_of_sale_demo` clip |
| 8 — Settings | keeps the AI Instructions / menu-chat screenshot (no recording supplied for this beat) |

Each clip plays inside the existing framed window on the dark stage, trimmed to the scene length, with only a gentle scale hold — no side-to-side drift.

## Scene 8.5 — product suite montage (new, second-to-last)

A grid of the six applications playing simultaneously in small framed tiles, labelled in pink/white: POS, KDS, Dashboard, CFD, Kiosk, InventoryOS — using your six demo recordings. Tiles fade in in sequence, then the montage holds while the closing line lands.

## Scene 9 — close

Screens recede, then the attached white "e" logo appears centred with the line "Maya. Running the restaurant, so you can run the room." in white with the pink accent. The old "eatOS" bold wordmark and "Maya AI Automation" tagline are removed.

## Deliverable

One file only: `maya-ai-automation-v2-720p.mp4` — 1280x720, H.264, with the existing narration remixed to the new scene timings. The previous 1080p and silent files stay as they are; no new versions.

## Technical notes

- Long clips are transcoded to trimmed, 720p-friendly intermediates in `/tmp/maya/public/clips/` and played with Remotion's `<OffthreadVideo>`; the six montage clips are downscaled to tile size first so six simultaneous decodes stay within the sandbox render budget.
- `theme.ts` gains pink/white text tokens; `Headline` drops its clip-path wipe in favour of an opacity fade and gains the scrim. Scene durations shift to fit the montage, so `SCENES`/`TOTAL` and the audio mix offsets are recalculated from the measured voiceover lengths.
- Render via `remotion/scripts/render-maya.mjs` at 720p, then mux the narration with ffmpeg. Frame spot-checks across all scenes (including each montage tile) before delivery.
- No changes to the KDS application code.
