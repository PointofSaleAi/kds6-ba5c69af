import { useState } from 'react';
import { useBadgeVisibility } from '@/hooks/use-badge-visibility';
import { useLanguage } from '@/hooks/use-language';
import { useKitchenMessages } from '@/hooks/use-kitchen-messages';
import { useNotifications } from '@/hooks/use-notifications';
import { useKDSMode } from '@/hooks/use-kds-mode';
import {
  Clock, Bell, Settings, Eye, EyeOff, CheckCircle2, Undo2,
} from 'lucide-react';
import { TicketsIcon } from './icons/TicketsIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import restaurantLogo from '@/assets/icons/restaurant-logo.png';
import versionIcon from '@/assets/version-icon.svg';
import { DockDragHandle } from './DockDragHandle';

const APP_VERSION = '4.10.2';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  badge?: number;
  badgeColor?: string;
  action?: string;
}

interface KDSSidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onNavigate: (screen: string) => void;
  activeNav?: string;
  settingsOpen?: boolean;
  seenCount?: number;
  unseenCount?: number;
  historyCount?: number;
}

export function KDSSidebar({ activeFilter, onFilterChange, onNavigate, activeNav = 'home', settingsOpen, seenCount = 0, unseenCount = 0, historyCount = 0 }: KDSSidebarProps) {
  const { showBadge } = useBadgeVisibility();
  const { t } = useLanguage();
  const { pendingCount: pendingMessageCount } = useKitchenMessages();
  const { unreadCount: unreadNotifCount } = useNotifications();
  const { mode: kdsMode } = useKDSMode();
  const [expanded, setExpanded] = useState(false);

  const isExpo = kdsMode === 'Expo';

  const navItems: SidebarItem[] = isExpo
    ? [
        { icon: TicketsIcon, label: 'All', action: 'home' },
        { icon: CheckCircle2, label: 'Ready Only', action: 'seen-orders' },
        { icon: Undo2, label: 'Recalled', action: 'unseen-orders' },
        { icon: Clock, label: t.history, badge: historyCount || undefined, action: 'history' },
        { icon: Bell, label: t.alerts, badge: unreadNotifCount + pendingMessageCount, action: 'alerts' },
        { icon: Settings, label: t.settings, action: 'settings' },
      ]
    : [
        { icon: TicketsIcon, label: 'All', action: 'home' },
        { icon: Eye, label: t.newOrders, action: 'seen-orders', badge: seenCount || undefined, badgeColor: 'bg-[#2980B9]' },
        { icon: EyeOff, label: t.hideCompleted, action: 'unseen-orders', badge: unseenCount || undefined, badgeColor: 'bg-[#E84C3D]' },
        { icon: Clock, label: t.history, badge: historyCount || undefined, action: 'history' },
        { icon: Bell, label: t.alerts, badge: unreadNotifCount + pendingMessageCount, action: 'alerts' },
        { icon: Settings, label: t.settings, action: 'settings' },
      ];


  const isActive = (item: SidebarItem) => {
    if (item.action === 'settings') return settingsOpen;
    return !settingsOpen && activeNav === item.action;
  };

  const renderButton = (item: SidebarItem) => (
    <Tooltip key={item.action}>
      <TooltipTrigger asChild>
        <button
          onClick={() => onNavigate(item.action!)}
          className={`flex-1 flex items-center ${expanded ? 'justify-start px-3 gap-3' : 'justify-center'} rounded-xl transition-all duration-200 min-h-[44px] relative
            ${isActive(item)
              ? 'bg-sidebar-accent border-2 border-white/80'
              : 'hover:bg-white/20 border-2 border-transparent'
            }`}
        >
          <span className="relative shrink-0">
            <item.icon size={item.icon === TicketsIcon ? 26 : 22} className="text-sidebar-foreground" />
            {showBadge && item.badge != null && item.badge > 0 && (
              <span className={`absolute -top-1.5 -right-2 ${item.badgeColor || 'bg-[#E84C3D]'} text-primary-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5`}>
                {item.badge}
              </span>
            )}
          </span>
          {expanded && (
            <span className="text-sidebar-foreground text-xs font-semibold whitespace-nowrap overflow-hidden">
              {item.label}
            </span>
          )}
        </button>
      </TooltipTrigger>
      {!expanded && (
        <TooltipContent side="right" className="text-xs">
          {item.label}
        </TooltipContent>
      )}
    </Tooltip>
  );

  return (
      <TooltipProvider delayDuration={300}>
        <div className={`${expanded ? 'w-48' : 'w-20'} py-2 px-2 bg-transparent flex flex-col h-full shrink-0 z-20 transition-all duration-300 ease-out`}>
        <div
          className="h-full rounded-2xl flex flex-col gap-1 py-2 px-1.5 relative bg-tickets-bg"
          style={{
            boxShadow: 'inset 4px 4px 24px rgba(255,255,255,0.15)',
          }}
        >
          <div className="flex flex-col items-center gap-1 pt-1 pb-1 shrink-0">
            <DockDragHandle
              panel="mainSidebar"
              orientation="vertical"
              ariaLabel="Drag to dock main sidebar"
              className="text-sidebar-foreground"
            />
          </div>
          {/* Restaurant Logo - tap to expand/collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center w-full h-14 shrink-0 rounded-xl hover:bg-white/20 transition-all duration-200"
          >
            <img src={restaurantLogo} alt="Restaurant" className="w-12 h-12 object-contain" />
          </button>

          <div className="mx-2 border-t border-white/10" />

          {/* All nav items with equal spacing */}
          {navItems.map(renderButton)}

          {/* Version logo + version number */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex ${expanded ? 'flex-row items-center justify-start px-3 gap-2' : 'flex-col items-center justify-center gap-0.5'} shrink-0 pt-1 pb-1 rounded-xl`}
              >
                <img
                  src={versionIcon}
                  alt="Point of Sale Ai"
                  className={`${expanded ? 'w-8 h-8' : 'w-9 h-9'} object-contain shrink-0`}
                />
                <span className="text-sidebar-foreground/70 text-[9px] font-semibold tracking-wide whitespace-nowrap">
                  v{APP_VERSION}
                </span>
              </div>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right" className="text-xs">
                Point of Sale Ai v{APP_VERSION}
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
