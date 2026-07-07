Create a programmatic recipe-video pipeline for all products in the Point of Sale Ai KDS using Remotion, then wire the generated MP4s into the existing recipe modal.

## What we will build

1. A self-contained `remotion/` project inside the repo that renders a short MP4 for each product using the existing recipe data (product name, ingredients, step titles, step images, duration).
2. A batch render script that generates one MP4 per recipe in `src/data/recipe-reference-data.ts` (default, burger, steak, salad, pasta, pizza, fish, chicken) and saves them locally.
3. A Lovable Cloud Storage bucket (e.g., `recipe-videos`) and an upload step that pushes each MP4 to the bucket and returns a public URL.
4. Update the recipe mock data so each recipe’s `video.url` points to its stored MP4.
5. No changes to the `RecipeReferenceModal` player logic are required; it already reads `recipe.video.url` and falls back to a demo only when the URL is empty.

## Visual direction

- Format: 16:9, 1080x1920px vertical is also an option; default 1920x1080 at 30fps.
- Duration: 15-20 seconds per recipe, matching the mock `duration` labels (1:05, 1:24, 1:35, etc.) if desired.
- Look: clean, kitchen-readable text; Montserrat headings; step cards that fade/slide through the existing recipe step images; a persistent bottom bar showing the product name and step progress.
- Animation style: subtle slide/fade transitions between steps, no complex effects so rendering stays fast and stable in the sandbox.

## Technical steps

### 1. Remotion scaffold
- Create `remotion/` directory with `bun init -y`.
- Install: `remotion`, `@remotion/cli`, `@remotion/renderer`, `@remotion/bundler`, `@remotion/compositor-linux-x64-musl`, `@remotion/transitions`, `react`, `react-dom`, `typescript`, `@types/react`.
- Apply the sandbox fix: overwrite the gnu compositor binary with the musl one and symlink system `ffmpeg`/`ffprobe`.
- Add `tsconfig.json` with `jsx: "react-jsx"`, `module: "Preserve"`, `moduleResolution: "bundler"`.

### 2. Composition and scenes
- `src/index.ts`: `registerRoot(RemotionRoot)`.
- `src/Root.tsx`: register a single composition (`id: "recipe"`) that accepts `productName`, `steps`, `ingredients`, `durationSeconds`, and `imageUrl` as props.
- `src/MainVideo.tsx`: persistent background + `<TransitionSeries>` sequencing one scene per recipe step.
- `src/scenes/RecipeStepScene.tsx`: full-screen step image with overlaid step number, title, and one-line instruction, fading in/out with frame-based `interpolate()`.
- `src/components/RecipeHeader.tsx`: top-left product name and bottom progress bar.

### 3. Batch render + upload
- `remotion/scripts/render-all.mjs`: iterate over every recipe from `src/data/recipe-reference-data.ts`, call `renderMedia()` for each, and write to `remotion/output/<product>.mp4`.
- Create a Lovable Cloud Storage bucket `recipe-videos` via the storage tool (public).
- `remotion/scripts/upload-to-cloud.mjs` (or a small Node script using the Supabase client): upload each MP4 and update a JSON map of product -> public URL.
- Back-fill the `video.url` field in `src/data/recipe-reference-data.ts` for each recipe.

### 4. Validation
- Open the recipe modal in the KDS preview and tap "Watch video" for a product; confirm the generated MP4 loads instead of the demo.
- Spot-check a few frames with `bunx remotion still` before the full render.

## Cost / credit impact

- No AI generation credits are consumed because the video is built from existing images and text in code (Remotion).
- Remotion rendering uses sandbox compute/build time during the render step, which falls under normal build-mode usage.
- Lovable Cloud Storage charges for stored data and outbound transfer separately from subscription credits. Each ~15-second MP4 at 1080p is roughly 2-5 MB, so total storage for 8 recipes is small (under 50 MB).
- If you prefer to avoid storage costs entirely, the MP4s can be kept locally in the repo under `public/videos/` and served as static assets, but this bloats the bundle and is not recommended for production.

## Out of scope

- AI-generated video from prompts (e.g., a model generating a real cooking video) is intentionally excluded; that would consume AI credits and is a different feature.
- Real-time video generation from user-uploaded recipes is not included; this plan covers the existing mock catalog only.

## Deliverables

- `remotion/` project with source files, scenes, and components.
- `remotion/scripts/render-all.mjs` and `remotion/scripts/upload-to-cloud.mjs`.
- Updated `src/data/recipe-reference-data.ts` with working video URLs.
- A generated MP4 for each product in the mock catalog.

Approve this plan and I will implement it in build mode.