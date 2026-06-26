import { useState, useMemo } from 'react';
import { X, Bell, AlertTriangle, Info, CheckCircle, Megaphone, Check, MessageSquare, ArrowRightLeft, Utensils, Plus, Flame, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKitchenMessages } from '@/hooks/use-kitchen-messages';
import { useNotifications } from '@/hooks/use-notifications';
import { useLanguage } from '@/hooks/use-language';
import { KitchenReplyDialog } from '@/components/kds/KitchenReplyDialog';
import type { KitchenMessage } from '@/types/kitchen-message';
import type { NotificationType, KDSNotification } from '@/types/notification';
import { formatTime } from '@/lib/datetime';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { getOverlayInsets } from '@/lib/dock-insets';

function useTimeAgo() {
  const { t } = useLanguage();
  return (date: Date): string => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return t.justNow;
    if (mins < 60) return t.minAgoSuffix.replace('{n}', String(mins));
    return t.hourAgoSuffix.replace('{n}', String(Math.floor(mins / 60)));
  };
}

const notifIcons: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  'table-transfer': { icon: ArrowRightLeft, color: 'text-status-in-progress' },
  'item-moved': { icon: Utensils, color: 'text-order-take-out' },
  'new-item-added': { icon: Plus, color: 'text-success' },
  'course-fired': { icon: Flame, color: 'text-warning' },
  'general-alert': { icon: Megaphone, color: 'text-[#7C3AED]' },
  'overtime': { icon: AlertTriangle, color: 'text-destructive' },
  'new-order': { icon: Bell, color: 'text-warning' },
  'recalled': { icon: Info, color: 'text-status-in-progress' },
  'system': { icon: Info, color: 'text-order-take-out' },
};

interface AlertsPanelProps {
  open: boolean;
  onClose: () => void;
}

type TabFilter = 'notifications' | 'messages';

const PRIORITY: Record<string, number> = {
  overtime: 0,
  system: 1,
  'table-transfer': 2,
  'item-moved': 2,
  'general-alert': 3,
  'course-fired': 4,
  'new-item-added': 4,
  'new-order': 5,
  recalled: 5,
};

function buildAiSummary(unread: KDSNotification[]): string {
  if (unread.length === 0) return '';
  const sorted = [...unread].sort((a, b) => (PRIORITY[a.type] ?? 9) - (PRIORITY[b.type] ?? 9));
  const top = sorted.slice(0, 3).map(n => n.message.replace(/\.$/, ''));
  const intro = unread.length === 1 ? '1 item needs attention' : `${unread.length} items need attention`;
  return `${intro} — ${top.join(', ')}.`;
}

type ChipStyle = 'default' | 'urgent' | 'hardware';
interface AiChipConfig {
  label: string;
  style: ChipStyle;
  response: string;
  primary: string;
  secondary?: string;
}

function getAiChipConfig(type: string, message: string): AiChipConfig {
  const lower = message.toLowerCase();
  if (type === 'overtime') {
    return {
      label: 'Suggest action',
      style: 'urgent',
      response: 'This ticket is past the target time. Bump items that are plated and check the pass before firing anything new.',
      primary: 'Bump now',
      secondary: 'Go to ticket',
    };
  }
  if (type === 'system' && /printer|offline|hardware/.test(lower)) {
    return {
      label: 'How to fix?',
      style: 'hardware',
      response: 'Check the printer power and network cable. If still offline, reassign tickets to a backup printer in Hardware settings.',
      primary: 'Go to hardware settings',
      secondary: 'Dismiss',
    };
  }
  if (type === 'new-order') {
    return {
      label: 'Fire immediately or hold?',
      style: 'default',
      response: 'Station load is normal. Safe to fire now unless this is part of a coursed table.',
      primary: 'Fire now',
      secondary: 'Hold',
    };
  }
  if (type === 'table-transfer' || type === 'item-moved') {
    return {
      label: 'What should I do?',
      style: 'default',
      response: 'Update the ticket header to the new table and notify the runner so the food lands at the right seat.',
      primary: 'Update tickets',
      secondary: 'Dismiss',
    };
  }
  if (type === 'course-fired') {
    return {
      label: 'Check timing',
      style: 'default',
      response: 'Confirm the previous course has cleared. Stagger this fire by ~2 minutes if the table is still eating.',
      primary: 'Acknowledge',
    };
  }
  if (type === 'general-alert' && /vip/.test(lower)) {
    return {
      label: 'Prioritise now?',
      style: 'urgent',
      response: 'Move this table to the top of the queue and assign your most experienced cook to the station.',
      primary: 'Prioritise tickets',
      secondary: 'Dismiss',
    };
  }
  return {
    label: 'What should I do?',
    style: 'default',
    response: 'Acknowledge this notification and continue with your current ticket priority.',
    primary: 'Acknowledge',
    secondary: 'Dismiss',
  };
}

const CHIP_STYLES: Record<ChipStyle, string> = {
  default: 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]',
  urgent: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  hardware: 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]',
};

