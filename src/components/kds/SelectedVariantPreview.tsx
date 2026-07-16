import { useEffect, useState } from 'react';
import { OrderCard } from './OrderCard';
import { OrderCardV1 } from './variants/OrderCardV1';
import { OrderCardV2 } from './variants/OrderCardV2';
import { OrderCardV3 } from './variants/OrderCardV3';
import { OrderCardV4 } from './variants/OrderCardV4';
import { OrderCardV5 } from './variants/OrderCardV5';
import { OrderCardV6 } from './variants/OrderCardV6';
import { OrderCardV7 } from './variants/OrderCardV7';
import { OrderCardV8 } from './variants/OrderCardV8';
import { OrderCardV9 } from './variants/OrderCardV9';
import { OrderCardV10 } from './variants/OrderCardV10';
import { OrderCardV11 } from './variants/OrderCardV11';
import { OrderCardV12 } from './variants/OrderCardV12';
import { OrderCardV13 } from './variants/OrderCardV13';
import { previewTicket } from '@/data/mock-preview-ticket';
import { KDSSettingsPreviewScope, type TicketsRouteKey } from '@/hooks/use-kds-settings';
import {
  getCardVariantForTicketsRoute,
  readStoredTicketsRoute,
  TICKETS_ROUTE_CHANGE_EVENT,
} from '@/lib/ticket-card-variant';
import type { Order } from '@/types/kds';

interface SelectedVariantPreviewProps {
  order?: Order;
  layoutOverride?: 'standard' | 'compact';
  routeOverride?: TicketsRouteKey;
}

/**
 * Renders the mock preview ticket using whichever ticket-card variant the
 * user selected in Settings > Display > Ticket Layout (or a caller-provided
 * routeOverride, used by the Live Studio filmstrip).
 */
export function SelectedVariantPreview({
  order = previewTicket,
  layoutOverride,
  routeOverride,
}: SelectedVariantPreviewProps) {
  const [route, setRoute] = useState<TicketsRouteKey>(() => readStoredTicketsRoute('v3'));

  useEffect(() => {
    if (routeOverride) return;
    const sync = () => setRoute(readStoredTicketsRoute('v3'));
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener(TICKETS_ROUTE_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener(TICKETS_ROUTE_CHANGE_EVENT, sync);
    };
  }, [routeOverride]);

  const activeRoute = routeOverride ?? route;
  const variant = getCardVariantForTicketsRoute(activeRoute);

  const themedMap: Record<string, React.ComponentType<{ order: Order }>> = {
    v6: OrderCardV6, v7: OrderCardV7, v8: OrderCardV8, v9: OrderCardV9,
    v10: OrderCardV10, v11: OrderCardV11, v12: OrderCardV12, v13: OrderCardV13,
  };
  const ThemedCard = themedMap[variant];

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
    ) : ThemedCard ? (
      <ThemedCard order={order} />
    ) : (
      <OrderCard order={order} layoutOverride={layoutOverride} legacyActions={activeRoute === 'Default'} />
    );

  return <KDSSettingsPreviewScope route={activeRoute}>{content}</KDSSettingsPreviewScope>;
}
