import { LayoutGrid, LayoutList, Columns3, Sun, Moon } from 'lucide-react';
import type { ViewMode } from '@/types/kds';

interface BottomStatusBarProps {
  orderCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: string;
  onToggleTheme: () => void;
}

export function BottomStatusBar({ orderCount, viewMode, onViewModeChange, theme, onToggleTheme }: BottomStatusBarProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const viewModes: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
    { mode: 'list', icon: LayoutList, label: 'List' },
    { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
    { mode: 'horizontal', icon: Columns3, label: 'Horizontal' },
  ];

  return (
    <div className="h-[52px] bg-brand-dark flex items-center justify-between px-4 shrink-0 z-10">
      <span className="text-primary-foreground text-sm font-bold">
        {orderCount} Orders in Queue
      </span>

      <div className="flex items-center bg-primary-foreground/10 rounded-full p-0.5">
        {viewModes.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors min-h-[36px] ${
              viewMode === mode
                ? 'bg-primary-foreground text-brand-dark'
                : 'text-primary-foreground/50 hover:text-primary-foreground/80'
            }`}
            aria-label={`Switch to ${label} view`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors min-h-[44px] min-w-[44px]"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={16} className="text-primary-foreground/70" /> : <Sun size={16} className="text-warning" />}
        </button>
        <span className="text-primary-foreground/80 text-sm">
          {timeStr} &middot; {dateStr}
        </span>
      </div>
    </div>
  );
}
