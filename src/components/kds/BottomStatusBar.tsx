import { useState, useRef, useEffect, useCallback } from 'react';
import { LayoutGrid, Columns3, StretchHorizontal, Sun, Moon, ArrowUpDown, Volume2, VolumeX, Languages, Filter, Building2, Package, Utensils, Check } from 'lucide-react';
import { DEFAULT_ORDER_TYPE_COLORS, useKDSSettings } from '@/hooks/use-kds-settings';
import type { OrderType } from '@/types/kds';
import AnimatedAIIcon from './AnimatedAIIcon';
import { usePortrait } from '@/hooks/use-portrait';
import type { ViewMode } from '@/types/kds';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useKDSMode } from '@/hooks/use-kds-mode';
import { useSound } from '@/hooks/use-sound';
import { useLanguage } from '@/hooks/use-language';
import { DockDragHandle } from './DockDragHandle';
import { EightySixSheet, type EightySixedItem } from './EightySixSheet';
import OrderTypeFilterModal from './OrderTypeFilterModal';
import { useToast } from '@/hooks/use-toast';



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
  aiAssistantOpen?: boolean;
  onToggleAiAssistant?: () => void;
  orderTypeFilter?: OrderType[];
  onOrderTypeFilterChange?: (types: OrderType[]) => void;
}

function SoundToggle() {
  const { muted, toggleMute } = useSound();

  return (
    <button
      data-onboarding="sound"
      onClick={toggleMute}
      className="flex items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors w-9 h-9 min-h-[36px] min-w-[36px]"
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {muted ? <VolumeX size={15} className="text-primary-foreground/70" /> : <Volume2 size={15} className="text-primary-foreground/70" />}
    </button>
  );
}

function LanguageToggle({ onOpen }: { onOpen?: () => void }) {
  return (
    <button
      data-onboarding="language"
      onClick={onOpen}
      className="flex items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors w-9 h-9 min-h-[36px] min-w-[36px]"
      aria-label="Change Language"
    >
      <Languages size={15} className="text-primary-foreground/70" />
    </button>
  );
}

