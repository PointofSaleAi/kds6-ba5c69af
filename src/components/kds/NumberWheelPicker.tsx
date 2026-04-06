import { useRef, useEffect, useCallback, useState } from 'react';

interface NumberWheelPickerProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

export default function NumberWheelPicker({ value, onChange, min = 0, max = 60, label }: NumberWheelPickerProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const scrollToValue = useCallback((val: number, smooth = false) => {
    if (!listRef.current) return;
    const idx = val - min;
    const offset = idx * ITEM_HEIGHT;
    listRef.current.scrollTo({ top: offset, behavior: smooth ? 'smooth' : 'auto' });
  }, [min]);

  useEffect(() => {
    scrollToValue(value);
  }, []);

  const handleScroll = () => {
    if (!listRef.current) return;
    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!listRef.current) return;
      const scrollTop = listRef.current.scrollTop;
      const idx = Math.round(scrollTop / ITEM_HEIGHT);
      const snappedVal = Math.max(min, Math.min(max, min + idx));
      listRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
      onChange(snappedVal);
      setIsScrolling(false);
    }, 80);
  };

  const paddingItems = Math.floor(VISIBLE_ITEMS / 2);

  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-[10px] font-semibold text-text-muted mb-1 uppercase tracking-wider">{label}</span>}
      <div
        className="relative rounded-xl border border-border bg-muted overflow-hidden"
        style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, width: 64 }}
      >
        {/* Selection highlight */}
        <div
          className="absolute left-1 right-1 rounded-lg bg-foreground/10 pointer-events-none z-10"
          style={{ top: ITEM_HEIGHT * paddingItems, height: ITEM_HEIGHT }}
        />

        {/* Fade edges */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-muted to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-muted to-transparent pointer-events-none z-20" />

        <div
          ref={listRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto scrollbar-hide"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {/* Top padding */}
          {Array.from({ length: paddingItems }).map((_, i) => (
            <div key={`pad-top-${i}`} style={{ height: ITEM_HEIGHT }} />
          ))}

          {items.map((num) => {
            const isActive = num === value;
            return (
              <div
                key={num}
                onClick={() => { onChange(num); scrollToValue(num, true); }}
                className={`flex items-center justify-center cursor-pointer transition-all select-none ${
                  isActive ? 'text-text-primary font-bold text-lg' : 'text-text-muted text-sm'
                }`}
                style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'start' }}
              >
                {num}
              </div>
            );
          })}

          {/* Bottom padding */}
          {Array.from({ length: paddingItems }).map((_, i) => (
            <div key={`pad-bot-${i}`} style={{ height: ITEM_HEIGHT }} />
          ))}
        </div>
      </div>
    </div>
  );
}
