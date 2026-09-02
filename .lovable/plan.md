# KDS UI Tour — animated 30s video from the uploaded recording

Turn the uploaded demo recording into a polished ~30 second product tour: the mouse cursor is replaced by a soft touch/tap effect, motion is smoothed with slow zooms and clean cuts, and short captions label each step. Output: a 1920x1080 MP4 delivered to your documents folder.

## What the finished video looks like

- Source footage: your recording, retimed and trimmed to the strongest ~30 seconds.
- No mouse pointer anywhere. Every pointer position becomes a soft translucent touch dot; every click becomes an expanding tap ripple with a brief scale pulse.
- Slow cinematic push-ins on the area being touched (ticket card, footer control, notification row) so the detail is readable at 1080p, easing back out between beats.
- Captions: one short line per scene, bottom-left, in Montserrat, appearing with a quick fade-and-rise and holding for the whole beat.
- Title card at the start ("Point of Sale Ai — Kitchen Display System") and a closing card, both built from the brand palette (`#212121`, `#1A1A2E`, page `#F0F2F5`).
- Silent, per your choice — captions carry the story.

## Scene list (drawn from the recording)

1. Sign in — "Sign in to your station" (brief, ~2s)
2. Live ticket board — "Every ticket, one glance"
3. Tap an item's eye icon — "Acknowledge items as you see them"
4. Item marked Served with prep timer — "Per-item prep timers"
5. Ticket button progresses Seen → Preparing → Served — "Tickets follow the kitchen, not the clock"
6. Notifications panel with AI summary — "AI tells you what needs attention"
7. 86 an item from a low-stock alert — "86 an item in one tap"
8. Closing card

I'll adjust exact beats to the clearest moments in the footage; if you want a different order or extra steps, say so and I'll re-cut.

## How it gets built (technical)

1. **Cursor tracking.** Decode the recording frame by frame and locate the pointer each frame with normalized cross-correlation against pointer templates cropped from the footage (arrow + hand variants), using a local search window seeded from the previous frame and a full-frame fallback when confidence drops. Output a per-frame track (`x`, `y`, confidence) as JSON.
2. **Click detection.** Mark taps where the pointer dwells (low velocity over consecutive frames) and the pixels under it change in the following frames — these become ripple timestamps. I'll verify each detected tap against the frame it fires on before committing it.
3. **Pointer removal.** In the composite, cover the tracked pointer with a small patch sampled/blurred from its surroundings, then draw the touch dot on top, so no arrow is visible.
4. **Composite in Remotion** (`remotion/` already exists in the project, so this reuses that setup): the source MP4 as the base layer inside a scaled/translated wrapper for the zooms, plus overlay layers for touch dot, ripples, captions, title/closing cards. All motion via `useCurrentFrame()` + `interpolate()`/`spring()`; scene sequencing via `TransitionSeries` with short fades.
5. **Render** headless to `/mnt/documents/kds-ui-tour.mp4` (H.264, 30fps, 1920x1080), then spot-check frames and report the file.

New files live under `remotion/src/` (a `TourVideo.tsx` composition plus `scenes/` and `components/` for the touch and caption layers) with the tracking script under `remotion/scripts/`. No changes to the KDS app itself.

## Fallback

If automatic click detection proves unreliable on any beat, I'll pin those tap moments manually from frame inspection rather than ship a mistimed ripple.
