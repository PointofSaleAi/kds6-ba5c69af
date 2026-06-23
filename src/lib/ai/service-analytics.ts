import type { Order } from '@/types/kds';
import type { RemakeEvent, ServiceDigest, ServiceMetrics } from '@/types/ai';

const BASELINE_TICKET_SECONDS = 840; // 14 min rolling baseline
const STATION_BASELINES: Record<string, number> = {
  Grill: 660,
  Fry: 360,
  Salad: 240,
  Dessert: 180,
  Bar: 180,
  Kitchen: 600,
};

export function computeServiceMetrics(orders: Order[], remakes: RemakeEvent[]): ServiceMetrics {
  const ticketSeconds: number[] = [];
  const stationSeconds = new Map<string, number[]>();
  const hours = new Map<string, number>();

  for (const o of orders) {
    const seconds = Math.max(60, Math.round((Date.now() - o.timeReceived.getTime()) / 1000));
    ticketSeconds.push(seconds);
    const hour = o.timeReceived.toLocaleTimeString([], { hour: '2-digit' });
    hours.set(hour, (hours.get(hour) ?? 0) + 1);
    for (const c of o.courses) {
      for (const item of c.items) {
        const station = item.station ?? 'Kitchen';
        const arr = stationSeconds.get(station) ?? [];
        arr.push(seconds);
        stationSeconds.set(station, arr);
      }
    }
  }

  const avg = ticketSeconds.length
    ? Math.round(ticketSeconds.reduce((s, n) => s + n, 0) / ticketSeconds.length)
    : 0;

  const stationDeltas = Array.from(stationSeconds.entries()).map(([station, arr]) => {
    const stationAvg = arr.reduce((s, n) => s + n, 0) / arr.length;
    const baseline = STATION_BASELINES[station] ?? 600;
    return { station, deltaSeconds: Math.round(stationAvg - baseline) };
  });

  let peak = 'n/a';
  let peakCount = 0;
  for (const [hour, count] of hours) {
    if (count > peakCount) {
      peak = hour;
      peakCount = count;
    }
  }

  return {
    avgTicketSeconds: avg,
    baselineTicketSeconds: BASELINE_TICKET_SECONDS,
    stationDeltas,
    remakeCount: remakes.length,
    peakWindow: peak,
    totalOrders: orders.length,
  };
}

export function buildDigest(metrics: ServiceMetrics, remakes: RemakeEvent[]): ServiceDigest {
  const fmtMin = (s: number) => `${Math.round(s / 60)}m`;
  const fmtDelta = (s: number) => `${s >= 0 ? '+' : ''}${Math.round(s / 60)}m`;

  const slowest = [...metrics.stationDeltas].sort((a, b) => b.deltaSeconds - a.deltaSeconds)[0];
  const remakeGroups = new Map<string, number>();
  for (const r of remakes) {
    const key = `${r.itemName} (${r.reason})`;
    remakeGroups.set(key, (remakeGroups.get(key) ?? 0) + 1);
  }
  const topRemake = Array.from(remakeGroups.entries()).sort((a, b) => b[1] - a[1])[0];

  const headline = `Avg ticket ${fmtMin(metrics.avgTicketSeconds)} across ${metrics.totalOrders} orders. Baseline ${fmtMin(metrics.baselineTicketSeconds)}.`;

  const bullets: string[] = [];
  if (slowest) {
    bullets.push(`${slowest.station} ran ${fmtDelta(slowest.deltaSeconds)} vs baseline.`);
  }
  if (topRemake) {
    bullets.push(`${topRemake[1]} remake${topRemake[1] === 1 ? '' : 's'} flagged, top reason: ${topRemake[0]}.`);
  } else if (metrics.remakeCount > 0) {
    bullets.push(`${metrics.remakeCount} remakes flagged.`);
  } else {
    bullets.push('No remakes flagged tonight.');
  }
  bullets.push(`Peak ticket volume around ${metrics.peakWindow}.`);

  return { headline, bullets, generatedAt: new Date() };
}
