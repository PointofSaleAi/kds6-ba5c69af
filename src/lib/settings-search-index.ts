export type SettingsGroupId = 'display' | 'orders' | 'expo' | 'hardware' | 'system' | 'account';

export interface SettingsSearchEntry {
  id: string;
  label: string;
  description: string;
  group: SettingsGroupId;
  groupLabel: string;
  path: string;
  keywords: string;
}

export const SETTINGS_GROUPS: Record<SettingsGroupId, { label: string; path: string }> = {
  display: { label: 'Display', path: '/kds/v1/settings/display' },
  orders: { label: 'Tickets', path: '/kds/v1/settings/orders' },
  expo: { label: 'Expo View', path: '/kds/v1/settings/expo' },
  hardware: { label: 'Hardware', path: '/kds/v1/settings/hardware' },
  system: { label: 'System', path: '/kds/v1/settings/system' },
  account: { label: 'Account', path: '/kds/v1/settings/account' },
};

/**
 * Static, client-side searchable index of every settings row.
 * `id` is also used as a hash anchor for highlight-on-navigate.
 */
export const SETTINGS_SEARCH_INDEX: SettingsSearchEntry[] = [
  // Display
  { id: 'display-mode', label: 'Display Mode', description: 'Grid, horizontal, or stagger layout', group: 'display', groupLabel: 'Display', path: '/kds/v1/settings/display#display-mode', keywords: 'grid horizontal stagger layout view' },
  { id: 'cards-per-row', label: 'Cards per Row', description: 'How many tickets fit across', group: 'display', groupLabel: 'Display', path: '/kds/v1/settings/display#cards-per-row', keywords: 'columns count density' },
  { id: 'text-size', label: 'Text Size', description: 'Compact, Standard, or Large', group: 'display', groupLabel: 'Display', path: '/kds/v1/settings/display#text-size', keywords: 'font scale size legibility' },
  { id: 'ticket-layout', label: 'Ticket Layout', description: 'Standard or Compact ticket density', group: 'display', groupLabel: 'Display', path: '/kds/v1/settings/display#ticket-layout', keywords: 'compact standard ticket card layout density' },
  { id: 'status-colors', label: 'Status Colors', description: 'Ticket aging color thresholds', group: 'display', groupLabel: 'Display', path: '/kds/v1/settings/display#status-colors', keywords: 'aging colors thresholds time' },
  { id: 'order-type-colors', label: 'Order Type Colors', description: 'Header colors per order type', group: 'display', groupLabel: 'Display', path: '/kds/v1/settings/display#order-type-colors', keywords: 'order type colors header dine in take out delivery banquet' },
  { id: 'enable-badge', label: 'Enable Badge', description: 'Sidebar icon count badge', group: 'display', groupLabel: 'Display', path: '/kds/v1/settings/display#enable-badge', keywords: 'badge sidebar icon count notification' },
  { id: 'ticket-identifier', label: 'Ticket Identifier', description: 'Order number or guest name', group: 'display', groupLabel: 'Display', path: '/kds/v1/settings/display#ticket-identifier', keywords: 'ticket identifier order number guest name primary card label' },
  { id: 'mode-switcher', label: 'Mode Switcher', description: 'Standard, Expo, or Station mode', group: 'display', groupLabel: 'Display', path: '/kds/v1/settings/display#mode-switcher', keywords: 'mode switcher kds standard expo station prep operational' },
  { id: 'theme', label: 'Theme', description: 'Light or dark mode', group: 'display', groupLabel: 'Display', path: '/kds/v1/settings/display#theme', keywords: 'light dark theme appearance' },
  { id: 'language', label: 'Language', description: 'Display language selection', group: 'display', groupLabel: 'Display', path: '/kds/v1/settings/display#language', keywords: 'region locale i18n language translation' },

  // Orders
  { id: 'category-filter', label: 'Category Filter', description: 'Show only selected categories', group: 'orders', groupLabel: 'Tickets', path: '/kds/v1/settings/orders#category-filter', keywords: 'category filter products' },
  { id: 'revenue-center', label: 'Revenue Center Filter', description: 'Filter by station or revenue center', group: 'orders', groupLabel: 'Tickets', path: '/kds/v1/settings/orders#revenue-center', keywords: 'station revenue center filter' },
  { id: 'stagger-mode', label: 'Stagger Mode', description: 'Release orders in batches', group: 'orders', groupLabel: 'Tickets', path: '/kds/v1/settings/orders#stagger-mode', keywords: 'stagger pacing batch release queue' },
  { id: 'servable-modifiers', label: 'Servable Modifiers', description: 'Track modifier preparation status', group: 'orders', groupLabel: 'Tickets', path: '/kds/v1/settings/orders#servable-modifiers', keywords: 'modifiers servable status tracking' },
  { id: 'allergen-badges', label: 'Allergen Badges', description: 'Show allergen chips on tickets', group: 'orders', groupLabel: 'Tickets', path: '/kds/v1/settings/orders#allergen-badges', keywords: 'allergen badges chips warnings' },
  { id: 'sort-default', label: 'Default Sort', description: 'Sort tickets by Time, Table, or Type', group: 'orders', groupLabel: 'Tickets', path: '/kds/v1/settings/orders#sort-default', keywords: 'sort order time table type default' },
  { id: 'order-hold', label: 'Order Hold', description: 'Hold new orders before the kitchen sees them', group: 'orders', groupLabel: 'Tickets', path: '/kds/v1/settings/orders#order-hold', keywords: 'order hold delay queue time buffer' },

  // Expo
  { id: 'expo-send-button', label: 'Show Send Button', description: 'Always or only when ready', group: 'expo', groupLabel: 'Expo view', path: '/kds/v1/settings/expo#expo-send-button', keywords: 'expo send button ready always' },

  // Hardware
  { id: 'kot-printer', label: 'KOT Printer', description: 'Kitchen ticket printer assignment', group: 'hardware', groupLabel: 'Hardware', path: '/kds/v1/settings/hardware#kot-printer', keywords: 'printer kot kitchen ticket' },
  { id: 'label-printer', label: 'Label Printer', description: 'Per-product label printer assignment', group: 'hardware', groupLabel: 'Hardware', path: '/kds/v1/settings/hardware#label-printer', keywords: 'printer label sticker' },
  { id: 'sound-settings', label: 'Sound Settings', description: 'Volume and notification alerts', group: 'hardware', groupLabel: 'Hardware', path: '/kds/v1/settings/hardware#sound-settings', keywords: 'sound volume audio alert beep' },
  { id: 'sync', label: 'Sync', description: 'Force sync of orders and settings', group: 'hardware', groupLabel: 'Hardware', path: '/kds/v1/settings/hardware#sync', keywords: 'sync refresh orders settings cloud' },
  { id: 'connection', label: 'Connection', description: 'Network and EdgeOS sync', group: 'hardware', groupLabel: 'Hardware', path: '/kds/v1/settings/hardware#connection', keywords: 'connection network websocket sync edgeos' },

  // System
  { id: 'ai-integration', label: 'AI Integration', description: 'Maya integration', group: 'system', groupLabel: 'System', path: '/kds/v1/settings/system#ai-integration', keywords: 'ai integration settings maya provider' },
  { id: 'ai-instructions', label: 'AI Instructions', description: 'Rules, custom instructions & restaurant knowledge base', group: 'system', groupLabel: 'System', path: '/kds/v1/settings/system/ai-integration/ai-instructions', keywords: 'ai instructions rules dos donts custom prompt system prompt knowledge base restaurant type' },

  // Account
  { id: 'device-name', label: 'Device Name', description: 'Identifier for this Kitchen Display', group: 'account', groupLabel: 'Account', path: '/kds/v1/settings/account#device-name', keywords: 'device name identifier kds station' },
  { id: 'station-id', label: 'Station ID', description: 'Unique station identifier', group: 'account', groupLabel: 'Account', path: '/kds/v1/settings/account#station-id', keywords: 'station id identifier' },
  { id: 'bug-reporting', label: 'Bug Reporting', description: 'In-app issue capture', group: 'account', groupLabel: 'Account', path: '/kds/v1/settings/account#bug-reporting', keywords: 'bug report crash issue in-app' },
  { id: 'debug-mode', label: 'Debug Mode', description: 'Verbose logging and dev selector', group: 'account', groupLabel: 'Account', path: '/kds/v1/settings/account#debug-mode', keywords: 'debug developer dev mode verbose logging' },
  { id: 'upload-logs', label: 'Upload Logs', description: 'Send logs to support', group: 'account', groupLabel: 'Account', path: '/kds/v1/settings/account#upload-logs', keywords: 'upload logs diagnostics support eatos' },
  { id: 'feedback-support', label: 'Feedback & Support', description: 'Request a feature or contact support', group: 'account', groupLabel: 'Account', path: '/kds/v1/settings/account#feedback-support', keywords: 'feedback support feature request help' },
  { id: 'log-out', label: 'Log out', description: 'Sign out of this device', group: 'account', groupLabel: 'Account', path: '/kds/v1/settings/account#log-out', keywords: 'logout sign out exit' },
];

export function searchSettings(query: string): SettingsSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SETTINGS_SEARCH_INDEX.filter((e) => {
    const hay = `${e.label} ${e.description} ${e.keywords} ${e.groupLabel}`.toLowerCase();
    return hay.includes(q);
  });
}
