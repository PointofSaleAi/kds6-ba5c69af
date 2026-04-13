import { useState, useEffect } from 'react';
import InlineLanguageSettings from '@/components/kds/InlineLanguageSettings';
import OrderTypeColorsSettings from '@/pages/OrderTypeColorsSettings';
import StatusSettings from '@/pages/StatusSettings';
import { useKDSMode } from '@/hooks/use-kds-mode';
import { useBadgeVisibility } from '@/hooks/use-badge-visibility';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import type { KDSMode, StationCourse } from '@/hooks/use-kds-mode';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, Monitor, ShoppingBag, Cpu, User, Minus, Plus, ChevronRight, ChevronLeft, Wifi, BadgeCheck, Layers, RefreshCw, Printer, Bug, Globe } from 'lucide-react';
import { toast } from 'sonner';

type Section = 'display' | 'orders' | 'hardware' | 'account' | 'language' | 'order-type-colors' | 'status-settings';

interface SettingsPanelProps {
  onClose: () => void;
  onOpenSub: (sub: string) => void;
  onLogOut?: () => void;
  onDevModeChange?: (enabled: boolean) => void;
  initialSection?: Section;
}

const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'display', label: 'Display', icon: Monitor },
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

export function SettingsPanel({ onClose, onOpenSub, onLogOut, onDevModeChange, initialSection = 'display' }: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  useEffect(() => { setActiveSection(initialSection); }, [initialSection]);
  const {
    cardsPerRow, setCardsPerRow,
    textSize, setTextSize,
    showAllergens, setShowAllergens,
    staggerMode, setStaggerMode,
    servableModifiers, setServableModifiers,
    sortDefault, setSortDefault,
    ticketHeaderLayout, setTicketHeaderLayout,
  } = useKDSSettings();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { showBadge: enableBadge, setShowBadge: setEnableBadge } = useBadgeVisibility();
  const { mode: kdsMode, setMode: setKdsMode, stationCourse, setStationCourse } = useKDSMode();
  const [syncing, setSyncing] = useState(false);
  const [bugReporting, setBugReporting] = useState(false);
  const [devMode, setDevMode] = useState(() => localStorage.getItem('posai-dev-mode') === 'true');
  const [uploadingLogs, setUploadingLogs] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [featureText, setFeatureText] = useState('');

  const handleFeatureSubmit = () => {
    // TODO: send to backend API
    console.info('[FeatureRequest]', { text: featureText, stationId: 'STN-001', version: '5.0.84' });
    setFeatureModalOpen(false);
    setFeatureText('');
    toast.success('Thank you for your feedback!');
  };

  const handleUploadLogs = () => {
    setUploadingLogs(true);
    const logs = {
      timestamp: new Date().toISOString(),
      device: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
        online: navigator.onLine,
      },
      app: {
        version: '5.0.84',
        kdsMode,
        textSize,
        showAllergens,
        servableModifiers,
        ticketHeaderLayout,
        debugMode: devMode,
        bugReporting,
      },
      performance: {
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        } : null,
        uptime: Math.round(performance.now() / 1000),
      },
    };
    console.info('[LogUpload] Collected device logs:', JSON.stringify(logs, null, 2));
    setTimeout(() => {
      setUploadingLogs(false);
      toast.success('Logs uploaded successfully', {
        description: `${Object.keys(logs).length} sections collected at ${new Date().toLocaleTimeString()}`,
      });
    }, 2000);
  };

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
      <div className="w-[200px] bg-surface-card border-r border-border flex flex-col shrink-0">
        <div className="px-5 py-4">
          <h2 className="text-lg font-bold text-text-primary">Settings</h2>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-3 px-3 py-4 rounded-lg text-left transition-colors min-h-[56px] ${
                activeSection === id
                  ? 'bg-status-new/10 border-l-[3px] border-status-new text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-muted/50 font-normal'
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          {/* Language tabs in header when language section is active */}
          {activeSection === 'language' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSection('display')}
                className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Back to Display"
              >
                <ChevronLeft size={20} className="text-text-secondary" />
              </button>
              <h2 className="text-lg font-bold text-text-primary">Language</h2>
            </div>
          ) : activeSection === 'order-type-colors' || activeSection === 'status-settings' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSection('display')}
                className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Back"
              >
                <ChevronLeft size={20} className="text-text-secondary" />
              </button>
              <h2 className="text-lg font-bold text-text-primary">
                {activeSection === 'order-type-colors' ? 'Order Type Colors' : 'Ticket Aging Rules'}
              </h2>
            </div>
          ) : (
            <div />
          )}
        </div>
        {(activeSection === 'language' || activeSection === 'order-type-colors' || activeSection === 'status-settings') && <div className="mx-5 h-px bg-border mb-4" />}

        {/* Section content */}
        <div className={`flex-1 overflow-hidden ${activeSection === 'status-settings' ? 'flex flex-col' : 'px-6 pb-6 overflow-y-auto'}`}>
          {activeSection === 'display' && (
            <div className="grid grid-cols-2 gap-4">
              <SettingsCard>
                <CardLabel label="Language" description="Set your display language preferences." />
                <ActionButton label="Configure" onClick={() => setActiveSection('language')} />
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Text Size" />
                <PillToggle options={['Compact', 'Standard', 'Large']} value={textSize} onChange={setTextSize} />
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Status Colours" description="Customise order status colours" />
                <ActionButton label="Customise" onClick={() => setActiveSection('status-settings')} />
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Order Type Colors" description="Customise order type header colors" />
                <ActionButton label="Customise" onClick={() => setActiveSection('order-type-colors')} />
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Show Allergen Badges" />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[13px] text-text-secondary font-medium">{showAllergens ? 'ON' : 'OFF'}</span>
                  <LargeToggle checked={showAllergens} onChange={setShowAllergens} />
                </div>
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Enable Badge" description="Show notification badges on sidebar icons" />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[13px] text-text-secondary font-medium">{enableBadge ? 'ON' : 'OFF'}</span>
                  <LargeToggle checked={enableBadge} onChange={setEnableBadge} />
                </div>
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Mode Switcher" description="Switch between Kitchen Display System operational modes" />
                <PillToggle options={['Standard', 'Expo', 'Prep']} value={kdsMode} onChange={(v) => setKdsMode(v as KDSMode)} />
                <div className="mt-3 px-3 py-2 bg-muted rounded-lg text-[12px] text-text-secondary leading-relaxed">
                  {kdsMode === 'Standard' && 'Full order cards with course sections, item-level tracking, and detailed modifiers. Best for line cooks.'}
                  {kdsMode === 'Expo' && 'Consolidated view across all stations. Best for the expediter managing the pass.'}
                  {kdsMode === 'Prep' && 'Aggregated item board grouped by course type with quantities. Best for prep stations batching work.'}
                </div>
                {kdsMode === 'Prep' && (
                  <div className="mt-3">
                    <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider mb-2 block">Station</span>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { value: 'ENTREE' as StationCourse, label: 'Entree' },
                        { value: 'APPETIZER' as StationCourse, label: 'Appetizer' },
                        { value: 'DESSERT' as StationCourse, label: 'Dessert' },
                        { value: 'SIDES' as StationCourse, label: 'Sides' },
                      ]).map((station) => (
                        <button
                          key={station.value}
                          onClick={() => setStationCourse(stationCourse === station.value ? null : station.value)}
                          className={`px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors min-h-[44px] border ${
                            stationCourse === station.value
                              ? 'bg-brand-dark text-primary-foreground border-brand-dark'
                              : 'bg-surface-card text-text-secondary border-border hover:border-text-muted'
                          }`}
                        >
                          {station.label}
                        </button>
                      ))}
                    </div>
                    {stationCourse && (
                      <div className="mt-2 px-3 py-1.5 bg-muted rounded text-[11px] text-text-muted">
                        Showing station view for {stationCourse.charAt(0) + stationCourse.slice(1).toLowerCase()} station
                      </div>
                    )}
                  </div>
                )}
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Ticket Identifier" />
                <PillToggle
                  options={['Order Number', 'Guest Name/Number']}
                  value={ticketHeaderLayout === 'guest' ? 'Guest Name/Number' : 'Order Number'}
                  onChange={(v) => setTicketHeaderLayout(v === 'Guest Name/Number' ? 'guest' : 'kitchen')}
                />
                <div className="mt-3 px-3 py-2 bg-muted rounded-lg text-[12px] text-text-secondary leading-relaxed">
                  {ticketHeaderLayout === 'kitchen'
                    ? 'Order number shown as primary identifier. Best for kitchen and prep stations.'
                    : 'Guest name or number shown as primary identifier. Best for expediters and runners.'}
                </div>
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Servable Modifiers" />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[13px] text-text-secondary font-medium">{servableModifiers ? 'ON' : 'OFF'}</span>
                  <LargeToggle checked={servableModifiers} onChange={setServableModifiers} />
                </div>
              </SettingsCard>

            </div>
          )}


          {activeSection === 'hardware' && (
            <div className="grid grid-cols-2 gap-4">
              <SettingsCard>
                <CardLabel label="Printer Routing" description="Select where this KDS will send print jobs." />
                <ActionButton label="Configure" onClick={() => onOpenSub('printer-routing')} />
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Sound Settings" description="Volume and alert sounds" />
                <ActionButton label="Configure" onClick={() => onOpenSub('sound-settings')} />
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Sync" description="Manually sync orders and settings" />
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-primary text-[13px] font-bold min-h-[44px] hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </SettingsCard>

              <SettingsCard className="col-span-2">
                <CardLabel label="Connection" description="EdgeOS and sync settings" />
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
                <CardLabel label="Station ID" />
                <div className="text-[15px] text-text-primary font-medium">STN-001</div>
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Bug Reporting" description="Enable in-app bug reporting tool" />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[13px] text-text-secondary font-medium">{bugReporting ? 'ON' : 'OFF'}</span>
                  <LargeToggle checked={bugReporting} onChange={setBugReporting} />
                </div>
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Debug Mode" description="Enable verbose logging for troubleshooting" />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[13px] text-text-secondary font-medium">{devMode ? 'ON' : 'OFF'}</span>
                  <LargeToggle checked={devMode} onChange={(v) => { setDevMode(v); localStorage.setItem('posai-dev-mode', String(v)); onDevModeChange?.(v); }} />
                </div>
              </SettingsCard>

              <SettingsCard>
                <CardLabel label="Upload Logs" description="Send device logs to the eatOS support team" />
                <button
                  onClick={handleUploadLogs}
                  disabled={uploadingLogs}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted text-text-primary text-[13px] font-bold min-h-[44px] hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} className={uploadingLogs ? 'animate-spin' : ''} />
                  {uploadingLogs ? 'Uploading...' : 'Upload Logs'}
                </button>
              </SettingsCard>

              <SettingsCard className="col-span-2">
                <CardLabel label="Feedback & Support" description="Request a feature or share feedback" />
                <ActionButton label="Request a Feature" onClick={() => setFeatureModalOpen(true)} />
              </SettingsCard>


              <SettingsCard className="col-span-2">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-3 text-status-new text-[14px] font-bold border-2 border-status-new rounded-lg hover:bg-status-new/10 transition-colors min-h-[52px]"
                >
                  LOG OUT
                </button>
              </SettingsCard>

              <div className="col-span-2 mt-2">
                <span className="text-[12px] font-normal text-text-muted">
                  Version <span className="font-mono">5.0.84</span>
                  {'    '}FL <span className="font-mono">3.35.7</span>
                  {'    '}BD <span className="font-mono">25.03.26</span>
                </span>
              </div>
            </div>
          )}

          {activeSection === 'language' && (
            <InlineLanguageSettings activeTab="language" />
          )}

          {activeSection === 'order-type-colors' && (
            <OrderTypeColorsSettings onBack={() => setActiveSection('display')} />
          )}

          {activeSection === 'status-settings' && (
            <StatusSettings onBack={() => setActiveSection('display')} />
          )}
        </div>
      </div>



      {/* Feature Request Modal */}
      {featureModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFeatureModalOpen(false)} />
          <div className="relative bg-surface-card rounded-xl shadow-xl w-[480px] max-w-[90vw] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-[15px] font-bold text-text-primary">Request a Feature</h3>
              <button onClick={() => setFeatureModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px]">
                <X size={18} className="text-text-muted" />
              </button>
            </div>
            <div className="px-5 py-4">
              <textarea
                value={featureText}
                onChange={(e) => setFeatureText(e.target.value)}
                placeholder="What would you like to see in the KDS?"
                rows={5}
                className="w-full bg-muted rounded-lg px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted outline-none resize-none min-h-[120px]"
              />
            </div>
            <div className="px-5 pb-4">
              <button
                onClick={handleFeatureSubmit}
                disabled={!featureText.trim()}
                className="w-full py-3 rounded-lg text-[13px] font-bold uppercase tracking-wider bg-brand-dark text-primary-foreground hover:bg-brand-dark/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px]"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

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
