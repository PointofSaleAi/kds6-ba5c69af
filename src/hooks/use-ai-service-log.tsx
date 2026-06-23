import { useCallback, useEffect, useState } from 'react';
import type { RemakeEvent } from '@/types/ai';

const STORAGE_KEY = 'posai.ai.servicelog.v1';

interface StoredEvent {
  id: string;
  itemName: string;
  reason: string;
  timestamp: string;
  station: string;
}

function load(): RemakeEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: StoredEvent[] = JSON.parse(raw);
    return parsed.map((e) => ({ ...e, timestamp: new Date(e.timestamp) }));
  } catch {
    return [];
  }
}

const DEFAULT_REMAKES: RemakeEvent[] = [
  { id: 'r-1', itemName: 'Caesar Salad', reason: 'Wrong dressing', timestamp: new Date(Date.now() - 1800000), station: 'Salad' },
  { id: 'r-2', itemName: 'Caesar Salad', reason: 'Wrong dressing', timestamp: new Date(Date.now() - 600000), station: 'Salad' },
  { id: 'r-3', itemName: 'House Burger', reason: 'Overcooked', timestamp: new Date(Date.now() - 3600000), station: 'Grill' },
];

export function useAiServiceLog() {
  const [remakes, setRemakes] = useState<RemakeEvent[]>(() => {
    const existing = load();
    return existing.length ? existing : DEFAULT_REMAKES;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(remakes.map((r) => ({ ...r, timestamp: r.timestamp.toISOString() }))),
    );
  }, [remakes]);

  const addRemake = useCallback((event: Omit<RemakeEvent, 'id' | 'timestamp'>) => {
    setRemakes((prev) => [
      ...prev,
      { ...event, id: `r-${Date.now()}`, timestamp: new Date() },
    ]);
  }, []);

  const reset = useCallback(() => setRemakes(DEFAULT_REMAKES), []);

  return { remakes, addRemake, reset };
}
