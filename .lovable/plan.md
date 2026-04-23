

## Goal

Make the Settings → Language preview ticket responsive to live edits, fill its container properly, and let users toggle between Standard and Compact preview layouts.

## Changes

### `src/components/kds/InlineLanguageSettings.tsx`

1. **Add local preview-layout state**
   - Add `const [previewLayout, setPreviewLayout] = useState<'standard' | 'compact'>(ticketLayout)` (read initial from `useKDSSettings`).
   - This is preview-only and does NOT mutate global `ticketLayout`.

2. **Live-apply unsaved Region edits to the preview**
   - The preview currently uses global `useLanguage()` context, but `dateFormat` / `timeFormat` are held in local state until Save. Pass the local `timeFormat` through to the preview by overriding `previewTicket.timeReceived` formatting. Since `OrderCard` reads `timeFormat` from context, wrap the preview render in a small inline component that re-formats using the local state where needed, OR simply persist `timeFormat` immediately on change (call `saveTimeFormat(i)` inside the radio handler, same for date) so the preview reflects edits in real time. Choose the latter (simpler): persist on change, remove the need for a Save click to see preview updates.

3. **Force preview ticket to match selected layout**
   - Replace the current `<OrderCard order={previewTicket} />` with:
     ```tsx
     <OrderCard order={previewTicket} compact={previewLayout === 'compact'} />
     ```
   - For Standard preview, ensure the ticket fills the container: replace the brittle `[&>*]:h-full [&>*]:flex [&>*]:flex-col` hack with a proper flex wrapper (`flex-1 min-h-0 overflow-hidden flex` and let OrderCard's own root grow). Since OrderCard's root is a `div` with its own height behavior, wrap it in a `h-full w-full` container and rely on the existing card styling (no forced child stretching).
   - To make the items list visually reach the bottom, pad the items area: pass a `compactRows={false}` and add `min-h-full` so the body section uses available height. If OrderCard does not already stretch, wrap with a flex container that stretches the inner courses list.

4. **Add Standard / Compact toggle above the preview**
   - Above the preview ticket, add a small segmented control:
     ```
     [ Standard ] [ Compact ]
     ```
     with the same pill style used for the Language Scope segmented control.
   - Bind to `previewLayout` / `setPreviewLayout`.

### `src/components/kds/OrderCard.tsx` (minimal touch)

- Confirm `compact` prop renders `CompactOrderCard` when true (already supported via existing `compact` flow). No logic changes needed if already handled; otherwise add an early branch:
  ```tsx
  if (compact) return <CompactOrderCard order={order} liveElapsed={liveElapsed} urgency={urgency} />;
  ```
  (Only add if not already present.)

### Preview container layout

In `InlineLanguageSettings.tsx`, restructure the right column:

```text
┌─ PREVIEW KDS ─────────────────┐
│  [ Standard ] [ Compact ]     │  ← new toggle
├───────────────────────────────┤
│                               │
│   <OrderCard fills space>     │  ← flex-1, min-h-0
│                               │
├───────────────────────────────┤
│  Showing <lang> ...           │
└───────────────────────────────┘
```

Apply `flex flex-col h-full` to the preview column, `flex-1 min-h-0` to the ticket wrapper, and remove the child-selector hack.

## Out of Scope

- No changes to `previewTicket` mock data.
- No changes to global `ticketLayout` setting from the preview toggle (preview-only override).
- No changes to Region tab fields beyond making date/time format persist on change so the preview updates live.

