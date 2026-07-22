import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  RefreshCw,
  Headphones,
  Bell,
  Wifi,
  UtensilsCrossed,
} from 'lucide-react';
import AnimatedAIIcon from '@/components/kds/AnimatedAIIcon';
import ScreenModeChip from '@/components/kds/ScreenModeChip';
import { useNotifications } from '@/hooks/use-notifications';

const HEADER_H = 44;
const HEADER_BG = '#0D0D1A';

/**
 * Global KDS top header. Mirrors the POS mobile app header:
 * switch-user, identity chip (Guest · STAFF), service period, then
 * screen mode / AI / refresh / support / notifications / wifi / clock.
 * Positioned fixed so it sits above the training bar offset seamlessly.
 */
export function KDSTopHeader() {
  const [time, setTime] = useState(() => new Date());
  const { unreadCount } = useNotifications();

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

  const timeLabel = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

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
          <ArrowLeftRight size={16} className="text-white/80" />
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

          <UtensilsCrossed size={14} className="hidden md:block text-white/70" />
          <span className="hidden md:inline text-[12px] text-white/90">
            Dinner Service (9:00 PM)
          </span>
        </button>
      </div>

      {/* Right: system controls */}
      <div className="flex items-center gap-2 md:gap-3">
        <ScreenModeChip />

        <div className="flex items-center justify-center">
          <AnimatedAIIcon size={20} />
        </div>

        <button
          type="button"
          aria-label="Local host"
          className="relative p-1 rounded hover:bg-white/10 transition-colors"
        >
          <RefreshCw size={16} className="text-white/80" />
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{ background: '#F59E0B', border: `1.5px solid ${HEADER_BG}` }}
          />
        </button>

        <button
          type="button"
          aria-label="Support"
          className="hidden md:flex p-1.5 rounded-md hover:bg-white/10 transition-colors"
        >
          <Headphones size={16} className="text-white/80" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative p-1 rounded hover:bg-white/10 transition-colors"
        >
          <Bell size={16} className="text-white/80" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full text-[9px] font-bold flex items-center justify-center px-0.5"
              style={{ background: '#ED1C24', color: '#FFFFFF' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          aria-label="Network"
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <Wifi size={16} className="text-white/80" />
        </button>

        <span
          className="text-[12px] md:text-[13px] font-mono-timer tabular-nums text-white/90 ml-1"
        >
          {timeLabel}
        </span>
      </div>
    </header>
  );
}
