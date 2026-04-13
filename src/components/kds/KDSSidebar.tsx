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
          className={`flex-1 flex items-center justify-center rounded-xl transition-all duration-200 min-h-[44px] relative
            ${isActive(item)
              ? 'bg-sidebar-accent border-2 border-white/80'
              : 'hover:bg-white/20 border-2 border-transparent'
            }`}
        >
          <item.icon size={22} className="text-sidebar-foreground" />
          {showBadge && item.badge != null && item.badge > 0 && (
            <span className={`absolute top-1 right-1 ${item.badgeColor || 'bg-brand-primary'} text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center`}>
              {item.badge}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-20 py-2 px-2 bg-sidebar-bg flex flex-col h-full shrink-0 z-20">
        <div
          className="h-full rounded-2xl flex flex-col gap-1 py-2 px-1.5"
          style={{
            background: '#7575754D',
            boxShadow: 'inset 4px 4px 24px rgba(255,255,255,0.15)',
          }}
        >
          {/* Main nav */}
          <div className="flex flex-col gap-1 flex-[4]">
            {navItems.map(renderButton)}
          </div>

          <div className="mx-2 border-t border-white/10" />

          {/* Seen / Unseen */}
          <div className="flex flex-col gap-1 flex-[2]">
            {filterItems.map(renderButton)}
          </div>

          <div className="flex-1" />

          <div className="mx-2 border-t border-white/10" />

          {/* Switch to POS */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex items-center justify-center rounded-xl hover:bg-white/20 transition-all duration-200 min-h-[44px] border-2 border-transparent">
                <ArrowLeftRight size={20} className="text-sidebar-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {t.switchToPOS}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
