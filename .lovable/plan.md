## Goal
Port the real-LLM chat behavior from the Mobile Point of Sale project's AI panels into the KDS `AIAssistantPanel`, replacing the hardcoded `generateResponse()` canned strings with a live, streaming Kitchen Assistant powered by Lovable AI Gateway.

Out of scope (per your selection): settings tool-calling, ticket-context awareness, real mic transcription. The mic icon stays as a visual stub.

## What changes

### 1. Enable Lovable Cloud
Provision Cloud + `LOVABLE_API_KEY` for this KDS project so the edge function can call the AI Gateway. No tables or auth needed.

### 2. New edge function: `kds-ai-chat`
`supabase/functions/kds-ai-chat/index.ts`
- Streams `text/event-stream` responses from `google/gemini-3-flash-preview` via Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`, `Lovable-API-Key` header).
- CORS enabled, `verify_jwt = false` (public read-only assistant, no PII).
- System prompt scoped to the KDS Kitchen Assistant role: helps cooks understand tickets, allergens, course timing, KDS settings, terminology ("Point of Sale", "Point of Sale Ai", "Served/Queued/Station"), and the SEEN → IN PROGRESS → SERVED flow. Refuses to invent ticket data.
- Handles 429 (rate limited) and 402 (credits exhausted) by returning a JSON error the client surfaces as a chat bubble.
- Accepts `{ messages: {role, content}[] }` and forwards the full conversation history every turn.

### 3. Rewire `src/components/kds/AIAssistantPanel.tsx`
- Delete the `generateResponse()` mock and the `QUICK_ACTIONS` / `TRY_PROMPTS` "Applied: …" green action badges (no longer meaningful without tool calls). Keep the suggestion chips but make them seed prompts that hit the real model.
- Replace `setTimeout(..., 600)` simulation with a streaming `fetch` to the edge function. Append assistant tokens to the last message as they arrive (SSE parse loop).
- Keep thinking indicator while `status === 'submitted'` (before first token).
- Render assistant text with `react-markdown` (`bun add react-markdown`) so the model can format lists, bold allergens, etc.
- Preserve the existing visual design: navy `#1A1A2E` header, animated "e" logo, mic stub, input pill, dock-aware insets, light/dark theme.
- Surface gateway errors (429/402/network) as an inline assistant bubble with a clear message.

### 4. No data persistence
Conversation lives only in component state for this session (matches current behavior). No threads, no DB.

## Technical notes
- Edge function uses `npm:` Deno imports for `ai`/`@ai-sdk/openai-compatible` is not required — a direct OpenAI-compatible `fetch` to `/v1/chat/completions` with `stream: true` keeps the function small and avoids extra deps.
- Client reads `import.meta.env.VITE_SUPABASE_URL` to build the function URL.
- Keep `LOVABLE_API_KEY` server-side only.

## Files touched
- `supabase/functions/kds-ai-chat/index.ts` (new)
- `supabase/config.toml` (register function, `verify_jwt = false`)
- `src/components/kds/AIAssistantPanel.tsx` (rewire to streaming)
- `package.json` (`react-markdown` dep)

## Verification
After build, open the assistant from the KDS rail, ask a free-form question like "how should I prioritize a ticket that's been waiting 18 minutes?", confirm tokens stream in and markdown renders. Trigger a forced 402/429 path to confirm the error bubble.