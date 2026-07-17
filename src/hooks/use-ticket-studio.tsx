import { useEffect, useState } from 'react';
import {
  readTicketStudioConfig,
  TICKET_STUDIO_CHANGE_EVENT,
  type TicketStudioConfig,
} from '@/lib/ticket-studio-config';

/** Subscribes to the persisted Ticket Studio configuration. */
export function useTicketStudioConfig(): TicketStudioConfig {
  const [config, setConfig] = useState<TicketStudioConfig>(() => readTicketStudioConfig());

  useEffect(() => {
    const sync = () => setConfig(readTicketStudioConfig());
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener(TICKET_STUDIO_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener(TICKET_STUDIO_CHANGE_EVENT, sync);
    };
  }, []);

  return config;
}
