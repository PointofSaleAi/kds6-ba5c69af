import { useState, useEffect, useMemo } from 'react';
import InlineLanguageSettings from '@/components/kds/InlineLanguageSettings';
import OrderTypeColorsSettings from '@/pages/OrderTypeColorsSettings';
import StatusSettings from '@/pages/StatusSettings';
import { useKDSMode } from '@/hooks/use-kds-mode';
import { useBadgeVisibility } from '@/hooks/use-badge-visibility';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { usePrinterAssignments } from '@/hooks/use-printer-assignments';
import type { KDSMode } from '@/hooks/use-kds-mode';
import type { Order } from '@/types/kds';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, Monitor, ShoppingBag, Cpu, User, Minus, Plus, ChevronRight, ChevronLeft, Wifi, BadgeCheck, Layers, RefreshCw, Printer, Tag, Bug, Globe, Pencil, Upload } from 'lucide-react';
import { toast } from 'sonner';

type Section = 'display' | 'orders' | 'hardware' | 'account' | 'language' | 'order-type-colors' | 'status-settings';

interface SettingsPanelProps {
  onClose: () => void;
  onOpenSub: (sub: string) => void;
  onLogOut?: () => void;
  onDevModeChange?: (enabled: boolean) => void;
  initialSection?: Section;
  onNavigateHome?: () => void;
  orders?: Order[];
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

function PrinterStatusDot({ status }: { status: 'online' | 'offline' | 'low-paper' }) {
  const colors = { online: 'bg-status-done', offline: 'bg-destructive', 'low-paper': 'bg-amber-500' };
  const labels = { online: 'Online', offline: 'Offline', 'low-paper': 'Low Paper' };
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
      <span className="text-[12px] text-text-muted">{labels[status]}</span>
    </span>
  );
}

function KotPrinterCard({ onOpenSub }: { onOpenSub: (sub: string) => void }) {
  const { kot } = usePrinterAssignments();
  return (
    <SettingsCard>
      <CardLabel label="KOT Printer" description="Prints the full order ticket for this station" />
      {kot.printerId ? (
        <div className="flex items-center gap-2 mb-3">
          <Printer size={14} className="text-text-muted" />
          <span className="text-[13px] font-semibold text-text-primary">{kot.printerName}</span>
          <PrinterStatusDot status={kot.status} />
        </div>
      ) : (
        <div className="text-[13px] text-text-muted mb-3">No printer assigned</div>
      )}
      <ActionButton label="Configure" onClick={() => onOpenSub('printer-kot')} />
    </SettingsCard>
  );
}

function LabelPrinterCard({ onOpenSub }: { onOpenSub: (sub: string) => void }) {
  const { label } = usePrinterAssignments();
  return (
    <SettingsCard>
      <CardLabel label="Label Printer" description="Prints item stickers when an order is completed" />
      {label.printerId ? (
        <div className="flex items-center gap-2 mb-3">
          <Tag size={14} className="text-text-muted" />
          <span className="text-[13px] font-semibold text-text-primary">{label.printerName}</span>
          <PrinterStatusDot status={label.status} />
        </div>
      ) : (
        <div className="text-[13px] text-text-muted mb-3">No printer assigned</div>
      )}
      <ActionButton label="Configure" onClick={() => onOpenSub('printer-label')} />
    </SettingsCard>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-4 py-2.5 rounded-lg bg-muted text-text-primary text-[13px] font-bold min-h-[44px] hover:bg-muted/80 transition-colors"
    >
      {label}
    </button>
  );
}

// Compact row used inside the new row-based grid layout
function RowCell({ name, subtitle, control }: { name: string; subtitle?: string; control?: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-3 bg-surface-card"
      style={{ padding: '9px 12px' }}
    >
      <div className="min-w-0 flex-1">
        <div style={{ fontSize: '11px', fontWeight: 500, color: 'hsl(var(--text-primary))' }} className="truncate">{name}</div>
        {subtitle && (
          <div style={{ fontSize: '10px', color: '#999', marginTop: '1px' }} className="truncate">{subtitle}</div>
        )}
      </div>
      {control && <div className="shrink-0">{control}</div>}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: '#999',
        marginBottom: '7px',
      }}
    >
      {children}
    </div>
  );
}

