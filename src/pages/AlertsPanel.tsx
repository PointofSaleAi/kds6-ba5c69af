import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Bell, AlertTriangle, Info, CheckCircle, Megaphone, Check, MessageSquare, ArrowRightLeft, Utensils, Plus, Flame, Trash2, Sparkles, PackageX } from 'lucide-react';
import AnimatedAIIcon from '@/components/kds/AnimatedAIIcon';
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

function EightySixNotifIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <span
      className={`font-bold ${className || ''}`}
      style={{ fontSize: size ?? 16, lineHeight: 1 }}
    >
      86
    </span>
  );
}

const notifIcons: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  'table-transfer': { icon: ArrowRightLeft, color: 'text-status-preparing' },
  'item-moved': { icon: Utensils, color: 'text-order-take-out' },
  'new-item-added': { icon: Plus, color: 'text-success' },
  'course-fired': { icon: Flame, color: 'text-warning' },
  'general-alert': { icon: Megaphone, color: 'text-[#7C3AED]' },
  'overtime': { icon: AlertTriangle, color: 'text-destructive' },
  'new-order': { icon: Bell, color: 'text-warning' },
  'recalled': { icon: Info, color: 'text-status-preparing' },
  'low-stock': { icon: PackageX, color: 'text-warning' },
  'pos-86d': { icon: EightySixNotifIcon, color: 'text-destructive' },
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
  'pos-86d': 1,
  'low-stock': 1,
  'table-transfer': 2,
  'item-moved': 2,
  'general-alert': 3,
  'course-fired': 4,
  'new-item-added': 4,
  'new-order': 5,
  recalled: 5,
};

function buildAiSummary(unread: KDSNotification[], tui: (t: string, v?: Record<string, string|number>) => string): string {
  if (unread.length === 0) return '';
  const sorted = [...unread].sort((a, b) => (PRIORITY[a.type] ?? 9) - (PRIORITY[b.type] ?? 9));
  const top = sorted.slice(0, 3).map(n => n.message.replace(/\.$/, ''));
  const intro = unread.length === 1 ? tui('1 item needs attention') : tui('{n} items need attention', { n: unread.length });
  return `${intro} — ${top.join(', ')}.`;
}

type ActionColor = 'navy' | 'green' | 'red' | 'orange';
interface AiAction {
  label: string;
  color: ActionColor;
  kind: 'navigate-ticket' | 'navigate-home' | 'navigate-hardware' | 'fire' | 'bump' | 'update-table' | 'prioritise' | 'view';
  ticketNumber?: string;
  targetTable?: string;
}

const COLOR_CLASSES: Record<ActionColor, string> = {
  navy: 'bg-[#1A1A2E] text-white',
  green: 'bg-[#059669] text-white',
  red: 'bg-[#E84C3D] text-white',
  orange: 'bg-[#F97316] text-white',
};

