import { useState } from 'react';
import { X, ChevronRight, Monitor, ShoppingBag, Cpu, User, Globe, Volume2, Printer, Palette, Server, Clock, Minus, Plus, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';

interface SettingsScreenProps {
  open: boolean;
  onClose: () => void;
  onOpenSub: (sub: string) => void;
}

interface SettingsRowProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}

function SettingsRow({ icon: Icon, label, description, right, onClick }: SettingsRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left min-h-[52px]"
    >
      <Icon size={20} className="text-text-muted shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-item-name text-text-primary">{label}</div>
        {description && <div className="text-modifier text-text-muted truncate">{description}</div>}
      </div>
      {right || <ChevronRight size={16} className="text-text-muted shrink-0" />}
    </button>
  );
}

function SegmentedToggle({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex bg-muted rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={(e) => { e.stopPropagation(); onChange(opt); }}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[32px] ${
            value === opt ? 'bg-brand-primary text-primary-foreground' : 'text-text-secondary'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      className={`relative w-11 h-6 rounded-full transition-colors min-w-[44px] ${checked ? 'bg-brand-primary' : 'bg-border'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-surface-card rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function StepperControl({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded bg-muted flex items-center justify-center disabled:opacity-30 min-h-[32px] min-w-[32px]"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-bold text-text-primary">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded bg-muted flex items-center justify-center disabled:opacity-30 min-h-[32px] min-w-[32px]"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function SettingsScreen({ open, onClose, onOpenSub }: SettingsScreenProps) {
  const { theme, setTheme } = useTheme();
  const [displayMode, setDisplayMode] = useState('List');
  const [textSize, setTextSize] = useState('Standard');
  const [cardsPerRow, setCardsPerRow] = useState(4);
  const [showAllergens, setShowAllergens] = useState(true);
  const [staggerMode, setStaggerMode] = useState(false);
  const [servableModifiers, setServableModifiers] = useState(true);
  const [sortDefault, setSortDefault] = useState('By Time');

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-brand-dark/60 z-50 flex items-end justify-center sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-card rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div />
            <h2 className="text-lg font-bold text-text-primary">Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close settings">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Settings content */}
          <div className="flex-1 overflow-y-auto">
            {/* DISPLAY */}
            <div className="px-4 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <Monitor size={14} className="text-text-muted" />
                <span className="text-section-label uppercase text-text-muted tracking-widest">DISPLAY</span>
              </div>
            </div>
            <SettingsRow icon={Monitor} label="Display Mode" right={<SegmentedToggle options={['List', 'Grid', 'Horizontal']} value={displayMode} onChange={setDisplayMode} />} />
            <SettingsRow icon={Monitor} label="Cards Per Row" right={<StepperControl value={cardsPerRow} onChange={setCardsPerRow} min={2} max={8} />} />
            <SettingsRow icon={Monitor} label="Text Size" right={<SegmentedToggle options={['Compact', 'Standard', 'Large']} value={textSize} onChange={setTextSize} />} />
            <SettingsRow icon={Palette} label="Status Colours" description="Customise order status colours" onClick={() => onOpenSub('status-settings')} />
            <SettingsRow
              icon={theme === 'dark' ? Moon : Sun}
              label="Theme"
              right={
                <SegmentedToggle
                  options={['Light', 'Dark']}
                  value={theme === 'dark' ? 'Dark' : 'Light'}
                  onChange={(v) => setTheme(v === 'Dark' ? 'dark' : 'light')}
                />
              }
            />

            {/* ORDERS */}
            <div className="px-4 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag size={14} className="text-text-muted" />
                <span className="text-section-label uppercase text-text-muted tracking-widest">ORDERS</span>
              </div>
            </div>
            <SettingsRow icon={ShoppingBag} label="Category Filter" description="Manage active categories" onClick={() => onOpenSub('category-filter')} />
            <SettingsRow icon={ShoppingBag} label="Revenue Center Filter" description="Manage station filters" onClick={() => onOpenSub('revenue-filter')} />
            <SettingsRow icon={Clock} label="Stagger Mode" description={staggerMode ? 'Configure release schedule' : undefined} right={<Toggle checked={staggerMode} onChange={setStaggerMode} />} onClick={staggerMode ? () => onOpenSub('stagger-mode') : undefined} />
            <SettingsRow icon={ShoppingBag} label="Servable Modifiers" right={<Toggle checked={servableModifiers} onChange={setServableModifiers} />} />
            <SettingsRow icon={ShoppingBag} label="Show Allergen Badges" right={<Toggle checked={showAllergens} onChange={setShowAllergens} />} />
            <SettingsRow icon={ShoppingBag} label="Sort Default" right={<SegmentedToggle options={['By Time', 'By Table', 'By Type']} value={sortDefault} onChange={setSortDefault} />} />

            {/* HARDWARE */}
            <div className="px-4 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <Cpu size={14} className="text-text-muted" />
                <span className="text-section-label uppercase text-text-muted tracking-widest">HARDWARE</span>
              </div>
            </div>
            <SettingsRow icon={Printer} label="Main Printing Device" description="Kitchen Epson TM-T88" onClick={() => onOpenSub('printer-settings')} />
            <SettingsRow icon={Volume2} label="Sound Settings" description="Volume and alert sounds" onClick={() => onOpenSub('sound-settings')} />
            <SettingsRow icon={Server} label="Connection" description="WebSocket and sync settings" onClick={() => onOpenSub('websocket-settings')} />

            {/* ACCOUNT */}
            <div className="px-4 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-text-muted" />
                <span className="text-section-label uppercase text-text-muted tracking-widest">ACCOUNT</span>
              </div>
            </div>
            <SettingsRow icon={User} label="Device Name" description="Kitchen Display 1" />
            <SettingsRow icon={Globe} label="Language" description="English (US)" onClick={() => onOpenSub('language-settings')} />
            <div className="px-4 py-3">
              <button className="w-full py-2.5 text-destructive text-cta font-bold hover:bg-destructive/10 rounded-lg transition-colors min-h-[44px]">
                LOG OUT
              </button>
            </div>

            <div className="text-center py-3 text-xs text-text-muted">
              eatOS KDS v2.4.1
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