export default function AlertsPanel({ open, onClose }: AlertsPanelProps) {
  const [tab, setTab] = useState<TabFilter>('notifications');
  const [replyTarget, setReplyTarget] = useState<KitchenMessage | null>(null);
  const { messages, replies, pendingCount, acknowledgeMessage, sendReply, getRepliesForMessage } = useKitchenMessages();
  const { notifications, unreadCount, acknowledge, clearAcknowledged } = useNotifications();
  const { t, tl, tperson, tn } = useLanguage();
  const timeAgo = useTimeAgo();
  const { layout } = useDockLayout();
  const insets = getOverlayInsets(layout);

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
            className="fixed bg-black/40 z-40"
            style={{ left: insets.left, right: insets.right, top: insets.top, bottom: insets.bottom }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed z-50 w-[440px] max-w-[95vw] p-[10px] pl-0"
            style={{ right: insets.right, top: insets.top, bottom: insets.bottom }}
          >
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-border bg-surface-card flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">{t.notificationsTitle}</h2>
              <div className="flex items-center gap-2">
                {tab === 'notifications' && (
                  <button
                    onClick={clearAcknowledged}
                    className="text-xs text-text-muted hover:text-destructive flex items-center gap-1 transition-colors px-2"
                  >
                    <Trash2 size={14} />
                    {t.clearRead}
                  </button>
                )}
                <button
                  onClick={onClose}
                  aria-label="Close alerts"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center active:opacity-70 transition-opacity"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Tab pills */}
            <div className="flex gap-2 px-4 py-3 border-b border-border">
              <button
                onClick={() => setTab('notifications')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors min-h-[36px] relative
                  ${tab === 'notifications' ? 'bg-brand-primary text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'}`}
              >
                {t.notificationsTitle}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTab('messages')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors min-h-[36px] relative
                  ${tab === 'messages' ? 'bg-[#7C3AED] text-white' : 'bg-muted text-text-secondary hover:bg-muted/80'}`}
              >
                {t.kitchenMessagesTab}
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {tab === 'notifications' ? (
                /* Notifications tab */
                notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <CheckCircle size={48} className="text-success mb-4" />
                    <p className="text-text-primary font-semibold">{t.allClearNoNotifications}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notif) => {
                      const config = notifIcons[notif.type] || notifIcons['system'];
                      const Icon = config.icon;
                      return (
                        <button
                          key={notif.id}
                          onClick={() => !notif.acknowledged && acknowledge(notif.id)}
                          className={`w-full text-left flex gap-3 px-4 py-3 transition-colors ${!notif.acknowledged ? 'hover:bg-muted/50' : ''}`}
                        >
                          {/* Unread dot */}
                          <div className="flex items-start pt-1.5 w-3 shrink-0">
                            {!notif.acknowledged && (
                              <span className="w-2.5 h-2.5 rounded-full bg-warning shrink-0" />
                            )}
                          </div>
                          <Icon size={18} className={`${config.color} shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug ${!notif.acknowledged ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                              {tn(notif.message)}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-text-muted">
                              <span className="px-1.5 py-0.5 rounded bg-muted text-text-secondary font-medium">{tl(notif.station)}</span>
                              <span>·</span>
                              <span>{timeAgo(notif.timestamp)}</span>
                              {notif.acknowledged && (
                                <>
                                  <span>·</span>
                                  <span className="text-success">{t.readLabel}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Kitchen messages tab */
                sortedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <Megaphone size={48} className="text-[#7C3AED]/40 mb-4" />
                    <p className="text-text-primary font-semibold">{t.noKitchenMessages}</p>
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
                              {tl(msg.terminal_name || 'Point of Sale')}
                            </span>
                            <span className="text-[10px] text-text-muted">{timeAgo(msg.timestamp)}</span>
                          </div>

                          {/* Meta row */}
                          <div className="px-4 pt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-text-muted">
                            <span>{tperson(msg.employee_name)}{msg.employee_role ? ` - ${tl(msg.employee_role)}` : ''}</span>
                            {msg.linked_order_number && <span>{t.orderHash}{msg.linked_order_number}</span>}
                            {msg.table_number && <span>{tl(msg.table_number)}</span>}
                          </div>

                          {/* Body */}
                          <div className="px-4 py-2">
                            <p className="text-[13px] text-text-primary leading-snug">{tn(msg.message_text)}</p>
                          </div>

                          {/* Replies */}
                          {msgReplies.length > 0 && (
                            <div className="mx-4 mb-2 border-l-2 border-[#7C3AED]/30 pl-3 space-y-1">
                              {msgReplies.map(r => (
                                <div key={r.reply_id}>
                                  <p className="text-[11px] text-text-primary font-medium">{tn(r.reply_text)}</p>
                                  <p className="text-[9px] text-text-muted">{t.kitchenLabel} - {formatTime(r.timestamp)}</p>
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
                                {t.acknowledge}
                              </button>
                            ) : (
                              <div className="flex-1 py-2 rounded-lg bg-success/10 text-success text-[12px] font-bold flex items-center justify-center gap-1.5 min-h-[44px]">
                                <Check size={14} />
                                {t.acknowledged}
                              </div>
                            )}
                            <button
                              onClick={() => setReplyTarget(msg)}
                              className="py-2 px-4 rounded-lg border border-border text-text-primary text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-muted transition-colors min-h-[44px]"
                            >
                              <MessageSquare size={14} />
                              {t.reply}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
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
