import { useState } from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, Monitor, ShoppingBag, Cpu, User, Minus, Plus, ChevronRight, Wifi, BadgeCheck, Layers, RefreshCw, Printer } from 'lucide-react';
import { toast } from 'sonner';

type Section = 'display' | 'orders' | 'hardware' | 'account';

interface SettingsPanelProps {
  onClose: () => void;
  onOpenSub: (sub: string) => void;
  onLogOut?: () => void;
}

const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'display', label: 'Display', icon: Monitor },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'hardware', label: 'Hardware', icon: Cpu },
  { id: 'account', label: 'Account', icon: User },
];

function SettingsCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-card border border-border rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function CardLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div className="mb-3">
      <div className="text-[15px] font-bold text-text-primary">{label}</div>
      {description && <div className="text-[13px] text-text-muted mt-0.5">{description}</div>}
    </div>
  );
}

function PillToggle({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-colors min-h-[44px] ${
            value === opt
              ? 'bg-brand-dark text-primary-foreground'
              : 'bg-muted text-text-secondary'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function LargeToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-[68px] h-[36px] rounded-full transition-colors min-w-[68px] ${checked ? 'bg-brand-primary' : 'bg-border'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`absolute top-1 left-1 w-7 h-7 bg-surface-card rounded-full transition-transform shadow-sm ${checked ? 'translate-x-8' : ''}`} />
    </button>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-4 py-2.5 rounded-lg bg-muted text-text-primary text-[13px] font-bold min-h-[44px] hover:bg-muted/80 transition-colors"
    >
      {label} <ChevronRight size={14} />
    </button>
  );
}

export function SettingsPanel({ onClose, onOpenSub, onLogOut }: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<Section>('display');
  const [cardsPerRow, setCardsPerRow] = useState(4);
  const [textSize, setTextSize] = useState('Standard');
  const [showAllergens, setShowAllergens] = useState(true);
  const [staggerMode, setStaggerMode] = useState(false);
  const [servableModifiers, setServableModifiers] = useState(true);
  const [sortDefault, setSortDefault] = useState('By Time');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [enableBadge, setEnableBadge] = useState(true);
  const [kdsMode, setKdsMode] = useState('Standard');
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success('Sync complete');
    }, 1500);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left column - section tabs */}
      <div className="w-[280px] bg-surface-card border-r border-border flex flex-col shrink-0">
        <div className="px-5 py-4">
          <h2 className="text-lg font-bold text-text-primary">Settings</h2>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-3 px-4 py-4 rounded-lg text-left transition-colors min-h-[56px] ${
                activeSection === id
                  ? 'bg-muted border-l-[3px] border-status-new text-text-primary font-bold'
                  : 'text-text-secondary hover:bg-muted/50'
              }`}
            >
              <Icon size={20} />
              <span className="text-[15px]">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right column - content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Close button header */}
        <div className="flex items-center justify-end px-5 py-3 shrink-0">
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close settings"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Section content */}
        <div className="flex-1 px-6 pb-6 overflow-hidden">
          {activeSection === 'display' && (
            <div className="grid grid-cols-2 gap-4">
              <SettingsCard>
                <CardLabel label="Cards Per Row" />
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => setCardsPerRow(Math.max(2, cardsPerRow - 1))}
                    disabled={cardsPerRow <= 2}
                    className="w-[44px] h-[44px] rounded-lg bg-muted flex items-center justify-center disabled:opacity-30 text-text-primary font-bold"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-[48px] font-black text-text-primary leading-none min-w-[60px] text-center">
                    {cardsPerRow}
                  </span>
                  <button
                    onClick={() => setCardsPerRow(Math.min(8, cardsPerRow + 1))}
                    disabled={cardsPerRow >= 8}
                    className="w-[44px] h-[44px] rounded-lg bg-muted flex items-center justify-center disabled:opacity-30 text-text-primary font-bold"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Text Size" />
                <PillToggle options={['Compact', 'Standard', 'Large']} value={textSize} onChange={setTextSize} />
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Status Colours" description="Customise order status colours" />
                <ActionButton label="Customise" onClick={() => onOpenSub('status-settings')} />
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Show Allergen Badges" />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[13px] text-text-secondary font-medium">{showAllergens ? 'ON' : 'OFF'}</span>
                  <LargeToggle checked={showAllergens} onChange={setShowAllergens} />
                </div>
              </SettingsCard>
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="grid grid-cols-2 gap-4">
              <SettingsCard>
                <CardLabel label="Category Filter" description="Manage active categories" />
                <ActionButton label="Manage" onClick={() => onOpenSub('category-filter')} />
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Revenue Center Filter" description="Manage station filters" />
                <ActionButton label="Manage" onClick={() => onOpenSub('revenue-filter')} />
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Stagger Mode" />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[13px] text-text-secondary font-medium">{staggerMode ? 'ON' : 'OFF'}</span>
                  <LargeToggle checked={staggerMode} onChange={setStaggerMode} />
                </div>
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Servable Modifiers" />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[13px] text-text-secondary font-medium">{servableModifiers ? 'ON' : 'OFF'}</span>
                  <LargeToggle checked={servableModifiers} onChange={setServableModifiers} />
                </div>
              </SettingsCard>

              <SettingsCard className="col-span-2">
                <CardLabel label="Sort Default" />
                <PillToggle options={['By Time', 'By Table', 'By Type']} value={sortDefault} onChange={setSortDefault} />
              </SettingsCard>
            </div>
          )}

          {activeSection === 'hardware' && (
            <div className="grid grid-cols-2 gap-4">
              <SettingsCard>
                <CardLabel label="Main Printing Device" description="Kitchen Epson TM-T88" />
                <ActionButton label="Change" onClick={() => onOpenSub('printer-settings')} />
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Sound Settings" description="Volume and alert sounds" />
                <ActionButton label="Configure" onClick={() => onOpenSub('sound-settings')} />
              </SettingsCard>

              <SettingsCard className="col-span-2">
                <CardLabel label="Connection" description="WebSocket and sync settings" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi size={14} className="text-status-done" />
                    <span className="text-[13px] text-status-done font-medium">Connected</span>
                  </div>
                  <ActionButton label="Configure" onClick={() => onOpenSub('websocket-settings')} />
                </div>
              </SettingsCard>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="grid grid-cols-2 gap-4">
              <SettingsCard>
                <CardLabel label="Device Name" />
                <div className="text-[15px] text-text-primary font-medium">Kitchen Display 1</div>
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Language" description="English (US)" />
                <ActionButton label="Change" onClick={() => onOpenSub('language-settings')} />
              </SettingsCard>

              <SettingsCard className="col-span-2">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-3 text-status-new text-[14px] font-bold border-2 border-status-new rounded-lg hover:bg-status-new/10 transition-colors min-h-[52px]"
                >
                  LOG OUT
                </button>
              </SettingsCard>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="bg-surface-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary">Log Out?</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              You will be returned to the sign-in screen. Any unsaved settings will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { onClose(); onLogOut?.(); }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
