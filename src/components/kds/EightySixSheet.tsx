import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useOrderStore } from "@/hooks/use-order-store";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Search,
  Clock,
  RotateCcw,
  Package,
  ChevronDown,
  ChevronRight,
  X,
  ChevronLeft,
  Minus,
  Plus,
} from "lucide-react";
import { EightySixBadge } from "./EightySixBadge";
import { Item86Modal } from "./Flag86Button";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const restoreDurations = [
  { id: "now", label: "Restore Now", ms: 0 },
  { id: "5min", label: "In 5 minutes", ms: 5 * 60 * 1000 },
  { id: "10min", label: "In 10 minutes", ms: 10 * 60 * 1000 },
  { id: "15min", label: "In 15 minutes", ms: 15 * 60 * 1000 },
  { id: "20min", label: "In 20 minutes", ms: 20 * 60 * 1000 },
  { id: "1hr", label: "In 1 hour", ms: 60 * 60 * 1000 },
  { id: "2hr", label: "In 2 hours", ms: 2 * 60 * 60 * 1000 },
  { id: "custom", label: "Custom time", ms: null },
];

export interface EightySixedItem {
  id: string;
  name: string;
  category: string;
  reason: string;
  snoozedAt: Date;
  snoozeEndTime: Date | null;
  scheduledRestoreTime?: Date | null;
  quantity?: number;
}

interface EightySixSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eightySixedItems: EightySixedItem[];
  onRestoreItem: (itemId: string) => void;
  onScheduleRestore: (itemId: string, restoreTime: Date) => void;
  onEightySixItem: (item: { name: string; category: string; snoozeDuration: string; quantity?: number }) => void;
}

const UNCATEGORIZED = "Uncategorized";




const snoozeDurations = [
  { id: "15min", label: "15 min", ms: 15 * 60 * 1000 },
  { id: "1hr", label: "1 hour", ms: 60 * 60 * 1000 },
  { id: "end_of_shift", label: "End of shift", ms: 8 * 60 * 60 * 1000 },
  { id: "indefinite", label: "Until restored", ms: null },
];