function extractTicket(msg: string): string | undefined {
  const m = msg.match(/#\s?(\d{2,})/);
  return m?.[1];
}

function getAiAction(type: string, message: string, tui: (t: string, v?: Record<string, string|number>) => string): AiAction {
  const lower = message.toLowerCase();
  const ticket = extractTicket(message);
  if (type === 'overtime') {
    return { label: ticket ? tui('Bump ticket {n}', { n: ticket }) : tui('Bump ticket'), color: 'red', kind: 'bump', ticketNumber: ticket };
  }
  if (type === 'new-order') {
    return { label: ticket ? tui('Fire order {n}', { n: ticket }) : tui('Fire order'), color: 'green', kind: 'fire', ticketNumber: ticket };
  }
  if (type === 'table-transfer') {
    const tables = message.match(/table\s+(\w+)/gi);
    const target = tables && tables.length > 1 ? tables[tables.length - 1].replace(/table\s+/i, '') : undefined;
    return { label: target ? tui('Update to Table {n}', { n: target }) : tui('Update tables'), color: 'navy', kind: 'update-table', targetTable: target };
  }
  if (type === 'item-moved') {
    return { label: tui('Go to Ticket'), color: 'navy', kind: 'navigate-ticket', ticketNumber: ticket };
  }
  if (type === 'system' && /printer|offline|hardware/.test(lower)) {
    return { label: tui('Go to Hardware'), color: 'orange', kind: 'navigate-hardware' };
  }
  if (type === 'general-alert' && /vip/.test(lower)) {
    return { label: tui('Prioritise Now'), color: 'navy', kind: 'prioritise' };
  }
  if (type === 'course-fired') {
    return { label: tui('Go to Ticket'), color: 'navy', kind: 'navigate-ticket', ticketNumber: ticket };
  }
  if (type === 'low-stock') {
    return { label: tui('86 it'), color: 'red', kind: 'view' };
  }
  if (type === 'pos-86d') {
    return { label: tui('View 86 List'), color: 'red', kind: 'view' };
  }
  return { label: tui('View'), color: 'navy', kind: 'view' };
}



export default function AlertsPanel({ open, onClose }: AlertsPanelProps) {
  const [tab, setTab] = useState<TabFilter>('notifications');
  const [replyTarget, setReplyTarget] = useState<KitchenMessage | null>(null);
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const navigate = useNavigate();
  const { messages, replies, pendingCount, acknowledgeMessage, sendReply, getRepliesForMessage } = useKitchenMessages();
  const { notifications, unreadCount, acknowledge, clearAcknowledged } = useNotifications();
  const { t, tl, tperson, tn, tui } = useLanguage();
  const timeAgo = useTimeAgo();
  const { layout } = useDockLayout();
  const insets = getOverlayInsets(layout);

  const unreadNotifications = useMemo(() => notifications.filter(n => !n.acknowledged), [notifications]);
  const aiSummary = useMemo(() => buildAiSummary(unreadNotifications, tui), [unreadNotifications, tui]);

  const openAiAssistant = () => {
    window.dispatchEvent(new CustomEvent('kds:open-ai-assistant'));
    onClose();
  };

  const runAiAction = (notifId: string, action: AiAction) => {
    acknowledge(notifId);
    switch (action.kind) {
      case 'bump':
        toast.success(action.ticketNumber ? tui('Bumped ticket {n}', { n: action.ticketNumber }) : tui('Bumped ticket'));
        onClose();
        break;
      case 'fire':
        toast.success(action.ticketNumber ? tui('Fired order {n}', { n: action.ticketNumber }) : tui('Fired order'));
        onClose();
        break;
      case 'update-table':
        toast.success(action.targetTable ? tui('Tickets updated to Table {n}', { n: action.targetTable }) : tui('Tables updated'));
        onClose();
        break;
      case 'prioritise':
        toast.success(tui('VIP tickets prioritised'));
        window.dispatchEvent(new CustomEvent('kds:prioritise-vip'));
        onClose();
        break;
      case 'navigate-hardware':
        onClose();
        navigate('/kds/v1/settings/hardware');
        break;
      case 'navigate-ticket':
        onClose();
        navigate(action.ticketNumber ? `/kds/v1?ticket=${action.ticketNumber}` : '/kds/v1');
        break;
      case 'view':
      case 'navigate-home':
      default:
        onClose();
        navigate('/kds/v1');
        break;
    }
  };

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
            transition={{ duration: 0.2 }}
            className="fixed z-[9997] inset-0"
            style={{
              backgroundColor: `hsl(var(--drawer-backdrop) / var(--drawer-backdrop-opacity))`,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed z-[9998] w-[440px] max-w-[95vw] p-2 pl-0"
            style={{ right: insets.right, top: `var(--training-bar-h, 0px)`, bottom: 0 }}
          >
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col" style={{ background: 'hsl(var(--surface-card))' }}>
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
                  aria-label={tui('Close Alerts')}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center active:opacity-70 transition-opacity"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Tab pills */}
            <div className="flex gap-2 px-4 py-3 border-b border-border items-center">
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
              {tab === 'notifications' && unreadNotifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAiSummaryOpen(v => !v)}
                  aria-label={tui('AI Summary')}
                  className={`ml-auto relative w-9 h-9 rounded-full flex items-center justify-center transition-colors
                    ${aiSummaryOpen ? 'bg-[#1A1A2E]' : 'bg-muted hover:bg-muted/80'}`}
                >
                  <AnimatedAIIcon size={18} />
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {unreadNotifications.length}
                  </span>
                </button>
              )}
            </div>

            {/* AI Summary expanded block */}
            {tab === 'notifications' && aiSummaryOpen && aiSummary && (
              <div className="flex-shrink-0">
                <div
                  className="bg-[#1A1A2E]"
                  style={{ borderRadius: '8px', padding: '10px 14px', margin: '10px 16px' }}
                >
                  <p className="text-white" style={{ fontSize: '11px', lineHeight: 1.5 }}>{aiSummary}</p>
                  <button
                    onClick={openAiAssistant}
                    className="mt-1 inline-flex items-center gap-1 hover:underline"
                    style={{ fontSize: '10px', color: '#93C5FD' }}
                  >
                    <MessageSquare size={10} />
                    {tui('Ask AI what to do')}
                  </button>
                </div>
              </div>
            )}

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
                      const isUnread = !notif.acknowledged;
                      const action = isUnread ? getAiAction(notif.type, notif.message, tui) : null;
                      return (
                        <div
                          key={notif.id}
                          className={`flex gap-3 px-4 py-3 transition-colors ${isUnread ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-50'}`}
                          onClick={() => isUnread && acknowledge(notif.id)}
                        >
                          {/* Unread dot */}
                          <div className="flex items-start pt-1.5 w-3 shrink-0">
                            {isUnread && (
                              <span className="w-2.5 h-2.5 rounded-full bg-warning shrink-0" />
                            )}
                          </div>
                          <Icon size={18} className={`${config.color} shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                              {tn(notif.message)}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-text-muted">
                              <span className="px-1.5 py-0.5 rounded bg-muted text-text-secondary font-medium">{tl(notif.station)}</span>
                              <span>·</span>
                              <span>{timeAgo(notif.timestamp)}</span>
                              {!isUnread && (
                                <>
                                  <span>·</span>
                                  <span className="text-success">{t.readLabel}</span>
                                </>
                              )}
                            </div>
                            {action && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  runAiAction(notif.id, action);
                                }}
                                className={`inline-flex items-center rounded-lg hover:opacity-90 active:opacity-80 transition-opacity ${COLOR_CLASSES[action.color]}`}
                                style={{ gap: '5px', fontSize: '11px', fontWeight: 600, padding: '5px 12px', marginTop: '6px' }}
                              >
                                <Sparkles size={11} className="text-white" />
                                {action.label}
                              </button>
                            )}
                          </div>
                        </div>
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
                              {tl(msg.terminal_name) || tui('Point of Sale')}
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
