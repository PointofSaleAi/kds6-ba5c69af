import { useState, useMemo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { usePortrait } from '@/hooks/use-portrait';
import { useStatusRules } from '@/hooks/use-status-rules';
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
  matchingTicketCount?: number;
}

/* ── Urgency row (per-ticket, for Urgent & New sections) ── */
interface UrgencyRow {
  itemName: string;
  quantity: number;
  ticketLabel: string; // e.g. "T33"
  orderId: string;
}

/* ── Category summary (for In Progress section) ── */
interface CategorySummary {
  category: ProductCategory;
  items: { name: string; remaining: number; hasNew: boolean }[];
}

const AVAILABLE_STATIONS: StationName[] = ['Grill', 'Fry', 'Salad', 'Dessert', 'Bar'];

function buildUrgencySections(
  orders: Order[],
  getStatusForElapsed: (s: number) => { ruleId: string },
  stationCourseFilter?: string,
) {
  const urgentRows: UrgencyRow[] = [];
  const newRows: UrgencyRow[] = [];
  const inProgressMap = new Map<ProductCategory, Map<string, { remaining: number; hasNew: boolean }>>();

  for (const order of orders) {
    if (order.status === 'served') continue;
    const { ruleId } = getStatusForElapsed(order.elapsedSeconds);

    for (const cg of order.courses) {
      if (cg.isFired) continue;
      for (const item of cg.items) {
        if (item.isCompleted || item.isCancelled) continue;
        const cat = item.category || ('Uncategorized' as ProductCategory);
        if (stationCourseFilter && cat !== stationCourseFilter) continue;

        const ticketLabel = `T${order.orderNumber}`;

        if (ruleId === 'overtime') {
          urgentRows.push({ itemName: item.name, quantity: item.quantity, ticketLabel, orderId: order.id });
        } else if (ruleId === 'start') {
          newRows.push({ itemName: item.name, quantity: item.quantity, ticketLabel, orderId: order.id });
        } else {
          // medium, delay -> In Progress
          if (!inProgressMap.has(cat)) inProgressMap.set(cat, new Map());
          const items = inProgressMap.get(cat)!;
          const existing = items.get(item.name) || { remaining: 0, hasNew: false };
          existing.remaining += item.quantity;
          if (item.isNew) existing.hasNew = true;
          items.set(item.name, existing);
        }
      }
    }
  }

  const inProgressCategories: CategorySummary[] = Array.from(inProgressMap.entries())
    .map(([category, items]) => ({
      category,
      items: Array.from(items.entries())
        .map(([name, data]) => ({ name, remaining: data.remaining, hasNew: data.hasNew }))
        .filter(i => i.remaining > 0)
        .sort((a, b) => b.remaining - a.remaining),
    }))
    .filter(c => c.items.length > 0);

  return { urgentRows, newRows, inProgressCategories };
}

