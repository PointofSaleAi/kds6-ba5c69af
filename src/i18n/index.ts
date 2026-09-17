import type { LanguageCode } from '@/hooks/use-language';
import type { UiDict } from './types';
import { uiChrome } from './ui-chrome';
import { uiSettingsShell } from './ui-settings-shell';
import { uiSettingsScreens } from './ui-settings-screens';
import { uiAuth } from './ui-auth';
import { uiDialogs } from './ui-dialogs';

const MODULES: UiDict[] = [uiChrome, uiSettingsShell, uiSettingsScreens, uiAuth, uiDialogs];

/** Merged lookup table, built once per session. */
const MERGED: UiDict = MODULES.reduce<UiDict>((acc, mod) => {
  (Object.keys(mod) as LanguageCode[]).forEach((lang) => {
    acc[lang] = { ...(acc[lang] || {}), ...(mod[lang] || {}) };
  });
  return acc;
}, {});

/** Translates an interface phrase, falling back to the English source text. */
export function lookupUiLabel(lang: LanguageCode, text: string): string {
  if (!text) return text;
  const dict = MERGED[lang];
  if (!dict) return text;
  return dict[text] ?? text;
}

/** Fills `{name}` placeholders after translation so word order stays correct. */
export function fillUiVars(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}
