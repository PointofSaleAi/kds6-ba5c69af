import { useState, useRef, useEffect } from 'react';
import { X, Send, Monitor, Receipt, Printer, User, Mic, MicOff, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedAIIcon from './AnimatedAIIcon';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { getOverlayInsets } from '@/lib/dock-insets';

interface AIAssistantPanelProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { label: 'Display', icon: Monitor, prompt: 'Show display settings' },
  { label: 'Tickets', icon: Receipt, prompt: 'Show ticket settings' },
  { label: 'Hardware', icon: Printer, prompt: 'Show hardware settings' },
  { label: 'Account', icon: User, prompt: 'Show account settings' },
];

const TRY_PROMPTS = [
  'Set text size to large',
  'Enable allergen badges',
  'Switch to compact layout',
  'Change language to Spanish',
];

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  action?: string;
};

function generateResponse(prompt: string): { text: string; action?: string } {
  const p = prompt.toLowerCase();
  if (p.includes('text size') && p.includes('large')) {
    return { text: 'Text size set to Large.', action: 'Applied: Display → Text size → Large' };
  }
  if (p.includes('allergen')) {
    return { text: 'Allergen badges enabled on all tickets.', action: 'Applied: Display → Allergen badges → On' };
  }
  if (p.includes('compact')) {
    return { text: 'Switched to compact layout.', action: 'Applied: Display → Ticket spacing → Compact' };
  }
  if (p.includes('spanish') || p.includes('language')) {
    return { text: 'Language changed to Spanish.', action: 'Applied: Account → Language → Español' };
  }
  if (p.includes('display')) {
    return { text: 'Opening display settings.', action: 'Navigated: Settings → Display' };
  }
  if (p.includes('ticket')) {
    return { text: 'Opening ticket settings.', action: 'Navigated: Settings → Tickets' };
  }
  if (p.includes('hardware') || p.includes('printer')) {
    return { text: 'Opening hardware settings.', action: 'Navigated: Settings → Hardware' };
  }
  if (p.includes('account')) {
    return { text: 'Opening account settings.', action: 'Navigated: Settings → Account' };
  }
  return { text: `Got it. I'll handle: "${prompt}".`, action: 'Request queued' };
}

export function AIAssistantPanel({ open, onClose }: AIAssistantPanelProps) {
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const { layout } = useDockLayout();
  const insets = getOverlayInsets(layout);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const toggleRecording = () => setRecording(r => !r);

  const submitPrompt = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || thinking) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const res = generateResponse(trimmed);
      setMessages(m => [
        ...m,
        { id: `a-${Date.now()}`, role: 'assistant', text: res.text, action: res.action },
      ]);
      setThinking(false);
    }, 600);
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
            className="fixed bg-brand-dark/30 z-40"
            style={{ left: insets.left, right: insets.right, top: insets.top, bottom: insets.bottom }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed w-[320px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ right: insets.right, top: insets.top, bottom: insets.bottom }}
          >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 h-[44px] shrink-0"
        style={{ background: '#1A1A2E' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AnimatedAIIcon size={18} />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">AI</span>
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

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white">
        {!hasMessages ? (
          <div className="px-4 py-5 flex flex-col items-center text-center">
            <div className="mb-3">
              <AnimatedAIIcon size={44} />
            </div>
            <h2 className="text-[16px] font-bold text-foreground mb-1">How can I help you?</h2>
            <p className="text-[12px] text-muted-foreground leading-snug mb-5 px-1">
              I can configure your KDS settings. Just tell me what you need.
            </p>

            {/* Quick action chips */}
            <div className="grid grid-cols-2 gap-2 w-full mb-5">
              {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
                <button
                  key={label}
                  onClick={() => submitPrompt(prompt)}
                  className="flex items-center gap-1.5 justify-center px-2 py-2 rounded-full border border-border bg-background hover:bg-muted active:scale-95 transition-all text-[12px] font-semibold text-foreground"
                >
                  <Icon size={13} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Try asking */}
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
                    <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-muted text-[12px] text-foreground">
                      {m.text}
                    </div>
                    {m.action && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/10 text-success text-[11px] font-semibold">
                        <Check size={11} />
                        <span className="truncate">{m.action}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
            {thinking && (
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

      {/* Footer input */}
      <div className="shrink-0 bg-muted/40 border-t border-border px-2 py-2 flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={recording ? 'Listening...' : 'Ask me anything...'}
            className="w-full h-9 bg-white border border-border rounded-full pl-3 pr-10 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
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
          disabled={!input.trim() || thinking}
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
