import { useState } from 'react';
import { X, Bell, AlertTriangle, Info, CheckCircle, Megaphone, Check, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKitchenMessages } from '@/hooks/use-kitchen-messages';
import { KitchenReplyDialog } from '@/components/kds/KitchenReplyDialog';
import type { KitchenMessage } from '@/types/kitchen-message';

interface Alert {
  id: string;
  type: 'overtime' | 'new-order' | 'recalled' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
}

// TODO: Replace with API data
const mockAlerts: Alert[] = [
  { id: 'a1', type: 'overtime', message: 'Order #22 is 10+ minutes overtime', timestamp: '2 min ago', read: false },
  { id: 'a2', type: 'new-order', message: 'New order #27 received (DINE IN, Table 9)', timestamp: '3 min ago', read: false },
  { id: 'a3', type: 'recalled', message: 'Order #18 recalled by Manager', timestamp: '12 min ago', read: false },
  { id: 'a4', type: 'system', message: 'Printer "Kitchen HP" is offline', timestamp: '25 min ago', read: true },
  { id: 'a5', type: 'new-order', message: 'New order #26 received (BANQUET)', timestamp: '30 min ago', read: true },
];

const alertIcons: Record<string, { icon: React.ElementType; color: string }> = {
  overtime: { icon: AlertTriangle, color: 'text-destructive' },
  'new-order': { icon: Bell, color: 'text-warning' },
  recalled: { icon: Info, color: 'text-status-in-progress' },
  system: { icon: Info, color: 'text-order-take-out' },
};

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface AlertsPanelProps {
  open: boolean;
  onClose: () => void;
}

type TabFilter = 'alerts' | 'messages';

export default function AlertsPanel({ open, onClose }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [tab, setTab] = useState<TabFilter>('alerts');
  const [replyTarget, setReplyTarget] = useState<KitchenMessage | null>(null);
  const { messages, replies, pendingCount, acknowledgeMessage, sendReply, getRepliesForMessage } = useKitchenMessages();

  const markAllRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  const dismiss = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  // Sort messages: pending first, then by timestamp desc
  const sortedMessages = [...messages].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-dark/30 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[360px] bg-surface-card shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Alerts</h2>
              <div className="flex items-center gap-3">
                {tab === 'alerts' && (
                  <button onClick={markAllRead} className="text-sm text-brand-primary hover:underline">Mark all read</button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close alerts">
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Tab pills */}
            <div className="flex gap-2 px-4 py-3 border-b border-border">
              <button
                onClick={() => setTab('alerts')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors min-h-[36px]
                  ${tab === 'alerts' ? 'bg-brand-primary text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'}`}
              >
                Alerts
              </button>
              <button
                onClick={() => setTab('messages')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors min-h-[36px] relative
                  ${tab === 'messages' ? 'bg-[#7C3AED] text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'}`}
              >
                Kitchen Messages
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {tab === 'alerts' ? (
                /* Alerts tab */
                alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <CheckCircle size={48} className="text-success mb-4" />
                    <p className="text-text-primary font-semibold">No alerts, all clear</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {alerts.map((alert) => {
                      const config = alertIcons[alert.type];
                      return (
                        <div key={alert.id} className={`flex gap-3 px-4 py-3 ${!alert.read ? 'bg-brand-primary/5' : ''}`}>
                          <config.icon size={20} className={`${config.color} shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!alert.read ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                              {alert.message}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">{alert.timestamp}</p>
                          </div>
                          <button onClick={() => dismiss(alert.id)} className="p-1 hover:bg-muted rounded shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Dismiss alert">
                            <X size={14} className="text-text-muted" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Kitchen Messages tab */
                sortedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <Megaphone size={48} className="text-[#7C3AED]/40 mb-4" />
                    <p className="text-text-primary font-semibold">No kitchen messages</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {sortedMessages.map(msg => {
                      const isPending = msg.status === 'pending';
                      const msgReplies = getRepliesForMessage(msg.message_id);
                      return (
                        <div key={msg.message_id} className={`${isPending ? 'bg-[#7C3AED]/5' : ''}`}>
                          {/* Message header */}
                          <div className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED]/10">
                            <Megaphone size={14} className="text-[#7C3AED] shrink-0" />
                            <span className="text-[11px] font-bold text-[#7C3AED] flex-1 truncate">
                              {msg.terminal_name || 'POS'}
                            </span>
                            <span className="text-[10px] text-text-muted">{timeAgo(msg.timestamp)}</span>
                          </div>

                          {/* Meta row */}
                          <div className="px-4 pt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-text-muted">
                            <span>{msg.employee_name}{msg.employee_role ? ` - ${msg.employee_role}` : ''}</span>
                            {msg.linked_order_number && <span>Order #{msg.linked_order_number}</span>}
                            {msg.table_number && <span>{msg.table_number}</span>}
                          </div>

                          {/* Body */}
                          <div className="px-4 py-2">
                            <p className="text-[13px] text-text-primary leading-snug">{msg.message_text}</p>
                          </div>

                          {/* Replies */}
                          {msgReplies.length > 0 && (
                            <div className="mx-4 mb-2 border-l-2 border-[#7C3AED]/30 pl-3 space-y-1">
                              {msgReplies.map(r => (
                                <div key={r.reply_id}>
                                  <p className="text-[11px] text-text-primary font-medium">{r.reply_text}</p>
                                  <p className="text-[9px] text-text-muted">Kitchen - {formatTime(r.timestamp)}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="px-4 pb-3 flex gap-2">
                            {isPending ? (
                              <button
                                onClick={() => acknowledgeMessage(msg.message_id)}
                                className="flex-1 py-2 rounded-lg bg-brand-primary text-white text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-brand-primary/90 transition-colors min-h-[44px]"
                              >
                                <Check size={14} />
                                Acknowledge
                              </button>
                            ) : (
                              <div className="flex-1 py-2 rounded-lg bg-success/10 text-success text-[12px] font-bold flex items-center justify-center gap-1.5 min-h-[44px]">
                                <Check size={14} />
                                Acknowledged
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
                  </div>
                )
              )}
            </div>
          </motion.div>

          {replyTarget && (
            <KitchenReplyDialog
              message={replyTarget}
              onSend={sendReply}
              onClose={() => setReplyTarget(null)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
