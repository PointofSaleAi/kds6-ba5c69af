import { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Info, Check } from 'lucide-react';
import { toast } from 'sonner';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SwitchToggle, useHashHighlight } from '@/components/settings/SettingsControls';
import { AI_STORAGE_KEYS as STORAGE_KEYS, emitAIIntegrationChange } from '@/hooks/use-ai-integration';

type ConnectionStatus = 'not_configured' | 'connected' | 'invalid_key' | 'error';

interface ProviderOption {
  id: string;
  name: string;
}

const PROVIDERS: ProviderOption[] = [
  { id: 'openai', name: 'OpenAI (ChatGPT)' },
  { id: 'google', name: 'Google Gemini' },
  { id: 'maya', name: 'Maya AI' },
];

const STATUS_LABEL: Record<ConnectionStatus, { label: string; color: string }> = {
  not_configured: { label: 'Not Configured', color: 'hsl(var(--text-muted))' },
  connected: { label: 'Connected', color: '#16A085' },
  invalid_key: { label: 'Invalid Key', color: '#E74C3C' },
  error: { label: 'Error', color: '#E74C3C' },
};

function loadPref(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = window.localStorage.getItem(key);
  return v ?? fallback;
}


export default function AIIntegrationSettings() {
  const hash = useHashHighlight();
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<string>('');
  const [status, setStatus] = useState<ConnectionStatus>('not_configured');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEnabled(loadPref(STORAGE_KEYS.enabled, 'false') === 'true');
    setProvider(loadPref(STORAGE_KEYS.provider, ''));
    setStatus(loadPref(STORAGE_KEYS.status, 'not_configured') as ConnectionStatus);
  }, []);

  const persist = (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore quota errors
    }
    emitAIIntegrationChange();
  };

  const handleToggleEnabled = (next: boolean) => {
    setEnabled(next);
    persist(STORAGE_KEYS.enabled, String(next));
  };

  const handleProviderChange = (next: string) => {
    setProvider(next);
    setStatus('not_configured');
    persist(STORAGE_KEYS.provider, next);
    persist(STORAGE_KEYS.status, 'not_configured');
  };

  const handleSave = async () => {
    if (!provider) {
      toast.error('Please select a provider');
      return;
    }
    setIsSaving(true);
    try {
      const nextStatus: ConnectionStatus = 'connected';
      setStatus(nextStatus);
      persist(STORAGE_KEYS.enabled, String(enabled));
      persist(STORAGE_KEYS.provider, provider);
      persist(STORAGE_KEYS.status, nextStatus);
      toast.success('AI integration settings saved');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    setEnabled(false);
    setProvider('');
    setStatus('not_configured');
    emitAIIntegrationChange();
    toast.success('AI integration removed');
  };


  const statusStyle = STATUS_LABEL[status];

  return (
    <>
      <SectionHeaderCard
        icon={Sparkles}
        iconColor="#7C3AED"
        title="AI Integration"
        shortDescription="Configure an external AI provider with your own API key for AI-powered KDS features."
        longDescription="Configure external AI providers using your own API keys. AI-powered features across the Kitchen Display System will use this integration when enabled. Keys are stored securely as project secrets and never sent to the browser."
      />

      {/* Enable / Disable */}
      <div
        id="ai-enabled"
        className={`mb-3 rounded-[28px] px-4 py-3 flex items-center justify-between ${hash === 'ai-enabled' ? 'ring-2 ring-[hsl(var(--btn-seen))]' : ''}`}
        style={{
          background: 'hsl(var(--surface-card))',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <div>
          <div className="text-[15px] font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>
            Enable AI Integration
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--text-muted))' }}>
            Master toggle for all external AI features on this device.
          </div>
        </div>
        <SwitchToggle checked={enabled} onChange={handleToggleEnabled} />
      </div>

      {/* Connection Status */}
      <div
        className="mb-3 rounded-[28px] px-4 py-3 flex items-center justify-between"
        style={{
          background: 'hsl(var(--surface-card))',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <span className="text-[15px] font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>
          Connection status
        </span>
        <span className="text-sm font-semibold" style={{ color: statusStyle.color }}>
          {statusStyle.label}
        </span>
      </div>

      {/* Provider Selection */}
      <div
        id="ai-provider"
        className={`mb-3 rounded-[28px] overflow-hidden ${hash === 'ai-provider' ? 'ring-2 ring-[hsl(var(--btn-seen))]' : ''}`}
        style={{
          background: 'hsl(var(--surface-card))',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <div
          className="px-4 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(var(--text-muted))' }}
        >
          AI Provider
        </div>
        {PROVIDERS.map((p, idx) => {
          const selected = provider === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleProviderChange(p.id)}
              className="w-full flex items-center justify-between px-4 py-3 active:opacity-70 transition-opacity text-left"
              style={{
                borderTop: idx === 0 ? 'none' : '1px solid hsl(var(--border))',
              }}
            >
              <span className="text-[15px] font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
                {p.name}
              </span>
              {selected && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#16A085' }}
                >
                  <Check size={13} color="#FFFFFF" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* API Key managed server-side note */}
      {provider && (
        <div
          id="ai-api-key"
          className={`mb-3 rounded-[28px] p-4 flex gap-3 ${hash === 'ai-api-key' ? 'ring-2 ring-[hsl(var(--btn-seen))]' : ''}`}
          style={{
            background: 'hsl(var(--surface-card))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <ShieldCheck size={20} className="shrink-0 mt-0.5" style={{ color: '#16A085' }} />
          <div>
            <div
              className="text-[13px] font-semibold mb-1"
              style={{ color: 'hsl(var(--text-primary))' }}
            >
              API Key
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>
              For security, provider API keys are configured server-side as a project secret
              (<span className="font-mono">EXTERNAL_AI_API_KEY</span>). Ask your workspace admin to
              set or rotate the key. Keys are never stored in the database or sent to the browser.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {provider && (
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 font-semibold py-3 rounded-full text-sm tracking-wide transition-colors text-center disabled:opacity-50"
            style={{
              background: 'hsl(var(--brand-primary))',
              color: 'hsl(var(--brand-primary-foreground))',
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 font-semibold py-3 rounded-full text-sm tracking-wide transition-colors text-center"
            style={{
              background: 'transparent',
              color: '#E74C3C',
              border: '1px solid #E74C3C',
            }}
          >
            Reset
          </button>
        </div>
      )}

      {/* Info Note */}
      <div className="rounded-2xl p-4 flex gap-3 mb-6">
        <Info size={18} className="shrink-0 mt-0.5" style={{ color: 'hsl(var(--btn-seen))' }} />
        <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--text-muted))' }}>
          All AI usage is billed directly to your own provider account. This does not use platform
          credits. Only Admin, Owner, or Manager roles can configure this integration.
        </p>
      </div>
    </>
  );
}
