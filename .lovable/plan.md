
## Live Studio for KDS Ticket Layouts

Rebuild the Ticket Layout area inside `src/pages/settings/DisplaySettings.tsx` to match the eatOS Live Studio experience. Everything lives inside the existing settings shell (sidebar, breadcrumb) and the persistent KDS rail/footer.

### Layout (desktop ≥ 980px)

```text
+-----------------------------------------------------------+
| Stage (≈ 75% width)               | Inspector (≈ 25%)     |
|  ┌ Stage head ─────────────────┐  |  Personalize          |
|  │ Board title · meta          │  |  ┌ scrollable ─────┐  |
|  │ [Preview rush][Preview alg] │  |  │ Layout          │  |
|  ├─ Preview area ──────────────┤  |  │ Density         │  |
|  │ Live ticket variant (hybrid)│  |  │ Text size       │  |
|  │ + optional compare pane     │  |  │ Ticket ID       │  |
|  ├─ Filmstrip ─────────────────┤  |  │ Safety emphasis │  |
|  │ 16 image thumbnails, ★, hor.│  |  │ Theme           │  |
|  └─────────────────────────────┘  |  │ Station         │  |
|                                   |  └─────────────────┘  |
|                                   |  Status line          |
|                                   |  [Reset][Save preset] |
|                                   |  [Apply to station]   |
+-----------------------------------------------------------+
```

Below 980px: inspector stacks under stage, filmstrip scrolls horizontally, compare panes stack vertically. Touch targets ≥ 44px.

### Boards (hybrid preview)

16 boards, stable string IDs, each mapped to one of our real variants:

| # | Board name | Variant |
|---|---|---|
| 1 | Main Prep | v3 |
| 2 | Expo Focus | v1 |
| 3 | Distance Grid | v8 (Distance View) |
| 4 | Course Flow | v9 |
| 5 | Safety Queue | v11 (Safety First) |
| 6 | Timeline Lanes | v12 (Timeline Flow) |
| 7 | Rush Adaptive | v13 (Adaptive Density) |
| 8 | Dark Ops | v14 (Dark Command) |
| 9 | Main Prep Classic | Default |
| 10 | Expo Focus Classic | v2 |
| 11 | Distance Classic | v4 |
| 12 | Course Flow Classic | v5 |
| 13 | Safety Classic | v6 |
| 14 | Timeline Classic | v7 (Focus Lane) |
| 15 | Rush Classic | v10 (Progressive Ticket) |
| 16 | Dark Ops Classic | v14 (dark variant, dark theme forced) |

Filmstrip thumbnails: the uploaded `.webp` images from `assets.zip`, uploaded via `lovable-assets` (13 confirmed in zip; any missing images fall back to a solid theme swatch). Large center preview renders the **live mapped ticket variant** using existing `previewTicket` mock, so it reflects our real code. Selected board gets a dark border + "Selected" badge. Star toggles favorite.

### Inspector controls (all wired)

- **Layout**: Compact / Standard / Spacious → existing `ticketSpacing`.
- **Text size**: Small / Medium / Large → existing `textSize`.
- **Ticket identifier**: Order # / Guest / Table → existing `ticketHeaderLayout` mapping.
- **Theme**: Light / Dark / Auto → existing app theme.
- **Density**: Low / Medium / High → new per-route setting added to `use-kds-settings.tsx`, controls preview card `--density` (padding + secondary detail visibility).
- **Safety emphasis**: Muted / Bright / Highlighted → new setting, adjusts allergen chip prominence (opacity + optional glow).
- **Station**: Expediter / Bar / Prep 1 / Prep 2 → wires to existing `useKDSMode.setStationCourse` (station name maps to available categories; falls back to All when a name has no matching category).

Every control writes to a **draft state** first. The live preview updates instantly. Nothing hits the applied settings store until "Apply to station".

### Actions

- **Two-up compare**: pill toggle in stage head. When on, next filmstrip click sets `compareBoardId`; preview grid renders two live variants side by side (stacked <980px). Controls only affect the primary board.
- **Preview rush**: swaps `previewTicket` for a denser rush fixture (more items, older timestamps). Fixture-only.
- **Preview allergy**: swaps to a critical-allergen fixture with prominent allergen chips.
- **Reset**: restores personalization defaults for the selected board; leaves favorites and applied config alone.
- **Save preset**: prompts for a name, stores `{ boardId, ...personalization }` in localStorage under `kds.live-studio.presets`. Rendered in a small "Presets" section above the footer.
- **Apply to station**: commits draft to the real settings store (`ticketSpacing`, `textSize`, `ticketHeaderLayout`, theme, density, safetyEmphasis) and writes `ticketsRoute` for the selected board's variant. Shows loading → success chip in the status line. Debounced to prevent duplicate submits.

### Persistence (localStorage)

- `kds.live-studio.favorites` → `string[]`
- `kds.live-studio.presets` → `Array<{ id, name, config }>`
- `kds.live-studio.draft` → last draft per station, so switching back restores it

Applied config still routes through the existing `useKDSSettings` store, so operational screens keep working exactly as before.

### New files

- `src/data/kds-boards.ts` — 16 board records, image imports, variant mapping.
- `src/data/preview-fixtures.ts` — normal/rush/allergy `previewTicket` variants.
- `src/hooks/use-live-studio.tsx` — draft state, favorites, presets, apply logic.
- `src/components/settings/live-studio/LiveStudio.tsx` — orchestrator.
- `src/components/settings/live-studio/StagePreview.tsx` — head + preview grid + compare.
- `src/components/settings/live-studio/BoardFilmstrip.tsx` — thumbnails, star, badges, keyboard nav.
- `src/components/settings/live-studio/InspectorPanel.tsx` — controls + footer actions.
- `src/components/settings/live-studio/CapsuleSegmented.tsx` — capsule-shaped segmented control (12px radius workspace, 999px capsule).
- `src/assets/kds-boards/*.webp.asset.json` — one asset pointer per board image (created via `lovable-assets` from `/mnt/user-uploads/assets/`).

### Existing files edited

- `src/pages/settings/DisplaySettings.tsx` — replace the current "Ticket Layout" preview + pills area with `<LiveStudio />`; keep the other sections (Language, Status, Order type colors, etc.) untouched.
- `src/hooks/use-kds-settings.tsx` — add per-route `density` and `safetyEmphasis` settings (with defaults) so the setter maps directly.
- `src/index.css` — small additions for `.ls-*` classes: capsule pills, 12px workspace cards, `--ls-density` CSS var driving card padding, safety-emphasis opacity variants.

### Out of scope (per your answers)

- No backend tables; presets and favorites stay in localStorage.
- Analytics events, permissions, and real API endpoints from the handoff are not wired — controls still map to our local settings store.
- No new full-screen route; Live Studio lives inside the current settings shell.

### Accessibility & performance

- `aria-pressed` on capsule segments, star buttons, and compare toggle.
- Live region on the inspector status line for save/apply results.
- Filmstrip supports arrow-key navigation and roving tab index.
- Thumbnails lazy-load after the first visible group; selected and compare images preloaded.
- Respects `prefers-reduced-motion` for preview transitions.
- No em dashes anywhere in copy. Montserrat everywhere (already global).

Ready when you say go.
