import { useState } from 'react';
import { MessageCircle, Check, Reply } from 'lucide-react';
import type { KitchenMessage, KitchenReply } from '@/types/kitchen-message';
import { KitchenReplyDialog } from './KitchenReplyDialog';

interface KitchenMessageSectionProps {
  messages: KitchenMessage[];
  replies: KitchenReply[];
  onAcknowledge: (messageId: string) => void;
  onReply: (messageId: string, text: string) => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function KitchenMessageSection({ messages, replies, onAcknowledge, onReply }: KitchenMessageSectionProps) {
  const [replyTarget, setReplyTarget] = useState<KitchenMessage | null>(null);

  if (messages.length === 0) return null;

  return (
    <>
      {messages.map(msg => {
        const msgReplies = replies.filter(r => r.message_id === msg.message_id);
        const isPending = msg.status === 'pending';

        return (
          <div
            key={msg.message_id}
            className={`border-b border-border ${isPending ? 'animate-pulse-once' : ''}`}
          >
            {/* Header bar */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#7C3AED]/10">
              <Megaphone size={14} className="text-[#7C3AED] shrink-0" />
              <span className="text-[11px] font-bold text-[#7C3AED] flex-1 truncate">
                Message from {msg.terminal_name || msg.employee_name}
              </span>
              <span className="text-[10px] text-text-muted shrink-0">{timeAgo(msg.timestamp)}</span>
            </div>

            {/* Message body */}
            <div className="px-3 py-2">
              <p className="text-[13px] text-text-primary leading-snug">{msg.message_text}</p>
              {msg.employee_role && (
                <p className="text-[10px] text-text-muted mt-1">{msg.employee_name} - {msg.employee_role}</p>
              )}
            </div>

            {/* Threaded replies */}
            {msgReplies.length > 0 && (
              <div className="mx-3 mb-2 border-l-2 border-[#7C3AED]/30 pl-3 space-y-1">
                {msgReplies.map(r => (
                  <div key={r.reply_id}>
                    <p className="text-[11px] text-text-primary font-medium">{r.reply_text}</p>
                    <p className="text-[9px] text-text-muted">Kitchen - {formatTime(r.timestamp)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="px-3 pb-2 flex gap-2">
              {isPending ? (
                <button
                  onClick={() => onAcknowledge(msg.message_id)}
                  className="flex-1 py-2 rounded-lg bg-brand-primary text-white text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-brand-primary/90 transition-colors min-h-[44px]"
                >
                  <Check size={14} />
                  Acknowledge
                </button>
              ) : (
                <div className="flex-1 py-2 rounded-lg bg-success/10 text-success text-[12px] font-bold flex items-center justify-center gap-1.5 min-h-[44px]">
                  <Check size={14} />
                  Acknowledged {msg.acknowledged_at ? formatTime(msg.acknowledged_at) : ''}
                </div>
              )}
              <button
                onClick={() => setReplyTarget(msg)}
                className="py-2 px-4 rounded-lg border border-border text-text-primary text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-muted transition-colors min-h-[44px]"
              >
                <MessageSquare size={14} />
                Reply
              </button>
            </div>
          </div>
        );
      })}

      {replyTarget && (
        <KitchenReplyDialog
          message={replyTarget}
          onSend={onReply}
          onClose={() => setReplyTarget(null)}
        />
      )}
    </>
  );
}
