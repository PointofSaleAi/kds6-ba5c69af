import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface PortraitContextValue {
  isPortrait: boolean;
  forcePortrait: boolean;
  setForcePortrait: (v: boolean) => void;
}

const PortraitContext = createContext<PortraitContextValue>({
  isPortrait: false,
  forcePortrait: false,
  setForcePortrait: () => {},
});

export function PortraitProvider({ children }: { children: ReactNode }) {
  const [forcePortrait, setForcePortrait] = useState(false);
  const [naturalPortrait, setNaturalPortrait] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth;
  });

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const handler = (e: MediaQueryListEvent) => setNaturalPortrait(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isPortrait = forcePortrait || naturalPortrait;

  return (
    <PortraitContext.Provider value={{ isPortrait, forcePortrait, setForcePortrait }}>
      {children}
    </PortraitContext.Provider>
  );
}

export function usePortrait() {
  return useContext(PortraitContext);
}
