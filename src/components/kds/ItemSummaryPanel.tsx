import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ChevronRight, ChevronLeft, Bell } from 'lucide-react';
import type { Order, CourseType } from '@/types/kds';

interface ItemSummaryPanelProps {
  orders: Order[];
}

interface CategorySummary {
  category: CourseType;
  items: { name: string; total: number; completed: number }[];
}

function buildSummary(orders: Order[]): CategorySummary[] {
  const map = new Map<CourseType, Map<string, { total: number; completed: number }>>();

  for (const order of orders) {
    if (order.status === 'served') continue;
    for (const cg of order.courses) {
      if (!map.has(cg.course)) map.set(cg.course, new Map());
      const items = map.get(cg.course)!;
      for (const item of cg.items) {
        const existing = items.get(item.name) || { total: 0, completed: 0 };
        existing.total += item.quantity;
        if (item.isCompleted) existing.completed += item.quantity;
        items.set(item.name, existing);
      }
    }
  }

  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items: Array.from(items.entries()).map(([name, counts]) => ({ name, ...counts })),
  }));
}

export function ItemSummaryPanel({ orders }: ItemSummaryPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const summary = buildSummary(orders);
  const totalItems = summary.reduce((acc, cat) => acc + cat.items.reduce((a, i) => a + i.total, 0), 0);

  if (collapsed) {
    return (
      <div className="w-10 bg-surface-card border-l border-border flex flex-col items-center py-3 shrink-0">
        <button onClick={() => setCollapsed(false)} className="p-1 hover:bg-muted rounded min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Expand panel">
          <ChevronLeft size={16} />
        </button>
        <span className="text-[10px] font-bold text-text-secondary mt-2 [writing-mode:vertical-lr]">{totalItems} products</span>
      </div>
    );
  }

  return (
    <div className="w-[220px] bg-surface-card border-l border-border flex flex-col shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-semibold text-text-primary">Product Summary</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-muted rounded min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Collapse panel">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {summary.map((cat) => {
          const totalCat = cat.items.reduce((a, i) => a + i.total, 0);
          const completedCat = cat.items.reduce((a, i) => a + i.completed, 0);
          return (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-section-label text-text-secondary uppercase tracking-widest">
                  {cat.category}S
                </span>
                <span className="text-[11px] text-text-muted">
                  {completedCat} / {totalCat}
                </span>
              </div>
              <div className="w-full h-1 bg-muted rounded-full mb-2">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${totalCat > 0 ? (completedCat / totalCat) * 100 : 0}%` }}
                />
              </div>
              {cat.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-0.5">
                  <span className="text-modifier text-text-primary truncate">{item.name}</span>
                  <span className="text-modifier font-bold text-text-primary ml-2 shrink-0">{item.total}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
