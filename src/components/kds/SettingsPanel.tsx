import { useState, useEffect, useMemo } from 'react';
import { formatTime } from '@/lib/datetime';
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
import { X, ChevronRight, ChevronLeft, RefreshCw, Pencil, Upload, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/use-language';

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



// Compact row used inside the new row-based grid layout
function RowCell({ name, subtitle, control }: { name: string; subtitle?: string; control?: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-3 bg-surface-card rounded-lg border border-border flex-wrap @container"
      style={{ padding: '18px 22px', minHeight: '76px' }}
    >
      <div className="min-w-0 flex-1" style={{ minWidth: '120px' }}>
        <div style={{ fontSize: '17px', fontWeight: 600, color: 'hsl(var(--text-primary))' }} className="truncate">{name}</div>
        {subtitle && (
          <div style={{ fontSize: '14px', color: '#999', marginTop: '4px' }} className="truncate">{subtitle}</div>
        )}
      </div>
      {control && <div className="shrink-0">{control}</div>}
    </div>
  );
}

// Destructive variant of RowCell used for the Account "Log out" entry.
// Keeps grid alignment with RowCell while applying the destructive palette.
function LogOutRowCell({
  name,
  subtitle,
  onClick,
}: {
  name?: string;
  subtitle?: string;
  onClick: () => void;
}) {
  const { tui } = useLanguage();
  const displayName = name ?? tui('Log out');
  const displaySubtitle = subtitle ?? tui('Sign out of this device');
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-3 bg-surface-card text-left rounded-lg border border-border"
      style={{ padding: '14px 18px', minHeight: '76px', background: '#ffffff' }}
    >
      <div className="min-w-0 flex-1">
        <div style={{ fontSize: '17px', fontWeight: 600, color: '#C0392B' }} className="truncate">{displayName}</div>
        <div style={{ fontSize: '14px', color: '#E8A0A0', marginTop: '4px' }} className="truncate">{displaySubtitle}</div>
      </div>
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          width: '32px',
          height: '32px',
          background: '#FFF5F5',
          border: '0.5px solid #FCCACA',
          borderRadius: '8px',
        }}
      >
        <LogOut size={16} strokeWidth={2} color="#C0392B" />
      </div>
    </button>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: '#999',
        marginBottom: '10px',
      }}
    >
      {children}
    </div>
  );
}

function RowGrid({ children }: { children: React.ReactNode; itemCount?: number }) {
  // Responsive: 2 columns by default, 3 columns at xl (>=1280px) breakpoint.
  // No outer border / grey gap so empty grid area blends with the settings background.
  return (
    <div
      className="settings-row-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2"
    >
      {children}
    </div>
  );
}

function SmallToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-brand-primary' : 'bg-border'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-surface-card rounded-full transition-transform shadow-sm ${checked ? 'translate-x-6' : ''}`} />
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
          style={{ fontSize: '13px', padding: '7px 14px' }}
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
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: '#F5F5F5',
        border: '0.5px solid #E0E0E0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Pencil size={20} strokeWidth={2} color="#888888" />
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
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: '#F5F5F5',
        border: '0.5px solid #E0E0E0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ChevronRight size={20} strokeWidth={2} color="#888888" />
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
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: '#F5F5F5',
        border: '0.5px solid #E0E0E0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={20} strokeWidth={2} color="#888888" className={spinning ? 'animate-spin' : ''} />
    </button>
  );
}

