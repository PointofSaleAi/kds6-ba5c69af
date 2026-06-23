import type { Order } from '@/types/kds';
import type { StationLoad } from '@/types/ai';
import { predictPrep } from '@/data/mock-prep-times';

// Capacity = max parallel seconds a station can do per "tick".
const STATION_CAPACITY: Record<string, number> = {
  Grill: 1800,
  Fry: 1200,
  Salad: 900,
  Dessert: 600,
  Bar: 900,
  Kitchen: 1800,
};

export function computeStationLoad(orders: Order[]): StationLoad[] {
  const map = new Map<string, number>();
  for (const o of orders) {
    if (o.status === 'served') continue;
    for (const c of o.courses) {
      for (const item of c.items) {
        if (item.isCompleted || item.isCancelled) continue;
        const station = item.station ?? 'Kitchen';
        const pred = predictPrep(item.name);
        map.set(station, (map.get(station) ?? 0) + pred.medianSeconds * item.quantity);
      }
    }
  }
  const stations = ['Grill', 'Fry', 'Salad', 'Dessert', 'Bar', 'Kitchen'];
  return stations.map((station) => {
    const queued = map.get(station) ?? 0;
    const capacity = STATION_CAPACITY[station] ?? 1200;
    return {
      station,
      queuedSeconds: queued,
      capacitySeconds: capacity,
      loadRatio: queued / capacity,
    };
  });
}

export function estimateOrderEta(order: Order, loads: StationLoad[]): number {
  const loadByStation = new Map(loads.map((l) => [l.station, l.loadRatio]));
  let maxSeconds = 0;
  for (const c of order.courses) {
    for (const item of c.items) {
      if (item.isCompleted || item.isCancelled) continue;
      const pred = predictPrep(item.name);
      const station = item.station ?? 'Kitchen';
      const load = loadByStation.get(station) ?? 0;
      const inflated = pred.medianSeconds * (1 + Math.min(load, 1.5));
      if (inflated > maxSeconds) maxSeconds = inflated;
    }
  }
  return Math.round(maxSeconds);
}