function RowGrid({ children, itemCount }: { children: React.ReactNode; itemCount: number }) {
  // Determine empty cells needed to fill the grid based on viewport (3 cols >=1024, 2 cols <1024)
  // We render padding cells for both layouts; CSS hides extras. Simplest: compute for both via a small helper rendered as filler.
  return (
    <div
      className="settings-row-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px',
        backgroundColor: '#e0e0e0',
        border: '0.5px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {children}
      {/* Filler cells: top up to a multiple of 6 so both 2-col and 3-col grids are flush. */}
      {Array.from({ length: (6 - (itemCount % 6)) % 6 }).map((_, i) => (
        <div key={`f-${i}`} style={{ background: '#fafafa' }} />
      ))}
    </div>
  );
}

function SmallToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-brand-primary' : 'bg-border'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-surface-card rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function ChipGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{ fontSize: '10px', padding: '4px 8px' }}
          className={`rounded-full font-semibold transition-colors ${
            value === opt ? 'bg-brand-dark text-primary-foreground' : 'bg-muted text-text-secondary'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function RowButton({ label, onClick, disabled, icon }: { label: string; onClick: () => void; disabled?: boolean; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ fontSize: '10px', padding: '4px 10px' }}
      className="rounded-md bg-muted text-text-primary font-semibold flex items-center gap-1 hover:bg-muted/80 transition-colors disabled:opacity-50"
    >
      {icon}
      {label}
    </button>
  );
}

// Icon-only button components for settings rows
function EditIconButton({ onClick, title }: { onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center cursor-pointer flex-shrink-0"
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: '#F0FFF4',
        border: '0.5px solid #C0DD97',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Pencil size={16} strokeWidth={2} color="#3B6D11" />
    </button>
  );
}

function ChevronIconButton({ onClick, title }: { onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center cursor-pointer flex-shrink-0"
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: '#F5F5F5',
        border: '0.5px solid #E0E0E0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ChevronRight size={16} strokeWidth={2} color="#888888" />
    </button>
  );
}

function ActionIconButton({ onClick, title, icon: Icon, spinning }: { onClick: () => void; title?: string; icon: React.ElementType; spinning?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center cursor-pointer flex-shrink-0"
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: '#EBF5FF',
        border: '0.5px solid #B5D4F4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={16} strokeWidth={2} color="#185FA5" className={spinning ? 'animate-spin' : ''} />
    </button>
  );
}

export function SettingsPanel({ onClose, onOpenSub, onLogOut, onDevModeChange, initialSection = 'display', onNavigateHome, orders = [] }: SettingsPanelProps) {
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
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const order of orders) {
      if (order.status === 'served') continue;
      for (const cg of order.courses) {
        for (const item of cg.items) {
          if (item.category && !item.isCompleted && !item.isCancelled) cats.add(item.category);
        }
      }
    }
    return Array.from(cats).sort();
  }, [orders]);
  const [syncing, setSyncing] = useState(false);
  const [bugReporting, setBugReporting] = useState(false);
  const [devMode, setDevMode] = useState(() => localStorage.getItem('posai-dev-mode') === 'true');
  const [uploadingLogs, setUploadingLogs] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [featureText, setFeatureText] = useState('');
  const [featureCategory, setFeatureCategory] = useState('');

  const handleFeatureSubmit = () => {
    // TODO: send to backend API
    console.info('[FeatureRequest]', { text: featureText, category: featureCategory, stationId: 'STN-001', device: 'Kitchen Display 1', version: '5.0.84' });
    setFeatureModalOpen(false);
    setFeatureText('');
    setFeatureCategory('');
    toast.success('Thank you for your feedback! Our product team will review it.');
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

  // Sub-screen routing (Language / Order Type Colors / Status Settings)
  const inSubScreen = activeSection === 'language' || activeSection === 'order-type-colors' || activeSection === 'status-settings';

  // Display section rows
  const displayRows = [
    { name: 'Language', subtitle: 'Display language', control: <EditIconButton onClick={() => setActiveSection('language')} title="Configure Language" /> },
    { name: 'Text Size', subtitle: 'Font scale', control: <ChipGroup options={['Compact', 'Standard', 'Large']} value={textSize} onChange={setTextSize} /> },
    { name: 'Status Colours', subtitle: 'Ticket aging colours', control: <EditIconButton onClick={() => setActiveSection('status-settings')} title="Customise Status Colours" /> },
    { name: 'Order Type Colors', subtitle: 'Header colours', control: <EditIconButton onClick={() => setActiveSection('order-type-colors')} title="Customise Order Type Colors" /> },
    { name: 'Allergen Badges', subtitle: 'Show on tickets', control: <SmallToggle checked={showAllergens} onChange={setShowAllergens} /> },
    { name: 'Enable Badge', subtitle: 'Sidebar icon count', control: <SmallToggle checked={enableBadge} onChange={setEnableBadge} /> },
    { name: 'Ticket Identifier', subtitle: 'Primary card label', control: <ChipGroup options={['Order Number', 'Guest Name']} value={ticketHeaderLayout === 'guest' ? 'Guest Name' : 'Order Number'} onChange={(v) => setTicketHeaderLayout(v === 'Guest Name' ? 'guest' : 'kitchen')} /> },
    { name: 'Servable Modifiers', subtitle: 'Track modifier status', control: <SmallToggle checked={servableModifiers} onChange={setServableModifiers} /> },
    { name: 'Mode Switcher', subtitle: 'KDS operational mode', control: <ChipGroup options={['Standard', 'Expo', 'Station']} value={kdsMode === 'Prep' ? 'Station' : kdsMode} onChange={(v) => setKdsMode((v === 'Station' ? 'Prep' : v) as KDSMode)} /> },
  ];

  const hardwareRows = [
    { name: 'KOT Printer', subtitle: 'No printer assigned', control: <RowButton label="Configure →" onClick={() => onOpenSub('printer-kot')} /> },
    { name: 'Label Printer', subtitle: 'No printer assigned', control: <RowButton label="Configure →" onClick={() => onOpenSub('printer-label')} /> },
    { name: 'Sound Settings', subtitle: 'Volume & alerts', control: <RowButton label="Configure →" onClick={() => onOpenSub('sound-settings')} /> },
    { name: 'Sync', subtitle: 'Orders & settings', control: <RowButton label={syncing ? 'Syncing…' : 'Sync Now'} onClick={handleSync} disabled={syncing} icon={<RefreshCw size={11} className={syncing ? 'animate-spin' : ''} />} /> },
    { name: 'Connection', subtitle: 'EdgeOS · Connected', control: <RowButton label="Configure →" onClick={() => onOpenSub('websocket-settings')} /> },
  ];

  const accountRows = [
    { name: 'Device Name', subtitle: 'Kitchen Display 1', control: null },
    { name: 'Station ID', subtitle: 'STN-001', control: null },
    { name: 'Bug Reporting', subtitle: 'In-app reporting tool', control: <SmallToggle checked={bugReporting} onChange={setBugReporting} /> },
    { name: 'Debug Mode', subtitle: 'Verbose logging', control: <SmallToggle checked={devMode} onChange={(v) => { setDevMode(v); localStorage.setItem('posai-dev-mode', String(v)); onDevModeChange?.(v); }} /> },
    { name: 'Upload Logs', subtitle: 'Send to eatOS support', control: <RowButton label={uploadingLogs ? 'Uploading…' : '↑ Upload'} onClick={handleUploadLogs} disabled={uploadingLogs} /> },
    { name: 'Feedback & Support', subtitle: 'Request a feature', control: <RowButton label="Request →" onClick={() => setFeatureModalOpen(true)} /> },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {inSubScreen && (
          <>
            <div className="flex items-center justify-between px-5 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSection('display')}
                  className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Back"
                >
                  <ChevronLeft size={20} className="text-text-secondary" />
                </button>
                <h2 className="text-lg font-bold text-text-primary">
                  {activeSection === 'language' ? 'Language' : activeSection === 'order-type-colors' ? 'Order Type Colors' : 'Ticket Aging Rules'}
                </h2>
              </div>
            </div>
            <div className="mx-5 h-px bg-border mb-4" />
          </>
        )}

        <div className={`flex-1 overflow-hidden ${activeSection === 'status-settings' ? 'flex flex-col' : 'overflow-y-auto'}`}>
          {!inSubScreen && (
            <div className="px-6 py-5 max-w-[1200px] mx-auto w-full">
              <h2 className="text-lg font-bold text-text-primary mb-4">Settings</h2>

              <SectionHeading>Display</SectionHeading>
              <RowGrid itemCount={displayRows.length}>
                {displayRows.map((r) => <RowCell key={r.name} name={r.name} subtitle={r.subtitle} control={r.control} />)}
              </RowGrid>

              <div style={{ marginTop: '18px' }}>
                <SectionHeading>Hardware</SectionHeading>
                <RowGrid itemCount={hardwareRows.length}>
                  {hardwareRows.map((r) => <RowCell key={r.name} name={r.name} subtitle={r.subtitle} control={r.control} />)}
                </RowGrid>
              </div>

              <div style={{ marginTop: '18px' }}>
                <SectionHeading>Account</SectionHeading>
                <RowGrid itemCount={accountRows.length}>
                  {accountRows.map((r) => <RowCell key={r.name} name={r.name} subtitle={r.subtitle} control={r.control} />)}
                </RowGrid>
              </div>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                style={{
                  background: '#fff5f5',
                  border: '0.5px solid #fccaca',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  textAlign: 'center',
                  color: '#c0392b',
                  fontSize: '12px',
                  fontWeight: 500,
                  width: '100%',
                  marginTop: '18px',
                }}
              >
                Log Out
              </button>

              <div style={{ fontSize: '10px', color: '#ccc', textAlign: 'center', marginTop: '10px' }}>
                Version 5.0.84 FL 3.35.7 BD 25.03.26
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
            <div className="px-5 pt-4 pb-2">
              <p className="text-[12px] font-semibold text-text-secondary mb-2 uppercase tracking-wider">Category</p>
              <div className="flex flex-wrap gap-2">
                {['Display & Layout', 'Order Management', 'Coursing', 'Other'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFeatureCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors min-h-[36px] ${
                      featureCategory === cat
                        ? 'bg-brand-dark text-primary-foreground'
                        : 'bg-muted text-text-secondary hover:bg-muted/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 py-3">
              <textarea
                value={featureText}
                onChange={(e) => { if (e.target.value.length <= 150) setFeatureText(e.target.value); }}
                maxLength={150}
                placeholder="What would you like to see in the KDS?"
                rows={5}
                className="w-full bg-muted rounded-lg px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted outline-none resize-none min-h-[120px]"
              />
              <p className="text-right text-[11px] text-text-muted mt-1">{featureText.length}/150</p>
            </div>
            <div className="px-5 pb-3">
              <div className="bg-muted/60 rounded-lg px-3 py-2.5 flex gap-4 text-[11px] text-text-muted">
                <span>Station ID: STN-001</span>
                <span>Device: Kitchen Display 1</span>
                <span>Version: 5.0.84</span>
              </div>
            </div>
            <div className="px-5 pb-4">
              <button
                onClick={handleFeatureSubmit}
                disabled={!featureText.trim() || !featureCategory}
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
