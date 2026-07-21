import type { TextSize, TicketSpacing, TicketLayout } from '@/hooks/use-kds-settings';

export type RestaurantPresetId =
  | 'fine-dining'
  | 'casual-dining'
  | 'quick-service'
  | 'cafe'
  | 'bakery'
  | 'bar-lounge'
  | 'fast-casual'
  | 'food-truck';

export interface RestaurantPreset {
  id: RestaurantPresetId;
  label: string;
  // Display
  textSize: TextSize;
  ticketSpacing: TicketSpacing;
  ticketLayout: TicketLayout;
  ticketIdentifier: 'Order number' | 'Guest name';
  agingRules: 'Slow kitchen' | 'Standard' | 'Fast kitchen';
  applyToCourseLevel: boolean;
  enableBadge: boolean;
  modeSwitcher: 'Standard' | 'Expo' | 'Station';
  language: 'Single' | 'Dual';
  // Tickets
  servableModifiers: boolean;
  allergenBadges: boolean;
  ticketHeaderAllergenSummary: boolean;
  // Sound
  volume: number; // percent
  alertSound: 'Soft ding' | 'Default beep' | 'Double chime' | 'Urgent alert';
}

export const RESTAURANT_PRESETS: RestaurantPreset[] = [
  {
    id: 'fine-dining', label: 'Fine Dining',
    textSize: 'Standard', ticketSpacing: 'Spacious', ticketLayout: 'standard',
    ticketIdentifier: 'Guest name', agingRules: 'Slow kitchen', applyToCourseLevel: true,
    enableBadge: true, modeSwitcher: 'Standard', language: 'Dual',
    servableModifiers: true, allergenBadges: true, ticketHeaderAllergenSummary: true,
    volume: 50, alertSound: 'Soft ding',
  },
  {
    id: 'casual-dining', label: 'Casual Dining',
    textSize: 'Standard', ticketSpacing: 'Standard', ticketLayout: 'standard',
    ticketIdentifier: 'Guest name', agingRules: 'Standard', applyToCourseLevel: true,
    enableBadge: true, modeSwitcher: 'Standard', language: 'Single',
    servableModifiers: false, allergenBadges: true, ticketHeaderAllergenSummary: true,
    volume: 75, alertSound: 'Double chime',
  },
  {
    id: 'quick-service', label: 'Quick Service',
    textSize: 'Large', ticketSpacing: 'Compact', ticketLayout: 'compact',
    ticketIdentifier: 'Order number', agingRules: 'Fast kitchen', applyToCourseLevel: false,
    enableBadge: true, modeSwitcher: 'Standard', language: 'Single',
    servableModifiers: false, allergenBadges: false, ticketHeaderAllergenSummary: false,
    volume: 100, alertSound: 'Urgent alert',
  },
  {
    id: 'cafe', label: 'Café',
    textSize: 'Standard', ticketSpacing: 'Compact', ticketLayout: 'compact',
    ticketIdentifier: 'Order number', agingRules: 'Fast kitchen', applyToCourseLevel: false,
    enableBadge: true, modeSwitcher: 'Standard', language: 'Single',
    servableModifiers: false, allergenBadges: true, ticketHeaderAllergenSummary: true,
    volume: 75, alertSound: 'Default beep',
  },
  {
    id: 'bakery', label: 'Bakery',
    textSize: 'Large', ticketSpacing: 'Compact', ticketLayout: 'compact',
    ticketIdentifier: 'Order number', agingRules: 'Fast kitchen', applyToCourseLevel: false,
    enableBadge: true, modeSwitcher: 'Standard', language: 'Single',
    servableModifiers: false, allergenBadges: true, ticketHeaderAllergenSummary: true,
    volume: 100, alertSound: 'Default beep',
  },
  {
    id: 'bar-lounge', label: 'Bar & Lounge',
    textSize: 'Standard', ticketSpacing: 'Standard', ticketLayout: 'standard',
    ticketIdentifier: 'Guest name', agingRules: 'Standard', applyToCourseLevel: true,
    enableBadge: true, modeSwitcher: 'Expo', language: 'Single',
    servableModifiers: false, allergenBadges: false, ticketHeaderAllergenSummary: false,
    volume: 75, alertSound: 'Double chime',
  },
  {
    id: 'fast-casual', label: 'Fast Casual',
    textSize: 'Large', ticketSpacing: 'Compact', ticketLayout: 'compact',
    ticketIdentifier: 'Order number', agingRules: 'Fast kitchen', applyToCourseLevel: false,
    enableBadge: true, modeSwitcher: 'Standard', language: 'Single',
    servableModifiers: false, allergenBadges: false, ticketHeaderAllergenSummary: false,
    volume: 100, alertSound: 'Urgent alert',
  },
  {
    id: 'food-truck', label: 'Food Truck',
    textSize: 'Large', ticketSpacing: 'Compact', ticketLayout: 'compact',
    ticketIdentifier: 'Order number', agingRules: 'Fast kitchen', applyToCourseLevel: false,
    enableBadge: true, modeSwitcher: 'Standard', language: 'Single',
    servableModifiers: false, allergenBadges: false, ticketHeaderAllergenSummary: false,
    volume: 100, alertSound: 'Urgent alert',
  },
];

export function buildPresetMessage(p: RestaurantPreset): string {
  return [
    `Here's what I'll configure for **${p.label}**:`,
    '',
    '**Display**',
    `- Text size → ${p.textSize}`,
    `- Ticket spacing → ${p.ticketSpacing}`,
    `- Ticket layout → ${p.ticketLayout === 'compact' ? 'Compact' : 'Standard'}`,
    `- Ticket identifier → ${p.ticketIdentifier}`,
    `- Aging rules → ${p.agingRules}`,
    `- Apply to course level → ${p.applyToCourseLevel ? 'On' : 'Off'}`,
    `- Enable badge → ${p.enableBadge ? 'On' : 'Off'}`,
    `- Mode switcher → ${p.modeSwitcher}`,
    `- Language → ${p.language}`,
    '',
    '**Tickets**',
    `- Servable modifiers → ${p.servableModifiers ? 'On' : 'Off'}`,
    `- Allergen badges → ${p.allergenBadges ? 'On' : 'Off'}`,
    `- Ticket header allergen summary → ${p.ticketHeaderAllergenSummary ? 'On' : 'Off'}`,
    '',
    '**Sound**',
    `- Volume → ${p.volume}%`,
    `- Alert sound → ${p.alertSound}`,
    '',
    'Apply these settings?',
  ].join('\n');
}
