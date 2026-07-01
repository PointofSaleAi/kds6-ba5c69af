import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, ChevronUp, Check } from 'lucide-react';
import {
  AI_PROVIDER_SHORT_LABELS,
  AI_PROVIDER_MODEL_OPTIONS,
  AI_STORAGE_KEYS,
  emitAIIntegrationChange,
  type AIProviderId,
} from '@/hooks/use-ai-integration';

interface Props {
  provider: AIProviderId;
  model: string;
}

export function AIProviderSwitcher({ provider, model }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeProvider: Exclude<AIProviderId, ''> = 'maya';
  const modelOptions = AI_PROVIDER_MODEL_OPTIONS[activeProvider] ?? [];
  const activeModel = model || modelOptions[0]?.name || '';

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

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
        <span className="w-7 h-7 rounded-full bg-pink-500/15 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-pink-400" />
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
