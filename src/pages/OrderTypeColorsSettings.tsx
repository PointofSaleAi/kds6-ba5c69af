import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS } from '@/hooks/use-kds-settings';
import { RotateCcw } from 'lucide-react';

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
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Column headers */}
        <div className="grid grid-cols-2 gap-8 mb-2">
          <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider">Color Settings</span>
          <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider">Live Preview</span>
        </div>

        {/* Aligned rows */}
        <div className="flex flex-col gap-3">
          {ORDER_TYPES.map(({ key, label, table, server, time, orderNum, items }) => {
            const color = orderTypeColors[key] || DEFAULT_ORDER_TYPE_COLORS[key];
            return (
              <div key={key} className="grid grid-cols-2 gap-8 items-stretch">
                {/* Left: Color picker */}
                <div className="bg-surface-card border border-border rounded-xl p-4 flex items-center gap-3">
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

                {/* Right: Preview card */}
                <div className="rounded-lg overflow-hidden border border-border shadow-sm flex flex-col">
                  <div
                    className="px-3 py-2 flex items-center justify-between"
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                      {label}
                    </span>
                    <div className="flex items-center gap-2 text-primary-foreground/80 text-[11px]">
                      <span>{time}</span>
                      <span>{table}</span>
                    </div>
                  </div>
                  <div className="bg-surface-card px-3 py-2 flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[20px] font-black text-text-primary leading-none">#{orderNum}</span>
                      <span className="text-[11px] text-text-muted">{server}</span>
                    </div>
                    {items.map((item, i) => (
                      <div key={i} className="text-[12px] text-text-secondary font-medium leading-relaxed">{item}</div>
                    ))}
                  </div>
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