export function BottomStatusBar({ orderCount, viewMode, onViewModeChange, theme, onToggleTheme, sortMode, onSortModeChange, hideViewControls, onOpenLanguageSettings, onOpenCategoryFilter, onOpenRevenueFilter, aiAssistantOpen, onToggleAiAssistant, orderTypeFilter, onOrderTypeFilterChange }: BottomStatusBarProps) {
  const { mode: kdsMode, stationCourse } = useKDSMode();
  const { t } = useLanguage();
  const { orderTypeColors } = useKDSSettings();
  const { isPortrait } = usePortrait();
  const { toast } = useToast();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const typeFilterRef = useRef<HTMLDivElement>(null);

  // 86 Items state
  const [eightySixOpen, setEightySixOpen] = useState(false);
  const [eightySixedItems, setEightySixedItems] = useState<EightySixedItem[]>([]);

  const handleEightySixItem = useCallback(
    (item: { name: string; category: string; snoozeDuration: string; quantity?: number }) => {
      const durations: Record<string, number | null> = {
        '15min': 15 * 60 * 1000,
        '1hr': 60 * 60 * 1000,
        'end_of_shift': 8 * 60 * 60 * 1000,
        'indefinite': null,
      };
      const ms = durations[item.snoozeDuration];
      const newItem: EightySixedItem = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        name: item.name,
        category: item.category,
        reason: 'Out of Stock',
        snoozedAt: new Date(),
        snoozeEndTime: ms ? new Date(Date.now() + ms) : null,
        quantity: item.quantity ?? 1,
      };
      setEightySixedItems(prev => [...prev, newItem]);
      toast({
        title: "Product 86'd",
        description: `${newItem.quantity > 1 ? `${newItem.quantity} x ` : ''}${item.name} marked as unavailable`,
      });
    },
    [toast],
  );

  const handleRestoreItem = useCallback((itemId: string) => {
    setEightySixedItems(prev => prev.filter(i => i.id !== itemId));
    toast({ title: 'Product Restored', description: 'Product is now available again' });
  }, [toast]);

  const handleScheduleRestore = useCallback((itemId: string, restoreTime: Date) => {
    setEightySixedItems(prev => prev.map(i => i.id === itemId ? { ...i, scheduledRestoreTime: restoreTime } : i));
    toast({
      title: 'Restore Scheduled',
      description: `Product will be restored at ${restoreTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
    });
  }, [toast]);

  // Auto-restore when scheduled time reached
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setEightySixedItems(prev => {
        const stillActive = prev.filter(i => !(i.scheduledRestoreTime && i.scheduledRestoreTime <= now));
        return stillActive.length === prev.length ? prev : stillActive;
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, []);



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

  useEffect(() => {
    if (!typeFilterOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (typeFilterRef.current && !typeFilterRef.current.contains(e.target as Node)) {
        setTypeFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [typeFilterOpen]);

  const orderTypeOptions: { value: OrderType; label: string }[] = [
    { value: 'dine-in', label: 'Dine In' },
    { value: 'take-out', label: 'Take Out' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'banquet', label: 'Banquet' },
    { value: 'drive-thru', label: 'Drive Thru' },
    { value: 'curb-side', label: 'Curb Side' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'phone-in', label: 'Phone-In' },
  ];
  const activeTypes = orderTypeFilter ?? [];
  const toggleType = (v: OrderType) => {
    if (!onOrderTypeFilterChange) return;
    onOrderTypeFilterChange(activeTypes.includes(v) ? activeTypes.filter(x => x !== v) : [...activeTypes, v]);
  };

  const viewModes: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
    { mode: 'grid', icon: LayoutGrid, label: t.grid },
    { mode: 'horizontal', icon: Columns3, label: t.horizontal },
    { mode: 'stagger', icon: StretchHorizontal, label: t.stagger },
  ];

  return (
    <>
    <div className="h-[52px] bg-brand-dark flex items-center justify-center px-4 shrink-0 z-10 gap-2">

      <div className="flex flex-1 items-center gap-2 shrink-0">
        <DockDragHandle
          panel="bottomBar"
          orientation="horizontal"
          ariaLabel="Drag to dock status bar"
          className="text-primary-foreground"
          showLock={false}
        />
        <span data-onboarding="queue-count" className="text-primary-foreground font-bold">
          <span className="text-lg">{orderCount}</span>{' '}
          <span className="text-sm">{t.ordersInQueue}</span>
        </span>
        {kdsMode === 'Prep' && (
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-foreground/15 text-primary-foreground/80">
            {stationCourse
              ? `${stationCourse} Station Mode`
              : 'Prep Mode'}
          </span>
        )}
      </div>

      {!hideViewControls && (
      <div className={`flex-none flex items-center ${isPortrait ? 'gap-2' : 'gap-3'}`}>
        {/* Category filter */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-onboarding="filter"
                onClick={onOpenCategoryFilter}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors min-h-[36px] min-w-[36px]"
                aria-label="Category Filter"
              >
                <Filter size={15} className="text-primary-foreground/70" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>{t.categoryFilter || 'Category filter'}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Revenue center filter */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-onboarding="revenue"
                onClick={onOpenRevenueFilter}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors min-h-[36px] min-w-[36px]"
                aria-label="Revenue Center Filter"
              >
                <Building2 size={15} className="text-primary-foreground/70" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>{t.revenueCenterFilter || 'Revenue center filter'}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Order type filter */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-onboarding="order-type-filter"
                onClick={() => setTypeFilterOpen(true)}
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors min-h-[36px] min-w-[36px] relative ${
                  activeTypes.length > 0
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground'
                }`}
                aria-label="Filter by Order Type"
              >
                <Utensils size={15} />
                {activeTypes.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeTypes.length}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Order Type</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>








        {/* Sort control */}
        <div className="relative" ref={sortRef}>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  data-onboarding="sort"
                  onClick={() => setSortOpen(!sortOpen)}
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors min-h-[36px] min-w-[36px] ${
                    sortMode !== 'newest'
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground'
                  }`}
                  aria-label="Sort Orders"
                >
                  <ArrowUpDown size={15} />
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
        <div className="flex items-center bg-primary-foreground/10 rounded-full p-0.5 gap-0.5">
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              data-onboarding={`view-${mode}`}
              onClick={() => onViewModeChange(mode)}
              className={`flex items-center justify-center ${isPortrait ? 'w-9 h-9' : 'gap-1.5 px-3'} py-1.5 rounded-full text-xs font-bold transition-colors min-h-[36px] ${
                viewMode === mode
                  ? 'bg-primary-foreground text-brand-dark'
                  : 'text-primary-foreground/50 hover:text-primary-foreground/80'
              }`}
              aria-label={`Switch to ${label} view`}
            >
              <Icon size={15} />
              {!isPortrait && <span>{label}</span>}
            </button>
          ))}
        </div>

        {/* Language, Sound, Theme - grouped with layout icons */}
        <LanguageToggle onOpen={onOpenLanguageSettings} />
        <SoundToggle />
        <button
          data-onboarding="theme"
          onClick={onToggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors min-h-[36px] min-w-[36px]"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={15} className="text-primary-foreground/70" /> : <Sun size={15} className="text-warning" />}
        </button>
        {/* 86 Items */}
        <button
          data-onboarding="eighty-six"
          onClick={() => setEightySixOpen(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-xl hover:opacity-80 transition-opacity shrink-0 h-[36px]"
          style={{ background: eightySixedItems.length > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(100, 100, 100, 0.4)' }}
          aria-label="86 products"
        >
          <div className="flex flex-col items-center leading-tight">
            <span className="text-[10px] text-white">86</span>
            <span className="text-[10px] text-white">Products</span>
          </div>
          <Package className={`w-4 h-4 ${eightySixedItems.length > 0 ? 'text-[#FF6B6B]' : 'text-white/50'}`} />
          {eightySixedItems.length > 0 && (
            <span className="text-[#FF6B6B] text-sm font-bold">({eightySixedItems.length})</span>
          )}
        </button>
      </div>
      )}

    </div>
    <EightySixSheet
      open={eightySixOpen}
      onOpenChange={setEightySixOpen}
      eightySixedItems={eightySixedItems}
      onRestoreItem={handleRestoreItem}
      onScheduleRestore={handleScheduleRestore}
      onEightySixItem={handleEightySixItem}
    />
    <OrderTypeFilterModal
      open={typeFilterOpen}
      onClose={() => setTypeFilterOpen(false)}
      activeTypes={activeTypes}
      onApply={(types) => onOrderTypeFilterChange?.(types)}
    />
    </>
  );
}

