import { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Settings, Bot, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import AnimatedAIIcon from './AnimatedAIIcon';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { getOverlayInsets } from '@/lib/dock-insets';
import { useAIIntegration, AI_PROVIDER_LABELS } from '@/hooks/use-ai-integration';
import { cn } from '@/lib/utils';

interface AIAssistantPanelProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTION_CHIPS = [
  'Prioritize an 18-min ticket',
  'Explain SEEN → IN PROGRESS → SERVED',
  'Order type header colors',
  'Handle shellfish allergen',
];

const TRY_EXAMPLES = [
  '"How many tickets are overtime?"',
  '"What stations are busiest right now?"',
  '"Mark ticket 1024 as served"',
  '"Show me all dine-in tickets"',
];

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kds-ai-chat`;

export function AIAssistantPanel({ open, onClose }: AIAssistantPanelProps) {
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const { layout } = useDockLayout();
  const insets = getOverlayInsets(layout);
  const ai = useAIIntegration();
  const navigate = useNavigate();
  const providerReady = ai.enabled && !!ai.provider && ai.status === 'connected';
  const providerLabel = ai.provider ? AI_PROVIDER_LABELS[ai.provider] : 'Not configured';
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const toggleRecording = () => setRecording(r => !r);

  const openAISettings = () => {
    onClose();
    navigate('/kds/full/settings/system/ai-integration');
  };

  const submitPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || streaming) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    const assistantId = `a-${Date.now()}`;
    const nextHistory = [...messages, userMsg];

    if (!providerReady) {
      const reason = !ai.enabled
        ? 'AI integration is turned off. Enable it in Settings → System → AI Integration to start chatting.'
        : !ai.provider
          ? 'No AI provider is selected. Pick one in Settings → System → AI Integration.'
          : `${providerLabel} is not connected (status: ${ai.status.replace('_', ' ')}). Save the provider in Settings → System → AI Integration to connect.`;
      setMessages([...nextHistory, { id: assistantId, role: 'assistant', text: reason }]);
      setInput('');
      return;
    }

    setMessages([...nextHistory, { id: assistantId, role: 'assistant', text: '' }]);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: ai.provider,
          messages: nextHistory.map(m => ({ role: m.role, content: m.text })),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let errMsg = 'Assistant is unavailable. Please try again.';
        try {
          const data = await res.json();
          if (data?.error) errMsg = data.error;
        } catch {}
        setMessages(m => m.map(msg => msg.id === assistantId ? { ...msg, text: errMsg } : msg));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let acc = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              acc += delta;
              setMessages(m => m.map(msg => msg.id === assistantId ? { ...msg, text: acc } : msg));
            }
          } catch {}
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(m => m.map(msg => msg.id === assistantId
          ? { ...msg, text: 'Connection error. Please try again.' }
          : msg));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitPrompt(input);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bg-black/40 z-40"
            style={{ left: insets.left, right: insets.right, top: insets.top, bottom: insets.bottom }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed z-50 w-[380px] max-w-[95vw] p-[10px] pl-0"
            style={{ right: insets.right, top: insets.top, bottom: insets.bottom }}
          >
            <div
              className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-neutral-700/50 flex flex-col"
              style={{ background: '#131316' }}
            >
              {/* Header */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-800/60 flex items-center justify-between">
                <button
                  onClick={openAISettings}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-700/60 active:opacity-70 transition-all border border-neutral-700/40"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-sm font-medium text-white">Point of Sale Ai</span>
                  <span className="text-xs text-neutral-400">· {providerLabel}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={openAISettings}
                    className="w-10 h-10 rounded-full bg-neutral-800/60 hover:bg-neutral-700/60 flex items-center justify-center active:opacity-70 transition-opacity"
                    title="AI Settings"
                  >
                    <Settings className="w-4 h-4 text-neutral-300" />
                  </button>
                  <button
                    onClick={onClose}
                    aria-label="Close AI assistant"
                    className="w-10 h-10 rounded-full bg-neutral-800/60 hover:bg-neutral-700/60 flex items-center justify-center active:opacity-70 transition-opacity"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Not-ready notice */}
              {!providerReady && (
                <div className="flex-shrink-0 px-4 py-2 text-[11px] leading-snug border-b border-neutral-800/60 bg-amber-500/10 text-amber-300">
                  {!ai.enabled
                    ? 'AI integration is off. '
                    : !ai.provider
                      ? 'No provider selected. '
                      : `${providerLabel} is ${ai.status.replace('_', ' ')}. `}
                  <button onClick={openAISettings} className="underline font-semibold">
                    Open AI Integration
                  </button>
                </div>
              )}

              {/* Messages / Empty state */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
                {!hasMessages ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-2">
                    <div className="mb-4 overflow-visible">
                      <AnimatedAIIcon size={56} />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-1">
                      How can I help you today?
                    </h2>
                    <p className="text-neutral-400 text-sm mb-4 max-w-sm">
                      Ask about tickets, allergens, courses, or KDS settings.
                    </p>

                    <div className="flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-full bg-neutral-800/60 border border-neutral-700/40">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      <span className="text-xs text-neutral-400">Powered by</span>
                      <span className="text-xs font-medium text-white">{providerLabel}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                      {SUGGESTION_CHIPS.map(chip => (
                        <button
                          key={chip}
                          onClick={() => submitPrompt(chip)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-800/60 text-sm text-white hover:bg-neutral-700/60 active:opacity-70 transition-all border border-neutral-700/50"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                          {chip}
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 text-center">
                      <p className="text-xs text-neutral-400 mb-1.5">Try asking:</p>
                      <div className="space-y-1 text-xs text-neutral-500">
                        {TRY_EXAMPLES.map(e => <p key={e}>{e}</p>)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map(m => (
                      <div
                        key={m.id}
                        className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        {m.role === 'assistant' && (
                          <div className="flex-shrink-0 -ml-1 mt-0.5">
                            <AnimatedAIIcon size={24} />
                          </div>
                        )}
                        <div className="max-w-[85%]">
                          {m.text && (
                            <div
                              className={cn(
                                'rounded-2xl px-4 py-3 text-sm',
                                m.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-neutral-800/60 text-white'
                              )}
                            >
                              {m.role === 'assistant' ? (
                                <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-strong:text-white">
                                  <ReactMarkdown>{m.text}</ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">{m.text}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {streaming && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.text && (
                      <div className="flex gap-3 justify-start">
                        <div className="flex-shrink-0 -ml-1 mt-0.5">
                          <AnimatedAIIcon size={24} />
                        </div>
                        <div className="bg-neutral-800/60 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-[10px] text-neutral-400">{providerLabel}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-4 border-t border-neutral-800/60">
                <form
                  onSubmit={(e) => { e.preventDefault(); submitPrompt(input); }}
                  className="flex gap-3 items-center"
                >
                  <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={streaming}
                    aria-label={recording ? 'Stop recording' : 'Start voice input'}
                    aria-pressed={recording}
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0',
                      recording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-neutral-800/60 text-neutral-400 hover:bg-neutral-700/60 hover:text-white'
                    )}
                  >
                    {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={recording ? 'Listening...' : 'Ask me anything...'}
                      disabled={streaming}
                      className={cn(
                        'w-full bg-neutral-800/60 rounded-full px-5 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-60',
                        recording && 'ring-2 ring-red-500/50'
                      )}
                      readOnly={recording}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!input.trim() || streaming || recording}
                    aria-label="Send message"
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0',
                      input.trim() && !streaming && !recording
                        ? 'bg-primary text-primary-foreground active:opacity-70'
                        : 'bg-neutral-800/60 text-neutral-500'
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>

                {recording && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-red-400">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Listening... Speak your command
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
