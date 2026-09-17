import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ItemSummaryPanel } from './ItemSummaryPanel';
import type { Order } from '@/types/kds';
import { useLanguage } from '@/hooks/use-language';

interface SummaryDrawerProps {
  orders: Order[];
  stationCourse?: string;
  selectedItems?: Set<string>;
  onItemToggle?: (itemName: string) => void;
  selectedCategories?: Set<string>;
  onCategoryToggle?: (category: string) => void;
  onClearAll?: () => void;
  matchingTicketCount?: number;
}

export function SummaryDrawer(props: SummaryDrawerProps) {
  const { tui } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const totalRemaining = useMemo(() => {
    let count = 0;
    for (const order of props.orders) {
      if (order.status === 'served') continue;
      for (const cg of order.courses) {
        if (cg.isFired) continue;
        for (const item of cg.items) {
          if (!item.isCompleted && !item.isCancelled) count += item.quantity;
        }
      }
    }
    return count;
  }, [props.orders]);

  return (
    <>
      {/* Backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed left-0 right-0 z-50 transition-transform duration-300 ease-in-out"
        style={{
          bottom: 44, // above BottomStatusBar
          transform: expanded ? 'translateY(0)' : 'translateY(calc(100% - 40px))',
          height: '50vh',
        }}
      >
        {/* Handle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full h-[40px] flex items-center justify-center gap-2 bg-sidebar text-sidebar-foreground rounded-t-lg border-t border-x border-sidebar-border"
        >
          <span className="text-[12px] font-bold uppercase tracking-wider">
            {tui('Summary {n}', { n: totalRemaining })}
          </span>
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {/* Content */}
        <div className="h-[calc(100%-40px)] overflow-hidden bg-surface-card border-x border-sidebar-border">
          <div className="h-full overflow-y-auto">
            <ItemSummaryPanel {...props} />
          </div>
        </div>
      </div>
    </>
  );
}
