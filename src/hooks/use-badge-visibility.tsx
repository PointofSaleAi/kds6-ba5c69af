import { createContext, useContext, useState, type ReactNode } from 'react';

interface BadgeVisibilityContextType {
  showBadge: boolean;
  setShowBadge: (show: boolean) => void;
}

const BadgeVisibilityContext = createContext<BadgeVisibilityContextType>({
  showBadge: true,
  setShowBadge: () => {},
});

export function BadgeVisibilityProvider({ children }: { children: ReactNode }) {
  const [showBadge, setShowBadge] = useState(true);

  return (
    <BadgeVisibilityContext.Provider value={{ showBadge, setShowBadge }}>
      {children}
    </BadgeVisibilityContext.Provider>
  );
}

export function useBadgeVisibility() {
  return useContext(BadgeVisibilityContext);
}
