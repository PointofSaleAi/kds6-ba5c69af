## Goal

Split the `/kds/v7` experience into two synchronized pages that communicate via `BroadcastChannel` (no backend). Scanning a product QR on the sticker page marks the same product as Served on the tickets page in real time.

## Pages

**1. `/kds/v7` — Tickets screen (existing)**
- Remove the `FloatingQrScanBar` from this route.
- Add a lightweight `useQrScanSync()` hook that:
  - Opens a `BroadcastChannel('kds-qr-scan')`.
  - On message `{ type: 'scan', orderId, itemId }`, calls `markItemDone(orderId, itemId)` from the order store.
  - Falls back to `storage` events (localStorage write/read) for browsers/tabs where BroadcastChannel is unavailable, so it also works across separate tabs/windows in the same browser profile after publishing.

**2. `/kds/qr-stickers` — New printable QR sticker page**
- Route added in `src/App.tsx`.
- Reads active (non-served) orders from the same client-side order store.
- Renders one sticker per product per order, order-by-order, product-by-product (matches the "printer emits stickers one by one" mental model).
- Each sticker shows: order number, table/guest, product name, modifiers summary, and a QR code encoding `{ orderId, itemId }` (JSON, base64) using `qrcode.react` (already installed for the recipe QR).
- Sticker layout tuned for physical label printing: fixed width (~2.25in), print CSS with `@page` and one sticker per page break, and a "Print" button.
- A "Scan a sticker" panel at the top with two input paths:
  a. **Camera scan** using `html5-qrcode` (works on any device with a camera, after publishing). Decodes the QR, publishes `{ type: 'scan', orderId, itemId }` on the BroadcastChannel + localStorage fallback.
  b. **Manual/hardware scanner input** (hidden text input auto-focused) so a USB/Bluetooth barcode scanner can type the payload and Enter to fire the same event.

## Shared sync utility

New `src/lib/qr-scan-bus.ts`:
- `publishScan(payload)` writes to `BroadcastChannel('kds-qr-scan')` and also `localStorage.setItem('kds-qr-scan', JSON.stringify({...payload, ts: Date.now()}))` as a fallback.
- `subscribeScan(handler)` listens to both channels; dedupes by timestamp.

## Constraints acknowledged

- Same-browser-profile only (BroadcastChannel/localStorage). In production this means the tickets tab and the sticker/scanner tab must run in the same browser on the same device (e.g. two tabs on the KDS tablet, or the KDS tablet acting as both). This matches the manager's "no backend" directive; cross-device scan (phone scans, tablet updates) is out of scope for this plan.

## Files

- `src/App.tsx` — remove `FloatingQrScanBar` from `/kds/v7`; add `/kds/qr-stickers` route.
- `src/lib/qr-scan-bus.ts` — new shared publish/subscribe helper.
- `src/hooks/use-qr-scan-sync.ts` — new hook wired into `/kds/v7`.
- `src/pages/QrStickersPage.tsx` — new page (sticker list + scanner panel + print styles).
- (Delete or keep unused) `src/components/kds/FloatingQrScanBar.tsx` — kept in repo, no longer imported.
- Dependency: add `html5-qrcode` for camera scanning.
