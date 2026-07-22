import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Send, RefreshCw, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { KitchenMessage } from '@/types/kitchen-message';
import { issueReplyToken, REPLY_TOKEN_TTL_SECONDS } from '@/lib/demo-auth';
import { useKDSSettings, DEFAULT_QUICK_REPLIES } from '@/hooks/use-kds-settings';


const MAX_CHARS = 100;
const QR_EXPIRY_SECONDS = REPLY_TOKEN_TTL_SECONDS;

interface KitchenReplyDialogProps {
  message: KitchenMessage;
  onSend: (messageId: string, text: string) => void;
  onClose: () => void;
}

export function KitchenReplyDialog({ message, onSend, onClose }: KitchenReplyDialogProps) {
  const [text, setText] = useState('');
  const [tokenInfo, setTokenInfo] = useState(() => issueReplyToken(message.message_id));
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((tokenInfo.expiresAt - Date.now()) / 1000))
  );

  const qrUrl = useMemo(
    () => `${window.location.origin}/kds-reply?messageId=${encodeURIComponent(message.message_id)}&token=${encodeURIComponent(tokenInfo.token)}`,
    [message.message_id, tokenInfo.token]
  );

  // Expiry countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, tokenInfo.token]);

  const refreshQr = useCallback(() => {
    const next = issueReplyToken(message.message_id);
    setTokenInfo(next);
    setSecondsLeft(Math.max(0, Math.floor((next.expiresAt - Date.now()) / 1000)));
  }, [message.message_id]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(message.message_id, trimmed);
    onClose();
  };

  const handlePreset = (preset: string) => {
    setText(preset);
  };

  const expired = secondsLeft <= 0;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[680px] max-w-[95vw] bg-surface-card rounded-[20px] shadow-2xl overflow-hidden">
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

        {/* Two-column body */}
        <div className="flex divide-x divide-border">
          {/* Left: reply composer */}
          <div className="flex-1 min-w-0">
            {/* Preset chips */}
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-semibold text-text-secondary mb-2">Quick Replies</p>
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
          </div>

          {/* Right: QR code */}
          <div className="w-[220px] flex flex-col items-center justify-center px-4 py-4 gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <Smartphone size={14} />
              Reply from your phone
            </div>

            <div className={`p-2 bg-white rounded-xl ${expired ? 'opacity-30' : ''}`}>
              <QRCodeSVG value={qrUrl} size={140} level="M" />
            </div>

            {expired ? (
              <button
                onClick={refreshQr}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-muted rounded-lg transition-colors min-h-[36px]"
              >
                <RefreshCw size={12} />
                Refresh QR
              </button>
            ) : (
              <p className="text-[11px] text-text-muted font-mono tabular-nums">
                Expires in {mins}:{secs.toString().padStart(2, '0')}
              </p>
            )}
          </div>
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
