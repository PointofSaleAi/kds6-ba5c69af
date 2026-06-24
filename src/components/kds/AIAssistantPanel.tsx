import { useState } from 'react';
import { X, Send, Monitor, Receipt, Printer, User } from 'lucide-react';
import AnimatedAIIcon from './AnimatedAIIcon';

interface AIAssistantPanelProps {
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { label: 'Display', icon: Monitor },
  { label: 'Tickets', icon: Receipt },
  { label: 'Hardware', icon: Printer },
  { label: 'Account', icon: User },
];

const TRY_PROMPTS = [
  'Set text size to large',
  'Enable allergen badges',
  'Switch to compact layout',
  'Change language to Spanish',
];

export function AIAssistantPanel({ onClose }: AIAssistantPanelProps) {
  const [input, setInput] = useState('');

  return (
    <div className="w-[280px] flex flex-col shrink-0 overflow-hidden bg-white border-l border-border h-full">
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
      <div className="flex-1 overflow-y-auto bg-white px-4 py-5 flex flex-col items-center text-center">
        <div className="mb-3">
          <AnimatedAIIcon size={44} />
        </div>
        <h2 className="text-[16px] font-bold text-foreground mb-1">How can I help you?</h2>
        <p className="text-[12px] text-muted-foreground leading-snug mb-5 px-1">
          I can configure your KDS settings. Just tell me what you need.
        </p>

        {/* Quick action chips */}
        <div className="grid grid-cols-2 gap-2 w-full mb-5">
          {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 justify-center px-2 py-2 rounded-full border border-border bg-background hover:bg-muted transition-colors text-[12px] font-semibold text-foreground"
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
                onClick={() => setInput(p)}
                className="text-left px-3 py-2 rounded-lg bg-muted/60 hover:bg-muted text-[12px] font-medium text-foreground transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer input */}
      <div className="shrink-0 bg-muted/40 border-t border-border px-2 py-2 flex items-center gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 h-9 bg-white border border-border rounded-full px-3 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        <button
          aria-label="Send message"
          className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-opacity hover:opacity-90"
          style={{ background: '#1A1A2E' }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