const formatTimeRemaining = (endTime: Date | null) => {
  if (!endTime) return "Until restored";
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  if (diff <= 0) return "Expired";
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m left`;
  return `${minutes}m left`;
};

const formatScheduledRestoreTime = (restoreTime: Date) =>
  restoreTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

interface InlineQtyAdjusterProps {
  value: number;
  onChange: (value: number) => void;
}

function InlineQtyAdjuster({ value, onChange, stock }: InlineQtyAdjusterProps) {
  return (
    <div
      className="flex flex-col items-end gap-0.5"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(Math.max(1, value - 1));
          }}
          className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-foreground hover:bg-muted/80 active:scale-95 transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-foreground tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(value + 1);
          }}
          className="w-6 h-6 rounded-full bg-[#212121] border border-[#212121] flex items-center justify-center text-white hover:bg-[#212121]/80 active:scale-95 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      {typeof stock === "number" && (
        <span className="text-[10px] text-muted-foreground leading-none">
          Available Stock: {stock}
        </span>
      )}
    </div>
  );
}

export function EightySixSheet({
  open,
  onOpenChange,
  eightySixedItems,
  onRestoreItem,
  onScheduleRestore,
  onEightySixItem,
}: EightySixSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedDuration, setSelectedDuration] = useState<string>("1hr");
  const [view, setView] = useState<"add" | "manage">("manage");
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [confirmItem, setConfirmItem] = useState<{ name: string; category: string } | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const modalDismissedAtRef = useRef(0);

  const itemKey = (name: string, category: string) => `${category}::${name}`;

  const toggleSelectItem = (name: string, category: string) => {
    const k = itemKey(name, category);
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
        setSelectedQuantities((q) => {
          const nextQ = { ...q };
          delete nextQ[k];
          return nextQ;
        });
      } else {
        next.add(k);
        setSelectedQuantities((q) => ({ ...q, [k]: 1 }));
      }
      return next;
    });
  };

  const setItemQuantity = (name: string, category: string, quantity: number) => {
    const k = itemKey(name, category);
    setSelectedQuantities((prev) => ({ ...prev, [k]: Math.max(1, quantity) }));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedItems(new Set());
    setSelectedQuantities({});
  };

  const bulk86Selected = () => {
    selectedItems.forEach((k) => {
      const [category, name] = k.split("::");
      if (!eightySixedItems.some((i) => i.name === name)) {
        onEightySixItem({ name, category, snoozeDuration: selectedDuration, quantity: selectedQuantities[k] ?? 1 });
      }
    });
    exitSelectMode();
  };

  const hoursScrollRef = useRef<HTMLDivElement>(null);
  const minutesScrollRef = useRef<HTMLDivElement>(null);
  const hoursTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minutesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeConfirmItem = useCallback(() => {
    modalDismissedAtRef.current = Date.now();
    setConfirmItem(null);
  }, []);

  const handleSheetOpenChange = useCallback((next: boolean) => {
    if (confirmItem) {
      if (!next) closeConfirmItem();
      return;
    }
    if (!next) closeConfirmItem();
    onOpenChange(next);
  }, [closeConfirmItem, confirmItem, onOpenChange]);

  const openConfirmItem = useCallback((item: { name: string; category: string }) => {
    if (confirmItem) return;
    if (Date.now() - modalDismissedAtRef.current < 400) return;
    setConfirmItem(item);
  }, [confirmItem]);

  const hoursOptions = Array.from({ length: 13 }, (_, i) => i);
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (showCustomTimePicker) {
      if (hoursScrollRef.current) hoursScrollRef.current.scrollTop = customHours * ITEM_HEIGHT;
      if (minutesScrollRef.current) minutesScrollRef.current.scrollTop = customMinutes * ITEM_HEIGHT;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCustomTimePicker]);

  useEffect(() => {
    if (!open) {
      setConfirmItem(null);
      setOpenPopoverId(null);
      setShowCustomTimePicker(false);
      exitSelectMode();
    }
  }, [open]);

  useEffect(() => {
    if (view !== "add") exitSelectMode();
  }, [view]);



  const snapToNearest = useCallback(
    (scrollRef: React.RefObject<HTMLDivElement>, maxValue: number, setValue: (v: number) => void) => {
      if (!scrollRef.current) return;
      const scrollTop = scrollRef.current.scrollTop;
      const nearestIndex = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(nearestIndex, maxValue));
      scrollRef.current.scrollTo({ top: clampedIndex * ITEM_HEIGHT, behavior: "smooth" });
      setValue(clampedIndex);
    },
    [],
  );

  const handleHoursScroll = useCallback(() => {
    if (!hoursScrollRef.current) return;
    const nearestIndex = Math.round(hoursScrollRef.current.scrollTop / ITEM_HEIGHT);
    setCustomHours(Math.max(0, Math.min(nearestIndex, 12)));
    if (hoursTimeout.current) clearTimeout(hoursTimeout.current);
    hoursTimeout.current = setTimeout(() => snapToNearest(hoursScrollRef, 12, setCustomHours), 150);
  }, [snapToNearest]);

  const handleMinutesScroll = useCallback(() => {
    if (!minutesScrollRef.current) return;
    const nearestIndex = Math.round(minutesScrollRef.current.scrollTop / ITEM_HEIGHT);
    setCustomMinutes(Math.max(0, Math.min(nearestIndex, 59)));
    if (minutesTimeout.current) clearTimeout(minutesTimeout.current);
    minutesTimeout.current = setTimeout(() => snapToNearest(minutesScrollRef, 59, setCustomMinutes), 150);
  }, [snapToNearest]);

  const handleRestoreWithDuration = (itemId: string, durationId: string) => {
    if (durationId === "custom") {
      setShowCustomTimePicker(true);
      return;
    }
    if (durationId === "now") {
      onRestoreItem(itemId);
      setOpenPopoverId(null);
      setShowCustomTimePicker(false);
      return;
    }
    const duration = restoreDurations.find((d) => d.id === durationId);
    if (duration && duration.ms) {
      onScheduleRestore(itemId, new Date(Date.now() + duration.ms));
    } else {
      onRestoreItem(itemId);
    }
    setOpenPopoverId(null);
    setShowCustomTimePicker(false);
  };

  const handleCustomTimeConfirm = (itemId: string) => {
    if (customHours > 0 || customMinutes > 0) {
      const ms = (customHours * 60 + customMinutes) * 60 * 1000;
      onScheduleRestore(itemId, new Date(Date.now() + ms));
      setOpenPopoverId(null);
      setShowCustomTimePicker(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const handleEightySix = (itemName: string, category: string, quantity = 1) => {
    onEightySixItem({ name: itemName, category, snoozeDuration: selectedDuration, quantity });
  };

  const isItemEightySixed = (itemName: string) =>
    eightySixedItems.some((item) => item.name === itemName);

  const { orders } = useOrderStore();

  // Build category → unique product list from all live KDS orders.
  const menuCategories = useMemo(() => {
    const byCategory = new Map<string, Set<string>>();
    for (const order of orders) {
      for (const course of order.courses) {
        for (const it of course.items) {
          const cat = (it.category ?? UNCATEGORIZED) as string;
          if (!byCategory.has(cat)) byCategory.set(cat, new Set());
          byCategory.get(cat)!.add(it.name);
        }
      }
    }
    return Array.from(byCategory.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, set]) => ({ name, items: Array.from(set).sort((a, b) => a.localeCompare(b)) }));
  }, [orders]);

  const query = searchQuery.toLowerCase().trim();
  const filteredCategories = menuCategories
    .map((cat) => {
      const categoryMatches = cat.name.toLowerCase().includes(query);
      return {
        ...cat,
        items: categoryMatches ? cat.items : cat.items.filter((item) => item.toLowerCase().includes(query)),
      };
    })
    .filter((cat) => cat.items.length > 0);

  // Expand all categories by default in Add Items view, and auto-expand any
  // categories that contain matching products while searching.
  useEffect(() => {
    if (view === "add") {
      setExpandedCategories(new Set(filteredCategories.map((c) => c.name)));
    }
  }, [view, filteredCategories]);




  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="right"
        className="w-[400px] sm:max-w-[400px] bg-background border-border p-0 flex flex-col gap-0"
        onPointerDownOutside={(e) => { if (confirmItem) e.preventDefault(); }}
        onInteractOutside={(e) => { if (confirmItem) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (confirmItem) { e.preventDefault(); closeConfirmItem(); } }}
      >

        <SheetHeader className="px-4 pt-4 pb-2 border-b border-destructive/30">
          <SheetTitle className="text-foreground text-lg font-semibold flex items-center gap-3">
            <span>86 Items</span>
            {eightySixedItems.length > 0 && (
              <EightySixBadge
                size="lg"
                label={eightySixedItems.reduce((sum, i) => sum + (i.quantity ?? 1), 0).toString()}
                showIcon={false}
                pulse
              />
            )}
          </SheetTitle>
        </SheetHeader>

        {/* View Toggle */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
          <button
            onClick={() => setView("manage")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "manage"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Currently 86'd ({eightySixedItems.reduce((sum, i) => sum + (i.quantity ?? 1), 0)})
          </button>
          <button
            onClick={() => setView("add")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "add"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Add Items
          </button>
        </div>

        {view === "manage" ? (
          <ScrollArea className="flex-1">
            {eightySixedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <Package className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground text-center">No items are currently 86'd</p>
                <Button
                  onClick={() => setView("add")}
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Items
                </Button>
              </div>
            ) : (
              <div className="px-4 pt-2 pb-4 space-y-3">
                {eightySixedItems.map((item) => (
                  <div key={item.id} className="eighty-six-card flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="eighty-six-icon flex-shrink-0 mt-0.5">
                        <X size={12} strokeWidth={3} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-destructive font-semibold truncate">{item.name}</p>
                          {(item.quantity ?? 1) > 1 && (
                            <span className="text-xs font-semibold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                              x{item.quantity}
                            </span>
                          )}
                          <EightySixBadge size="sm" variant="subtle" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{item.category}</span>
                          <span className="text-xs text-muted-foreground/50">&middot;</span>
                          <span className="text-xs text-destructive font-medium">
                            {item.reason}
                          </span>
                        </div>
                        {item.scheduledRestoreTime ? (
                          <div className="flex items-center gap-1.5 mt-2 text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md w-fit">
                            <RotateCcw className="w-3 h-3" />
                            <span className="text-xs font-medium">
                              Restores at {formatScheduledRestoreTime(item.scheduledRestoreTime)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{formatTimeRemaining(item.snoozeEndTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Popover
                      open={openPopoverId === item.id}
                      onOpenChange={(open) => {
                        setOpenPopoverId(open ? item.id : null);
                        if (!open) setShowCustomTimePicker(false);
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[220px] p-0 bg-popover border-border rounded-xl overflow-hidden"
                        align="end"
                        sideOffset={8}
                      >
                        {showCustomTimePicker ? (
                          <div className="p-3">
                            <div className="flex items-center gap-2 mb-3">
                              <button
                                onClick={() => setShowCustomTimePicker(false)}
                                className="p-1 rounded-full hover:bg-muted transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                              </button>
                              <p className="text-foreground text-sm font-medium">Custom time</p>
                            </div>

                            <div className="flex items-center justify-center gap-2 mb-3">
                              {/* Hours */}
                              <div
                                className="relative overflow-hidden rounded-lg"
                                style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, width: 80 }}
                              >
                                <div
                                  className="absolute left-1 right-1 pointer-events-none z-10 rounded-md"
                                  style={{
                                    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                                    height: ITEM_HEIGHT,
                                    background: "hsl(var(--foreground) / 0.1)",
                                    border: "1px solid hsl(var(--foreground) / 0.15)",
                                  }}
                                />
                                <div
                                  ref={hoursScrollRef}
                                  className="h-full overflow-y-scroll scrollbar-hide touch-pan-y"
                                  style={{
                                    scrollSnapType: "y mandatory",
                                    WebkitOverflowScrolling: "touch",
                                    scrollBehavior: "smooth",
                                    overscrollBehavior: "contain",
                                  }}
                                  onScroll={handleHoursScroll}
                                >
                                  <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
                                  {hoursOptions.map((hour) => {
                                    const isSelected = hour === customHours;
                                    return (
                                      <div
                                        key={hour}
                                        className="flex items-center justify-center cursor-pointer select-none"
                                        style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
                                        onClick={() => {
                                          hoursScrollRef.current?.scrollTo({
                                            top: hour * ITEM_HEIGHT,
                                            behavior: "smooth",
                                          });
                                          setCustomHours(hour);
                                        }}
                                      >
                                        <span
                                          className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                                        >
                                          {hour}h
                                        </span>
                                      </div>
                                    );
                                  })}
                                  <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
                                </div>
                              </div>
                              {/* Minutes */}
                              <div
                                className="relative overflow-hidden rounded-lg"
                                style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, width: 80 }}
                              >
                                <div
                                  className="absolute left-1 right-1 pointer-events-none z-10 rounded-md"
                                  style={{
                                    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                                    height: ITEM_HEIGHT,
                                    background: "hsl(var(--foreground) / 0.1)",
                                    border: "1px solid hsl(var(--foreground) / 0.15)",
                                  }}
                                />
                                <div
                                  ref={minutesScrollRef}
                                  className="h-full overflow-y-scroll scrollbar-hide touch-pan-y"
                                  style={{
                                    scrollSnapType: "y mandatory",
                                    WebkitOverflowScrolling: "touch",
                                    scrollBehavior: "smooth",
                                    overscrollBehavior: "contain",
                                  }}
                                  onScroll={handleMinutesScroll}
                                >
                                  <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
                                  {minutesOptions.map((minute) => {
                                    const isSelected = minute === customMinutes;
                                    return (
                                      <div
                                        key={minute}
                                        className="flex items-center justify-center cursor-pointer select-none"
                                        style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
                                        onClick={() => {
                                          minutesScrollRef.current?.scrollTo({
                                            top: minute * ITEM_HEIGHT,
                                            behavior: "smooth",
                                          });
                                          setCustomMinutes(minute);
                                        }}
                                      >
                                        <span
                                          className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                                        >
                                          {minute}m
                                        </span>
                                      </div>
                                    );
                                  })}
                                  <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleCustomTimeConfirm(item.id)}
                              disabled={customHours === 0 && customMinutes === 0}
                              className="w-full py-2 rounded-lg text-sm font-semibold"
                            >
                              Confirm
                            </Button>
                          </div>
                        ) : (
                          <div className="py-2">
                            <p className="text-muted-foreground text-xs px-3 py-1.5">Restore after</p>
                            {restoreDurations.map((duration) => (
                              <button
                                key={duration.id}
                                onClick={() => handleRestoreWithDuration(item.id, duration.id)}
                                className="w-full py-2.5 px-3 hover:bg-muted text-foreground text-sm text-left transition-colors"
                              >
                                {duration.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        ) : (
          <>
            <div className="px-4 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search menu items..."
                    className="pl-9 bg-muted border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  size="sm"
                  variant={selectMode ? "default" : "outline"}
                  onClick={() => {
                    if (selectMode) exitSelectMode();
                    else setSelectMode(true);
                  }}
                  className="h-9 px-3 shrink-0"
                >
                  {selectMode ? "Cancel" : "Select"}
                </Button>
              </div>
            </div>

            <div className="px-4 pt-1 pb-2 border-b border-border">
              <p className="text-muted-foreground text-xs mb-1">Mark as unavailable for</p>
              <div className="flex gap-1">
                {snoozeDurations.map((duration) => (
                  <button
                    key={duration.id}
                    onClick={() => setSelectedDuration(duration.id)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedDuration === duration.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="px-4 pt-2 pb-4 space-y-2">
                {filteredCategories.map((category) => {
                  const isExpanded = expandedCategories.has(category.name);
                  return (
                    <div key={category.name} className="bg-muted rounded-xl overflow-hidden">
                      <button
                      onClick={() => toggleCategory(category.name)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/80 transition-colors"
                    >
                      <span className={`text-sm ${isExpanded ? "font-semibold text-muted-foreground" : "font-medium text-foreground"}`}>
                        {category.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">{category.items.length}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border bg-muted/40">
                        {category.items.map((item) => {
                          const is86ed = isItemEightySixed(item);
                          const isSelected = selectedItems.has(itemKey(item, category.name));
                          return (
                            <button
                              key={item}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (is86ed) return;
                                if (selectMode) toggleSelectItem(item, category.name);
                                else openConfirmItem({ name: item, category: category.name });
                              }}
                              disabled={is86ed}
                              className={`w-full flex items-center justify-between pl-6 pr-3 py-3 border-t border-border/50 first:border-t-0 transition-colors ${
                                is86ed
                                  ? "cursor-not-allowed eighty-six-row"
                                  : "hover:bg-muted/80"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {selectMode && !is86ed && (
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                      isSelected
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "border-muted-foreground/50 bg-background"
                                    }`}
                                  >
                                    {isSelected && (
                                      <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M2 6.5 L5 9.5 L10 3.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </div>
                                )}
                                {is86ed && (
                                  <div className="eighty-six-icon w-4 h-4 flex-shrink-0">
                                    <X size={10} strokeWidth={3} />
                                  </div>
                                )}
                                <span className={`text-sm font-normal text-foreground ${is86ed ? "eighty-six-text" : ""}`}>
                                  {item}
                                </span>
                              </div>
                              {is86ed ? (
                                <EightySixBadge size="sm" variant="subtle" />
                              ) : selectMode ? (
                                <InlineQtyAdjuster
                                  value={selectedQuantities[itemKey(item, category.name)] ?? 1}
                                  stock={getAvailableStock(item)}
                                  onChange={(qty) => {
                                    if (!isSelected) toggleSelectItem(item, category.name);
                                    setItemQuantity(item, category.name, qty);
                                  }}
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">Tap to 86</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}

        <Item86Modal
          open={!!confirmItem}
          onClose={closeConfirmItem}
          onConfirm={() => {
            if (confirmItem) {
              handleEightySix(confirmItem.name, confirmItem.category);
              closeConfirmItem();
            }
          }}
          productName={confirmItem?.name ?? ''}
          currentQuantity={0}
          initialQuantity={0}
          quantityLabel="Available stock"
          renderInPlace
        />


        <div className="p-4 border-t border-border">
          {view === "add" && selectMode ? (
            <Button
              onClick={bulk86Selected}
              disabled={selectedItems.size === 0}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              86 it{selectedItems.size > 0 ? ` (${selectedItems.size})` : ""}
            </Button>
          ) : (
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Done
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
