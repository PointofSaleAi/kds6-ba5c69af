import Index from './Index';
import { useQrScanSync } from '@/hooks/use-qr-scan-sync';

/**
 * Same as /kds/v2 (variant v1) but wired to receive scans broadcast from
 * the /kds/qr-stickers page. Scanning a product QR there marks the matching
 * product as Served here in real time.
 */
export default function KdsV7Page() {
  useQrScanSync();
  return <Index cardVariant="v1" />;
}
