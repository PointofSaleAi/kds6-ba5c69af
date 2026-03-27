import { useState, useEffect } from 'react';

/**
 * Returns elapsed seconds since `since`, updating every second.
 */
export function useElapsedSeconds(since: Date): number {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - since.getTime()) / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - since.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [since]);

  return Math.max(0, elapsed);
}
