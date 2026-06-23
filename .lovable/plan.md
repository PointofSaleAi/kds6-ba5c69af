# Point of Sale Ai KDS — AI-First Feature Roadmap (V1, Isolated Route)

## Architecture decision (per your direction)
All AI-First features ship behind a **new isolated route tree** under `/kds/ai` (sibling to `/kds/full`). The existing KDS screens, components, hooks, and stores stay **untouched**. The AI sandbox imports from existing data/types as read-only and renders its own components, so we can iterate freely without regression risk to the production layout.

```text
/kds/full/...        ← existing KDS, unchanged
/kds/ai              ← new AI-First shell (sidebar + entry dashboard)
  /dashboard         ← AI overview + feature tiles
  /sequencer         ← Feature 1: Smart sequencing + nudge
  /allergens         ← Feature 2: Allergen intelligence
  /eta               ← Feature 3: Live ETA + 86 detection
  /voice             ← Feature 4: Voice + AI translation
  /insights          ← Feature 5: End-of-service digest
```

A single toggle on the existing sidebar ("AI Lab" link) deep-links into `/kds/ai/dashboard`. No changes to `OrderCard`, `BottomStatusBar`, `KDSSidebar`, `MainOrderView`, status-aging engine, or settings pages.

## Market context (quick read)
- **Toast / Square / SpotOn / Lightspeed / Fresh KDS**: rules-based. Static prep timers, FIFO sequencing, flat allergen tags, no station-load awareness, no FOH/BOH ETA feedback, no learning loop.
- **Oracle Simphony / QSR ConnectSmart**: stronger routing and reporting, still deterministic. No predictive pacing, no modifier conflict detection, no plain-language same-night digest.
- **Our edge**: stations, coursing, status-aging, dual-language, allergens, expo + summary panel, notification bus, history, mock order store already exist. The AI route consumes them and layers intelligence on top.

The 5 features below each solve at least one pain point from the attached strategy brief.

---

## Feature 1 — Smart Ticket Sequencing & Proactive Urgency Nudge

**Competitor context.** Toast/Square/SpotOn fire in arrival order and only flip the timer red once you are already late. None offer per-table cook-back sequencing or pre-red warnings.

**Pain Point Solved.** Brief p.4: "10 tickets arrive at once, cook must decide what to fire first while already cooking", "Timer turns red with no warning", and "12-min steak and 3-min salad for the same table fire in arrival order, not cook order". Our model computes a per-table fire schedule and surfaces an amber nudge 3 to 4 min before red so the cook acts, not panics.

**UX (lives at `/kds/ai/sequencer`)**
- **AI Fire Queue panel**: ordered list of the next 3 to 5 items the AI says to fire now, with table and station chips.
- **Cook-back timeline**: horizontal Gantt per active table showing each item's predicted start and finish so the table lands together.
- **Amber nudge feed**: stream of tickets entering the 3 to 4 min pre-red window with reason ("Grill backed up", "Long-cook item").
- **Demo toggle**: replay a canned rush so reviewers see sequencing in action.

**Code architecture**
1. New types `src/types/ai.ts`: `PrepPrediction`, `FireRecommendation`, `NudgeEvent`.
2. New mock model `src/data/mock-prep-times.ts` keyed by item name + station with median and p90 seconds.
3. New hook `src/hooks/use-ai-sequencer.tsx` (read-only consumer of `useOrderStore`).
4. New page `src/pages/ai/SequencerScreen.tsx` and components in `src/components/ai/sequencer/*`.
5. Demo data lives in `src/data/mock-ai-rush.ts`, scoped to AI route only.

---

## Feature 2 — Allergen Intelligence (Conflict Detection + Severity Scaling)

**Competitor context.** Every competitor renders allergens as a flat tag identical in weight to "no onion". None cross-check modifiers against ingredient lists at order time.

**Pain Point Solved.** Brief p.5: "During rush, cook skims ticket and misses NO NUTS buried under 4 modifiers", "All allergen tags look identical, peanut allergy styled the same as no-onion preference", "Conflicting modifiers (no dairy + item with hidden butter base) not caught at order entry". We elevate severity-high allergens to an above-the-fold banner and auto-flag ingredient conflicts.

