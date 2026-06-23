import { useMemo } from 'react';
import { useOrderStore } from '@/hooks/use-order-store';
import { computeStationLoad, estimateOrderEta } from '@/lib/ai/eta-predictor';
import type { EtaQuote } from '@/types/ai';

export function useStationLoad() {
  const { orders } = useOrderStore();

  return useMemo(() => {
    const loads = computeStationLoad(orders);
    const quotes: EtaQuote[] = orders
      .filter((o) => o.status !== 'served')
      .map((o) => {
        const aiEta = estimateOrderEta(o, loads);
        const quoted = o.targetSeconds;
        return {
          orderId: o.id,
          orderNumber: o.orderNumber,
          tableName: o.tableName,
          quotedSeconds: quoted,
          aiEtaSeconds: aiEta,
          deltaSeconds: aiEta - quoted,
        };
      });
    return { loads, quotes };
  }, [orders]);
}
