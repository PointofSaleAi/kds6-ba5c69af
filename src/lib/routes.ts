/**
 * Centralized KDS route constants. Update `KDS_ROOT` (or version) here when
 * routes are renamed and every deep link/navigation call updates automatically.
 */

const KDS_PREFIX = '/kds';

// The primary/latest KDS home route. Bump this when a new version is promoted.
export const KDS_ROOT = `${KDS_PREFIX}/v6` as const;

// Alternate top-level KDS entry points.
export const KDS_DEFAULT = `${KDS_PREFIX}/default` as const;
export const KDS_ONLINE_ORDERING = `${KDS_PREFIX}/home-onlineordering` as const;

// Versioned card variants (kept individually so <Route path=""> stays literal).
export const KDS_V2 = `${KDS_PREFIX}/v2` as const;
export const KDS_V3 = `${KDS_PREFIX}/v3` as const;
export const KDS_V4 = `${KDS_PREFIX}/v4` as const;
export const KDS_V5 = `${KDS_PREFIX}/v5` as const;
export const KDS_V6 = `${KDS_PREFIX}/v6` as const;

// Settings live under the primary KDS root.
export const KDS_SETTINGS = `${KDS_ROOT}/settings` as const;

export const KDS_SETTINGS_GROUP = {
  display: `${KDS_SETTINGS}/display`,
  orders: `${KDS_SETTINGS}/orders`,
  expo: `${KDS_SETTINGS}/expo`,
  hardware: `${KDS_SETTINGS}/hardware`,
  system: `${KDS_SETTINGS}/system`,
  account: `${KDS_SETTINGS}/account`,
} as const;

export const KDS_SETTINGS_SYSTEM_AI_INTEGRATION =
  `${KDS_SETTINGS_GROUP.system}/ai-integration` as const;
export const KDS_SETTINGS_SYSTEM_AI_INSTRUCTIONS =
  `${KDS_SETTINGS_SYSTEM_AI_INTEGRATION}/ai-instructions` as const;

// Non-KDS routes referenced across the app.
export const KDS_REPLY = '/kds-reply' as const;

/** Build a deep link under the primary KDS root. */
export const kdsPath = (suffix = '') =>
  suffix ? `${KDS_ROOT}${suffix.startsWith('/') || suffix.startsWith('?') || suffix.startsWith('#') ? '' : '/'}${suffix}` : KDS_ROOT;
