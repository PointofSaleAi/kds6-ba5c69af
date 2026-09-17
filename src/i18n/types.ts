import type { LanguageCode } from '@/hooks/use-language';

/**
 * Interface phrase dictionary. Keys are the exact English phrase used in the
 * UI, so any missing translation falls back to readable English instead of a
 * blank label. English locales intentionally have no entries.
 */
export type UiDict = Partial<Record<LanguageCode, Record<string, string>>>;
