import { useEffect, useRef, useState } from 'react';
import AnimatedAIIcon from '@/components/kds/AnimatedAIIcon';
import ScreenModeChip from '@/components/kds/ScreenModeChip';
import { NotificationsPopover } from '@/components/kds/NotificationsPopover';
import { useNotifications } from '@/hooks/use-notifications';
import { useLanguage, formatTimeForKDS, formatDateForKDS } from '@/hooks/use-language';
import switchUserIcon from '@/assets/icons/switch-user.png';
import dinnerIcon from '@/assets/icons/dinner.png';
import localHostIcon from '@/assets/icons/local-host.png';
import refreshIcon from '@/assets/icons/refresh.png';
import supportIcon from '@/assets/icons/support.png';
import notificationIcon from '@/assets/icons/notification.png';
import wifiIcon from '@/assets/icons/wifi.png';

const HEADER_H = 44;
const HEADER_BG = '#0D0D1A';

/**
 * Global KDS top header. Mirrors the POS mobile app header:
 * switch-user, identity chip (Guest · STAFF), service period, then
 * screen mode / AI / refresh / support / notifications / wifi / clock.
 * Positioned fixed so it sits above the training bar offset seamlessly.
 */
export function KDSTopHeader({ onToggleAiAssistant, aiAssistantOpen, onOpenAlerts }: { onToggleAiAssistant?: () => void; aiAssistantOpen?: boolean; onOpenAlerts?: () => void } = {}) {
  const [time, setTime] = useState(() => new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const { unreadCount } = useNotifications();
  const { timeFormat: tfmt, dateFormat: dfmt } = useLanguage();

  useEffect(() => {
    document.documentElement.style.setProperty('--kds-header-h', `${HEADER_H}px`);
    return () => {
      document.documentElement.style.removeProperty('--kds-header-h');
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000 * 15);
    return () => clearInterval(t);
  }, []);

  const timeLabel = formatTimeForKDS(time, tfmt);
  const dateLabel = formatDateForKDS(time, dfmt);

  return (
    <header
      role="banner"
      className="fixed left-0 right-0 z-[9996] flex items-center justify-between px-3 md:px-4"
      style={{
        top: 'var(--training-bar-h, 0px)',
        height: HEADER_H,
        background: HEADER_BG,
        color: '#FFFFFF',
        fontFamily: 'Montserrat, sans-serif',
      }}
    >
      {/* Left: switch user + identity chip + service period */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          type="button"
          aria-label="Switch user"
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <img src={switchUserIcon} alt="" className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 pl-0 pr-2 md:pr-3 bg-white/10 hover:bg-white/15 rounded-full transition-colors"
        >
          <span
            className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{ background: '#3F3F46', color: '#FFFFFF' }}
          >
            G
          </span>
          <span className="text-xs md:text-sm font-medium">Guest</span>
          <span
            className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            Staff
          </span>

          <span className="hidden md:block w-px h-4 bg-white/20 mx-1" />

          <img src={dinnerIcon} alt="" className="hidden md:block w-4 h-4" />
          <span className="hidden md:inline text-[12px] text-white/90">
            Dinner Service (9:00 PM)
          </span>
        </button>
      </div>

      {/* Right: system controls */}
      <div className="flex items-center gap-2 md:gap-3">
        <ScreenModeChip />

        <button
          type="button"
          data-onboarding="ai"
          onClick={onToggleAiAssistant}
          aria-label={aiAssistantOpen ? 'Close AI assistant' : 'Open AI assistant'}
          aria-pressed={aiAssistantOpen}
          className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/10"
          style={aiAssistantOpen ? { background: 'linear-gradient(135deg, hsla(280, 80%, 75%, 0.35) 0%, hsla(220, 90%, 70%, 0.35) 100%)' } : undefined}
        >
          <AnimatedAIIcon size={20} />
        </button>

        <button
          type="button"
          aria-label="Local host"
          className="relative p-0.5 md:p-1 rounded hover:bg-white/10 transition-colors"
        >
          <img src={localHostIcon} alt="" className="w-4 h-4 md:w-5 md:h-5" />
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
            style={{ background: '#F59E0B', border: `1.5px solid ${HEADER_BG}` }}
          />
        </button>

        <button
          type="button"
          aria-label="Refresh"
          className="hidden md:flex p-1 rounded hover:bg-white/10 transition-colors"
        >
          <img src={refreshIcon} alt="" className="w-5 h-5" />
        </button>

        <button
          type="button"
          aria-label="Support"
          className="hidden md:flex p-1.5 rounded-md transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <img src={supportIcon} alt="" className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            ref={notifBtnRef}
            type="button"
            aria-label="Notifications"
            aria-pressed={notifOpen}
            onClick={() => setNotifOpen(v => !v)}
            className="relative p-0.5 md:p-1 rounded hover:bg-white/10 transition-colors"
          >
            <img src={notificationIcon} alt="" className="w-4 h-4 md:w-5 md:h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full text-[9px] font-bold flex items-center justify-center px-0.5"
                style={{ background: '#ED1C24', color: '#FFFFFF' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationsPopover
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            anchorRef={notifBtnRef}
          />
        </div>

        <button
          type="button"
          aria-label="Network"
          className="p-0.5 md:p-1 rounded hover:bg-white/10 transition-colors"
        >
          <img src={wifiIcon} alt="" className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <div className="flex flex-col items-end leading-tight ml-1 tabular-nums">
          <span className="text-[12px] md:text-[13px] font-mono-timer text-white/95">
            {timeLabel}
          </span>
          <span className="text-[9px] md:text-[10px] text-white/60">
            {dateLabel}
          </span>
        </div>
      </div>
    </header>
  );
}
