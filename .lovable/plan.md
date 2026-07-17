# Plan: Project Guardian — Single Source of Truth

Create one comprehensive Markdown document that any AI tool (Lovable, Cursor, Claude, etc.) or human contributor can read to work on this KDS project without repeating past mistakes.

## Deliverable

A single file written to `/mnt/documents/PROJECT_GUARDIAN.md` (with a `.md` artifact tag so you can download it). No code changes to the app itself.

## Source Material

Full project chat history + existing memory files under `mem://` (index + all referenced memory docs). I'll pull both so the document reflects everything already codified plus the friction points and corrections that never made it into memory.

## Document Structure

1. **Product Overview** — What Point of Sale Ai KDS is, target device, viewing distance, primary users.
2. **Non-Negotiable Guardrails** (the "never do this" list)
   - Terminology: banned words (Fire, Auto-fire, Prep in UI, POSAI, "In Progress", "Done"), required words (Served, Queued, Station, Preparing, Ready).
   - No em dashes anywhere (workspace rule).
   - Montserrat everywhere, JetBrains Mono for timers only.
   - No hardcoded colors (`text-white`, `bg-black`, hex literals in components) — semantic tokens only.
   - Never use `fixed inset-0` for overlays; use `getOverlayInsets(layout)` so KDS rail + footer stay visible.
   - No removed features: Re-route item, Re-route Entire Ticket, X close buttons on primary settings tabs.
   - No hardcoded data in UI; API-first with typed contracts.
3. **Design System**
   - Color tokens (order type headers, urgency states, backgrounds, text, modifiers, allergens).
   - Typography scale (order # 56/900, item 15/600, allergens 13/700, min 12px).
   - Layout constants (sidebar 56/200, right panel 220, card radius 8, gap 10, status bar 44, touch min 44×44).
   - Ticket spacing scale (Compact default, Standard, Spacious).
   - Light + dark theme rules, 91% lightness background, pure white for auth.
4. **UI/UX Standards**
   - 3-state item lifecycle: UNSEEN (blue eye) → PREPARING (red bell) → SERVED (purple check), with Ready between Preparing and Served at ticket level.
   - Ticket lifecycle rules (bulk transitions, "seen" only when every product seen).
   - Interaction model: tap = recipe, long-press = 86 popover, double-tap = undo, product actions only via icons.
   - Action rail alignment: horizontally centered to first line of product name (3-column layout).
   - Done items sort to bottom of ticket, in every layout.
   - Persistent nav (left rail + bottom bar) always visible; dockable edges.
   - Modal pattern: inline sub-screens for settings, no X buttons on primary tabs.
   - Notifications: 4s auto-dismiss, station filtering.
   - Animations: framer-motion spring, 1.15× tactile scale.
5. **Feature Rulebook** (one short section per feature, linking to the `mem://` doc)
   - Coursing, Expo mode, Stagger pacing, Status aging, History recall, Kitchen messaging, Mobile reply QR, Station mode, Training mode, Onboarding, Recipe reference, Servable modifiers, 86 drawer (categories not courses, multi-select, uniform vs mixed batches), Order hold, Coursing timer, Floating QR scan bar, Ticket Studio.
6. **Cross-Surface Consistency Rules**
   - Ticket layout choice must propagate to History, Seen, Unseen screens (via `src/lib/ticket-card-variant.ts`).
   - Expo tickets must visually match V3 (header, notes, course header, product name, background/border, tightened spacing, no ± symbols on modifiers).
   - Standard KDS ↔ Expo status sync via `itemLifecycles` in `use-order-store`.
   - Secondary language must render on V3 with RTL alignment for Arabic.
7. **AI-First Architecture Rules** (from workspace knowledge)
   - MCP-compatible tool interfaces, LLM-parseable JSON responses, conversational equivalents for every workflow, embeddable data design, AI cost budgeting, response guardrails, observability.
   - AI chat must be proactive (prompt next step), not a static list — Auto-Execute Chip Protocol pattern in `AIAssistantPanel`.
8. **Backend / Cloud Rules**
   - Never say "Supabase" to users; use "Lovable Cloud".
   - RLS + GRANTs on every public table.
   - Roles in a separate `user_roles` table with `has_role` security-definer function.
   - Storage: private buckets + signed URLs (recipe-videos precedent).
   - Never edit auto-generated client/types/.env/config.toml.
9. **Mistakes Log & Corrections** — chronological table of user-reported issues and how they were fixed, so future agents recognize the pattern. Categories:
   - Alignment regressions (action icon vertical centering across product/modifier/notes/allergens).
   - Layout not propagating across screens (History/Seen/Unseen).
   - Behavior parity gaps between variants (V3 vs default: recall, seen semantics, tap vs long-press).
   - Spacing regressions in 86 drawer and Expo tickets.
   - Terminology drift (SEEN-only CTA, "In Progress"/"Done" naming).
   - Overlays covering persistent nav.
   - Public storage bucket leak.
   - Missing RTL/secondary-language support on new variants.
   - Ticket Studio: order-type pill removed, Reset relocated, Save/Apply removed.
10. **Lessons Learned / Best Practices**
    - When adding a new ticket variant, replicate: recall, seen semantics, long-press 86, double-tap undo, secondary language, RTL, done-sort-last, action rail alignment, layout propagation.
    - When adding a new screen, respect dock insets and persistent nav.
    - When touching the 86 drawer, preserve: categories (not courses), color swap on expand, multi-select, uniform vs mixed batch rendering.
    - When shipping a security fix, prefer signed URLs over public policies.
    - Before claiming a fix, verify across all ticket layouts and both themes.
11. **Forward Guardrails Checklist** (copy-paste PR checklist)
    - [ ] No em dashes, no banned terminology.
    - [ ] Semantic tokens only.
    - [ ] Works in light + dark.
    - [ ] Works on V1/V2/V3/V7 + Expo + History/Seen/Unseen.
    - [ ] Persistent nav visible.
    - [ ] Touch targets ≥ 44×44.
    - [ ] Secondary language + RTL verified.
    - [ ] No hardcoded data.
    - [ ] RLS + GRANTs on any new table.
    - [ ] No public storage buckets for user content.
12. **Reference Index** — Table mapping each rule to the `mem://` file and the primary source file(s) in the repo.

## Method

1. Read `mem://index.md` and every referenced memory file in parallel.
2. Use `chat_search--recall_chat_history` in overlapping windows to recover early decisions not in memory.
3. Draft `PROJECT_GUARDIAN.md`, keep it scannable (H2 per section, tables where useful, no emojis, no em dashes).
4. Write to `/mnt/documents/PROJECT_GUARDIAN.md` and emit a `<presentation-artifact>` tag.

## Out of Scope

- No changes to app code, memory files, or settings.
- Not generating a PDF/DOCX unless you ask — Markdown is the most useful format for AI tools and diffs.

Confirm and I'll build it. If you'd rather have it as PDF or DOCX too, say so and I'll add that step.