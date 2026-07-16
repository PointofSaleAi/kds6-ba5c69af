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
import { Separator } from "@/components/ui/separator";
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
  Hourglass,
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

function InlineQtyAdjuster({ value, onChange }: InlineQtyAdjusterProps) {
  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(Math.max(0, value - 1));
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
  );
}

// Bucket an item's duration into a preset key so batch-uniform detection
// ignores second-level drift between items snoozed in the same bulk action.
type DurationPreset = "indefinite" | "15min" | "1hr" | "end_of_shift" | `custom-${number}`;
const getDurationPreset = (item: EightySixedItem): DurationPreset => {
  if (!item.snoozeEndTime) return "indefinite";
  const ms = item.snoozeEndTime.getTime() - item.snoozedAt.getTime();
  const minutes = Math.round(ms / 60000);
  if (Math.abs(minutes - 15) <= 1) return "15min";
  if (Math.abs(minutes - 60) <= 1) return "1hr";
  if (Math.abs(minutes - 480) <= 2) return "end_of_shift";
  // Bucket custom to nearest 5 min so bulk-set customs still count as uniform.
  return `custom-${Math.round(minutes / 5) * 5}`;
};

const getPresetLabel = (preset: DurationPreset): string => {
  if (preset === "indefinite") return "Until manually restored";
  if (preset === "15min") return "15 minutes";
  if (preset === "1hr") return "1 hour";
  if (preset === "end_of_shift") return "End of shift";
  const mins = Number(preset.split("-")[1]);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h} hour${h > 1 ? "s" : ""}`;
  }
  return `${mins} minutes`;
};

const getStockKind = (item: EightySixedItem): "out" | "partial" =>
  (item.quantity ?? 0) > 0 ? "partial" : "out";

const isGroupUniform = (items: EightySixedItem[]): boolean => {
  if (items.length <= 1) return true;
  const preset = getDurationPreset(items[0]);
  const stock = getStockKind(items[0]);
  return items.every((i) => getDurationPreset(i) === preset && getStockKind(i) === stock);
};

const getMinTimeRemainingLabel = (items: EightySixedItem[]): string => {
  const timed = items.filter((i) => i.snoozeEndTime);
  if (timed.length === 0) return "Until manually restored";
  const earliest = timed.reduce((min, i) =>
    (i.snoozeEndTime!.getTime() < min.snoozeEndTime!.getTime() ? i : min),
  );
  return formatTimeRemaining(earliest.snoozeEndTime);
};

interface RestorePopoverProps {
  itemId?: string;
  bulkItems?: EightySixedItem[];
  openPopoverId: string | null;
  setOpenPopoverId: (v: string | null) => void;
  showCustomTimePicker: boolean;
  setShowCustomTimePicker: (v: boolean) => void;
  handleRestoreWithDuration: (itemId: string, durationId: string) => void;
  handleCustomTimeConfirm: (itemId: string) => void;
  handleRestoreAllWithDuration?: (items: EightySixedItem[], durationId: string) => void;
  handleCustomTimeConfirmAll?: (items: EightySixedItem[]) => void;
  customHours: number;
  customMinutes: number;
  setCustomHours: (v: number) => void;
  setCustomMinutes: (v: number) => void;
  hoursScrollRef: React.RefObject<HTMLDivElement>;
  minutesScrollRef: React.RefObject<HTMLDivElement>;
  handleHoursScroll: () => void;
  handleMinutesScroll: () => void;
  hoursOptions: number[];
  minutesOptions: number[];
  triggerLabel?: string;
  triggerClassName?: string;
}

function RestorePopover(props: RestorePopoverProps) {
  const {
    itemId, bulkItems, openPopoverId, setOpenPopoverId,
    showCustomTimePicker, setShowCustomTimePicker,
    handleRestoreWithDuration, handleCustomTimeConfirm,
    handleRestoreAllWithDuration, handleCustomTimeConfirmAll,
    customHours, customMinutes, setCustomHours, setCustomMinutes,
    hoursScrollRef, minutesScrollRef, handleHoursScroll, handleMinutesScroll,
    hoursOptions, minutesOptions,
    triggerLabel = "Restore", triggerClassName,
  } = props;

  const popoverKey = bulkItems ? `bulk:${bulkItems === props.bulkItems && !itemId ? "all" : bulkItems[0]?.category ?? "group"}` : itemId!;
  const isOpen = openPopoverId === popoverKey;

  const onSelectDuration = (durationId: string) => {
    if (bulkItems && bulkItems.length > 0 && handleRestoreAllWithDuration) {
      handleRestoreAllWithDuration(bulkItems, durationId);
    } else if (itemId) {
      handleRestoreWithDuration(itemId, durationId);
    }
  };

  const onConfirmCustom = () => {
    if (bulkItems && bulkItems.length > 0 && handleCustomTimeConfirmAll) {
      handleCustomTimeConfirmAll(bulkItems);
    } else if (itemId) {
      handleCustomTimeConfirm(itemId);
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setOpenPopoverId(open ? popoverKey : null);
        if (!open) setShowCustomTimePicker(false);
      }}
    >
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className={triggerClassName ?? "h-8 px-3 text-xs font-semibold"}>
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0 bg-popover border-border rounded-xl overflow-hidden" align="end" sideOffset={8}>
        {showCustomTimePicker ? (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setShowCustomTimePicker(false)} className="p-1 rounded-full hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <p className="text-foreground text-sm font-medium">Custom time</p>
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="relative overflow-hidden rounded-lg" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, width: 80 }}>
                <div className="absolute left-1 right-1 pointer-events-none z-10 rounded-md"
                  style={{ top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2), height: ITEM_HEIGHT,
                    background: "hsl(var(--foreground) / 0.1)", border: "1px solid hsl(var(--foreground) / 0.15)" }} />
                <div ref={hoursScrollRef} className="h-full overflow-y-scroll scrollbar-hide touch-pan-y"
                  style={{ scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth", overscrollBehavior: "contain" }}
                  onScroll={handleHoursScroll}>
                  <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
                  {hoursOptions.map((hour) => {
                    const isSelected = hour === customHours;
                    return (
                      <div key={hour} className="flex items-center justify-center cursor-pointer select-none"
                        style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
                        onClick={() => { hoursScrollRef.current?.scrollTo({ top: hour * ITEM_HEIGHT, behavior: "smooth" }); setCustomHours(hour); }}>
                        <span className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{hour}h</span>
                      </div>
                    );
                  })}
                  <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, width: 80 }}>
                <div className="absolute left-1 right-1 pointer-events-none z-10 rounded-md"
                  style={{ top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2), height: ITEM_HEIGHT,
                    background: "hsl(var(--foreground) / 0.1)", border: "1px solid hsl(var(--foreground) / 0.15)" }} />
                <div ref={minutesScrollRef} className="h-full overflow-y-scroll scrollbar-hide touch-pan-y"
                  style={{ scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth", overscrollBehavior: "contain" }}
                  onScroll={handleMinutesScroll}>
                  <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
                  {minutesOptions.map((minute) => {
                    const isSelected = minute === customMinutes;
                    return (
                      <div key={minute} className="flex items-center justify-center cursor-pointer select-none"
                        style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
                        onClick={() => { minutesScrollRef.current?.scrollTo({ top: minute * ITEM_HEIGHT, behavior: "smooth" }); setCustomMinutes(minute); }}>
                        <span className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{minute}m</span>
                      </div>
                    );
                  })}
                  <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
                </div>
              </div>
            </div>
            <Button onClick={onConfirmCustom} disabled={customHours === 0 && customMinutes === 0}
              className="w-full py-2 rounded-lg text-sm font-semibold">Confirm</Button>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-muted-foreground text-xs px-3 py-1.5">Restore after</p>
            {restoreDurations.map((duration) => (
              <button key={duration.id} onClick={() => onSelectDuration(duration.id)}
                className="w-full py-2.5 px-3 hover:bg-muted text-foreground text-sm text-left transition-colors">
                {duration.label}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface ManageListProps extends Omit<RestorePopoverProps, "itemId" | "bulkItems" | "triggerLabel" | "triggerClassName"> {
  items: EightySixedItem[];
  onRestoreItem: (itemId: string) => void;
  onScheduleRestore: (itemId: string, restoreTime: Date) => void;
  handleRestoreAllWithDuration: (items: EightySixedItem[], durationId: string) => void;
  handleCustomTimeConfirmAll: (items: EightySixedItem[]) => void;
}

function ManageEightySixedList(props: ManageListProps) {
  const { items } = props;

  const grouped = useMemo(() => {
    const map = new Map<string, EightySixedItem[]>();
    for (const it of items) {
      const cat = it.category || UNCATEGORIZED;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(it);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const renderItemSubtext = (item: EightySixedItem) => {
    const stock = getStockKind(item);
    const preset = getDurationPreset(item);
    const timeLabel = item.snoozeEndTime ? formatTimeRemaining(item.snoozeEndTime) : getPresetLabel(preset);
    if (stock === "partial") {
      return (
        <p className="text-xs text-muted-foreground mt-0.5">
          <span className="text-amber-600 dark:text-amber-400 font-semibold">{item.quantity} left</span>
          <span> · {timeLabel}</span>
        </p>
      );
    }
    return <p className="text-xs text-muted-foreground mt-0.5">Out of stock · {timeLabel}</p>;
  };

  return (
    <div className="pb-4">
      {/* Top header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-foreground text-base font-bold">{items.length} items 86'd</p>
          <RestorePopover {...props} bulkItems={items} triggerLabel="Restore all" />
        </div>
      </div>

      {/* Category groups */}
      <div className="mt-2">
        {grouped.map(([category, list]) => {
          return (
            <div key={category} className="border-t border-border">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/40">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold tracking-wider text-foreground uppercase">{category}</p>
                  <span className="text-xs text-muted-foreground">({list.length})</span>
                </div>
                <RestorePopover {...props} bulkItems={list} triggerLabel={`Restore all (${list.length})`} />
              </div>

              <div className="divide-y divide-border/60">
                {list.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                      {renderItemSubtext(item)}
                    </div>
                    <RestorePopover {...props} itemId={item.id} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [durationPopoverOpen, setDurationPopoverOpen] = useState(false);
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
        setSelectedQuantities((q) => ({ ...q, [k]: 0 }));
      }
      return next;
    });
  };

  const setItemQuantity = (name: string, category: string, quantity: number) => {
    const k = itemKey(name, category);
    setSelectedQuantities((prev) => ({ ...prev, [k]: Math.max(0, quantity) }));
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
        onEightySixItem({ name, category, snoozeDuration: selectedDuration, quantity: selectedQuantities[k] ?? 0 });
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
      setSearchOpen(false);
      setSearchQuery("");
      setDurationPopoverOpen(false);
      exitSelectMode();
    }
  }, [open]);

  useEffect(() => {
    if (view !== "add") {
      exitSelectMode();
      setSearchOpen(false);
      setSearchQuery("");
    }
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

  const handleRestoreAllWithDuration = (items: EightySixedItem[], durationId: string) => {
    if (durationId === "custom") {
      setShowCustomTimePicker(true);
      return;
    }
    if (durationId === "now") {
      items.forEach((i) => onRestoreItem(i.id));
      setOpenPopoverId(null);
      setShowCustomTimePicker(false);
      return;
    }
    const duration = restoreDurations.find((d) => d.id === durationId);
    if (duration && duration.ms) {
      const restoreTime = new Date(Date.now() + duration.ms);
      items.forEach((i) => onScheduleRestore(i.id, restoreTime));
    } else {
      items.forEach((i) => onRestoreItem(i.id));
    }
    setOpenPopoverId(null);
    setShowCustomTimePicker(false);
  };

  const handleCustomTimeConfirmAll = (items: EightySixedItem[]) => {
    if (customHours > 0 || customMinutes > 0) {
      const ms = (customHours * 60 + customMinutes) * 60 * 1000;
      const restoreTime = new Date(Date.now() + ms);
      items.forEach((i) => onScheduleRestore(i.id, restoreTime));
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

  const isItemEightySixed = (itemName: string) =>
    eightySixedItems.some((item) => item.name === itemName);

  const handleEightySix = (itemName: string, category: string, quantity = 1) => {
    onEightySixItem({ name: itemName, category, snoozeDuration: selectedDuration, quantity });
  };

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
      const visibleItems = (categoryMatches ? cat.items : cat.items.filter((item) => item.toLowerCase().includes(query)))
        .filter((item) => !isItemEightySixed(item));
      return { ...cat, items: visibleItems };
    })
    .filter((cat) => cat.items.length > 0);

  // Expand all categories by default in Add Items view, and auto-expand any
  // categories that contain matching products while searching.
  useEffect(() => {
    if (view === "add") {
      setExpandedCategories(new Set(filteredCategories.map((c) => c.name)));
    }
  }, [view, filteredCategories]);




  const totalEightySixedCount = eightySixedItems.length;
  const activeDurationLabel =
    snoozeDurations.find((d) => d.id === selectedDuration)?.label ?? "1 hour";

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="right"
        className="w-[400px] sm:max-w-[400px] bg-background border-border p-0 flex flex-col gap-0 [&>button.absolute]:hidden"
        onPointerDownOutside={(e) => { if (confirmItem) e.preventDefault(); }}
        onInteractOutside={(e) => { if (confirmItem) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (confirmItem) { e.preventDefault(); closeConfirmItem(); } }}
      >

        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-foreground text-base font-semibold flex items-center gap-2 m-0">
              <span className="inline-flex items-center justify-center h-6 min-w-[26px] px-1.5 rounded-md bg-destructive text-white text-[11px] font-bold tracking-tight">
                86
              </span>
              <span>Products</span>
            </SheetTitle>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setView(view === "manage" ? "add" : "manage")}
                aria-pressed={view === "manage"}
                className={`h-8 pl-2.5 pr-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  view === "manage"
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                <span>86'd</span>
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                  {totalEightySixedCount}
                </span>
              </button>
              {view === "add" && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen((v) => {
                      const next = !v;
                      if (!next) setSearchQuery("");
                      return next;
                    });
                  }}
                  aria-label="Search products"
                  aria-pressed={searchOpen}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                    searchOpen
                      ? "bg-foreground text-background"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </SheetHeader>



        {view === "manage" ? (
          <ScrollArea className="flex-1 w-full">
            {eightySixedItems.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <Package className="w-12 h-12 text-muted-foreground/20 mb-4 mx-auto" />
                <p className="text-muted-foreground text-center w-full">No products are currently 86'd</p>
                <Button
                  onClick={() => setView("add")}
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 mx-auto"
                >
                  Add Products
                </Button>
              </div>
            ) : (
              <ManageEightySixedList
                items={eightySixedItems}
                onRestoreItem={onRestoreItem}
                onScheduleRestore={onScheduleRestore}
                openPopoverId={openPopoverId}
                setOpenPopoverId={setOpenPopoverId}
                showCustomTimePicker={showCustomTimePicker}
                setShowCustomTimePicker={setShowCustomTimePicker}
                handleRestoreWithDuration={handleRestoreWithDuration}
                handleCustomTimeConfirm={handleCustomTimeConfirm}
                handleRestoreAllWithDuration={handleRestoreAllWithDuration}
                handleCustomTimeConfirmAll={handleCustomTimeConfirmAll}
                customHours={customHours}
                customMinutes={customMinutes}
                setCustomHours={setCustomHours}
                setCustomMinutes={setCustomMinutes}
                hoursScrollRef={hoursScrollRef}
                minutesScrollRef={minutesScrollRef}
                handleHoursScroll={handleHoursScroll}
                handleMinutesScroll={handleMinutesScroll}
                hoursOptions={hoursOptions}
                minutesOptions={minutesOptions}
              />
            )}
          </ScrollArea>
        ) : (
          <>
            {searchOpen && (
              <div className="px-4 py-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search menu products..."
                    className="pl-9 pr-9 bg-muted border-input text-foreground placeholder:text-muted-foreground"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-muted-foreground/10 flex items-center justify-center"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-4 py-2 border-b border-border gap-3">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Hourglass className="w-4 h-4 text-muted-foreground" />
                <span>Mark unavailable for</span>
              </div>
              <Popover open={durationPopoverOpen} onOpenChange={setDurationPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="h-8 pl-3 pr-2 rounded-full bg-foreground text-background flex items-center gap-1.5 text-xs font-semibold hover:bg-foreground/90 transition-colors"
                  >
                    <span>{activeDurationLabel}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={6} className="w-[200px] p-1 bg-popover border-border rounded-xl">
                  {snoozeDurations.map((duration) => (
                    <button
                      key={duration.id}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(duration.id);
                        setDurationPopoverOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedDuration === duration.id
                          ? "bg-foreground text-background font-semibold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {(() => {
              const allSelectableKeys = filteredCategories.flatMap((cat) =>
                cat.items.filter((i) => !isItemEightySixed(i)).map((i) => itemKey(i, cat.name)),
              );
              const allSelected = allSelectableKeys.length > 0 && allSelectableKeys.every((k) => selectedItems.has(k));
              const toggleSelectAll = () => {
                if (allSelected) {
                  setSelectedItems(new Set());
                  setSelectedQuantities({});
                } else {
                  const next = new Set(selectedItems);
                  const nextQ = { ...selectedQuantities };
                  allSelectableKeys.forEach((k) => {
                    next.add(k);
                    if (nextQ[k] === undefined) nextQ[k] = 0;
                  });
                  setSelectedItems(next);
                  setSelectedQuantities(nextQ);
                }
              };
              return (
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">
                    {selectedItems.size > 0 ? `${selectedItems.size} selected` : "Tap the product to select"}
                  </span>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>
              );
            })()}




            <ScrollArea className="flex-1">
              <div className={`px-4 pt-1 space-y-3 ${selectedItems.size > 0 ? "pb-20" : "pb-4"}`}>
                {filteredCategories.map((category, index) => (
                  <>
                    <div key={category.name}>
                      <div className="flex items-center justify-between px-1 py-1">
                        <h3 className="text-sm font-bold text-foreground">
                          {category.name}
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            ({category.items.length})
                          </span>
                        </h3>
                        {category.items.some((i) => selectedItems.has(itemKey(i, category.name))) && (
                          <span className="text-xs text-muted-foreground">Available Stock</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {category.items.map((item) => {
                          const is86ed = isItemEightySixed(item);
                          const k = itemKey(item, category.name);
                          const isSelected = selectedItems.has(k);
                          return (
                            <button
                              key={item}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (is86ed) return;
                                toggleSelectItem(item, category.name);
                              }}
                              disabled={is86ed}
                              className={`w-full flex items-center justify-between px-2 py-2.5 rounded-lg transition-colors ${
                                is86ed
                                  ? "cursor-not-allowed eighty-six-row"
                                  : isSelected
                                    ? "bg-primary/5"
                                    : "hover:bg-muted/60"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {is86ed && (
                                  <div className="eighty-six-icon w-4 h-4 flex-shrink-0">
                                    <X size={10} strokeWidth={3} />
                                  </div>
                                )}
                                <span className={`text-sm font-medium text-foreground ${is86ed ? "eighty-six-text" : ""}`}>
                                  {item}
                                </span>
                              </div>
                              {is86ed ? (
                                <EightySixBadge size="sm" variant="subtle" />
                              ) : isSelected ? (
                                <InlineQtyAdjuster
                                  value={selectedQuantities[k] ?? 0}
                                  onChange={(qty) => setItemQuantity(item, category.name, qty)}
                                />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {index < filteredCategories.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </>
                ))}
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


        {view === "add" && selectedItems.size > 0 && (
          <div className="absolute bottom-4 right-4 z-50">
            <Button
              onClick={bulk86Selected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg"
            >
              86 it ({selectedItems.size})
            </Button>
          </div>
        )}

      </SheetContent>
    </Sheet>
  );
}
