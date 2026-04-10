import { useState, useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ChevronRight, ChevronLeft, ChevronDown, AlertTriangle } from 'lucide-react';
import cookingSummaryIcon from '@/assets/cooking-summary-icon.svg';
import type { Order, ProductCategory, StationName } from '@/types/kds';

interface ItemSummaryPanelProps {
  orders: Order[];
  stationCourse?: string;
  selectedItems?: Set<string>;
  onItemToggle?: (itemName: string) => void;
  selectedCategories?: Set<string>;
  onCategoryToggle?: (category: string) => void;
  onClearAll?: () => void;
}

interface CategorySummary {
  category: ProductCategory;
  items: { name: string; remaining: number }[];
}

const AVAILABLE_STATIONS: StationName[] = ['Grill', 'Fry', 'Salad', 'Dessert', 'Bar'];

function buildSummary(orders: Order[]): CategorySummary[] {
  const map = new Map<ProductCategory, Map<string, number>>();

  for (const order of orders) {
    if (order.status === 'served') continue;
    for (const cg of order.courses) {
      if (cg.isFired) continue;
      for (const item of cg.items) {
        if (item.isCompleted || item.isCancelled) continue;
        const cat = item.category || ('Uncategorized' as ProductCategory);
        if (!map.has(cat)) map.set(cat, new Map());
        const items = map.get(cat)!;
        const existing = items.get(item.name) || 0;
        items.set(item.name, existing + item.quantity);
      }
    }
  }

  return Array.from(map.entries())
    .map(([category, items]) => ({
      category,
      items: Array.from(items.entries())
        .map(([name, remaining]) => ({ name, remaining }))
        .filter(i => i.remaining > 0)
        .sort((a, b) => b.remaining - a.remaining),
    }))
    .filter(c => c.items.length > 0);
}

export function ItemSummaryPanel({ orders, stationCourse, selectedItems, onItemToggle, selectedCategories, onCategoryToggle, onClearAll }: ItemSummaryPanelProps) {
  const { tp } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const rawSummary = useMemo(() => buildSummary(orders), [orders]);

  const summary = stationCourse
    ? [
        ...rawSummary.filter(c => c.category === stationCourse),
        ...rawSummary.filter(c => c.category !== stationCourse),
      ]
    : rawSummary;

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
  const toggleSection = (cat: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
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
        <button onClick={() => setCollapsed(false)} className="p-1 hover:bg-sidebar-accent rounded min-w-[44px] min-h-[44px] flex items-center justify-center text-sidebar-foreground" aria-label="Expand panel">
          <ChevronLeft size={16} />
        </button>
        <span className="text-[10px] font-bold text-sidebar-foreground/70 mt-2 [writing-mode:vertical-lr]">{totalRemaining} to cook</span>
      </div>
    );
  }

  return (
    <div className="w-[220px] flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 bg-sidebar border-l border-sidebar-border">
        <div className="flex items-center gap-2 min-w-0">
          <img src={cookingSummaryIcon} alt="" className="w-5 h-5 opacity-70 shrink-0" />
          <span className="text-[15px] font-semibold text-sidebar-foreground uppercase tracking-wide shrink-0">Summary</span>
          <span className="text-[11px] font-bold text-sidebar-accent-foreground bg-sidebar-accent rounded-full px-2 py-0.5 min-w-[22px] text-center shrink-0">{totalRemaining}</span>
          {selectionCount > 0 && (
            <span className="text-[11px] font-bold text-white rounded shrink-0 px-1.5 py-0.5" style={{ backgroundColor: '#3B82F6', borderRadius: '4px' }}>
              {selectionCount} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {selectionCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-[11px] font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors whitespace-nowrap"
            >
              Clear all
            </button>
          )}
          <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-sidebar-accent rounded min-w-[44px] min-h-[44px] flex items-center justify-center text-sidebar-foreground" aria-label="Collapse panel">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Categories section */}
      <div className="flex-1 flex flex-col bg-surface-card border-l border-border overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {summary.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-[12px] text-text-muted">All items completed</p>
            </div>
          )}
          {summary.map((cat) => {
            const isUncategorized = cat.category === ('Uncategorized' as ProductCategory);
            const isStation = stationCourse === cat.category;
            const isMuted = !!stationCourse && !isStation;
            const sectionTotal = cat.items.reduce((a, i) => a + i.remaining, 0);
            const isExpanded = !collapsedSections.has(cat.category);

            const displayItems = isUncategorized
              ? cat.items.filter(item => !assignedStations.has(item.name))
              : cat.items;

            if (isUncategorized && displayItems.length === 0) return null;

            return (
              <div key={cat.category} className={isMuted ? 'opacity-50' : ''}>
                {/* Section header */}
                <button
                  onClick={() => toggleSection(cat.category)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-muted border-b border-border hover:bg-muted/90 transition-colors min-h-[36px]"
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronDown
                      size={12}
                      className={`text-text-muted transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                    />
                    {isUncategorized && (
                      <AlertTriangle size={12} className="text-warning shrink-0" />
                    )}
                    <span className={`text-[12px] uppercase tracking-widest font-bold ${isStation ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {cat.category}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                    sectionTotal >= 20
                      ? 'bg-destructive text-destructive-foreground'
                      : sectionTotal >= 10
                        ? 'bg-warning text-warning-foreground'
                        : 'bg-emerald-600 text-white'
                  }`}>
                    {isUncategorized ? displayItems.reduce((a, i) => a + i.remaining, 0) : sectionTotal}
                  </span>
                </button>

                {/* Items */}
                {isExpanded && (
                  <div className="px-3 py-1">
                    {displayItems.map((item) => {
                      const isCritical = item.remaining >= 10;
                      const isHigh = !isCritical && item.remaining >= 5;
                      const tierClass = isCritical
                        ? 'bg-destructive/10 -mx-3 px-3 border-l-2 border-destructive animate-pulse'
                        : isHigh
                          ? 'bg-warning/10 -mx-3 px-3 border-l-2 border-warning'
                          : '';
                      const countColor = isCritical ? 'text-destructive' : isHigh ? 'text-warning' : 'text-text-primary';
                      const isAssigning = assigningItem === item.name;
                      const isSelected = selectedItems?.has(item.name) ?? false;

                      return (
                        <div key={item.name} className={`relative border-b border-border/30 last:border-b-0 ${isSelected ? '' : tierClass}`}>
                          <div
                            className="flex items-center justify-between py-[4px] cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onItemToggle?.(item.name);
                            }}
                          >
                            <span
                              className={`min-w-0 truncate text-[13px] uppercase leading-tight ${isSelected ? 'font-bold' : 'font-medium'} text-text-primary`}
                              style={isSelected ? { borderLeft: '3px solid #3B82F6', paddingLeft: '6px', marginLeft: '-9px' } : undefined}
                            >
                              {tp(item.name)}
                            </span>
                            <div className="flex items-center gap-1.5 ml-2 shrink-0">
                              {isUncategorized && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssigningItem(isAssigning ? null : item.name);
                                  }}
                                  className="text-[10px] text-text-muted hover:text-text-primary transition-colors font-medium"
                                >
                                  + Assign
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
