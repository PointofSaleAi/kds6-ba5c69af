import { useState } from 'react';
import { useKDSSettings, DEFAULT_ORDER_TYPE_COLORS, DEFAULT_ORDER_TYPE_DETAILED_COLORS, type OrderTypeColorSet } from '@/hooks/use-kds-settings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';
import PersonSimpleRunBold from '@/assets/person-simple-run-bold.svg';

const ORDER_TYPES = [
  { key: 'dine-in', label: 'Dine In', headerLabel: 'DINE IN', table: 'Table 4', server: 'Sarah', time: '2:35', orderNum: 142 },
  { key: 'take-out', label: 'Take Out', headerLabel: 'TAKE OUT', table: '#1042', server: 'Mike', time: '1:12', orderNum: 318 },
  { key: 'delivery', label: 'Delivery', headerLabel: 'DELIVERY', table: '#D-207', server: 'UberEats', time: '4:08', orderNum: 527 },
  { key: 'banquet', label: 'Banquet', headerLabel: 'BANQUET', table: 'Hall B', server: 'James', time: '0:45', orderNum: 891 },
  { key: 'drive-thru', label: 'Drive Thru', headerLabel: 'DRIVE THRU', table: 'Lane 2', server: 'Alex', time: '1:50', orderNum: 604 },
  { key: 'curb-side', label: 'Curb Side', headerLabel: 'CURB SIDE', table: 'Spot 5', server: 'Lina', time: '3:20', orderNum: 735 },
  { key: 'scheduled', label: 'Scheduled', headerLabel: 'SCHEDULED', table: '6:30 PM', server: 'Online', time: '0:00', orderNum: 412 },
  { key: 'phone-in', label: 'Phone-In', headerLabel: 'PHONE-IN', table: '#P-88', server: 'Front', time: '2:10', orderNum: 263 },
  { key: 'custom', label: 'Custom', headerLabel: 'CUSTOM', table: 'Event', server: 'Chef', time: '5:00', orderNum: 109 },
] as const;

const COLOR_FIELDS: { key: keyof OrderTypeColorSet; label: string }[] = [
  { key: 'headerBg', label: 'Header Background Color' },
  { key: 'headerText', label: 'Header Text Color' },
  { key: 'ticketNumber', label: 'Ticket Number Color' },
  { key: 'bodyText', label: 'Body Text Color' },
];

interface OrderTypeColorsSettingsProps {
  onBack: () => void;
}

export default function OrderTypeColorsSettings({ onBack }: OrderTypeColorsSettingsProps) {
  const { orderTypeColors, orderTypeDetailedColors, setOrderTypeColors, setOrderTypeDetailedColors } = useKDSSettings();
  const [selectedType, setSelectedType] = useState('dine-in');

  const selectedInfo = ORDER_TYPES.find(t => t.key === selectedType)!;
  const colors: OrderTypeColorSet = orderTypeDetailedColors?.[selectedType] || DEFAULT_ORDER_TYPE_DETAILED_COLORS[selectedType];

  const handleColorChange = (field: keyof OrderTypeColorSet, value: string) => {
    const updated = {
      ...orderTypeDetailedColors,
      [selectedType]: { ...colors, [field]: value },
    };
    setOrderTypeDetailedColors(updated);
    // Keep orderTypeColors in sync (headerBg is the legacy single color)
    if (field === 'headerBg') {
      setOrderTypeColors({ ...orderTypeColors, [selectedType]: value });
    }
  };

  const handleReset = () => {
    const defaultDetailed = DEFAULT_ORDER_TYPE_DETAILED_COLORS[selectedType];
    const defaultBg = DEFAULT_ORDER_TYPE_COLORS[selectedType];
    setOrderTypeDetailedColors({
      ...orderTypeDetailedColors,
      [selectedType]: { ...defaultDetailed },
    });
    setOrderTypeColors({ ...orderTypeColors, [selectedType]: defaultBg });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Dropdown selector */}
        <div className="mb-6">
          <label className="text-[11px] font-bold uppercase text-text-muted tracking-wider mb-2 block">
            Select Order Type
          </label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full bg-surface-card border-border text-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_TYPES.map(t => (
                <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-[2fr_3fr] gap-6">
          {/* Left: Live ticket preview */}
          <div>
            <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider mb-2 block">
              Live Preview
            </span>
            <div className="rounded-lg overflow-hidden border border-border shadow-sm">
              {/* Header bar */}
              <div
                className="px-3 py-2 flex items-center justify-between"
                style={{ backgroundColor: colors.headerBg }}
              >
                <span
                  className="text-[13px] font-bold uppercase tracking-wider"
                  style={{ color: colors.headerText }}
                >
                  {selectedInfo.headerLabel}
                </span>
                <div
                  className="flex items-center gap-2 text-[11px]"
                  style={{ color: colors.headerText, opacity: 0.8 }}
                >
                  <span>{selectedInfo.time}</span>
                  <span>{selectedInfo.table}</span>
                </div>
              </div>
              {/* Body */}
              <div className="bg-surface-card px-4 py-3">
                <div
                  className="text-[32px] font-black leading-none mb-1"
                  style={{ color: colors.ticketNumber }}
                >
                  #{selectedInfo.orderNum}
                </div>
                <div
                  className="flex items-center gap-1.5 text-[13px] justify-end"
                  style={{ color: colors.bodyText }}
                >
                  <img src={PersonSimpleRunBold} alt="" width={14} height={14} className="opacity-60" />
                  <span>{selectedInfo.server}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Color settings */}
          <div>
            <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider mb-2 block">
              Color Settings
            </span>
            <div className="flex flex-col gap-3">
              {COLOR_FIELDS.map(({ key, label }) => (
                <div
                  key={key}
                  className="bg-surface-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                >
                  <span className="text-[14px] font-semibold text-text-primary">{label}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[12px] text-text-muted font-mono uppercase">
                      {colors[key]}
                    </span>
                    <label className="relative cursor-pointer shrink-0">
                      <input
                        type="color"
                        value={colors[key]}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <span
                        className="block w-9 h-9 rounded-full border-2 border-border"
                        style={{ backgroundColor: colors[key] }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-primary text-[13px] font-bold min-h-[44px] hover:bg-muted/80 transition-colors mt-6"
        >
          <RotateCcw size={14} />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
