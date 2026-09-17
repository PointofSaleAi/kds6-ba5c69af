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
}: SelectedVariantPreviewProps) {
  const [route, setRoute] = useState<TicketsRouteKey>(() => readStoredTicketsRoute('v3'));

  useEffect(() => {
    const sync = () => setRoute(readStoredTicketsRoute('v3'));
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
    variant === 'v1' ? (
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