export function SettingsPanel({ onClose, onOpenSub, onLogOut, onDevModeChange, initialSection = 'display', onNavigateHome, orders = [] }: SettingsPanelProps) {
  const { tui } = useLanguage();
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
    ticketLayout, setTicketLayout,
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
    toast.success(tui('Thank you for your feedback! Our product team will review it.'));
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
      toast.success(tui('Logs uploaded successfully'), {
        description: tui('{n} sections collected at {time}', { n: Object.keys(logs).length, time: formatTime(new Date()) }),
      });
    }, 2000);
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success(tui('Sync complete'));
    }, 1500);
  };

  // Sub-screen routing (Language / Order type colors / Status Settings)
  const inSubScreen = activeSection === 'language' || activeSection === 'order-type-colors' || activeSection === 'status-settings';

  // Display section rows
  const displayRows = [
    { name: tui('Language'), subtitle: tui('Display Language'), control: <EditIconButton onClick={() => setActiveSection('language')} title={tui('Configure Language')} /> },
    { name: tui('Text Size'), subtitle: tui('Font Scale'), control: <ChipGroup options={[tui('Compact'), tui('Standard'), tui('Large')]} value={textSize} onChange={setTextSize} /> },
    { name: tui('Ticket Layout'), subtitle: ticketLayout === 'compact' ? tui('Compact, product names only, tap to expand') : tui('Standard, full details visible'), control: <ChipGroup options={[tui('Standard'), tui('Compact')]} value={ticketLayout === 'compact' ? tui('Compact') : tui('Standard')} onChange={(v) => setTicketLayout(v === tui('Compact') ? 'compact' : 'standard')} /> },
    { name: tui('Status Colors'), subtitle: tui('Ticket Aging Colors'), control: <EditIconButton onClick={() => setActiveSection('status-settings')} title={tui('Customise Status Colors')} /> },
    { name: tui('Order Type Colors'), subtitle: tui('Header Colors'), control: <EditIconButton onClick={() => setActiveSection('order-type-colors')} title={tui('Customise Order Type Colors')} /> },
    { name: tui('Allergen Badges'), subtitle: tui('Show on Tickets'), control: <SmallToggle checked={showAllergens} onChange={setShowAllergens} /> },
    { name: tui('Enable Badge'), subtitle: tui('Sidebar Icon Count'), control: <SmallToggle checked={enableBadge} onChange={setEnableBadge} /> },
    { name: tui('Ticket Identifier'), subtitle: tui('Primary Card Label'), control: <ChipGroup options={[tui('Order number'), tui('Guest name')]} value={ticketHeaderLayout === 'guest' ? tui('Guest name') : tui('Order number')} onChange={(v) => setTicketHeaderLayout(v === tui('Guest name') ? 'guest' : 'kitchen')} /> },
    { name: tui('Servable Modifiers'), subtitle: tui('Track Modifier Status'), control: <SmallToggle checked={servableModifiers} onChange={setServableModifiers} /> },
    { name: tui('Mode Switcher'), subtitle: tui('KDS Operational Mode'), control: <ChipGroup options={[tui('Standard'), tui('Expo'), tui('Station')]} value={kdsMode === 'Prep' ? tui('Station') : tui(kdsMode)} onChange={(v) => setKdsMode((v === tui('Station') ? 'Prep' : v) as KDSMode)} /> },
  ];

  const hardwareRows = [
    { name: tui('KOT Printer'), subtitle: tui('No Printer Assigned'), control: <EditIconButton onClick={() => onOpenSub('printer-kot')} title={tui('Configure KOT Printer')} /> },
    { name: tui('Label Printer'), subtitle: tui('No Printer Assigned'), control: <EditIconButton onClick={() => onOpenSub('printer-label')} title={tui('Configure Label Printer')} /> },
    { name: tui('Sound Settings'), subtitle: tui('Volume & Alerts'), control: <EditIconButton onClick={() => onOpenSub('sound-settings')} title={tui('Configure Sound Settings')} /> },
    { name: tui('Sync'), subtitle: tui('Orders & Settings'), control: <ActionIconButton onClick={handleSync} title={tui('Sync Now')} icon={RefreshCw} spinning={syncing} /> },
    { name: tui('Connection'), subtitle: tui('EdgeOS · Connected'), control: <ChevronIconButton onClick={() => onOpenSub('websocket-settings')} title={tui('Configure Connection')} /> },
  ];

  const accountRows = [
    { name: tui('Device Name'), subtitle: 'Kitchen Display 1', control: null },
    { name: tui('Station ID'), subtitle: 'STN-001', control: null },
    { name: tui('Bug Reporting'), subtitle: tui('In-app Reporting Tool'), control: <SmallToggle checked={bugReporting} onChange={setBugReporting} /> },
    { name: tui('Debug Mode'), subtitle: tui('Verbose Logging'), control: <SmallToggle checked={devMode} onChange={(v) => { setDevMode(v); localStorage.setItem('posai-dev-mode', String(v)); onDevModeChange?.(v); }} /> },
    { name: tui('Upload Logs'), subtitle: tui('Send to Eatos Support'), control: <ActionIconButton onClick={handleUploadLogs} title={tui('Upload Logs')} icon={Upload} spinning={uploadingLogs} /> },
    { name: tui('Feedback & Support'), subtitle: tui('Request a Feature'), control: <ChevronIconButton onClick={() => setFeatureModalOpen(true)} title={tui('Request a Feature')} /> },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {inSubScreen && (
          <>
            <div className="flex items-start justify-between px-10 py-5 shrink-0 gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <button
                  onClick={() => setActiveSection('display')}
                  className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                  aria-label={tui('Back')}
                >
                  <ChevronLeft size={20} className="text-text-secondary" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-text-primary leading-tight">
                    {activeSection === 'language' ? tui('Language') : activeSection === 'order-type-colors' ? tui('Order type colors') : tui('Ticket aging rules')}
                  </h2>
                  {activeSection === 'status-settings' && (
                    <p className="text-[12px] text-text-muted mt-1">
                      {tui('Orders change color as they age. Adjust thresholds based on your kitchen speed.')}
                    </p>
                  )}
                </div>
              </div>
              {activeSection === 'status-settings' && (
                <button
                  onClick={() => {
                    const handler = (window as unknown as { __agingResetHandler?: () => void }).__agingResetHandler;
                    handler?.();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-text-primary text-[11px] font-bold uppercase tracking-wider min-h-[36px] hover:bg-muted/80 transition-colors shrink-0"
                  title={tui('Reset all Status Colors and Thresholds to Defaults')}
                >
                  <RefreshCw size={13} />
                  {tui('Reset to Defaults')}
                </button>
              )}
            </div>
            <div className="mx-10 h-px bg-border mb-4" />
          </>
        )}

        <div className={`flex-1 overflow-hidden ${activeSection === 'status-settings' ? 'flex flex-col' : 'overflow-y-auto'}`}>
          {!inSubScreen && (
            <div className="px-10 py-7 w-full">
              <h2 className="text-2xl font-bold text-text-primary mb-6">{tui('Settings')}</h2>

              <SectionHeading>{tui('Display')}</SectionHeading>
              <RowGrid itemCount={displayRows.length}>
                {displayRows.map((r) => <RowCell key={r.name} name={r.name} subtitle={r.subtitle} control={r.control} />)}
              </RowGrid>

              <div style={{ marginTop: '18px' }}>
                <SectionHeading>{tui('Hardware')}</SectionHeading>
                <RowGrid itemCount={hardwareRows.length}>
                  {hardwareRows.map((r) => <RowCell key={r.name} name={r.name} subtitle={r.subtitle} control={r.control} />)}
                </RowGrid>
              </div>

              <div style={{ marginTop: '18px' }}>
                <SectionHeading>{tui('Account')}</SectionHeading>
                <RowGrid itemCount={accountRows.length + 1}>
                  {accountRows.map((r) => <RowCell key={r.name} name={r.name} subtitle={r.subtitle} control={r.control} />)}
                  <LogOutRowCell onClick={() => setShowLogoutConfirm(true)} />
                </RowGrid>
              </div>

              <div style={{ fontSize: '10px', color: '#ccc', textAlign: 'center', marginTop: '10px' }}>
                Version 5.0.84 FL 3.35.7 BD 25.03.26
              </div>
            </div>
          )}

          {activeSection === 'language' && (
            <div className="px-10 pb-7 h-full">
              <InlineLanguageSettings activeTab="language" />
            </div>
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
              <h3 className="text-[15px] font-bold text-text-primary">{tui('Request a Feature')}</h3>
              <button onClick={() => setFeatureModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px]">
                <X size={18} className="text-text-muted" />
              </button>
            </div>
            <div className="px-5 pt-4 pb-2">
              <p className="text-[12px] font-semibold text-text-secondary mb-2 uppercase tracking-wider">{tui('Category')}</p>
              <div className="flex flex-wrap gap-2">
                {['Display & layout', 'Order management', 'Coursing', 'Other'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFeatureCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors min-h-[36px] ${
                      featureCategory === cat
                        ? 'bg-brand-dark text-primary-foreground'
                        : 'bg-muted text-text-secondary hover:bg-muted/80'
                    }`}
                  >
                    {tui(cat)}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 py-3">
              <textarea
                value={featureText}
                onChange={(e) => { if (e.target.value.length <= 150) setFeatureText(e.target.value); }}
                maxLength={150}
                placeholder={tui('What would you like to see in the KDS?')}
                rows={5}
                className="w-full bg-muted rounded-lg px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted outline-none resize-none min-h-[120px]"
              />
              <p className="text-right text-[11px] text-text-muted mt-1">{featureText.length}/150</p>
            </div>
            <div className="px-5 pb-3">
              <div className="bg-muted/60 rounded-lg px-3 py-2.5 flex gap-4 text-[11px] text-text-muted">
                <span>{tui('Station ID')}: STN-001</span>
                <span>{tui('Device')}: Kitchen Display 1</span>
                <span>{tui('Version')}: 5.0.84</span>
              </div>
            </div>
            <div className="px-5 pb-4">
              <button
                onClick={handleFeatureSubmit}
                disabled={!featureText.trim() || !featureCategory}
                className="w-full py-3 rounded-lg text-[13px] font-bold uppercase tracking-wider bg-brand-dark text-primary-foreground hover:bg-brand-dark/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px]"
              >
                {tui('Submit request')}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="bg-surface-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary">{tui('Log out?')}</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              {tui('You will be returned to the sign-in screen. Any unsaved settings will be lost.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">{tui('Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { onClose(); onLogOut?.(); }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]"
            >
              {tui('Log out')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