export function ItemSummaryPanel({ orders, stationCourse, selectedItems, onItemToggle, selectedCategories, onCategoryToggle, onClearAll, matchingTicketCount }: ItemSummaryPanelProps) {
  const { tp } = useLanguage();
  const { isPortrait } = usePortrait();
  const { getStatusForElapsed } = useStatusRules();
  const [collapsed, setCollapsed] = useState(false);

  const { urgentRows, newRows, inProgressCategories } = useMemo(
    () => buildUrgencySections(orders, getStatusForElapsed, stationCourse),
    [orders, getStatusForElapsed, stationCourse],
  );

  const totalRemaining = useMemo(() => {
    let count = 0;
    for (const order of orders) {
      if (order.status === 'served') continue;
      for (const cg of order.courses) {
        if (cg.isFired) continue;
        for (const item of cg.items) {
          if (!item.isCompleted && !item.isCancelled) count += item.quantity;
        }
      }
    }
    return count;
  }, [orders]);

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

  /* ── Render a single urgency row (Urgent or New) ── */
  const renderUrgencyRow = (
    row: UrgencyRow,
    idx: number,
    config: { bg: string; dotColor: string; textColor: string; badgeBg: string; badgeText: string },
  ) => {
    const isSelected = selectedItems?.has(row.itemName) ?? false;
    return (
      <div
        key={`${row.orderId}-${row.itemName}-${idx}`}
        className="flex items-center justify-between cursor-pointer"
        style={{
          backgroundColor: isSelected ? undefined : config.bg,
          padding: isPortrait ? '2px 12px' : '4px 12px',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
        }}
        onClick={(e) => { e.stopPropagation(); onItemToggle?.(row.itemName); }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: config.dotColor }} />
          <span
            className={`uppercase leading-tight ${isPortrait ? 'break-words' : 'truncate'} ${isSelected ? 'font-bold' : 'font-normal'}`}
            style={{
              fontSize: 'var(--kds-summary-text)',
              color: config.textColor,
              ...(isSelected ? { borderLeft: '3px solid #3B82F6', paddingLeft: '6px', marginLeft: '-8px' } : {}),
            }}
          >
            {tp(row.itemName)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-1 shrink-0">
          <span
            className="font-bold text-[10px] rounded px-1.5 py-0.5"
            style={{ backgroundColor: config.badgeBg, color: config.badgeText, borderRadius: '4px' }}
          >
            {row.ticketLabel}
          </span>
          <span
            className="text-right text-[14px] font-bold tabular-nums"
            style={isSelected
              ? { backgroundColor: '#3B82F6', color: '#FFFFFF', borderRadius: '9999px', padding: '0 6px', minWidth: '22px', textAlign: 'center', display: 'inline-block' }
              : { color: config.textColor }}
          >
            {row.quantity}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-[220px] flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 bg-sidebar border-l border-sidebar-border">
        <div className="flex items-center gap-2 min-w-0">
          <img src={cookingSummaryIcon} alt="" className="w-5 h-5 opacity-70 shrink-0" />
          <span className="text-[15px] font-semibold text-sidebar-foreground uppercase tracking-wide shrink-0">Summary</span>
          <span className="text-[11px] font-bold text-sidebar-accent-foreground bg-sidebar-accent rounded-full px-2 py-0.5 min-w-[22px] text-center shrink-0">{totalRemaining}</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-sidebar-accent rounded min-w-[44px] min-h-[44px] flex items-center justify-center text-sidebar-foreground shrink-0" aria-label="Collapse panel">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Filter status bar */}
      {selectionCount > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#EFF6FF] border-l border-border border-b border-b-border transition-all duration-150">
          <span
            className="text-[11px] font-bold text-white rounded px-1.5 py-0.5"
            style={{ backgroundColor: '#3B82F6', borderRadius: '4px' }}
          >
            {matchingTicketCount !== undefined ? `${matchingTicketCount} ticket${matchingTicketCount !== 1 ? 's' : ''}` : selectionLabel}
          </span>
          <button
            onClick={onClearAll}
            className="text-[11px] font-medium transition-colors whitespace-nowrap"
            style={{ color: '#3B82F6' }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 flex flex-col bg-surface-card border-l border-border overflow-hidden">
        <div className="flex-1 overflow-y-auto">

          {/* ─── Section 1: URGENT (Overtime) ─── */}
          {urgentRows.length > 0 && (
            <UrgencySection
              id="urgent"
              label="Urgent - overtime"
              labelColor="#E24B4A"
              count={urgentRows.reduce((a, r) => a + r.quantity, 0)}
              countBg="#E24B4A"
              collapsed={collapsedSections}
              onToggle={toggleSection}
            >
              {urgentRows.map((row, i) =>
                renderUrgencyRow(row, i, {
                  bg: '#FFF5F5',
                  dotColor: '#E24B4A',
                  textColor: '#A32D2D',
                  badgeBg: '#FCEBEB',
                  badgeText: '#A32D2D',
                }),
              )}
            </UrgencySection>
          )}

          {/* ─── Section 2: NEW (Just Fired) ─── */}
          {newRows.length > 0 && (
            <UrgencySection
              id="new"
              label="New - just fired"
              labelColor="#639922"
              count={newRows.reduce((a, r) => a + r.quantity, 0)}
              countBg="#639922"
              collapsed={collapsedSections}
              onToggle={toggleSection}
            >
              {newRows.map((row, i) =>
                renderUrgencyRow(row, i, {
                  bg: '#F4FAF0',
                  dotColor: '#639922',
                  textColor: '#3B6D11',
                  badgeBg: '#EAF3DE',
                  badgeText: '#3B6D11',
                }),
              )}
            </UrgencySection>
          )}

          {/* ─── Section 3: IN PROGRESS ─── */}
          {inProgressCategories.length > 0 && (
            <InProgressSection
              categories={inProgressCategories}
              stationCourse={stationCourse}
              selectedItems={selectedItems}
              selectedCategories={selectedCategories}
              onItemToggle={onItemToggle}
              onCategoryToggle={onCategoryToggle}
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
              assigningItem={assigningItem}
              setAssigningItem={setAssigningItem}
              assignedStations={assignedStations}
              handleAssignStation={handleAssignStation}
              isPortrait={isPortrait}
              tp={tp}
            />
          )}

          {urgentRows.length === 0 && newRows.length === 0 && inProgressCategories.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-[12px] text-text-muted">All items completed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Urgency section wrapper (Urgent / New) ── */
function UrgencySection({
  id, label, labelColor, count, countBg, collapsed, onToggle, children,
}: {
  id: string; label: string; labelColor: string; count: number; countBg: string;
  collapsed: Set<string>; onToggle: (id: string) => void; children: React.ReactNode;
}) {
  const isExpanded = !collapsed.has(id);
  return (
    <div>
      <div className="flex items-center border-b border-border min-h-[36px]">
        <button
          onClick={() => onToggle(id)}
          className="flex items-center justify-center px-1.5 py-2 shrink-0 min-w-[28px] min-h-[36px]"
          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
        >
          <ChevronDown
            size={12}
            className={`transition-transform duration-150 ${isExpanded ? '' : '-rotate-90'}`}
            style={{ color: labelColor }}
          />
        </button>
        <span className="flex-1 text-[12px] uppercase tracking-widest font-bold" style={{ color: labelColor }}>
          {label}
        </span>
        <span
          className="text-[11px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center mr-3 shrink-0 text-white"
          style={{ backgroundColor: countBg }}
        >
          {count}
        </span>
      </div>
      {isExpanded && children}
    </div>
  );
}

/* ── In Progress section (keeps existing category grouping) ── */
function InProgressSection({
  categories, stationCourse, selectedItems, selectedCategories, onItemToggle, onCategoryToggle,
  collapsedSections, toggleSection, assigningItem, setAssigningItem, assignedStations, handleAssignStation,
  isPortrait, tp,
}: {
  categories: CategorySummary[];
  stationCourse?: string;
  selectedItems?: Set<string>;
  selectedCategories?: Set<string>;
  onItemToggle?: (name: string) => void;
  onCategoryToggle?: (cat: string) => void;
  collapsedSections: Set<string>;
  toggleSection: (cat: string) => void;
  assigningItem: string | null;
  setAssigningItem: (v: string | null) => void;
  assignedStations: Map<string, StationName>;
  handleAssignStation: (name: string, station: StationName) => void;
  isPortrait: boolean;
  tp: (s: string) => string;
}) {
  // Section-level collapse for "in-progress" group header
  const groupExpanded = !collapsedSections.has('in-progress');

  return (
    <div>
      {/* Group header */}
      <div className="flex items-center border-b border-border min-h-[36px]">
        <button
          onClick={() => toggleSection('in-progress')}
          className="flex items-center justify-center px-1.5 py-2 shrink-0 min-w-[28px] min-h-[36px]"
          aria-label={groupExpanded ? 'Collapse section' : 'Expand section'}
        >
          <ChevronDown
            size={12}
            className={`text-text-muted transition-transform duration-150 ${groupExpanded ? '' : '-rotate-90'}`}
          />
        </button>
        <span className="flex-1 text-[12px] uppercase tracking-widest font-bold text-text-muted">
          In progress
        </span>
        <span className="text-[11px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center mr-3 shrink-0 bg-amber-500 text-white">
          {categories.reduce((a, c) => a + c.items.reduce((x, i) => x + i.remaining, 0), 0)}
        </span>
      </div>

      {groupExpanded && categories.map((cat) => {
        const isUncategorized = cat.category === ('Uncategorized' as ProductCategory);
        const isStation = !!stationCourse && cat.category === stationCourse;
        const sectionTotal = cat.items.reduce((a, i) => a + i.remaining, 0);
        const isExpanded = !collapsedSections.has(cat.category);
        const isCategorySelected = selectedCategories?.has(cat.category) ?? false;

        const displayItems = isUncategorized
          ? cat.items.filter(item => !assignedStations.has(item.name))
          : cat.items;

        if (isUncategorized && displayItems.length === 0) return null;

        return (
          <div key={cat.category}>
            <div className="flex items-center border-b border-border min-h-[32px] pl-4" style={isStation ? { borderLeft: '2px solid #4F46E5' } : undefined}>
              <button
                onClick={() => toggleSection(cat.category)}
                className="flex items-center justify-center px-1 py-1 shrink-0 min-w-[24px] min-h-[32px]"
                aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
              >
                <ChevronDown
                  size={10}
                  className={`text-text-muted transition-transform duration-150 ${isExpanded ? '' : '-rotate-90'}`}
                />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); if (!isUncategorized) onCategoryToggle?.(cat.category); }}
                className={`flex-1 flex items-center gap-1.5 py-1 pr-1 transition-all duration-150 rounded cursor-pointer ${
                  !isUncategorized ? 'hover:bg-[rgba(59,130,246,0.06)]' : ''
                } ${isCategorySelected ? 'border-b-2 border-[#3B82F6]' : ''}`}
                style={{ borderRadius: '4px' }}
              >
                {isUncategorized && <AlertTriangle size={12} className="text-warning shrink-0" />}
                <span className={`text-[11px] uppercase tracking-widest font-bold transition-colors duration-150 ${
                  isCategorySelected ? 'text-[#1D4ED8]' : isStation ? 'text-text-primary' : 'text-text-secondary'
                }`}>
                  {cat.category}
                </span>
              </button>
              <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center mr-3 shrink-0 transition-colors duration-150 ${
                isCategorySelected
                  ? 'bg-[#3B82F6] text-white'
                  : sectionTotal >= 20
                    ? 'bg-destructive text-destructive-foreground'
                    : sectionTotal >= 10
                      ? 'bg-warning text-warning-foreground'
                      : 'bg-emerald-600 text-white'
              }`}>
                {isUncategorized ? displayItems.reduce((a, i) => a + i.remaining, 0) : sectionTotal}
              </span>
            </div>

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
                    <div key={item.name} className={`relative border-b border-border/30 last:border-b-0 ${isSelected ? '' : tierClass} ${item.hasNew ? 'animate-new-item -mx-3 px-3' : ''}`}>
                      <div
                        className={`flex items-start justify-between ${isPortrait ? 'py-[2px] gap-1' : 'py-[4px]'} cursor-pointer`}
                        onClick={(e) => { e.stopPropagation(); onItemToggle?.(item.name); }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-[6px] h-[6px] rounded-full shrink-0 bg-amber-400" />
                          <span
                            className={`min-w-0 uppercase leading-tight ${isPortrait ? 'break-words' : 'truncate'} ${isSelected ? 'font-bold' : 'font-medium'} text-text-primary`}
                            style={{ fontSize: 'var(--kds-summary-text)', ...(isSelected ? { borderLeft: '3px solid #3B82F6', paddingLeft: '6px', marginLeft: '-9px' } : {}) }}
                          >
                            {tp(item.name)}
                          </span>
                        </div>
                        <div className={`flex items-center ${isPortrait ? 'gap-1' : 'gap-1.5'} ml-1 shrink-0`}>
                          {isUncategorized && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setAssigningItem(isAssigning ? null : item.name); }}
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

                      {isUncategorized && isAssigning && (
                        <div className="pb-1.5">
                          <div className="flex flex-wrap gap-1">
                            {AVAILABLE_STATIONS.map(station => (
                              <button
                                key={station}
                                onClick={(e) => { e.stopPropagation(); handleAssignStation(item.name, station); }}
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
  );
}
