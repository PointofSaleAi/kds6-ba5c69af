import { useEffect, useState } from 'react';

export type AIProviderId = 'openai' | 'google' | 'maya' | '';
export type AIConnectionStatus = 'not_configured' | 'connected' | 'invalid_key' | 'error';

export const AI_STORAGE_KEYS = {
  enabled: 'kds.ai_integration.enabled',
  provider: 'kds.ai_integration.provider',
  status: 'kds.ai_integration.status',
} as const;

export const AI_PROVIDER_LABELS: Record<Exclude<AIProviderId, ''>, string> = {
  openai: 'OpenAI (ChatGPT)',
  google: 'Google Gemini',
  maya: 'Maya AI',
};

export interface AIIntegrationState {
  enabled: boolean;
  provider: AIProviderId;
  status: AIConnectionStatus;
}

function read(): AIIntegrationState {
  if (typeof window === 'undefined') {
    return { enabled: false, provider: '', status: 'not_configured' };
  }
  return {
    enabled: window.localStorage.getItem(AI_STORAGE_KEYS.enabled) === 'true',
    provider: (window.localStorage.getItem(AI_STORAGE_KEYS.provider) ?? '') as AIProviderId,
    status: (window.localStorage.getItem(AI_STORAGE_KEYS.status) ?? 'not_configured') as AIConnectionStatus,
  };
}

const EVENT = 'kds:ai-integration-changed';

export function emitAIIntegrationChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function useAIIntegration(): AIIntegrationState {
  const [state, setState] = useState<AIIntegrationState>(() => read());

  useEffect(() => {
    const sync = () => setState(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return state;
}
