import { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Columns3, StretchHorizontal, Sun, Moon, ArrowUpDown, Volume2, VolumeX } from 'lucide-react';
import type { ViewMode } from '@/types/kds';
import { useKDSMode } from '@/hooks/use-kds-mode';

export type SortMode = 'time' | 'table' | 'type';

interface BottomStatusBarProps {
  orderCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: string;
  onToggleTheme: () => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
}

const sortOptions: { value: SortMode; label: string }[] = [
  { value: 'time', label: 'By Time' },
  { value: 'table', label: 'By Table' },
  { value: 'type', label: 'By Type' },
];

export function BottomStatusBar({ orderCount, viewMode, onViewModeChange, theme, onToggleTheme, sortMode, onSortModeChange }: BottomStatusBarProps) {
  const { mode: kdsMode } = useKDSMode();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const activeSort = sortOptions.find(s => s.value === sortMode)!;

  useEffect(() => {
    if (!sortOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sortOpen]);

  const viewModes: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
    { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
    { mode: 'horizontal', icon: Columns3, label: 'Horizontal' },
    { mode: 'stagger', icon: StretchHorizontal, label: 'Stagger' },
  ];

  return (
    <div className="h-[52px] bg-brand-dark flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <span className="text-primary-foreground font-bold">
          <span className="text-lg">{orderCount}</span> <span className="text-sm">Orders in Queue</span>
        </span>
        {kdsMode !== 'Standard' && (
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-foreground/15 text-primary-foreground/80">
            {kdsMode} Mode
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Sort control */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors min-h-[36px] ${
              sortMode !== 'time'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground'
            }`}
            aria-label="Sort orders"
          >
            <ArrowUpDown size={14} />
            <span>{sortMode === 'time' ? 'Sort' : `Sort: ${activeSort.label}`}</span>
          </button>

          {sortOpen && (
            <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-50">
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { onSortModeChange(opt.value); setSortOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors min-h-[40px] ${
                    sortMode === opt.value
                      ? 'bg-brand-primary/10 text-brand-primary font-bold'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View mode toggle */}
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
