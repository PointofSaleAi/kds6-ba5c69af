import { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import AnimatedAIIcon from './AnimatedAIIcon';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { getOverlayInsets } from '@/lib/dock-insets';
import { useAIIntegration, AI_PROVIDER_LABELS } from '@/hooks/use-ai-integration';
import { Link } from 'react-router-dom';


interface AIAssistantPanelProps {
  open: boolean;
  onClose: () => void;
}

const TRY_PROMPTS = [
  'How should I prioritize an 18-minute-old ticket?',
  'Explain the SEEN → IN PROGRESS → SERVED flow',
  'What do the order type header colors mean?',
  'How do I handle a shellfish allergen on a ticket?',
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

  const submitPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || streaming) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    const assistantId = `a-${Date.now()}`;
    const nextHistory = [...messages, userMsg];
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
  const lastMsg = messages[messages.length - 1];
  const showThinking = streaming && lastMsg?.role === 'assistant' && lastMsg.text === '';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bg-brand-dark/30 z-40"
            style={{ left: insets.left, right: insets.right, top: insets.top, bottom: insets.bottom }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed w-[320px] bg-background shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ right: insets.right, top: insets.top, bottom: insets.bottom }}
          >
      <div
        className="flex items-center justify-between px-3 h-[44px] shrink-0"
        style={{ background: '#1A1A2E' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AnimatedAIIcon size={18} />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Point of Sale Ai</span>
            <span className="text-[12px] font-semibold text-white truncate">Kitchen assistant</span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI assistant"
          className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-background">
        {!hasMessages ? (
          <div className="px-4 py-5 flex flex-col items-center text-center">
            <div className="mb-3">
              <AnimatedAIIcon size={44} />
            </div>
            <h2 className="text-[16px] font-bold text-foreground mb-1">How can I help you?</h2>
            <p className="text-[12px] text-muted-foreground leading-snug mb-5 px-1">
              Ask me anything about tickets, allergens, courses, or KDS settings.
            </p>

            <div className="w-full text-left">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Try asking
              </div>
              <div className="flex flex-col gap-1.5">
                {TRY_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => submitPrompt(p)}
                    className="text-left px-3 py-2 rounded-lg bg-muted/60 hover:bg-muted active:scale-[0.98] text-[12px] font-medium text-foreground transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 py-3 flex flex-col gap-2">
            {messages.map(m => (
              m.role === 'user' ? (
                <div key={m.id} className="self-end max-w-[85%] px-3 py-2 rounded-2xl rounded-br-sm text-[12px] font-medium text-white" style={{ background: '#1A1A2E' }}>
                  {m.text}
                </div>
              ) : (
                <div key={m.id} className="self-start max-w-[90%] flex gap-1.5">
                  <div className="shrink-0 mt-0.5"><AnimatedAIIcon size={16} /></div>
                  <div className="flex flex-col gap-1 min-w-0">
                    {m.text ? (
                      <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-muted text-[12px] text-foreground prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-strong:text-foreground">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            ))}
            {showThinking && (
              <div className="self-start flex gap-1.5 items-center px-3 py-2">
                <AnimatedAIIcon size={16} />
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '120ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '240ms' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 bg-muted/40 border-t border-border px-2 py-2 flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={recording ? 'Listening...' : 'Ask me anything...'}
            disabled={streaming}
            className="w-full h-9 bg-background border border-border rounded-full pl-3 pr-10 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
          />
          <button
            onClick={toggleRecording}
            aria-label={recording ? 'Stop recording' : 'Start voice input'}
            aria-pressed={recording}
            className={`absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              recording
                ? 'text-white animate-pulse'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            style={recording ? { background: '#E84C3D' } : undefined}
          >
            {recording ? <MicOff size={13} /> : <Mic size={13} />}
          </button>
        </div>
        <button
          onClick={() => submitPrompt(input)}
          disabled={!input.trim() || streaming}
          aria-label="Send message"
          className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: '#1A1A2E' }}
        >
          <Send size={14} />
        </button>
      </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
