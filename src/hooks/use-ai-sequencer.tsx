import { useMemo } from 'react';
import { useOrderStore } from '@/hooks/use-order-store';
import type { FireRecommendation, NudgeEvent } from '@/types/ai';
import { predictPrep } from '@/data/mock-prep-times';

const NUDGE_WINDOW_SECONDS = 240; // amber nudge fires 4 min before red

export function useAiSequencer() {
  const { orders } = useOrderStore();

  return useMemo(() => {
    const recommendations: FireRecommendation[] = [];
    const nudges: NudgeEvent[] = [];

    for (const order of orders) {
      if (order.status === 'served') continue;

      // Per-table cook-back: find longest predicted item; fire shorter items later so they land together.
      const items = order.courses.flatMap((c) => c.items)
        .filter((i) => !i.isCompleted && !i.isCancelled);
      if (items.length === 0) continue;

      const longest = Math.max(...items.map((i) => predictPrep(i.name).medianSeconds));
      for (const item of items) {
        const pred = predictPrep(item.name);
        const fireInSeconds = Math.max(0, longest - pred.medianSeconds);
        recommendations.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          tableName: order.tableName,
          itemId: item.id,
          itemName: item.name,
          station: item.station ?? 'Kitchen',
          fireInSeconds,
          reason: fireInSeconds === 0
            ? 'Longest cook — fire now to anchor the table.'
            : `Hold ${Math.round(fireInSeconds / 60)}m so it lands with longer items.`,
        });
      }

      // Nudge: ticket within window of target.
      const elapsed = Math.round((Date.now() - order.timeReceived.getTime()) / 1000);
      const secondsToRed = order.targetSeconds - elapsed;
      if (secondsToRed > 0 && secondsToRed <= NUDGE_WINDOW_SECONDS) {
        nudges.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          tableName: order.tableName,
          secondsToRed,
          reason: secondsToRed <= 120
            ? 'About to turn red — pick this up next.'
            : 'Approaching urgency window.',
        });
      }
    }

    recommendations.sort((a, b) => a.fireInSeconds - b.fireInSeconds);
    return { recommendations, nudges };
  }, [orders]);
}
