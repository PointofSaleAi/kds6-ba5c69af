import { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { usePortrait } from '@/hooks/use-portrait';
import { useStatusRules } from '@/hooks/use-status-rules';
import { ChevronRight, ChevronLeft, ChevronDown, AlertTriangle } from 'lucide-react';
import { DockDragHandle } from './DockDragHandle';
import cookingSummaryIcon from '@/assets/cooking-summary-icon.svg';
import type { Order, ProductCategory, StationName } from '@/types/kds';
import { courseAgingElapsed, isCourseActive } from '@/lib/kds-aging';

interface OvertimeItem {
  name: string;
  count: number;
  oldestSeconds: number;
}

/**
 * Walk every active (unfired, has remaining items) course in every active order.
 * For each course, compute the unified aging-elapsed seconds (matches OrderCard).
 * Yields one record per remaining item with its overtime flag and elapsed time.
 */
function collectActiveItems(
  orders: Order[],
  thresholdSeconds: number,
  now: number,
  courseLevelAging: boolean,
  stationCourseFilter?: string,
  mode: 'active' | 'completed' = 'active',
) {
  const records: Array<{
    name: string;
    category: ProductCategory;
    quantity: number;
    isNew: boolean;
    isOvertime: boolean;
    elapsedSeconds: number;
  }> = [];
  for (const order of orders) {
    if (mode === 'active' && order.status === 'served') continue;
    for (const cg of order.courses) {
      if (mode === 'active') {
        const courseHasRemaining = cg.items.some(i => !i.isCompleted && !i.isCancelled);
        if (!courseHasRemaining) continue;
        if (!stationCourseFilter && !isCourseActive(cg)) continue;
      }
      const elapsed = courseAgingElapsed(order, cg, courseLevelAging, now);
      const isOvertime = mode === 'active' && elapsed >= thresholdSeconds;
      for (const item of cg.items) {
        if (item.isCancelled) continue;
        if (mode === 'active' && item.isCompleted) continue;
        if (mode === 'completed' && !item.isCompleted) continue;
        const cat = (item.category || ('Uncategorized' as ProductCategory)) as ProductCategory;
        if (stationCourseFilter && cat !== stationCourseFilter) continue;
        records.push({
          name: item.name,
          category: cat,
          quantity: item.quantity,
          isNew: !!item.isNew,
          isOvertime,
          elapsedSeconds: elapsed,
        });
      }
    }
  }
  return records;
}

function buildOvertimeItems(
  records: ReturnType<typeof collectActiveItems>,
): OvertimeItem[] {
  const map = new Map<string, { count: number; oldestSeconds: number }>();
  for (const r of records) {
    if (!r.isOvertime) continue;
    const existing = map.get(r.name) || { count: 0, oldestSeconds: 0 };
    // Count overtime occurrences (line-item instances), NOT total quantity
    existing.count += 1;
    if (r.elapsedSeconds > existing.oldestSeconds) existing.oldestSeconds = r.elapsedSeconds;
    map.set(r.name, existing);
  }
  return Array.from(map.entries())
    .map(([name, d]) => ({ name, count: d.count, oldestSeconds: d.oldestSeconds }))
    .sort((a, b) => b.oldestSeconds - a.oldestSeconds || b.count - a.count || a.name.localeCompare(b.name));
}

function formatMins(seconds: number): string {
  return `${Math.floor(seconds / 60)}m`;
}

interface ItemSummaryPanelProps {
  orders: Order[];
  stationCourse?: string;
  selectedItems?: Set<string>;
  onItemToggle?: (itemName: string) => void;
  selectedCategories?: Set<string>;
  onCategoryToggle?: (category: string) => void;
  onClearAll?: () => void;
  matchingTicketCount?: number;
  /** 'active' = show in-progress items (default). 'completed' = show served/done items (used in History). */
  mode?: 'active' | 'completed';
}

interface CategorySummary {
  category: ProductCategory;
  hasOvertime: boolean;
  items: { name: string; remaining: number; hasNew: boolean; isOvertime: boolean }[];
}

const AVAILABLE_STATIONS: StationName[] = ['Grill', 'Fry', 'Salad', 'Dessert', 'Bar'];

function buildSummary(records: ReturnType<typeof collectActiveItems>): CategorySummary[] {
  const map = new Map<
    ProductCategory,
    Map<string, { remaining: number; hasNew: boolean; isOvertime: boolean }>
  >();

  for (const r of records) {
    if (!map.has(r.category)) map.set(r.category, new Map());
    const items = map.get(r.category)!;
    const existing = items.get(r.name) || { remaining: 0, hasNew: false, isOvertime: false };
    existing.remaining += r.quantity;
    if (r.isNew) existing.hasNew = true;
    if (r.isOvertime) existing.isOvertime = true;
    items.set(r.name, existing);
  }

  return Array.from(map.entries())
    .map(([category, items]) => {
      const itemList = Array.from(items.entries())
        .map(([name, data]) => ({
          name,
          remaining: data.remaining,
          hasNew: data.hasNew,
          isOvertime: data.isOvertime,
        }))
        .filter(i => i.remaining > 0)
        .sort((a, b) => {
          if (a.isOvertime !== b.isOvertime) return a.isOvertime ? -1 : 1;
          return b.remaining - a.remaining;
        });
      return {
        category,
        hasOvertime: itemList.some(i => i.isOvertime),
        items: itemList,
      };
    })
    .filter(c => c.items.length > 0);
}

export function ItemSummaryPanel({ orders, stationCourse, selectedItems, onItemToggle, selectedCategories, onCategoryToggle, onClearAll, matchingTicketCount, mode = 'active' }: ItemSummaryPanelProps) {
  const { tp, tcat, t } = useLanguage();
  const { isPortrait } = usePortrait();
  const { rules, courseLevelAging } = useStatusRules();
  const [collapsed, setCollapsed] = useState(false);

  // Tick every 10s to refresh live elapsed times
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 10000);
    return () => clearInterval(id);
  }, []);

  // Overtime threshold = minMinutes of the last (open-ended) rule
  const overtimeThresholdSec = useMemo(() => {
    const last = rules[rules.length - 1];
    return (last?.minMinutes ?? 21) * 60;
  }, [rules]);

  // Single pass over orders → records used by both Overtime + category sections.
  // Uses unified aging (matches OrderCard) so overtime stays in sync with cards.
  const activeRecords = useMemo(
    () => collectActiveItems(orders, overtimeThresholdSec, nowMs, courseLevelAging, stationCourse, mode),
    [orders, overtimeThresholdSec, nowMs, courseLevelAging, stationCourse, mode]
  );
  const summary = useMemo(() => buildSummary(activeRecords), [activeRecords]);
  const overtimeItems = useMemo(() => mode === 'active' ? buildOvertimeItems(activeRecords) : [], [activeRecords, mode]);
  const overtimeTotal = overtimeItems.reduce((a, i) => a + i.count, 0);
  const [overtimeCollapsed, setOvertimeCollapsed] = useState(true);
  const totalRemaining = summary.reduce((acc, cat) => acc + cat.items.reduce((a, i) => a + i.remaining, 0), 0);
  const categoryCount = selectedCategories?.size ?? 0;
  const itemCount = selectedItems?.size ?? 0;
  const selectionCount = categoryCount + itemCount;

  const selectionLabel = useMemo(() => {
    if (selectionCount === 0) return '';
    const parts: string[] = [];
    if (categoryCount > 0) {
      const cats = Array.from(selectedCategories ?? []);
      parts.push(cats.join(', '));
    }
    if (itemCount > 0) parts.push(`${itemCount} item${itemCount > 1 ? 's' : ''}`);
    return parts.join(' + ');
  }, [selectionCount, categoryCount, itemCount, selectedCategories]);

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const hasSeededDefaults = useRef(false);

  useEffect(() => {
    if (hasSeededDefaults.current) return;
    if (summary.length === 0 && overtimeItems.length === 0) return;
    hasSeededDefaults.current = true;
    setCollapsedSections(new Set(summary.map(c => c.category)));
    if (overtimeItems.length > 0) setOvertimeCollapsed(true);
  }, [summary, overtimeItems]);

  const [expandAllOn, setExpandAllOn] = useState(false);

  const toggleSection = (cat: string) => {
    setExpandAllOn(false);
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleOvertimeToggle = () => {
    setExpandAllOn(false);
    setOvertimeCollapsed(v => !v);
  };

  const toggleAllSections = () => {
    if (expandAllOn) {
      setCollapsedSections(new Set(summary.map(c => c.category)));
      if (overtimeItems.length > 0) setOvertimeCollapsed(true);
      setExpandAllOn(false);
    } else {
      setCollapsedSections(new Set());
      if (overtimeItems.length > 0) setOvertimeCollapsed(false);
      setExpandAllOn(true);
    }
  };


  const [assigningItem, setAssigningItem] = useState<string | null>(null);
  const [assignedStations, setAssignedStations] = useState<Map<string, StationName>>(new Map());

  const handleAssignStation = (itemName: string, station: StationName) => {
    setAssignedStations(prev => {
      const next = new Map(prev);
      next.set(itemName, station);
      return next;
    });
    setAssigningItem(null);
  };

  if (collapsed) {
    return (
      <div className="w-10 bg-sidebar border-l border-sidebar-border flex flex-col items-center py-3 shrink-0">
        <button onClick={() => setCollapsed(false)} className="p-1 rounded-full bg-sidebar-foreground/10 hover:bg-sidebar-foreground/20 min-w-[32px] min-h-[32px] flex items-center justify-center text-sidebar-foreground transition-colors" aria-label="Expand panel">
          <ChevronLeft size={18} strokeWidth={3} />
        </button>
        <span className="text-[14px] font-bold text-white mt-2 [writing-mode:vertical-lr]">{totalRemaining} {t.toCookLabel}</span>
      </div>
    );
  }

  return (
    <div data-onboarding="summary" className="w-[180px] flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div data-onboarding="summary-header" className="group/header relative z-20 flex items-center justify-between px-2 bg-sidebar border-l border-sidebar-border">
        <div className="flex items-center gap-1.5 min-w-0">
          <DockDragHandle
            panel="summaryPanel"
            orientation="vertical"
            ariaLabel="Drag to dock summary panel"
            className="text-sidebar-foreground shrink-0"
            showLock={false}
          />
          <span
            className="text-[15px] font-semibold text-sidebar-foreground uppercase tracking-wide shrink-0"
          >
            {t.summaryHeader}
          </span>
          <span className="text-[11px] font-bold text-sidebar-accent-foreground bg-sidebar-accent rounded-full px-1.5 py-0.5 min-w-[22px] text-center shrink-0">{totalRemaining}</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 rounded-full bg-sidebar-foreground/10 hover:bg-sidebar-foreground/20 min-w-[28px] min-h-[28px] flex items-center justify-center text-sidebar-foreground shrink-0 transition-colors" aria-label="Collapse panel">
          <ChevronRight size={16} strokeWidth={3} />
        </button>
      </div>

      {/* Expand-all toggle row */}
      {(summary.length > 0 || overtimeItems.length > 0) && (
        <button
          type="button"
          onClick={toggleAllSections}
          aria-pressed={expandAllOn}
          className="flex items-center justify-between gap-2 px-2 py-2 bg-sidebar border-l border-b border-sidebar-border text-left"
        >
          <span className="text-[12px] font-medium text-sidebar-foreground truncate">
            {expandAllOn ? 'Collapse all categories' : 'Expand all categories'}
          </span>
          <span
            className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors shrink-0 ${
              expandAllOn ? 'bg-success' : 'bg-sidebar-foreground/25'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                expandAllOn ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      )}


      {/* Filter status bar */}
      {selectionCount > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#EFF6FF] dark:bg-muted border-l border-border border-b border-b-border transition-all duration-150">
          <span
            className="text-[11px] font-bold text-white rounded px-1.5 py-0.5"
            style={{ backgroundColor: '#3B82F6', borderRadius: '4px' }}
          >
            {matchingTicketCount !== undefined ? `${matchingTicketCount} ${t.ticketsLabel}` : selectionLabel}
          </span>
          <button
            onClick={onClearAll}
            className="text-[11px] font-medium transition-colors whitespace-nowrap"
            style={{ color: '#3B82F6' }}
          >
            {t.clearAll}
          </button>
        </div>
      )}

      {/* Categories section */}
      <div className="relative flex-1 flex flex-col bg-surface-card border-l border-border overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Overtime section - styled like a category section */}
          {overtimeItems.length > 0 && (
            <div data-onboarding="summary-overtime">
              <div
                className="flex items-center border-b border-border min-h-[36px] ring-1 ring-inset ring-border/50"
                style={{ borderLeft: '2px solid hsl(var(--destructive))' }}
              >
                <button
                  onClick={handleOvertimeToggle}
                  className="flex items-center justify-center px-1.5 shrink-0 min-w-[36px] min-h-[36px]"
                  aria-label={overtimeCollapsed ? 'Expand overtime' : 'Collapse overtime'}
                >
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <ChevronDown
                      size={16}
                      className={`text-text-primary dark:text-sidebar-foreground transition-transform duration-150 ${overtimeCollapsed ? '-rotate-90' : ''}`}
                    />
                  </div>
                </button>
                <div className="flex-1 flex items-center gap-1.5 py-2 pr-1">
                  
                  <span className="text-[12px] uppercase tracking-widest font-bold text-destructive">
                    {t.overtimeHeader}
                  </span>
                </div>
                <span className="text-[11px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center mr-2 shrink-0 bg-destructive text-destructive-foreground">
                  {overtimeTotal}
                </span>
              </div>

              {!overtimeCollapsed && (
                <div className="pl-1.5 pr-2 py-0.5">
                  {overtimeItems.map((item) => {
                    const isSelected = selectedItems?.has(item.name) ?? false;
                    return (
                      <div
                        key={`overtime-${item.name}`}
                        className="relative border-b border-border/30 last:border-b-0 bg-destructive/10 -ml-1.5 -mr-2 pl-1.5 pr-2 border-l-2 border-destructive animate-pulse"
                      >
                        <div
                          className={`flex items-center justify-between ${isPortrait ? 'py-[1px] gap-1' : 'py-[2px]'} cursor-pointer`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemToggle?.(item.name);
                          }}
                        >
                          <span
                            className={`min-w-0 uppercase leading-tight break-words ${isSelected ? 'font-bold' : 'font-medium'} text-text-primary`}
                            style={{ fontSize: 'var(--kds-summary-text)', ...(isSelected ? { borderLeft: '3px solid #3B82F6', paddingLeft: '6px', marginLeft: '-9px' } : {}) }}
                          >
                            {tp(item.name)}
                          </span>
                          <div className={`flex items-center ${isPortrait ? 'gap-0.5' : 'gap-1'} ml-0.5 shrink-0`}>
                            <span className="text-[10px] font-mono text-destructive tabular-nums">
                              {formatMins(item.oldestSeconds)}
                            </span>
                            <span
                              className={`text-right text-[14px] font-bold tabular-nums ${isSelected ? '' : 'text-destructive'}`}
                              style={isSelected ? { backgroundColor: '#3B82F6', color: '#FFFFFF', borderRadius: '9999px', padding: '0 6px', minWidth: '22px', textAlign: 'center', display: 'inline-block' } : undefined}
                            >
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {summary.length === 0 && overtimeItems.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-[12px] text-text-muted">{t.allItemsCompleted}</p>
            </div>
          )}
          {summary.map((cat, catIdx) => {
            const isUncategorized = cat.category === ('Uncategorized' as ProductCategory);
            const isStation = !!stationCourse && cat.category === stationCourse;
            const isMuted = false;
            const sectionTotal = cat.items.reduce((a, i) => a + i.remaining, 0);
            const isExpanded = !collapsedSections.has(cat.category);
            const isCategorySelected = selectedCategories?.has(cat.category) ?? false;

            const displayItems = isUncategorized
              ? cat.items.filter(item => !assignedStations.has(item.name))
              : cat.items;

            if (isUncategorized && displayItems.length === 0) return null;

            return (
              <div key={cat.category} {...(catIdx === 0 ? { 'data-onboarding': 'summary-category' } : {})}>
                {/* Section header */}
                <div className="flex items-center border-b border-border min-h-[36px] ring-1 ring-inset ring-border/50" style={isStation ? { borderLeft: '2px solid #4F46E5' } : undefined}>
                  {/* Chevron toggle */}
                  <button
                    onClick={() => toggleSection(cat.category)}
                    className="flex items-center justify-center px-1.5 shrink-0 min-w-[36px] min-h-[36px]"
                    aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                  >
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                      <ChevronDown
                        size={16}
                        className={`text-text-primary dark:text-sidebar-foreground transition-transform duration-150 ${isExpanded ? '' : '-rotate-90'}`}
                      />
                    </div>
                  </button>
                  {/* Category label - tappable for filtering */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isUncategorized) onCategoryToggle?.(cat.category);
                    }}
                    className={`flex-1 flex items-center gap-1.5 py-2 pr-1 transition-all duration-150 rounded cursor-pointer ${
                      !isUncategorized ? 'hover:bg-[rgba(59,130,246,0.06)]' : ''
                    } ${isCategorySelected ? 'border-b-2 border-[#3B82F6]' : ''}`}
                    style={{ borderRadius: '4px' }}
                  >
                    {isUncategorized && (
                      <AlertTriangle size={12} className="text-warning shrink-0" />
                    )}
                    <span className={`text-[12px] uppercase tracking-widest font-bold transition-colors duration-150 ${
                      isCategorySelected ? 'text-[#1D4ED8]' : isStation ? 'text-text-primary' : 'text-text-secondary'
                    }`}>
                      {tcat(cat.category)}
                    </span>
                  </button>
                  <span className={`text-[11px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center mr-2 shrink-0 transition-colors duration-150 ${
                    isCategorySelected
                      ? 'bg-[#3B82F6] text-white'
                      : cat.hasOvertime
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-text-muted text-white'
                  }`}>
                    {isUncategorized ? displayItems.reduce((a, i) => a + i.remaining, 0) : sectionTotal}
                  </span>
                </div>

                {/* Items */}
                {isExpanded && (
                  <div className="pl-1.5 pr-2 py-0.5">
                    {displayItems.map((item, itemIdx) => {
                      // Highlight only when actually overtime, never by quantity.
                      const tierClass = item.isOvertime
                        ? 'bg-destructive/10 -ml-1.5 -mr-2 pl-1.5 pr-2 border-l-2 border-destructive animate-pulse'
                        : '';
                      const countColor = item.isOvertime ? 'text-destructive' : 'text-text-primary';
                      const isAssigning = assigningItem === item.name;
                      const isSelected = selectedItems?.has(item.name) ?? false;
                      const isFirstProduct = catIdx === 0 && itemIdx === 0;

                      return (
                        <div key={item.name} {...(isFirstProduct ? { 'data-onboarding': 'summary-product' } : {})} className={`relative border-b border-border/30 last:border-b-0 ${isSelected ? '' : tierClass} ${item.hasNew ? '-ml-1.5 -mr-2 pl-1.5 pr-2' : ''}`}>
                          <div
                            className={`flex items-center justify-between ${isPortrait ? 'py-[1px] gap-1' : 'py-[2px]'} cursor-pointer`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onItemToggle?.(item.name);
                            }}
                          >
                            <span
                              className={`min-w-0 uppercase leading-tight break-words ${isSelected ? 'font-bold' : 'font-medium'} text-text-primary`}
                              style={{ fontSize: 'var(--kds-summary-text)', ...(isSelected ? { borderLeft: '3px solid #3B82F6', paddingLeft: '4px', marginLeft: '-7px' } : {}) }}
                            >
                              {tp(item.name)}
                            </span>
                            <div className={`flex items-center ${isPortrait ? 'gap-0.5' : 'gap-1'} ml-0.5 shrink-0`}>
                              {isUncategorized && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssigningItem(isAssigning ? null : item.name);
                                  }}
                                  className="text-[10px] text-text-muted hover:text-text-primary transition-colors font-medium"
                                >
                                  {t.assignAction}
                                </button>
                              )}
                              <span
                                className={`text-right text-[14px] font-bold tabular-nums ${isSelected ? '' : countColor}`}
                                style={isSelected ? { backgroundColor: '#3B82F6', color: '#FFFFFF', borderRadius: '9999px', padding: '0 6px', minWidth: '22px', textAlign: 'center', display: 'inline-block' } : undefined}
                              >
                                {item.remaining}
                              </span>
                            </div>
                          </div>

                          {/* Inline assign dropdown */}
                          {isUncategorized && isAssigning && (
                            <div className="pb-1.5">
                              <div className="flex flex-wrap gap-1">
                                {AVAILABLE_STATIONS.map(station => (
                                  <button
                                    key={station}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssignStation(item.name, station);
                                    }}
                                    className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-muted hover:bg-muted/70 text-text-secondary transition-colors"
                                  >
                                    {station}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
