/**
 * Cross-tab pub/sub for QR product scans.
 *
 * The tickets page (/kds/v7) subscribes; the stickers page
 * (/kds/qr-stickers) publishes when a QR is scanned. Uses BroadcastChannel
 * with a localStorage fallback so it works across any two tabs in the same
 * browser profile even after publishing.
 */

export interface ScanPayload {
  orderId: string;
  itemId: string;
  ts: number;
}

const CHANNEL = 'kds-qr-scan';
const STORAGE_KEY = 'kds-qr-scan:last';

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    return new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
}

export function encodeScanValue(orderId: string, itemId: string): string {
  // Use a compact URL-safe payload the QR encodes.
  return `kdsqr:${orderId}::${itemId}`;
}

export function decodeScanValue(raw: string): { orderId: string; itemId: string } | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith('kdsqr:')) {
    const rest = trimmed.slice('kdsqr:'.length);
    const [orderId, itemId] = rest.split('::');
    if (orderId && itemId) return { orderId, itemId };
  }
  // Also accept raw "orderId::itemId" typed manually.
  const [orderId, itemId] = trimmed.split('::');
  if (orderId && itemId) return { orderId, itemId };
  return null;
}

export function publishScan(orderId: string, itemId: string): void {
  const payload: ScanPayload = { orderId, itemId, ts: Date.now() };
  const ch = getChannel();
  try {
    ch?.postMessage(payload);
  } catch {
    /* noop */
  } finally {
    ch?.close();
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* noop */
  }
}

export function subscribeScan(handler: (p: ScanPayload) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  let lastTs = 0;
  const seen = (p: ScanPayload) => {
    if (!p || !p.orderId || !p.itemId) return;
    if (p.ts === lastTs) return;
    lastTs = p.ts;
    handler(p);
  };

  const ch = getChannel();
  const onMsg = (e: MessageEvent) => seen(e.data as ScanPayload);
  ch?.addEventListener('message', onMsg);

  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    try {
      seen(JSON.parse(e.newValue) as ScanPayload);
    } catch {
      /* noop */
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    ch?.removeEventListener('message', onMsg);
    ch?.close();
    window.removeEventListener('storage', onStorage);
  };
}
