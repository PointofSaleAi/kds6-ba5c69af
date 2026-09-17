import { useEffect, useState } from 'react';
import { OrderCard } from './OrderCard';
import { OrderCardV1 } from './variants/OrderCardV1';
import { OrderCardV2 } from './variants/OrderCardV2';
import { OrderCardV3 } from './variants/OrderCardV3';
import { OrderCardV4 } from './variants/OrderCardV4';
import { OrderCardV5 } from './variants/OrderCardV5';
import { previewTicket } from '@/data/mock-preview-ticket';
import { TicketBoard } from './glass/TicketBoard';
import { GlassBoardProvider } from './glass/glass-board-context';
import { KDSSettingsPreviewScope, useKDSSettings, type TicketsRouteKey } from '@/hooks/use-kds-settings';
import {
  getCardVariantForTicketsRoute,
  readStoredTicketsRoute,
  TICKETS_ROUTE_CHANGE_EVENT,
} from '@/lib/ticket-card-variant';
import type { Order } from '@/types/kds';

interface SelectedVariantPreviewProps {
  order?: Order;
  layoutOverride?: 'standard' | 'compact';
  /** Glass View preview: which sample ticket to show. */
  glassTicketId?: string;
  /** Glass View preview: force the ticket's wait time (aging rules). */
  glassElapsedSeconds?: number;
}

/** Glass View preview card, driven by the saved ticket-layout settings. */
function GlassPreview({
  ticketId,
  elapsedSeconds,
}: {
  ticketId: string;
  elapsedSeconds?: number;
}) {
  const { ticketSpacing, textSize, ticketLayout, ticketHeaderLayout } = useKDSSettings();
  return (
    <div className="w-full flex justify-center">
      <GlassBoardProvider>
        <TicketBoard
          maxTickets={1}
          pinnedTicketId={ticketId}
          viewModeOverride="grid"
          identifier={ticketHeaderLayout === 'guest' ? 'guest' : 'order'}
          scaleFactor={textSize === 'Compact' ? 0.9 : textSize === 'Large' ? 1.1 : 1}
          spacing={ticketSpacing as 'Compact' | 'Standard' | 'Spacious'}
          appearance={ticketLayout === 'compact' ? 'compact' : ticketLayout === 'header' ? 'header' : 'standard'}
          elapsedSecondsOverride={elapsedSeconds}
        />
      </GlassBoardProvider>
    </div>
  );
}

/**
 * Renders the mock preview ticket using whichever ticket-card variant the
 * user selected in Settings > Display > Ticket Layout. Keeps preview tickets
 * across settings screens (Status Colors, Language, etc.) in sync with the
 * Ticket Layout choice.
 */
export function SelectedVariantPreview({
  order = previewTicket,
  layoutOverride,
  glassTicketId = 't23',
  glassElapsedSeconds,
}: SelectedVariantPreviewProps) {
  const [route, setRoute] = useState<TicketsRouteKey>(() => readStoredTicketsRoute('glass'));

  useEffect(() => {
    const sync = () => setRoute(readStoredTicketsRoute('glass'));
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener(TICKETS_ROUTE_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener(TICKETS_ROUTE_CHANGE_EVENT, sync);
    };
  }, []);

  const variant = getCardVariantForTicketsRoute(route);

  const content =
    route === 'glass' ? (
      <GlassPreview ticketId={glassTicketId} elapsedSeconds={glassElapsedSeconds} />
    ) : variant === 'v1' ? (
      <OrderCardV1 order={order} />
    ) : variant === 'v2' ? (
      <OrderCardV2 order={order} />
    ) : variant === 'v3' ? (
      <OrderCardV3 order={order} />
    ) : variant === 'v4' ? (
      <OrderCardV4 order={order} />
    ) : variant === 'v5' ? (
      <OrderCardV5 order={order} />
    ) : (
      <OrderCard order={order} layoutOverride={layoutOverride} legacyActions={route === 'Default'} />
    );

  return <KDSSettingsPreviewScope route={route}>{content}</KDSSettingsPreviewScope>;
}
