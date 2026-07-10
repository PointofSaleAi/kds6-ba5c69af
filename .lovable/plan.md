## Goal
Replace the placeholder "Watch video" content with a real recipe video fetched from YouTube based on the dish name.

## Approach
Use YouTube Data API v3 `search.list` server-side (edge function) with query `"<dish name> recipe"`, then embed the top result in an iframe in the KDS recipe modal and the `/recipe/:name` page.

## Steps

1. **Secret**
   - Request `YOUTUBE_API_KEY` via `add_secret` (user obtains from Google Cloud Console → APIs & Services → YouTube Data API v3).

2. **Edge function** `supabase/functions/youtube-recipe-search/index.ts`
   - Input: `{ query: string }` (validated with Zod, max 200 chars).
   - Call: `GET https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=1&safeSearch=strict&q=<query>%20recipe&key=<KEY>`.
   - Return: `{ videoId, title, channelTitle, thumbnail }` or `{ error, status, details }`.
   - Standard CORS headers, surface provider errors with status + body.

3. **Client hook** `src/hooks/useRecipeVideo.ts`
   - `useRecipeVideo(dishName)` calls `supabase.functions.invoke('youtube-recipe-search', { body: { query: dishName } })`.
   - Simple in-memory cache keyed by dish name to avoid repeat calls in a session.
   - Returns `{ videoId, loading, error }`.

4. **KDS recipe modal** `src/components/kds/RecipeReferenceModal.tsx`
   - When "Watch video" is opened, call the hook with the current dish name.
   - Render `<iframe src="https://www.youtube.com/embed/{videoId}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen>` in the existing video slot.
   - Loading: spinner. Error / no result: fallback message "No video found for this dish."

5. **Recipe detail page** `src/pages/RecipeDetailPage.tsx`
   - Same hook + iframe swap in the existing video player region.
   - Keep current poster/play button; on click, render the iframe.

## Technical details
- YouTube Data API free quota: 10,000 units/day; `search.list` costs 100 units → ~100 lookups/day. The per-dish cache keeps usage low.
- No frontend exposure of the API key. Only the edge function reads `YOUTUBE_API_KEY`.
- `videoEmbeddable=true` prevents picking videos that block iframes.
- No schema changes, no changes to the KDS ticket UI or lifecycle logic.

## Out of scope
- Persisting picked videos per dish (can be added later with a `recipes.video_id` column).
- Manual override / curation UI.
