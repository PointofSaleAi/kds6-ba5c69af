// Mock prep-time model. Median & p90 seconds keyed by item name.
// In production this would come from a learned model server-side.

export interface PrepStat {
  medianSeconds: number;
  p90Seconds: number;
}

export const mockPrepTimes: Record<string, PrepStat> = {
  'Cheese Selection': { medianSeconds: 180, p90Seconds: 240 },
  'Meatballs': { medianSeconds: 480, p90Seconds: 600 },
  'Filet Mignon': { medianSeconds: 720, p90Seconds: 900 },
  'Tres Leches': { medianSeconds: 120, p90Seconds: 180 },
  'Caesar Salad': { medianSeconds: 180, p90Seconds: 240 },
  'Truffle Fries': { medianSeconds: 300, p90Seconds: 420 },
  'Ribeye Steak': { medianSeconds: 780, p90Seconds: 960 },
  'Margherita Pizza': { medianSeconds: 540, p90Seconds: 720 },
  'Pasta Carbonara': { medianSeconds: 420, p90Seconds: 540 },
  'Grilled Salmon': { medianSeconds: 540, p90Seconds: 720 },
  'Chicken Wings': { medianSeconds: 480, p90Seconds: 600 },
  'House Burger': { medianSeconds: 420, p90Seconds: 540 },
};

export function predictPrep(itemName: string): PrepStat {
  return mockPrepTimes[itemName] ?? { medianSeconds: 360, p90Seconds: 480 };
}
