import { useState } from 'react';
import { useBadgeVisibility } from '@/hooks/use-badge-visibility';
import { useLanguage } from '@/hooks/use-language';
import {
  Home, Clock, Bell, Settings, Eye, EyeOff,
  ArrowLeftRight,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import restaurantLogo from '@/assets/icons/restaurant-logo.png';

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
}

export function KDSSidebar({ activeFilter, onFilterChange, onNavigate, activeNav = 'home', settingsOpen, seenCount = 0, unseenCount = 0 }: KDSSidebarProps) {
  const { showBadge } = useBadgeVisibility();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const navItems: SidebarItem[] = [
    { icon: Home, label: t.home, action: 'home' },
    { icon: Clock, label: t.history, badge: 6, action: 'history' },
    { icon: Bell, label: t.alerts, badge: 3, action: 'alerts' },
    { icon: Settings, label: t.settings, action: 'settings' },
  ];

  const filterItems: SidebarItem[] = [
    { icon: Eye, label: t.newOrders, action: 'seen-orders', badge: seenCount || undefined, badgeColor: 'bg-[#2980B9]' },
    { icon: EyeOff, label: t.hideCompleted, action: 'unseen-orders', badge: unseenCount || undefined, badgeColor: 'bg-[#E84C3D]' },
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
          <item.icon size={22} className="text-sidebar-foreground shrink-0" />
          {expanded && (
            <span className="text-sidebar-foreground text-xs font-semibold whitespace-nowrap overflow-hidden">
              {item.label}
            </span>
          )}
          {showBadge && item.badge != null && item.badge > 0 && (
            <span className={`absolute top-1 right-1 ${item.badgeColor || 'bg-brand-primary'} text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center`}>
              {item.badge}
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
      <div className={`${expanded ? 'w-48' : 'w-20'} py-2 px-2 bg-sidebar-bg flex flex-col h-full shrink-0 z-20 transition-all duration-300 ease-out`}>
        <div
          className="h-full rounded-2xl flex flex-col gap-1 py-2 px-1.5"
          style={{
            background: '#7575754D',
            boxShadow: 'inset 4px 4px 24px rgba(255,255,255,0.15)',
          }}
        >
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

          <div className="mx-2 border-t border-white/10" />

          {/* Seen / Unseen */}
          {filterItems.map(renderButton)}

          <div className="mx-2 border-t border-white/10" />

          {/* Switch to POS */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`flex-1 flex items-center ${expanded ? 'justify-start px-3 gap-3' : 'justify-center'} rounded-xl hover:bg-white/20 transition-all duration-200 min-h-[44px] border-2 border-transparent`}
              >
                <ArrowLeftRight size={20} className="text-sidebar-foreground shrink-0" />
                {expanded && (
                  <span className="text-sidebar-foreground text-xs font-semibold whitespace-nowrap overflow-hidden">
                    {t.switchToPOS}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right" className="text-xs">
                {t.switchToPOS}
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
