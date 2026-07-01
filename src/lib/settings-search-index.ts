import { KDS_SETTINGS_GROUP, KDS_SETTINGS_SYSTEM_AI_INSTRUCTIONS } from './routes';

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
  display: { label: 'Display', path: KDS_SETTINGS_GROUP.display },
  orders: { label: 'Tickets', path: KDS_SETTINGS_GROUP.orders },
  expo: { label: 'Expo view', path: KDS_SETTINGS_GROUP.expo },
  hardware: { label: 'Hardware', path: KDS_SETTINGS_GROUP.hardware },
  system: { label: 'System', path: KDS_SETTINGS_GROUP.system },
  account: { label: 'Account', path: KDS_SETTINGS_GROUP.account },
};

/**
 * Static, client-side searchable index of every settings row.
 * `id` is also used as a hash anchor for highlight-on-navigate.
 */
export const SETTINGS_SEARCH_INDEX: SettingsSearchEntry[] = [
  // Display
  { id: 'display-mode', label: 'Display mode', description: 'Grid, horizontal, or stagger layout', group: 'display', groupLabel: 'Display', path: `${KDS_SETTINGS_GROUP.display}#display-mode`, keywords: 'grid horizontal stagger layout view' },
  { id: 'cards-per-row', label: 'Cards per row', description: 'How many tickets fit across', group: 'display', groupLabel: 'Display', path: `${KDS_SETTINGS_GROUP.display}#cards-per-row`, keywords: 'columns count density' },
  { id: 'text-size', label: 'Text size', description: 'Compact, Standard, or Large', group: 'display', groupLabel: 'Display', path: `${KDS_SETTINGS_GROUP.display}#text-size`, keywords: 'font scale size legibility' },
  { id: 'ticket-layout', label: 'Ticket layout', description: 'Standard or Compact ticket density', group: 'display', groupLabel: 'Display', path: `${KDS_SETTINGS_GROUP.display}#ticket-layout`, keywords: 'compact standard ticket card layout density' },
  { id: 'status-colors', label: 'Status colors', description: 'Ticket aging color thresholds', group: 'display', groupLabel: 'Display', path: `${KDS_SETTINGS_GROUP.display}#status-colors`, keywords: 'aging colors thresholds time' },
  { id: 'order-type-colors', label: 'Order type colors', description: 'Header colors per order type', group: 'display', groupLabel: 'Display', path: `${KDS_SETTINGS_GROUP.display}#order-type-colors`, keywords: 'order type colors header dine in take out delivery banquet' },
  { id: 'enable-badge', label: 'Enable badge', description: 'Sidebar icon count badge', group: 'display', groupLabel: 'Display', path: `${KDS_SETTINGS_GROUP.display}#enable-badge`, keywords: 'badge sidebar icon count notification' },
  { id: 'ticket-identifier', label: 'Ticket Identifier', description: 'Order number or guest name', group: 'display', groupLabel: 'Display', path: `${KDS_SETTINGS_GROUP.display}#ticket-identifier`, keywords: 'ticket identifier order number guest name primary card label' },
  { id: 'mode-switcher', label: 'Mode switcher', description: 'Standard, Expo, or Station mode', group: 'display', groupLabel: 'Display', path: `${KDS_SETTINGS_GROUP.display}#mode-switcher`, keywords: 'mode switcher kds standard expo station prep operational' },
  { id: 'theme', label: 'Theme', description: 'Light or dark mode', group: 'display', groupLabel: 'Display', path: `${KDS_SETTINGS_GROUP.display}#theme`, keywords: 'light dark theme appearance' },
  { id: 'language', label: 'Language', description: 'Display language selection', group: 'display', groupLabel: 'Display', path: `${KDS_SETTINGS_GROUP.display}#language`, keywords: 'region locale i18n language translation' },

  // Orders
  { id: 'category-filter', label: 'Category filter', description: 'Show only selected categories', group: 'orders', groupLabel: 'Tickets', path: `${KDS_SETTINGS_GROUP.orders}#category-filter`, keywords: 'category filter products' },
  { id: 'revenue-center', label: 'Revenue center filter', description: 'Filter by station or revenue center', group: 'orders', groupLabel: 'Tickets', path: `${KDS_SETTINGS_GROUP.orders}#revenue-center`, keywords: 'station revenue center filter' },
  { id: 'stagger-mode', label: 'Stagger mode', description: 'Release orders in batches', group: 'orders', groupLabel: 'Tickets', path: `${KDS_SETTINGS_GROUP.orders}#stagger-mode`, keywords: 'stagger pacing batch release queue' },
  { id: 'servable-modifiers', label: 'Servable modifiers', description: 'Track modifier preparation status', group: 'orders', groupLabel: 'Tickets', path: `${KDS_SETTINGS_GROUP.orders}#servable-modifiers`, keywords: 'modifiers servable status tracking' },
  { id: 'allergen-badges', label: 'Allergen badges', description: 'Show allergen chips on tickets', group: 'orders', groupLabel: 'Tickets', path: `${KDS_SETTINGS_GROUP.orders}#allergen-badges`, keywords: 'allergen badges chips warnings' },
  { id: 'sort-default', label: 'Default sort', description: 'Sort tickets by Time, Table, or Type', group: 'orders', groupLabel: 'Tickets', path: `${KDS_SETTINGS_GROUP.orders}#sort-default`, keywords: 'sort order time table type default' },

  // Expo
  { id: 'expo-send-button', label: 'Show send button', description: 'Always or only when ready', group: 'expo', groupLabel: 'Expo view', path: `${KDS_SETTINGS_GROUP.expo}#expo-send-button`, keywords: 'expo send button ready always' },

  // Hardware
  { id: 'kot-printer', label: 'KOT printer', description: 'Kitchen ticket printer assignment', group: 'hardware', groupLabel: 'Hardware', path: `${KDS_SETTINGS_GROUP.hardware}#kot-printer`, keywords: 'printer kot kitchen ticket' },
  { id: 'label-printer', label: 'Label printer', description: 'Per-product label printer assignment', group: 'hardware', groupLabel: 'Hardware', path: `${KDS_SETTINGS_GROUP.hardware}#label-printer`, keywords: 'printer label sticker' },
  { id: 'sound-settings', label: 'Sound settings', description: 'Volume and notification alerts', group: 'hardware', groupLabel: 'Hardware', path: `${KDS_SETTINGS_GROUP.hardware}#sound-settings`, keywords: 'sound volume audio alert beep' },
  { id: 'sync', label: 'Sync', description: 'Force sync of orders and settings', group: 'hardware', groupLabel: 'Hardware', path: `${KDS_SETTINGS_GROUP.hardware}#sync`, keywords: 'sync refresh orders settings cloud' },
  { id: 'connection', label: 'Connection', description: 'Network and EdgeOS sync', group: 'hardware', groupLabel: 'Hardware', path: `${KDS_SETTINGS_GROUP.hardware}#connection`, keywords: 'connection network websocket sync edgeos' },

  // System
  { id: 'ai-integration', label: 'AI Integration', description: 'External AI provider with your own API key', group: 'system', groupLabel: 'System', path: `${KDS_SETTINGS_GROUP.system}#ai-integration`, keywords: 'ai integration settings openai chatgpt gemini google maya api key provider external' },
  { id: 'ai-instructions', label: 'AI Instructions', description: 'Rules, custom instructions & restaurant knowledge base', group: 'system', groupLabel: 'System', path: KDS_SETTINGS_SYSTEM_AI_INSTRUCTIONS, keywords: 'ai instructions rules dos donts custom prompt system prompt knowledge base restaurant type' },

  // Account
  { id: 'device-name', label: 'Device name', description: 'Identifier for this Kitchen Display', group: 'account', groupLabel: 'Account', path: `${KDS_SETTINGS_GROUP.account}#device-name`, keywords: 'device name identifier kds station' },
  { id: 'station-id', label: 'Station ID', description: 'Unique station identifier', group: 'account', groupLabel: 'Account', path: `${KDS_SETTINGS_GROUP.account}#station-id`, keywords: 'station id identifier' },
  { id: 'bug-reporting', label: 'Bug reporting', description: 'In-app issue capture', group: 'account', groupLabel: 'Account', path: `${KDS_SETTINGS_GROUP.account}#bug-reporting`, keywords: 'bug report crash issue in-app' },
  { id: 'debug-mode', label: 'Debug mode', description: 'Verbose logging and dev selector', group: 'account', groupLabel: 'Account', path: `${KDS_SETTINGS_GROUP.account}#debug-mode`, keywords: 'debug developer dev mode verbose logging' },
  { id: 'upload-logs', label: 'Upload logs', description: 'Send logs to support', group: 'account', groupLabel: 'Account', path: `${KDS_SETTINGS_GROUP.account}#upload-logs`, keywords: 'upload logs diagnostics support eatos' },
  { id: 'feedback-support', label: 'Feedback & support', description: 'Request a feature or contact support', group: 'account', groupLabel: 'Account', path: `${KDS_SETTINGS_GROUP.account}#feedback-support`, keywords: 'feedback support feature request help' },
  { id: 'log-out', label: 'Log out', description: 'Sign out of this device', group: 'account', groupLabel: 'Account', path: `${KDS_SETTINGS_GROUP.account}#log-out`, keywords: 'logout sign out exit' },
];

export function searchSettings(query: string): SettingsSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SETTINGS_SEARCH_INDEX.filter((e) => {
    const hay = `${e.label} ${e.description} ${e.keywords} ${e.groupLabel}`.toLowerCase();
    return hay.includes(q);
  });
}
