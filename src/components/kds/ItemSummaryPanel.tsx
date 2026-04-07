import { useState, useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import type { Order, CourseType } from '@/types/kds';

interface ItemSummaryPanelProps {
  orders: Order[];
  stationCourse?: string;
}

interface CategorySummary {
  category: CourseType;
  items: { name: string; remaining: number }[];
}

function buildSummary(orders: Order[]): CategorySummary[] {
  const map = new Map<CourseType, Map<string, number>>();

  for (const order of orders) {
    if (order.status === 'served') continue;
    for (const cg of order.courses) {
      if (!map.has(cg.course)) map.set(cg.course, new Map());
      const items = map.get(cg.course)!;
      for (const item of cg.items) {
        if (item.isCompleted || item.isCancelled) continue;
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
  const { tp, tc } = useLanguage();
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
      <div className="w-[220px] bg-sidebar border-l border-sidebar-border flex flex-col shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center justify-between px-3 py-2 w-full hover:bg-sidebar-accent transition-colors min-h-[44px]"
          aria-label="Expand panel"
        >
          <span className="text-[13px] font-bold text-sidebar-foreground uppercase tracking-wide leading-tight">Cooking<br/>Summary</span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-sidebar-foreground/70 bg-sidebar-accent rounded px-2 py-1">{totalRemaining}</span>
            <ChevronRight size={16} className="text-sidebar-foreground/60" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="w-[220px] bg-sidebar border-l border-sidebar-border flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-sidebar-border">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-sidebar-foreground uppercase tracking-wide">Cooking Summary</span>
          <span className="text-[11px] font-bold text-sidebar-foreground/60 bg-sidebar-accent rounded px-1.5 py-0.5">{totalRemaining}</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-sidebar-accent rounded min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Collapse panel">
          <ChevronRight size={16} className="text-sidebar-foreground" />
        </button>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {summary.length === 0 && (
          <div className="px-3 py-4 text-center">
            <p className="text-[12px] text-sidebar-foreground/50">All items completed</p>
          </div>
        )}
        {summary.map((cat) => {
          const isStation = stationCourse === cat.category;
          const isMuted = !!stationCourse && !isStation;
          const sectionTotal = cat.items.reduce((a, i) => a + i.remaining, 0);
          const isExpanded = !collapsedSections.has(cat.category);

          return (
            <div key={cat.category} className={isMuted ? 'opacity-50' : ''}>
              {/* Section header — tappable */}
              <button
                onClick={() => toggleSection(cat.category)}
                className="w-full flex items-center justify-between px-3 py-1.5 bg-sidebar-accent/50 border-b border-sidebar-border hover:bg-sidebar-accent transition-colors min-h-[36px]"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronDown
                    size={12}
                    className={`text-sidebar-foreground/50 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                  />
                  <span className={`text-[11px] uppercase tracking-widest font-bold ${isStation ? 'text-sidebar-foreground' : 'text-sidebar-foreground/70'}`}>
                    {tc(cat.category)}S
                  </span>
                </div>
                <span className={`text-[12px] font-black ${isStation ? 'text-sidebar-foreground' : 'text-sidebar-foreground/70'}`}>
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
                      ? 'bg-destructive/20 -mx-3 px-3 border-l-2 border-destructive animate-pulse'
                      : isHigh
                        ? 'bg-warning/20 -mx-3 px-3 border-l-2 border-warning'
                        : '';
                    const countColor = isCritical ? 'text-destructive' : isHigh ? 'text-warning' : 'text-sidebar-foreground';
                    return (
                      <div key={item.name} className={`flex items-center justify-between py-[2px] ${tierClass}`}>
                        <span className={`text-[12px] truncate leading-tight ${isCritical || isHigh ? 'text-sidebar-foreground font-bold' : 'text-sidebar-foreground/80'}`}>{tp(item.name)}</span>
                        <span className={`text-[12px] font-bold ml-2 shrink-0 tabular-nums ${countColor}`}>{item.remaining}</span>
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
  );
}
