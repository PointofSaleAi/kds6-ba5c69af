import { useState } from 'react';
import { MessageCircle, Reply, Eye } from 'lucide-react';
import itemReadyIcon from '@/assets/item-ready-icon.svg';
import type { KitchenMessage, KitchenReply } from '@/types/kitchen-message';
import { KitchenReplyDialog } from './KitchenReplyDialog';

interface KitchenMessageSectionProps {
  messages: KitchenMessage[];
  replies: KitchenReply[];
  onAcknowledge: (messageId: string) => void;
  onReply: (messageId: string, text: string) => void;
  variant?: 'default' | 'v3';
}

import { formatTime, formatTimeAgo as timeAgo } from '@/lib/datetime';

export function KitchenMessageSection({ messages, replies, onAcknowledge, onReply, variant = 'default' }: KitchenMessageSectionProps) {
  const [replyTarget, setReplyTarget] = useState<KitchenMessage | null>(null);
  const isV3 = variant === 'v3';

  if (messages.length === 0) return null;

  return (
    <>
      {messages.map(msg => {
        const msgReplies = replies.filter(r => r.message_id === msg.message_id);
        const isPending = msg.status === 'pending';

        return (
          <div
            key={msg.message_id}
            className={`border-b border-border ${isPending ? 'animate-pulse-once' : ''} ${!isPending && !isV3 ? 'opacity-60' : ''}`}
          >
            {/* Header bar */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#7C3AED]/10">
              <MessageCircle size={14} className="text-[#7C3AED] shrink-0" />
              <span className="text-[11px] font-bold text-[#7C3AED] flex-1 truncate">
                {msg.terminal_name || msg.employee_name}
              </span>
              <span className="text-[10px] text-text-muted shrink-0">{timeAgo(msg.timestamp)}</span>
            </div>

            {/* Message body */}
            <div className="px-3 py-2 flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-text-primary leading-snug">{msg.message_text}</p>
                {msg.employee_role && (
                  <p className="text-[10px] text-text-muted mt-1">{msg.employee_name} - {msg.employee_role}</p>
                )}
              </div>
              {isV3 ? (
                <div className="shrink-0">
                  {isPending ? (
                    <button
                      onClick={() => onAcknowledge(msg.message_id)}
                      aria-label="Seen & Acknowledge"
                      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:brightness-95"
                      style={{ backgroundColor: '#EBD7FF' }}
                    >
                      <Eye size={16} strokeWidth={2.5} className="text-[#7C3AED]" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setReplyTarget(msg)}
                      aria-label="Reply"
                      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:brightness-95"
                      style={{ backgroundColor: '#EBD7FF' }}
                    >
                      <MessageCircle size={16} strokeWidth={2.5} className="text-[#7C3AED]" />
                    </button>
                  )}
                </div>
              ) : isPending && (
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button
                    onClick={() => onAcknowledge(msg.message_id)}
                    aria-label="Acknowledge"
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:brightness-95"
                    style={{ backgroundColor: '#EBD7FF' }}
                  >
                    <img src={itemReadyIcon} alt="" style={{ width: 24, height: 18 }} />
                  </button>
                  <button
                    onClick={() => setReplyTarget(msg)}
                    aria-label="Reply"
                    className="w-7 h-7 rounded-md bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    <Reply size={20} strokeWidth={2.5} className="text-gray-800" />
                  </button>
                </div>
              )}
            </div>

            {/* Threaded replies */}
            {msgReplies.length > 0 && (
              <div className="mx-3 mb-2 border-l-2 border-[#7C3AED]/30 pl-3 space-y-1">
                {msgReplies.map(r => (
                  <div key={r.reply_id} className="flex items-center gap-2">
                    <p className="text-[11px] text-text-primary font-medium flex-1 min-w-0 truncate">{r.reply_text}</p>
                    <p className="text-[9px] text-text-muted shrink-0">{r.employee_name || 'Kitchen'} - {formatTime(r.timestamp)}</p>
                  </div>
                ))}
              </div>
            )}
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