**UX (lives at `/kds/ai/allergens`)**
- **Severity legend**: preference vs. medium vs. high (peanut, tree-nut, shellfish, gluten-celiac), with sample chips at each tier.
- **Conflict inspector**: list of incoming tickets where a modifier contradicts an ingredient, with the offending ingredient highlighted and a "Confirm with guest" CTA.
- **Side-by-side preview**: standard ticket vs. AI-enhanced ticket, so reviewers see the difference without us editing the live `OrderCard`.

**Code architecture**
1. Local type extension `AllergenAi { severity: 'preference' | 'medium' | 'high' }` in `src/types/ai.ts` (no edit to base `Allergen`).
2. New mock `src/data/mock-ingredients.ts`: `Record<itemName, { ingredients: string[]; hiddenAllergens: AllergenType[] }>`.
3. New util `src/lib/ai/allergen-intelligence.ts`: `detectConflicts(item)`.
4. New components `src/components/ai/allergens/*` including `AllergenSeverityBanner` and `ConflictCard`.
5. New page `src/pages/ai/AllergensScreen.tsx`.

---

## Feature 3 — Live ETA Feedback to FOH + 86 Auto-Detection

**Competitor context.** Toast/Square return static "15 min" quotes from menu defaults. None recompute from real station load. None auto-86 a depleting item.

**Pain Point Solved.** Brief p.6: "Server tells guest 15 mins but the grill is backed up, it is actually 25 mins" and "Item runs out, only one server told. Kitchen keeps getting orders for it". Our station-load predictor publishes a live ETA back to POS and auto-86s a likely-depleted item the moment the last portion is bumped.

**UX (lives at `/kds/ai/eta`)**
- **Station Load Meter board**: per-station capacity bars (Grill, Fry, Salad, Bar) updating live.
- **Live ETA table**: ticket × current quote × AI ETA × delta, with amber rows when delta > 5 min.
- **86 Inbox**: AI-suggested 86 items with one-tap "Confirm 86 → notify POS" (mocked toast for now).

**Code architecture**
1. New hook `src/hooks/use-station-load.tsx`.
2. New util `src/lib/ai/eta-predictor.ts`.
3. New mock `src/data/mock-inventory.ts` (read-only counter store; no mutation of real `useOrderStore`).
4. New page `src/pages/ai/EtaScreen.tsx` and components in `src/components/ai/eta/*`.

---

## Feature 4 — Conversational Hands-Free Control + AI Ticket Translation

**Competitor context.** None offer a true hands-free assistant with KDS context. Translation is UI chrome only, content stays in source language.

**Pain Point Solved.** Brief p.7: "Cook can't read the ticket in their language" and the implicit pain of a cook's hands being occupied while needing to bump, recall, or ask a question. We translate ticket content via AI and offer push-to-talk for "bump table 12", "recall last ticket", "show grill only", "ETA on 142".

**UX (lives at `/kds/ai/voice`)**
- **Push-to-talk panel**: large mic button (44×44+) with live waveform and transcript.
- **Intent log**: each utterance with parsed `{ action, params }` and a simulated result.
- **AI translation demo**: pick a source ticket, choose target language, see item names, modifiers, and notes translated by Lovable AI Gateway.
- **Safety rail**: destructive intents require on-screen confirm (no auto "clear all").

**Code architecture**
1. New hook `src/hooks/use-voice-command.tsx` (Web Speech API for STT) + intent parsing via Lovable AI Gateway.
2. Wire AI through `src/lib/ai-gateway.server.ts` and a `createServerFn` (`src/lib/ai.functions.ts`) so `LOVABLE_API_KEY` stays server-side. (TanStack pattern from `connecting-to-ai-models-tanstack`; if the project is classic Vite + React Router, the same logic moves to a Supabase Edge Function per `connecting-to-ai-models-classic-stack`; confirm at build time.)
3. New util `src/lib/ai/intents.ts` registry mapping intents to simulated actions (route-local only, does not mutate global `useOrderStore`).
4. New page `src/pages/ai/VoiceScreen.tsx` and components in `src/components/ai/voice/*`.

