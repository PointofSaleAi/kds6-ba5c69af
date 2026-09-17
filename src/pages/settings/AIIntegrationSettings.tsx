import { useEffect, useState } from 'react';
import { ShieldCheck, Info, Check, ChevronLeft, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SwitchToggle, useHashHighlight } from '@/components/settings/SettingsControls';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { AI_STORAGE_KEYS as STORAGE_KEYS, emitAIIntegrationChange } from '@/hooks/use-ai-integration';
import { useLanguage } from '@/hooks/use-language';

type ConnectionStatus = 'not_configured' | 'connected' | 'invalid_key' | 'error';

interface ProviderOption {
  id: string;
  name: string;
}

// Manufacturer default: Maya is the only selectable provider.
const PROVIDERS: ProviderOption[] = [
  { id: 'maya', name: 'Maya' },
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
  const navigate = useNavigate();
  const { tui } = useLanguage();
  const hash = useHashHighlight();
  const [enabled, setEnabled] = useState(true);
  const [provider, setProvider] = useState<string>('maya');
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEnabled(loadPref(STORAGE_KEYS.enabled, 'true') === 'true');
    setProvider(loadPref(STORAGE_KEYS.provider, 'maya'));
    setStatus(loadPref(STORAGE_KEYS.status, 'connected') as ConnectionStatus);
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
      toast.error(tui('Please select a provider'));
      return;
    }
    setIsSaving(true);
    try {
      const nextStatus: ConnectionStatus = 'connected';
      setStatus(nextStatus);
      persist(STORAGE_KEYS.enabled, String(enabled));
      persist(STORAGE_KEYS.provider, provider);
      persist(STORAGE_KEYS.status, nextStatus);
      toast.success(tui('AI integration settings saved'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    setEnabled(true);
    setProvider('maya');
    setStatus('connected');
    emitAIIntegrationChange();
    toast.success(tui('AI integration reset to default'));
  };


  const statusLabels: Record<ConnectionStatus, string> = {
    not_configured: tui('Not Configured'),
    connected: tui('Connected'),
    invalid_key: tui('Invalid Key'),
    error: tui('Error'),
  };
  const statusStyle = STATUS_LABEL[status];

  return (
    <>
      <div className="flex items-center justify-between pt-0 pb-4 mb-2 relative">
        <button
          type="button"
          onClick={() => navigate('/kds/v1/settings/system')}
          className="w-10 h-10 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
          style={{ background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border))' }}
          aria-label={tui('Back')}
        >
          <ChevronLeft size={20} style={{ color: 'hsl(var(--text-primary))' }} />
        </button>
        <h1
          className="absolute left-1/2 -translate-x-1/2"
          style={{ color: 'hsl(var(--text-primary))', fontSize: 20, fontWeight: 600 }}
        >
          {tui('AI Integration')}
        </h1>
      </div>

      <SettingsPill
        icon={Sparkles}
        iconColor="#7C3AED"
        label={tui('Enable AI Integration')}
        helper={tui('Maya powers all AI-powered features across the platform when enabled.')}
        right={<SwitchToggle checked={enabled} onChange={handleToggleEnabled} />}
        highlighted={hash === 'ai-enabled'}
      />


      {/* Connection Status */}
      <div
        className="mb-3 rounded-[28px] px-4 py-3 flex items-center justify-between"
        style={{
          background: 'hsl(var(--surface-card))',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <span className="text-[15px] font-semibold" style={{ color: 'hsl(var(--text-primary))' }}>
          {tui('Status')}
        </span>
        <span className="text-sm font-semibold" style={{ color: statusStyle.color }}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Provider Selection */}
      <div
        className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-wide"
        style={{ color: 'hsl(var(--text-muted))' }}
      >
        {tui('AI Provider')}
      </div>
      <div
        id="ai-provider"
        className={`mb-3 rounded-[28px] overflow-hidden ${hash === 'ai-provider' ? 'ring-2 ring-[hsl(var(--btn-seen))]' : ''}`}
        style={{
          background: 'hsl(var(--surface-card))',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <div className="w-full flex items-center justify-between px-4 py-3">
          <span className="text-[15px] font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
            Maya
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: '#16A085' }} />
            <span className="text-[13px] font-semibold" style={{ color: '#16A085' }}>{tui('Active')}</span>
          </div>
        </div>
      </div>

      {/* API Key managed server-side note */}
      {provider && (
        <>
          <div
            className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-wide"
            style={{ color: 'hsl(var(--text-muted))' }}
          >
            {tui('API Key')}
          </div>
          <div
            id="ai-api-key"
            className={`mb-3 rounded-[28px] p-4 flex gap-3 ${hash === 'ai-api-key' ? 'ring-2 ring-[hsl(var(--btn-seen))]' : ''}`}
            style={{
              background: 'hsl(var(--surface-card))',
              border: '1px solid hsl(var(--border))',
            }}
          >
            <ShieldCheck size={20} className="shrink-0 mt-0.5" style={{ color: '#16A085' }} />
            <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>
              {tui('For security, provider API keys are configured server-side as a project secret (<key/>). Ask your workspace admin to set or rotate the key. Keys are never stored in the database or sent to the browser.').split('<key/>').map((part, i, arr) => (
                <span key={i}>{part}{i < arr.length - 1 && <span className="font-mono">EXTERNAL_AI_API_KEY</span>}</span>
              ))}
            </p>
          </div>
        </>
      )}


      {/* Actions */}
      {provider && (
        <div className="flex gap-3 mb-2">
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
            {isSaving ? tui('Saving...') : tui('Save')}
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
            {tui('Reset')}
          </button>
        </div>
      )}

      {/* Info Note */}
      <div className="rounded-2xl px-4 py-2 flex gap-3 mb-4">
        <Info size={18} className="shrink-0 mt-0.5" style={{ color: 'hsl(var(--btn-seen))' }} />
        <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--text-muted))' }}>
          {tui('All AI usage is billed directly to your own provider account. This does not use platform credits. Only Admin, Owner, or Manager roles can configure this integration.')}
        </p>
      </div>

      {/* AI Behavior */}
      <div
        className="px-3 pt-2 pb-1.5 text-[11px] font-semibold tracking-wide"
        style={{ color: 'hsl(var(--text-muted))' }}
      >
        {tui('AI Behavior')}
      </div>
      <div className="mb-6 rounded-[28px] overflow-hidden" style={{ background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border))' }}>
        <button
          type="button"
          onClick={() => navigate('/kds/v1/settings/system/ai-integration/ai-instructions')}
          className="flex items-center justify-between w-full py-3.5 px-4 active:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(124, 58, 237, 0.15)' }}
            >
              <BookOpen size={16} style={{ color: '#7C3AED' }} />
            </div>
            <div className="text-left">
              <span className="block text-[15px] font-medium" style={{ color: 'hsl(var(--text-primary))' }}>
                {tui('AI Instructions')}
              </span>
              <span className="text-[12px]" style={{ color: 'hsl(var(--text-muted))' }}>
                {tui('Rules, custom instructions & knowledge base')}
              </span>
            </div>
          </div>
          <ChevronRight size={18} style={{ color: 'hsl(var(--text-muted))' }} />
        </button>
      </div>


    </>
  );
}
