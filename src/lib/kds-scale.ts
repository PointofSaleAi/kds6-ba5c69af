import type { TextSize, TicketSpacing } from '@/hooks/use-kds-settings';

/**
 * Returns the className string that wires the global Text size and Ticket
 * Spacing settings into the KDS CSS variable scale (defined in index.css).
 *
 * Apply this to the root of any order surface (Home, Expo, Station/Prep,
 * History, Seen, Unseen) so cards inherit the same scale tokens regardless
 * of which screen they are rendered on.
 */
export function getKdsScaleClasses(textSize: TextSize, ticketSpacing: TicketSpacing): string {
  const text =
    textSize === 'Compact' ? 'text-scale-compact'
    : textSize === 'Large' ? 'text-scale-large'
    : '';
  const spacing =
    ticketSpacing === 'Standard' ? 'ticket-spacing-standard'
    : ticketSpacing === 'Spacious' ? 'ticket-spacing-spacious'
    : 'ticket-spacing-compact';
  return `${text} ${spacing}`.trim();
}
