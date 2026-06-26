import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, ChevronUp, Check, Sparkles, Zap } from 'lucide-react';
import {
  AI_PROVIDER_SHORT_LABELS,
  AI_PROVIDER_MODEL_OPTIONS,
  AI_STORAGE_KEYS,
  emitAIIntegrationChange,
  type AIProviderId,
} from '@/hooks/use-ai-integration';

type ProviderMeta = {
  id: Exclude<AIProviderId, ''>;
  icon: typeof Bot;
  color: string;
  bg: string;
};

const PROVIDERS: ProviderMeta[] = [
  { id: 'posai', icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/15' },
  { id: 'openai', icon: Bot, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { id: 'claude', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  { id: 'google', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/15' },
  { id: 'maya', icon: Bot, color: 'text-pink-400', bg: 'bg-pink-500/15' },
];

interface Props {
  provider: AIProviderId;
  model: string;
}

export function AIProviderSwitcher({ provider, model }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeProvider: Exclude<AIProviderId, ''> =
    (provider ? provider : 'openai') as Exclude<AIProviderId, ''>;
  const activeMeta = PROVIDERS.find(p => p.id === activeProvider) ?? PROVIDERS[1];
  const ActiveIcon = activeMeta.icon;
  const modelOptions = AI_PROVIDER_MODEL_OPTIONS[activeProvider] ?? [];
  const activeModel =
    model || modelOptions[0]?.name || '';

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selectProvider = (id: Exclude<AIProviderId, ''>) => {
    window.localStorage.setItem(AI_STORAGE_KEYS.provider, id);
    const firstModel = AI_PROVIDER_MODEL_OPTIONS[id]?.[0]?.name ?? '';
    window.localStorage.setItem(AI_STORAGE_KEYS.model, firstModel);
    emitAIIntegrationChange();
  };

  const selectModel = (name: string) => {
    window.localStorage.setItem(AI_STORAGE_KEYS.model, name);
    emitAIIntegrationChange();
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-neutral-800/70 hover:bg-neutral-700/70 active:opacity-70 transition-all border border-neutral-700/50 whitespace-nowrap"
      >
        <span className={`w-7 h-7 rounded-full ${activeMeta.bg} flex items-center justify-center shrink-0`}>
          <ActiveIcon className={`w-4 h-4 ${activeMeta.color}`} />
        </span>
        <span className="text-sm font-semibold text-white leading-none">
          {AI_PROVIDER_SHORT_LABELS[activeProvider]}
        </span>
        {activeModel && (
          <span className="text-xs text-neutral-400 leading-none">· {activeModel}</span>
        )}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[300px] rounded-2xl border border-neutral-700/60 bg-[#131316] shadow-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-2 text-[11px] font-semibold tracking-widest text-neutral-500">
            AI PROVIDER
          </div>
          <div className="px-2 pb-2">
            {PROVIDERS.map(p => {
              const Icon = p.icon;
              const isActive = p.id === activeProvider;
              const count = AI_PROVIDER_MODEL_OPTIONS[p.id].length;
              return (
                <button
                  key={p.id}
                  onClick={() => selectProvider(p.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-neutral-800/80' : 'hover:bg-neutral-800/50'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-lg ${p.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${p.color}`} />
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {AI_PROVIDER_SHORT_LABELS[p.id]}
                  </span>
                  <span className="text-xs text-neutral-400">{count} models</span>
                  {isActive && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-neutral-800/80 px-4 pt-3 pb-2 text-[11px] font-semibold tracking-widest text-neutral-500">
            MODEL
          </div>
          <div className="px-2 pb-3">
            {modelOptions.map(m => {
              const isActive = m.name === activeModel;
              return (
                <button
                  key={m.id}
                  onClick={() => selectModel(m.name)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-neutral-800/80' : 'hover:bg-neutral-800/50'
                  }`}
                >
                  <span className="text-sm font-semibold text-white">{m.name}</span>
                  <span className="text-xs text-neutral-400">{m.description}</span>
                  {isActive && (
                    <Check className="ml-auto w-4 h-4 text-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
