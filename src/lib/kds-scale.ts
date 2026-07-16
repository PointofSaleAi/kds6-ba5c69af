import type { TextSize, TicketSpacing, KDSSafetyEmphasis } from '@/hooks/use-kds-settings';

/**
 * Returns the className string that wires the global Text size, Ticket
 * Spacing, and Safety Emphasis settings into the KDS CSS variable scale
 * (defined in index.css).
 *
 * Apply this to the root of any order surface (Home, Expo, Station/Prep,
 * History, Seen, Unseen) so cards inherit the same scale tokens regardless
 * of which screen they are rendered on.
 */
export function getKdsScaleClasses(
  textSize: TextSize,
  ticketSpacing: TicketSpacing,
  safetyEmphasis?: KDSSafetyEmphasis,
): string {
  const text =
    textSize === 'Compact' ? 'text-scale-compact'
    : textSize === 'Large' ? 'text-scale-large'
    : '';
  const spacing =
    ticketSpacing === 'Standard' ? 'ticket-spacing-standard'
    : ticketSpacing === 'Spacious' ? 'ticket-spacing-spacious'
    : 'ticket-spacing-compact';
  const safety =
    safetyEmphasis === 'Muted' ? 'kds-safety-muted'
    : safetyEmphasis === 'Highlighted' ? 'kds-safety-highlighted'
    : safetyEmphasis === 'Bright' ? 'kds-safety-bright'
    : '';
  return `${text} ${spacing} ${safety}`.trim();
}
