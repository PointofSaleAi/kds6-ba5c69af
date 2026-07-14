import { useEffect } from 'react';
import { subscribeScan } from '@/lib/qr-scan-bus';
import { useOrderStore } from '@/hooks/use-order-store';
import { toast } from '@/hooks/use-toast';

/**
 * Listens for QR scans broadcast from the /kds/qr-stickers page and marks
 * the matching product as Served on the active tickets.
 */
export function useQrScanSync() {
  const { orders, markItemDone } = useOrderStore();

  useEffect(() => {
    const unsub = subscribeScan(({ orderId, itemId }) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        toast({ title: 'Scan ignored', description: 'Order not on this screen.' });
        return;
      }
      let match: { name: string; done: boolean } | null = null;
      for (const c of order.courses) {
        for (const it of c.items) {
          if (it.id === itemId) {
            match = { name: it.name, done: !!it.isCompleted };
            break;
          }
        }
        if (match) break;
      }
      if (!match) {
        toast({ title: 'Scan ignored', description: 'Product not found.' });
        return;
      }
      if (match.done) {
        toast({ title: 'Already served', description: `${match.name} on #${order.orderNumber}.` });
        return;
      }
      markItemDone(orderId, itemId);
      toast({ title: 'Marked as Served', description: `${match.name} on #${order.orderNumber}.` });
    });
    return unsub;
  }, [orders, markItemDone]);
}
