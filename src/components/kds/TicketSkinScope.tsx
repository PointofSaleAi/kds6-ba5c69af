import { createContext, useContext, type ReactNode } from 'react';
import { useTheme } from '@/hooks/use-theme';
import {
  resolveTicketSkin,
  ticketSkinVars,
  type TicketSkin,
} from '@/lib/ticket-skin';

const TicketSkinContext = createContext<TicketSkin | null>(null);

/**
 * Resolves the active ticket skin: an explicit scope override wins, otherwise
 * the app theme decides. Safe to call outside a scope.
 */
export function useTicketSkin(): TicketSkin {
  const scoped = useContext(TicketSkinContext);
  const { theme } = useTheme();
  return scoped ?? resolveTicketSkin(theme);
}

/**
 * Applies the `--tkt-*` custom properties to a subtree. Used by the live
 * ticket board (follows the app theme) and by each Ticket Studio preview pane
 * (per-pane `theme` override so compare mode can show light next to dark).
 */
export function TicketSkinScope({
  theme,
  className,
  style,
  children,
}: {
  theme?: 'light' | 'dark';
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const { theme: appTheme } = useTheme();
  const skin = resolveTicketSkin(theme ?? appTheme);
  return (
    <TicketSkinContext.Provider value={skin}>
      <div className={className} style={{ ...ticketSkinVars(skin), ...style }}>
        {children}
      </div>
    </TicketSkinContext.Provider>
  );
}
