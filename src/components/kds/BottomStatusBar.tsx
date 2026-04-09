import { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Columns3, StretchHorizontal, Sun, Moon, ArrowUpDown, Volume2, VolumeX, Globe, Filter, Building2 } from 'lucide-react';
import type { ViewMode } from '@/types/kds';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useKDSMode } from '@/hooks/use-kds-mode';
import { useSound } from '@/hooks/use-sound';
import { useLanguage, formatTimeForKDS, formatDateForKDS } from '@/hooks/use-language';


export type SortMode = 'newest' | 'oldest' | 'table' | 'type';

interface BottomStatusBarProps {
  orderCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: string;
  onToggleTheme: () => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
  hideViewControls?: boolean;
  onOpenLanguageSettings?: () => void;
  onOpenCategoryFilter?: () => void;
  onOpenRevenueFilter?: () => void;
}

function SoundToggle() {
  const { muted, toggleMute } = useSound();

  return (
    <button
      onClick={toggleMute}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors min-h-[44px] min-w-[44px]"
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {muted ? <VolumeX size={16} className="text-primary-foreground/70" /> : <Volume2 size={16} className="text-primary-foreground/70" />}
    </button>
  );
}

function LanguageToggle({ onOpen }: { onOpen?: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors min-h-[44px] min-w-[44px] gap-1"
      aria-label="Change language"
    >
      <Globe size={16} className="text-primary-foreground/70" />
    </button>
  );
}

export function BottomStatusBar({ orderCount, viewMode, onViewModeChange, theme, onToggleTheme, sortMode, onSortModeChange, hideViewControls, onOpenLanguageSettings, onOpenCategoryFilter, onOpenRevenueFilter }: BottomStatusBarProps) {
  const { mode: kdsMode } = useKDSMode();
  const { t, timeFormat: tfmt, dateFormat: dfmt } = useLanguage();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const timeStr = formatTimeForKDS(now, tfmt);
  const dateStr = formatDateForKDS(now, dfmt);

  const sortOptions: { value: SortMode; label: string }[] = [
    { value: 'newest', label: t.sortNewToOld },
    { value: 'oldest', label: t.sortOldToNew },
    { value: 'table', label: t.sortByTable },
    { value: 'type', label: t.sortByType },
  ];

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
    { mode: 'grid', icon: LayoutGrid, label: t.grid },
    { mode: 'horizontal', icon: Columns3, label: t.horizontal },
    { mode: 'stagger', icon: StretchHorizontal, label: t.stagger },
  ];

  return (
    <div className="h-[52px] bg-brand-dark flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <span className="text-primary-foreground font-bold">
          <span className="text-lg">{orderCount}</span> <span className="text-sm">{t.ordersInQueue}</span>
        </span>
        {kdsMode === 'Prep' && (
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-foreground/15 text-primary-foreground/80">
            Prep Mode
          </span>
        )}
      </div>

      {!hideViewControls && (
      <div className="flex items-center gap-3">
        {/* Category filter */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenCategoryFilter}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors min-h-[36px] min-w-[36px]"
                aria-label="Category filter"
              >
                <Filter size={14} className="text-primary-foreground/70" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>{t.categoryFilter || 'Category Filter'}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Revenue center filter */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenRevenueFilter}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors min-h-[36px] min-w-[36px]"
                aria-label="Revenue center filter"
              >
                <Building2 size={14} className="text-primary-foreground/70" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>{t.revenueCenterFilter || 'Revenue Center Filter'}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Sort control */}
        <div className="relative" ref={sortRef}>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors min-h-[36px] min-w-[36px] ${
                    sortMode !== 'time'
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground'
                  }`}
                  aria-label="Sort orders"
                >
                  <ArrowUpDown size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>{activeSort.label}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
      )}

      <div className="flex items-center gap-3">
        <LanguageToggle onOpen={onOpenLanguageSettings} />
        <SoundToggle />
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
