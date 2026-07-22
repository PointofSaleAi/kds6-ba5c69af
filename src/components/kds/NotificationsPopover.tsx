import { useEffect, useRef } from 'react';
import { Bell, ChefHat, ShoppingBag, AlertTriangle, Clock, Package } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import type { KDSNotification, NotificationType } from '@/types/notification';

function timeAgo(d: Date): string {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function iconFor(t: NotificationType) {
  switch (t) {
    case 'new-order':
    case 'table-transfer':
    case 'item-moved':
    case 'new-item-added':
      return <ShoppingBag className="w-4 h-4 text-blue-400" />;
    case 'course-fired':
      return <ChefHat className="w-4 h-4 text-orange-400" />;
    case 'overtime':
      return <Clock className="w-4 h-4 text-red-400" />;
    case 'low-stock':
    case 'pos-86d':
      return <Package className="w-4 h-4 text-amber-400" />;
    case 'system':
      return <AlertTriangle className="w-4 h-4 text-neutral-400" />;
    default:
      return <Bell className="w-4 h-4 text-neutral-400" />;
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export function NotificationsPopover({ open, onClose, anchorRef }: Props) {
  const { notifications, unreadCount, acknowledge, clearAcknowledged } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const recent = notifications.slice(0, 3);

  return (
    <div
      ref={ref}
      className="fixed left-2 right-2 md:left-auto md:right-2 md:w-80 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
      style={{
        top: 'calc(var(--training-bar-h, 0px) + var(--kds-header-h, 56px) + 6px)',
        background: '#1C1C1E',
        border: '1px solid rgba(255,255,255,0.1)',
        fontFamily: 'Montserrat, sans-serif',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-semibold text-white">Notifications</span>
        {unreadCount > 0 && (
          <span
            className="min-w-[20px] h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1.5"
            style={{ background: '#ED1C24' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="px-4 py-6 text-center text-neutral-500 text-xs">
            No notifications yet
          </div>
        ) : (
          recent.map((n: KDSNotification) => (
            <button
              key={n.id}
              onClick={() => acknowledge(n.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${
                !n.acknowledged ? 'bg-white/[0.03]' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                {iconFor(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-medium ${!n.acknowledged ? 'text-white' : 'text-neutral-300'}`}
                  style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {n.message}
                </p>
                {n.station && n.station !== 'All' && (
                  <p className="text-[10px] text-neutral-500 mt-0.5 uppercase tracking-wide">{n.station}</p>
                )}
              </div>
              <span className="text-[10px] text-neutral-600 shrink-0 mt-0.5">{timeAgo(n.timestamp)}</span>
            </button>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t border-white/10 flex">
          <button
            onClick={() => {
              clearAcknowledged();
              onClose();
            }}
            className="flex-1 py-3 text-xs font-medium text-neutral-400 hover:bg-white/5 transition-colors"
          >
            Clear Read
          </button>
          <div className="w-px bg-white/10" />
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
            style={{ color: '#3B82F6' }}
          >
            View More
          </button>
        </div>
      )}
    </div>
  );
}
