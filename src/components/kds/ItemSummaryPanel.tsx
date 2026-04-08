import { useState, useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import cookingSummaryIcon from '@/assets/cooking-summary-icon.svg';
import type { Order, ProductCategory } from '@/types/kds';

interface ItemSummaryPanelProps {
  orders: Order[];
  stationCourse?: string;
}

interface CategorySummary {
  category: ProductCategory;
  items: { name: string; remaining: number }[];
}

function buildSummary(orders: Order[]): CategorySummary[] {
  const map = new Map<ProductCategory, Map<string, number>>();

  for (const order of orders) {
    if (order.status === 'served') continue;
    for (const cg of order.courses) {
      // Skip entire fired courses - those items are already done
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

export function ItemSummaryPanel({ orders, stationCourse }: ItemSummaryPanelProps) {
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

  // Track which sections are expanded; default: sections with items are expanded
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const toggleSection = (cat: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
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
      {/* Header - sidebar bg */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-sidebar border-l border-sidebar-border">
        <div className="flex items-center gap-2">
          <img src={cookingSummaryIcon} alt="" className="w-5 h-5 opacity-70" />
          <span className="text-[15px] font-semibold text-sidebar-foreground uppercase tracking-wide">Cooking Summary</span>
          <span className="text-[11px] font-bold text-sidebar-accent-foreground bg-sidebar-accent rounded-full px-2 py-0.5 min-w-[22px] text-center">{totalRemaining}</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-sidebar-accent rounded min-w-[44px] min-h-[44px] flex items-center justify-center text-sidebar-foreground" aria-label="Collapse panel">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Categories section */}
      <div className="flex-1 flex flex-col bg-surface-card border-l border-border overflow-hidden">

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {summary.length === 0 && (
          <div className="px-3 py-4 text-center">
            <p className="text-[12px] text-text-muted">All items completed</p>
          </div>
        )}
        {summary.map((cat) => {
          const isStation = stationCourse === cat.category;
          const isMuted = !!stationCourse && !isStation;
          const sectionTotal = cat.items.reduce((a, i) => a + i.remaining, 0);
          const isExpanded = !collapsedSections.has(cat.category);

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
                  {sectionTotal}
                </span>
              </button>

              {/* Items */}
              {isExpanded && (
                <div className="px-3 py-1">
                  {cat.items.map((item) => {
                    const isCritical = item.remaining >= 10;
                    const isHigh = !isCritical && item.remaining >= 5;
                    const tierClass = isCritical
                      ? 'bg-destructive/10 -mx-3 px-3 border-l-2 border-destructive animate-pulse'
                      : isHigh
                        ? 'bg-warning/10 -mx-3 px-3 border-l-2 border-warning'
                        : '';
                    const countColor = isCritical ? 'text-destructive' : isHigh ? 'text-warning' : 'text-text-primary';
                    return (
                      <div key={item.name} className={`flex items-center justify-between py-[4px] border-b border-border/30 last:border-b-0 ${tierClass}`}>
                        <span className="min-w-0 truncate text-[13px] font-normal uppercase leading-tight text-text-primary">{tp(item.name)}</span>
                        <span className={`ml-2 text-right text-[14px] font-bold shrink-0 tabular-nums ${countColor}`}>{item.remaining}</span>
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
