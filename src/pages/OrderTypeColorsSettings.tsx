import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS } from '@/hooks/use-kds-settings';
import { ChevronLeft, RotateCcw } from 'lucide-react';

const ORDER_TYPES = [
  { key: 'dine-in', label: 'DINE IN' },
  { key: 'take-out', label: 'TAKE OUT' },
  { key: 'delivery', label: 'DELIVERY' },
  { key: 'banquet', label: 'BANQUET' },
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
        <div className="space-y-3 max-w-md">
          {ORDER_TYPES.map(({ key, label }) => (
            <div key={key} className="bg-surface-card border border-border rounded-xl p-4">
              {/* Preview strip */}
              <div
                className="rounded-lg px-3 py-2 mb-3"
                style={{ backgroundColor: orderTypeColors[key] || DEFAULT_ORDER_TYPE_COLORS[key] }}
              >
                <span className="text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  {label}
                </span>
              </div>

              {/* Color picker row */}
              <div className="flex items-center gap-3">
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={orderTypeColors[key] || DEFAULT_ORDER_TYPE_COLORS[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span
                    className="block w-10 h-10 rounded-full border-2 border-border"
                    style={{ backgroundColor: orderTypeColors[key] || DEFAULT_ORDER_TYPE_COLORS[key] }}
                  />
                </label>
                <div>
                  <div className="text-[15px] font-bold text-text-primary">{label}</div>
                  <div className="text-[12px] text-text-muted font-mono uppercase">
                    {orderTypeColors[key] || DEFAULT_ORDER_TYPE_COLORS[key]}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-primary text-[13px] font-bold min-h-[44px] hover:bg-muted/80 transition-colors mt-4"
          >
            <RotateCcw size={14} />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