---

## Feature 5 — End-of-Service AI Digest + Remake Pattern Detection

**Competitor context.** Toast Analytics / Lightspeed Insights are end-of-month dashboards. None deliver a plain-language same-night digest. None cluster remakes by item × reason.

**Pain Point Solved.** Brief p.8 + p.7: "Same remake errors every service, nobody tracks it" and "After every service the data is there, nobody reads it". We auto-summarize the service in plain language and surface a remake pattern card the same night.

**UX (lives at `/kds/ai/insights`)**
- **Service digest card**: "Avg ticket 14m. Grill 3m slower than 30-day baseline. 2 remakes flagged (both Caesar, dressing). Peak 7:45 PM." with thumb-up/down feedback.
- **Remake heatmap**: item × reason matrix, cell color = frequency.
- **Baseline trend**: rolling 30-service per-station chart.
- **Demo controls**: "Generate sample digest" runs a server function call to Lovable AI Gateway (Gemini 3 Flash) over mock metrics.

**Code architecture**
1. New types in `src/types/ai.ts`: `ServiceMetrics`, `RemakeEvent`, `ServiceDigest`.
2. Local service log `src/hooks/use-ai-service-log.tsx` (localStorage `posai.ai.servicelog.v1`).
3. New util `src/lib/ai/service-analytics.ts` for baselines.
4. Server boundary: `summarizeService(metrics)` via `createServerFn` (or Edge Function in classic stack).
5. New page `src/pages/ai/InsightsScreen.tsx` and components in `src/components/ai/insights/*`.

---

## Shared scaffolding (built once, used by all 5 features)

```text
src/
  pages/ai/
    AiLayout.tsx              ← route shell with its own minimal sidebar
    AiDashboard.tsx           ← landing tiles + feature index
    SequencerScreen.tsx
    AllergensScreen.tsx
    EtaScreen.tsx
    VoiceScreen.tsx
    InsightsScreen.tsx
  components/ai/
    AiSidebar.tsx
    AiFeatureTile.tsx
    AiSectionHeader.tsx
    DemoTicketCard.tsx        ← AI-route-only ticket renderer (no edits to OrderCard)
    sequencer/* allergens/* eta/* voice/* insights/*
  hooks/
    use-ai-sequencer.tsx
    use-station-load.tsx
    use-voice-command.tsx
    use-ai-service-log.tsx
  lib/ai/
    allergen-intelligence.ts
    eta-predictor.ts
    intents.ts
    service-analytics.ts
  data/
    mock-prep-times.ts
    mock-ingredients.ts
    mock-inventory.ts
    mock-ai-rush.ts
  types/ai.ts
  lib/ai-gateway.server.ts    ← AI Gateway provider helper
  lib/ai.functions.ts         ← createServerFn entry points (TanStack)
```

Router change is additive: add an `<AiLayout>` route at `/kds/ai` with the five children above. Existing routes untouched. One link on the existing sidebar ("AI Lab") opens `/kds/ai/dashboard`.

`LOVABLE_API_KEY` is provisioned via `ai_gateway--create` before any AI feature is wired; mock data backs every screen so the route is fully usable even before the key is live.

## Build order (incremental, low-risk, isolated)

1. **Scaffolding**: route, `AiLayout`, `AiDashboard`, `AiSidebar`, `DemoTicketCard`, `types/ai.ts`, sidebar link in existing nav.
2. **Feature 2 (Allergen Intelligence)** — purely presentational, ships safest first.
3. **Feature 1 (Smart Sequencing + Nudge)** — uses mock prep times.
4. **Feature 3 (ETA + 86)** — adds station load board.
5. **Feature 5 (Insights / Digest)** — adds first live Lovable AI Gateway call.
6. **Feature 4 (Voice + AI translation)** — last, requires mic permissions and second AI Gateway call.

Each feature is a self-contained sub-route, independently toggleable, with zero edits to existing KDS screens.

---

Approve and I will start with the **AI scaffolding + Feature 2 (Allergen Intelligence)** on `/kds/ai/allergens`, then layer the other features in order.
