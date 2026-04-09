import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS } from '@/hooks/use-kds-settings';
import { ChevronLeft, RotateCcw } from 'lucide-react';

const ORDER_TYPES = [
  { key: 'dine-in', label: 'DINE IN', table: 'Table 4', server: 'Sarah', time: '2:35', orderNum: 142, items: ['Grilled Salmon', 'Caesar Salad'] },
  { key: 'take-out', label: 'TAKE OUT', table: '#1042', server: 'Mike', time: '1:12', orderNum: 318, items: ['Burger Combo', 'Fries'] },
  { key: 'delivery', label: 'DELIVERY', table: '#D-207', server: 'UberEats', time: '4:08', orderNum: 527, items: ['Pad Thai', 'Spring Rolls'] },
  { key: 'banquet', label: 'BANQUET', table: 'Hall B', server: 'James', time: '0:45', orderNum: 891, items: ['Filet Mignon x12'] },
  { key: 'drive-thru', label: 'DRIVE THRU', table: 'Lane 2', server: 'Alex', time: '1:50', orderNum: 604, items: ['Chicken Wrap', 'Iced Tea'] },
  { key: 'curb-side', label: 'CURB SIDE', table: 'Spot 5', server: 'Lina', time: '3:20', orderNum: 735, items: ['Family Meal Box'] },
  { key: 'scheduled', label: 'SCHEDULED', table: '6:30 PM', server: 'Online', time: '0:00', orderNum: 412, items: ['Party Platter'] },
  { key: 'phone-in', label: 'PHONE-IN', table: '#P-88', server: 'Front', time: '2:10', orderNum: 263, items: ['Pizza Margherita'] },
  { key: 'custom', label: 'CUSTOM', table: 'Event', server: 'Chef', time: '5:00', orderNum: 109, items: ['Special Menu'] },
] as const;

interface OrderTypeColorsSettingsProps {
  onBack: () => void;
}

function LivePreviewCard({ label, table, server, time, items, bgColor, orderNum }: {
  label: string; table: string; server: string; time: string; items: readonly string[]; bgColor: string; orderNum: number;
}) {
  return (
    <div className="rounded-lg overflow-hidden border border-border shadow-sm">
      {/* Header - the part that changes color */}
      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-2 text-primary-foreground/80 text-[11px]">
          <span>{time}</span>
          <span>{table}</span>
        </div>
      </div>
      {/* Body */}
      <div className="bg-surface-card px-3 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[20px] font-black text-text-primary leading-none">#{orderNum}</span>
          <span className="text-[11px] text-text-muted">{server}</span>
        </div>
        {items.map((item, i) => (
          <div key={i} className="text-[12px] text-text-secondary font-medium leading-relaxed">{item}</div>
        ))}
      </div>
    </div>
  );
}

export default function OrderTypeColorsSettings({ onBack }: OrderTypeColorsSettingsProps) {
  const { orderTypeColors, setOrderTypeColors } = useKDSSettings();

  const handleColorChange = (key: string, color: string) => {
    setOrderTypeColors({ ...orderTypeColors, [key]: color });
  };

  const handleReset = () => {
    setOrderTypeColors({ ...DEFAULT_ORDER_TYPE_COLORS });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 shrink-0">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Back"
        >
          <ChevronLeft size={20} className="text-text-secondary" />
        </button>
        <h2 className="text-lg font-bold text-text-primary">Order Type Colors</h2>
      </div>
      <div className="mx-5 h-px bg-border mb-4" />

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Live Preview Strip */}
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider mb-2 block">Live Preview</span>
          <div className="grid grid-cols-3 gap-2">
            {ORDER_TYPES.map(({ key, label, table, server, time, orderNum, items }) => (
              <LivePreviewCard
                key={key}
                label={label}
                table={table}
                server={server}
                time={time}
                orderNum={orderNum}
                items={items}
                bgColor={orderTypeColors[key] || DEFAULT_ORDER_TYPE_COLORS[key]}
              />
            ))}
          </div>
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-2 gap-3 max-w-2xl">
          {ORDER_TYPES.map(({ key, label }) => {
            const color = orderTypeColors[key] || DEFAULT_ORDER_TYPE_COLORS[key];
            return (
              <div key={key} className="bg-surface-card border border-border rounded-xl p-4 flex items-center gap-3">
                <label className="relative cursor-pointer shrink-0">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span
                    className="block w-10 h-10 rounded-full border-2 border-border"
                    style={{ backgroundColor: color }}
                  />
                </label>
                <div className="min-w-0">
                  <div className="text-[15px] font-bold text-text-primary">{label}</div>
                  <div className="text-[12px] text-text-muted font-mono uppercase">{color}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-primary text-[13px] font-bold min-h-[44px] hover:bg-muted/80 transition-colors mt-4"
        >
          <RotateCcw size={14} />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
