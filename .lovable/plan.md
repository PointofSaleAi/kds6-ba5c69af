# Maya AI Automation — 60s product film

A 60-second, dark full-bleed showcase of every Maya AI capability across the platform, narrated with voiceover. Visual language follows your eatOS reference (reference A): near-black product UI shown edge to edge, AI panels sliding in over it, violet/magenta sparkle accents on every AI moment — executed at the craft level of the Adobe reference (reference B): one consistent motion system, avatar-style touch cursor, spring entrances, no random transitions.

## Reference analysis (done)

**A — eatOS/Maya, 1280x720, 24fps, 10s, with audio.** Neon ribbon + wireframe-star logo bumper resolving to the eatOS mark, then dense product beats: dashboard with AI-recommendations rail, Maya chat (violet user bubble, dark AI reply, quick-reply chips), Real-Time MenuSync with 86'd Item Frequency chart, active suggestions tagged Staffing/Menu/Labor/Finance with Yes/No actions, Channels Sync, closing dashboard. Visible cursor, cross-dissolves, 4-point sparkle glyphs. Too rushed and too small to read — fixed in ours by 1080p framing and longer beats.

**B — Adobe Acrobat AI, 1920x1120, 24fps, 10.5s, silent.** Pastel gradient stage, floating rounded windows, avatar-attached cursor driving every action, typewriter text entry, magenta sparkle bursts, springy scale-ins, one clear action per beat. Craft benchmark for motion discipline.

## What the finished video looks like

- 1920x1080, 30fps, ~60s, H.264, delivered to your documents folder.
- Opens on your Maya AI logo animation (your supplied clip), fading into the dark stage.
- Dark full-bleed product screens (`#05060C` / `#0D0D1A` stage) with AI panels, chat bubbles and recommendation cards sliding over them.
- Brand accents: Maya violet `#7C3AED`, magenta sparkle glyphs at each AI beat, teal `#16A085` for positive/accepted states.
- Touch-tap effect instead of a mouse pointer (reuses the tour touch layer already built in `remotion/src/tour/`).
- Montserrat throughout; minimal on-screen keyword labels only, since narration carries the story.
- Voiceover generated from your script, plus a subtle music bed under it.

## Scene structure (60s, adjustable once assets land)

1. 0-5s — Maya logo animation → tagline card
2. 5-13s — Maya assistant chat: ask in plain language, Maya acts
3. 13-21s — AI recommendations rail: staffing, menu, labor, finance suggestions with accept/dismiss
4. 21-29s — 86 / stock intelligence: predicted sell-outs, one-tap 86
5. 29-37s — Real-Time MenuSync across channels
6. 37-45s — KDS side: notification summaries, prep-time and pacing intelligence
7. 45-54s — Reporting and insights: dashboard metrics narrated
8. 54-60s — Closing logo lockup + tagline

## Assets needed from you

- Maya AI logo animation clip (mp4/mov, transparent or dark background)
- Screen captures or stills of each capability, at the highest resolution you have
- The narration script (or the copy points, and I'll draft the script for approval)
- Optional: preferred voice character (warm/confident/neutral) and music track

## Technical approach

- Built in the existing `remotion/` project as a new composition `maya-ai` under `remotion/src/maya/`, with one file per scene in `maya/scenes/` and shared layers (`Stage`, `TouchLayer`, `SparkleLayer`, `KeywordLabel`) in `maya/components/`.
- All motion is frame-based (`useCurrentFrame()` + `interpolate()`/`spring()`); scenes wired with `TransitionSeries` using two transition types only.
- Supplied screens are staged as `Img` layers inside transform wrappers; supplied logo clip played via `OffthreadVideo` or pre-extracted frames if the compositor objects (as happened on the KDS tour).
- Voiceover generated via the Lovable AI TTS endpoint from the approved script, timed to the scene grid, then muxed with the music bed with ffmpeg after the silent render (the sandbox renderer must run muted).
- Rendered headless via a `scripts/render-maya.mjs` script to `/mnt/documents/maya-ai-automation.mp4`, with frame spot-checks before delivery.
- No changes to the KDS application code.

## Timing

Nothing is built until you send the assets and script — this plan is the agreed direction to start from.
