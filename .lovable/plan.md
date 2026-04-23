
## Scope

In the compact ticket header only, restrict the adaptive font-sizing logic so it applies **only to guest names**. Order numbers (and the guest-number fallback) keep their fixed `28px` size regardless of length.

## Current Behavior

In `src/components/kds/OrderCard.tsx` (compact layout block), the identifier currently runs through name-splitting + adaptive sizing whenever `ticketHeaderLayout === 'guest'` and a `guestName` exists. The fallback `order.orderNumber` path renders at fixed `28px`.

The issue: the adaptive sizing (18px / 22px / 26px) is also affecting visual parity expectations because it now governs the guest case entirely. The user wants the shrinking + line-splitting behavior preserved **only for guest names**, while order number and any guest-number rendering stay locked at `28px`.

## Change

In the compact header identifier block:

1. **Guest name branch** (`ticketHeaderLayout === 'guest' && order.guestName`):
   - Keep existing logic: split into first name + rest, compute adaptive `fontSize` (26 / 22 / 18) based on the longest part, render two stacked lines when a second part exists.

2. **Order number branch** (everything else, including missing guest name fallback):
   - Render `order.orderNumber` at fixed `28px`, single line, `font-black`, no adaptive sizing, no splitting. This matches the original compact header style exactly.

3. Do not touch any other field, the standard layout, the right-side stack (timer + server name), allergens, body, footer, or any tokens.

## Technical Detail

```tsx
// src/components/kds/OrderCard.tsx — compact header identifier
{ticketHeaderLayout === 'guest' && order.guestName ? (
  (() => {
    const parts = order.guestName.trim().split(/\s+/);
    const firstName = parts[0];
    const restName = parts.slice(1).join(' ');
    const longest = Math.max(firstName.length, restName.length);
    const fontSize = longest > 12 ? 18 : longest > 9 ? 22 : 26;
    return (
      <div
        className="text-white font-black min-w-0 leading-tight break-words"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div>{firstName}</div>
        {restName && <div>{restName}</div>}
      </div>
    );
  })()
) : (
  <div
    className="text-white font-black shrink-0 leading-none"
    style={{ fontSize: '28px' }}
  >
    {order.orderNumber}
  </div>
)}
```

**Files to edit:** `src/components/kds/OrderCard.tsx` (compact header identifier block only).
