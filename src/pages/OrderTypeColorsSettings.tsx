import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS, DEFAULT_ORDER_TYPE_DETAILED_COLORS } from '@/hooks/use-kds-settings';
import { RotateCcw, ArrowLeft } from 'lucide-react';

const ORDER_TYPES = [
  { key: 'dine-in', label: 'DINE IN', table: 'Table 4', time: '2:35' },
  { key: 'take-out', label: 'TAKE OUT', table: '#1042', time: '1:12' },
  { key: 'delivery', label: 'DELIVERY', table: '#D-207', time: '4:08' },
  { key: 'banquet', label: 'BANQUET', table: 'Hall B', time: '0:45' },
  { key: 'drive-thru', label: 'DRIVE THRU', table: 'Lane 2', time: '1:50' },
  { key: 'curb-side', label: 'CURB SIDE', table: 'Spot 5', time: '3:20' },
  { key: 'scheduled', label: 'SCHEDULED', table: '6:30 PM', time: '0:00' },
  { key: 'phone-in', label: 'PHONE-IN', table: '#P-88', time: '2:10' },
  { key: 'custom', label: 'CUSTOM', table: 'Event', time: '5:00' },
] as const;

interface OrderTypeColorsSettingsProps {
  onBack: () => void;
}

export default function OrderTypeColorsSettings({ onBack }: OrderTypeColorsSettingsProps) {
  const { orderTypeColors, orderTypeDetailedColors, setOrderTypeColors, setOrderTypeDetailedColors } = useKDSSettings();

  const getColors = (key: string) => orderTypeDetailedColors?.[key] || DEFAULT_ORDER_TYPE_DETAILED_COLORS[key];

  const handleColorChange = (key: string, field: 'headerBg' | 'headerText', value: string) => {
    const current = getColors(key);
    setOrderTypeDetailedColors({
      ...orderTypeDetailedColors,
      [key]: { ...current, [field]: value },
    });
    if (field === 'headerBg') {
      setOrderTypeColors({ ...orderTypeColors, [key]: value });
    }
  };

  const handleReset = () => {
    setOrderTypeColors({ ...DEFAULT_ORDER_TYPE_COLORS });
    setOrderTypeDetailedColors({ ...DEFAULT_ORDER_TYPE_DETAILED_COLORS });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="relative flex items-center justify-center px-2 pt-2 pb-3 shrink-0">
        <button
          onClick={onBack}
          className="absolute left-2 w-11 h-11 rounded-full bg-muted shadow-sm hover:bg-muted/70 transition-colors flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="w-full pl-12 sm:pl-0 text-lg sm:text-2xl font-bold text-text-primary text-center leading-tight">Order Type Colors</h1>
      </div>
      <div className="flex-1 px-2 pb-2 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {ORDER_TYPES.map(({ key, label, table, time }) => {
            const colors = getColors(key);
            return (
              <div key={key} className="rounded-xl border border-border overflow-hidden">
                {/* Live header preview */}
                <div
                  className="px-3 py-2 flex items-center justify-between"
                  style={{ backgroundColor: colors.headerBg }}
                >
                  <span
                    className="text-[13px] font-bold uppercase tracking-wider"
                    style={{ color: colors.headerText }}
                  >
                    {label}
                  </span>
                  <div
                    className="flex items-center gap-2 text-[11px]"
                    style={{ color: colors.headerText, opacity: 0.8 }}
                  >
                    <span>{time}</span>
                    <span>{table}</span>
                  </div>
                </div>

                {/* Color controls */}
                <div className="bg-surface-card px-3 py-3 grid grid-cols-2 gap-2">
                  {/* Header Background */}
                  <div className="flex items-center gap-2 flex-1">
                    <label className="relative cursor-pointer shrink-0">
                      <input
                        type="color"
                        value={colors.headerBg}
                        onChange={(e) => handleColorChange(key, 'headerBg', e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <span
                        className="block w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: colors.headerBg }}
                      />
                    </label>
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-text-primary leading-tight">Background</div>
                      <div className="text-[11px] text-text-muted font-mono uppercase">{colors.headerBg}</div>
                    </div>
                  </div>

                  {/* Header Text */}
                  <div className="flex items-center gap-2 flex-1">
                    <label className="relative cursor-pointer shrink-0">
                      <input
                        type="color"
                        value={colors.headerText}
                        onChange={(e) => handleColorChange(key, 'headerText', e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <span
                        className="block w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: colors.headerText }}
                      />
                    </label>
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-text-primary leading-tight">Text</div>
                      <div className="text-[11px] text-text-muted font-mono uppercase">{colors.headerText}</div>
                    </div>
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
