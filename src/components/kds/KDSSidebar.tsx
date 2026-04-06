import { useState } from 'react';
import { useBadgeVisibility } from '@/hooks/use-badge-visibility';
import { useLanguage } from '@/hooks/use-language';
import {
  Home, Clock, Bell, Settings, Eye, CheckCircle, EyeOff,
  ArrowLeftRight, Menu,
} from 'lucide-react';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  badge?: number;
  action?: string;
}

interface KDSSidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onNavigate: (screen: string) => void;
  activeNav?: string;
  settingsOpen?: boolean;
}

export function KDSSidebar({ activeFilter, onFilterChange, onNavigate, activeNav = 'home', settingsOpen }: KDSSidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const { showBadge } = useBadgeVisibility();
  const { t } = useLanguage();

  const navItems: SidebarItem[] = [
    { icon: Home, label: t.home, action: 'home' },
    { icon: Clock, label: t.history, badge: 6, action: 'history' },
    { icon: Bell, label: t.alerts, badge: 3, action: 'alerts' },
    { icon: Settings, label: t.settings, action: 'settings' },
  ];

  const filterItems: SidebarItem[] = [
    { icon: Eye, label: t.newOrders, action: 'new' },
    { icon: CheckCircle, label: t.inProgress, action: 'in-progress' },
    { icon: EyeOff, label: t.hideCompleted, action: 'completed' },
  ];

  const w = expanded ? 'w-[200px]' : 'w-14';

  return (
    <div className={`${w} bg-sidebar-bg flex flex-col h-full shrink-0 transition-all duration-200 z-20`}>
      {/* Hamburger */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-[44px]"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
        {expanded && <span className="text-sm font-semibold">{t.menu}</span>}
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-1.5">
        {navItems.map((item) => (
          <button
            key={item.action}
            onClick={() => onNavigate(item.action!)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-[44px] relative ${
              (item.action === 'settings' ? settingsOpen : (!settingsOpen && activeNav === item.action)) ? 'border-l-2 border-brand-primary bg-sidebar-accent' : ''
            }`}
          >
            <item.icon size={20} />
            {expanded && <span className="text-sm">{item.label}</span>}
            {showBadge && item.badge && (
              <span className="absolute top-1.5 left-7 bg-brand-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mx-3 my-2 border-t border-sidebar-border" />

      {/* Filters */}
      <nav className="flex flex-col gap-0.5 px-1.5">
        {filterItems.map((item) => (
          <button
            key={item.action}
            onClick={() => onFilterChange(item.action!)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-[44px] ${
              activeFilter === item.action ? 'border-l-2 border-brand-primary bg-sidebar-accent/50' : ''
            }`}
          >
            <item.icon size={18} />
            {expanded && <span className="text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="mx-3 my-2 border-t border-sidebar-border" />

      {/* Switch to POS */}
      <button
        className="flex items-center gap-3 px-3 py-3 text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-[44px] mx-1.5 mb-2 rounded-md"
      >
        <ArrowLeftRight size={18} />
        {expanded && <span className="text-sm">{t.switchToPOS}</span>}
      </button>
    </div>
  );
}
