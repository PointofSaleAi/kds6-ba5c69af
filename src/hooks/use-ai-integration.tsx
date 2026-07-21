import { useEffect, useState } from 'react';

export type AIProviderId = 'posai' | 'openai' | 'claude' | 'google' | 'maya' | '';
export type AIConnectionStatus = 'not_configured' | 'connected' | 'invalid_key' | 'error';

export const AI_STORAGE_KEYS = {
  enabled: 'kds.ai_integration.enabled',
  provider: 'kds.ai_integration.provider',
  status: 'kds.ai_integration.status',
  model: 'kds.ai_integration.model',
} as const;

export const AI_PROVIDER_LABELS: Record<Exclude<AIProviderId, ''>, string> = {
  posai: 'POS AI',
  openai: 'OpenAI (ChatGPT)',
  claude: 'Anthropic Claude',
  google: 'Google Gemini',
  maya: 'Maya',
};

export const AI_PROVIDER_SHORT_LABELS: Record<Exclude<AIProviderId, ''>, string> = {
  posai: 'POS AI',
  openai: 'ChatGPT',
  claude: 'Claude',
  google: 'Gemini',
  maya: 'Maya',
};

export interface AIModelOption {
  id: string;
  name: string;
  description: string;
}

export const AI_PROVIDER_MODEL_OPTIONS: Record<Exclude<AIProviderId, ''>, AIModelOption[]> = {
  posai: [
    { id: 'posai-pro', name: 'POS AI Pro', description: 'Most capable' },
    { id: 'posai-lite', name: 'POS AI Lite', description: 'Fast & efficient' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable' },
    { id: 'gpt-4o-mini', name: 'Gpt-4o Mini', description: 'Fast & efficient' },
    { id: 'gpt-3.5', name: 'GPT-3.5', description: 'Legacy model' },
  ],
  claude: [
    { id: 'sonnet-4', name: 'Sonnet 4', description: 'Most capable' },
    { id: 'haiku-4', name: 'Haiku 4', description: 'Fast & efficient' },
    { id: 'opus-3', name: 'Opus 3', description: 'Legacy model' },
  ],
  google: [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast & efficient' },
  ],
  maya: [
    { id: 'maya-1', name: 'Maya Pro', description: 'Most capable' },
    { id: 'maya-mini', name: 'Maya Mini', description: 'Fast & efficient' },
    { id: 'maya-lite', name: 'Maya Lite', description: 'Legacy model' },
  ],
};

export const AI_PROVIDER_MODELS: Record<Exclude<AIProviderId, ''>, string> = {
  posai: 'POS AI Pro',
  openai: 'GPT-4o',
  claude: 'Sonnet 4',
  google: 'Gemini 2.5 Pro',
  maya: 'Maya Pro',
};

export interface AIIntegrationState {
  enabled: boolean;
  provider: AIProviderId;
  status: AIConnectionStatus;
  model: string;
}

// Manufacturer defaults: AI integration ON, provider hardcoded to Maya.
const DEFAULT_ENABLED = true;
const DEFAULT_PROVIDER: AIProviderId = 'maya';
const DEFAULT_STATUS: AIConnectionStatus = 'connected';
const DEFAULT_MODEL = AI_PROVIDER_MODELS.maya;

function read(): AIIntegrationState {
  if (typeof window === 'undefined') {
    return { enabled: DEFAULT_ENABLED, provider: DEFAULT_PROVIDER, status: DEFAULT_STATUS, model: DEFAULT_MODEL };
  }
  const rawEnabled = window.localStorage.getItem(AI_STORAGE_KEYS.enabled);
  const rawProvider = window.localStorage.getItem(AI_STORAGE_KEYS.provider);
  const rawStatus = window.localStorage.getItem(AI_STORAGE_KEYS.status);
  const rawModel = window.localStorage.getItem(AI_STORAGE_KEYS.model);
  return {
    enabled: rawEnabled === null ? DEFAULT_ENABLED : rawEnabled === 'true',
    provider: (rawProvider ?? DEFAULT_PROVIDER) as AIProviderId,
    status: (rawStatus ?? DEFAULT_STATUS) as AIConnectionStatus,
    model: rawModel ?? DEFAULT_MODEL,
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
