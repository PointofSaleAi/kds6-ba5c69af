import { useState } from 'react';
import { X, Send } from 'lucide-react';
import type { KitchenMessage } from '@/types/kitchen-message';

const PRESET_REPLIES = [
  'Got it',
  'On its way',
  '5 mins',
  'Need more time',
  'Out of stock',
  'Cooking now',
];

const MAX_CHARS = 100;

interface KitchenReplyDialogProps {
  message: KitchenMessage;
  onSend: (messageId: string, text: string) => void;
  onClose: () => void;
}

export function KitchenReplyDialog({ message, onSend, onClose }: KitchenReplyDialogProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(message.message_id, trimmed);
    onClose();
  };

  const handlePreset = (preset: string) => {
    setText(preset);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] max-w-[90vw] bg-surface-card rounded-[20px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-text-primary">Reply to Message</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Original message */}
        <div className="px-5 py-3 bg-muted/30 border-b border-border">
          <p className="text-xs font-semibold text-text-secondary mb-1">
            From {message.terminal_name || message.employee_name}
          </p>
          <p className="text-sm text-text-primary leading-snug">{message.message_text}</p>
        </div>

        {/* Preset chips */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold text-text-secondary mb-2">Quick replies</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_REPLIES.map(preset => (
              <button
                key={preset}
                onClick={() => handlePreset(preset)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all min-h-[36px]
                  ${text === preset
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-surface-card text-text-primary border-border hover:bg-muted'
                  }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Free text input */}
        <div className="px-5 py-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Type a custom reply..."
            className="w-full h-20 px-3 py-2 text-sm border border-border rounded-lg bg-surface-card text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
          <p className="text-[10px] text-text-muted text-right mt-1">
            {text.length}/{MAX_CHARS}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-muted transition-colors min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="flex-1 py-3 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>
    </>
  );
}
