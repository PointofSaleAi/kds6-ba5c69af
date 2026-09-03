# Maya AI Automation — 9-scene narrated film

A dark, full-bleed product film for Maya AI following your eatOS reference: near-black product UI edge to edge, AI panels and chat sliding in over it, violet/magenta sparkle accents on every AI moment — with the motion discipline of the Adobe reference (one entrance style, one transition pair, spring timing, avatar-style touch cursor instead of a mouse). Bold, large, high-contrast on-screen text per scene. Delivered as MP4 for download.

## Assets received

- `e_maya.mp4` — Maya logo animation, 1280x720, 24fps, 3.8s, with audio. Opens the film (upscaled and letterbox-matched to the dark stage).
- 8 product screenshots: AI Instructions settings, Menu settings with AI chat panel, Real-Time MenuSync + Recommendations, eatOS dashboard rail, All AI recommendations panel, Ask Maya staffing conversation (x2), KDS Unseen board with the Maya panel.
- Reference films analysed: eatOS/Maya (dark full-bleed, sparkle accents, AI panels) and Adobe Acrobat AI (motion craft benchmark).

Screenshots are 1487x783-ish, below 1080p, so each is staged as a framed device window on the dark stage (never stretched full-bleed) with subtle push-in on the region the narration is describing — this keeps text crisp.

## Look and feel

- 1920x1080, 30fps, H.264, ~60-70s (final length set by the narration).
- Stage: near-black `#05060C` to `#0D0D1A` gradient with a faint violet bloom behind the active window.
- Accents: Maya violet `#7C3AED`, magenta sparkle glyphs at each AI beat, teal `#16A085` for positive/accepted states, blue `#2980B9` for the Scene 1 title.
- Type: Montserrat, weight 900, 90-120px headline text — bold, clear, high contrast, one short line per scene, safe-area aligned.
- Touch-tap effect (soft dot + ripple) drives every interaction; no mouse cursor anywhere.
- Voiceover from your script, generated as narration audio, plus a subtle music bed, muxed after render.

## Scene list (from your script)

1. **Open** — Maya logo clip, resolving into bold title: "Meet Maya" / "The first AI that runs your restaurant." Blue + white on black.
   VO: Meet Maya. The first AI that runs your restaurant.
2. **Demand & labour** — dashboard graph beat (`Screenshot ...3.34.15`), then the Ask Maya staffing conversation auto-filling the shift.
   VO: She predicts demand, optimises labour and personalises service. All without you lifting a finger.
3. **Co-pilot framing** — Ask Maya panel, natural-language query typed on screen (typewriter), answer + chart revealed.
   VO: Maya isn't guessing. She knows your data, and she explains what's happening.
4. **Ordering** — KDS Unseen board (`Screenshot ...4.02.23`): order lands on the board, Maya panel suggests an upsell. "40% faster" stat animates in.
   VO: She captures orders by voice or text, routes them straight to the kitchen and suggests upsells in real time. Forty per cent faster than manual entry.
5. **Reports** — MenuSync / recommendations dashboard opening full screen, chart bars building in.
   VO: Every day, Maya builds your reports for you. Saved, visual and ready when you are.
6. **Upselling** — recommendation cards stacking beside the live ticket, tags (Menu / Staffing / Finance) popping in sequence.
   VO: She manages upselling on her own, tips and reports included, learning what works and doing more of it.
7. **Menu management** — Menu settings screen; rows populate in a rapid stagger to read as bulk upload.
   VO: Updating your menu takes minutes, not hours, with AI-driven bulk upload.
8. **Settings** — AI Instructions / Menu settings with the AI chat panel; a conversational prompt changes the setting.
   VO: And when you need to change something, just tell her. Maya manages your settings, so you don't have to dig for them.
9. **Close** — screens receding into the dark stage, then the eatOS logo lockup with "Maya AI Automation".
   VO: Maya. Running the restaurant, so you can run the room.

Scenes 2, 3, 5, 6, 7 reuse the screenshots you sent with different framings and animated overlays (typed queries, building charts, staggered rows, sparkle bursts) since there is no live footage for those beats. If you can capture short recordings of any of them, I'll swap the real footage in.

## Deliverables

- `maya-ai-automation.mp4` — final narrated film, 1920x1080.
- A silent version and a 720p lighter version alongside it, so you have download options.

## Technical approach

- New Remotion composition `maya-ai` in the existing `remotion/` project, under `remotion/src/maya/` — one file per scene in `maya/scenes/`, shared layers (`Stage`, `DeviceWindow`, `TouchLayer`, `SparkleLayer`, `Headline`, `TypedQuery`) in `maya/components/`.
- All motion frame-based (`useCurrentFrame()` + `interpolate()`/`spring()`); scenes sequenced with `TransitionSeries` using only a fade and a soft push.
- Screenshots and the logo clip served from a public dir; the logo clip pre-extracted to frames if the sandbox compositor rejects inline video (as happened on the KDS tour).
- Narration generated per scene via the Lovable AI text-to-speech endpoint from your script, durations measured with ffprobe, then the scene grid timed to the actual audio lengths so text and VO stay in sync. Audio muxed onto the silent render with ffmpeg.
- Rendered headless via `remotion/scripts/render-maya.mjs` to `/mnt/documents/`, with frame spot-checks across every scene before delivery.
- No changes to the KDS application code.
