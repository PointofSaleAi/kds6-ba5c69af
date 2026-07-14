import Index from './Index';
import { useQrScanSync } from '@/hooks/use-qr-scan-sync';

/**
 * Tickets screen wired to the /kds/qr-stickers page. Uses the v2 card
 * variant (which supports the Seen → Preparing → Ready → Served row
 * lifecycle) so incoming QR scans can move a product to READY.
 */
export default function KdsV7Page() {
  useQrScanSync();
  return <Index cardVariant="v2" />;
}

