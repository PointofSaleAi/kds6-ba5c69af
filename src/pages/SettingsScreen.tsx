import { useState } from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, ChevronRight, Monitor, ShoppingBag, Cpu, User, Languages, Volume2, Printer, Tag, Palette, Server, Clock, Minus, Plus, Sun, Moon, Bug, Send } from 'lucide-react';
import { usePrinterAssignments } from '@/hooks/use-printer-assignments';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/hooks/use-language';
import { useKDSSettings } from '@/hooks/use-kds-settings';

interface SettingsScreenProps {
  open: boolean;
  onClose: () => void;
  onOpenSub: (sub: string) => void;
  onLogOut?: () => void;
  onDevModeChange?: (enabled: boolean) => void;
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

export default function SettingsScreen({ open, onClose, onOpenSub, onLogOut, onDevModeChange }: SettingsScreenProps) {
  const { theme, setTheme } = useTheme();
  const { t, languageName } = useLanguage();
  const { kot, label, labelEnabled, setLabelEnabled } = usePrinterAssignments();
  const { expoSendButtonMode, setExpoSendButtonMode, ticketLayout, setTicketLayout } = useKDSSettings();
  const [displayMode, setDisplayMode] = useState('Grid');
  const [textSize, setTextSize] = useState('Standard');
  const [cardsPerRow, setCardsPerRow] = useState(4);
  const [showAllergens, setShowAllergens] = useState(true);
  const [staggerMode, setStaggerMode] = useState(false);
  const [servableModifiers, setServableModifiers] = useState(false);
  const [sortDefault, setSortDefault] = useState('By time');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [devMode, setDevMode] = useState(() => localStorage.getItem('posai-dev-mode') === 'true');

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
            <h2 className="text-lg font-bold text-text-primary">{t.settings}</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close Settings">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Settings content */}
          <div className="flex-1 overflow-y-auto">
            {/* DISPLAY */}
            <div className="px-4 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <Monitor size={14} className="text-text-muted" />
                <span className="text-section-label uppercase text-text-muted tracking-widest">{t.display}</span>
              </div>
            </div>
            <SettingsRow icon={Monitor} label={t.displayMode} right={<SegmentedToggle options={[t.grid, t.horizontal, t.stagger]} value={displayMode} onChange={setDisplayMode} />} />
            <SettingsRow icon={Monitor} label={t.cardsPerRow} right={<StepperControl value={cardsPerRow} onChange={setCardsPerRow} min={2} max={8} />} />
            <SettingsRow icon={Monitor} label={t.textSize} right={<SegmentedToggle options={[t.compact, t.standard, t.large]} value={textSize} onChange={setTextSize} />} />
            <SettingsRow
              icon={Monitor}
              label="Ticket Layout"
              description={ticketLayout === 'compact' ? 'Compact, product names only, tap to expand' : 'Standard, full details visible'}
              right={
                <SegmentedToggle
                  options={['Standard', 'Compact']}
                  value={ticketLayout === 'compact' ? 'Compact' : 'Standard'}
                  onChange={(v) => setTicketLayout(v === 'Compact' ? 'compact' : 'standard')}
                />
              }
            />
            <SettingsRow icon={Palette} label={t.statusColours} description={t.customiseStatusColours} onClick={() => onOpenSub('status-settings')} />
            <SettingsRow
              icon={theme === 'dark' ? Moon : Sun}
              label={t.theme}
              right={
                <SegmentedToggle
                  options={[t.light, t.dark]}
                  value={theme === 'dark' ? t.dark : t.light}
                  onChange={(v) => setTheme(v === t.dark ? 'dark' : 'light')}
                />
              }
            />
            <SettingsRow icon={Languages} label={'Region'} description={languageName} onClick={() => onOpenSub('language-settings')} />

            {/* ORDERS */}
            <div className="px-4 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag size={14} className="text-text-muted" />
                <span className="text-section-label uppercase text-text-muted tracking-widest">Tickets</span>
              </div>
            </div>
            <SettingsRow icon={ShoppingBag} label={t.categoryFilter} description={t.manageCategories} onClick={() => onOpenSub('category-filter')} />
            <SettingsRow icon={ShoppingBag} label={t.revenueCenterFilter} description={t.manageStationFilters} onClick={() => onOpenSub('revenue-filter')} />
            <SettingsRow icon={Clock} label={t.staggerMode} description={staggerMode ? t.configureRelease : undefined} right={<Toggle checked={staggerMode} onChange={setStaggerMode} />} onClick={staggerMode ? () => onOpenSub('stagger-mode') : undefined} />
            <SettingsRow icon={ShoppingBag} label={t.servableModifiers} right={<Toggle checked={servableModifiers} onChange={setServableModifiers} />} />
            <SettingsRow icon={ShoppingBag} label={t.showAllergenBadges} right={<Toggle checked={showAllergens} onChange={setShowAllergens} />} />
            <SettingsRow icon={ShoppingBag} label={t.sortDefault} right={<SegmentedToggle options={[t.byTime, t.byTable, t.byType]} value={sortDefault} onChange={setSortDefault} />} />

            {/* EXPO VIEW */}
            <div className="px-4 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <Send size={14} className="text-text-muted" />
                <span className="text-section-label uppercase text-text-muted tracking-widest">Expo view</span>
              </div>
            </div>
            <SettingsRow
              icon={Send}
              label="Show Send Button"
              description={expoSendButtonMode === 'always' ? 'Always — show on all products' : 'When ready — only when product is marked done on KDS'}
              right={
                <SegmentedToggle
                  options={['Always', 'When ready']}
                  value={expoSendButtonMode === 'always' ? 'Always' : 'When ready'}
                  onChange={(v) => setExpoSendButtonMode(v === 'Always' ? 'always' : 'when-ready')}
                />
              }
            />

            {/* HARDWARE */}
            <div className="px-4 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <Cpu size={14} className="text-text-muted" />
                <span className="text-section-label uppercase text-text-muted tracking-widest">{t.hardware}</span>
              </div>
            </div>
            <SettingsRow
              icon={Printer}
              label="KOT Printer"
              description={kot.printerId ? kot.printerName : 'No printer assigned'}
              onClick={() => onOpenSub('printer-kot')}
            />
            <SettingsRow
              icon={Tag}
              label="Label Printer"
              description={labelEnabled ? (label.printerId ? label.printerName : 'No printer assigned') : 'Disabled'}
              right={<Toggle checked={labelEnabled} onChange={setLabelEnabled} />}
              onClick={labelEnabled ? () => onOpenSub('printer-label') : undefined}
            />
            <SettingsRow icon={Volume2} label={t.soundSettings} description={t.volumeAndAlerts} onClick={() => onOpenSub('sound-settings')} />
            <SettingsRow icon={Server} label={t.connection} description={t.wsAndSync} onClick={() => onOpenSub('websocket-settings')} />

            {/* ACCOUNT */}
            <div className="px-4 pt-4 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-text-muted" />
                <span className="text-section-label uppercase text-text-muted tracking-widest">{t.account}</span>
              </div>
            </div>
            <SettingsRow icon={User} label={t.deviceName} description="Kitchen Display 1" />
            <SettingsRow
              icon={Bug}
              label={t.devMode}
              description={t.showFlowSelector}
              right={
                <Toggle
                  checked={devMode}
                  onChange={(v) => {
                    setDevMode(v);
                    localStorage.setItem('posai-dev-mode', String(v));
                    onDevModeChange?.(v);
                  }}
                />
              }
            />
            <SettingsRow
              icon={User}
              label={t.logOut}
              onClick={() => setShowLogoutConfirm(true)}
            />



            <div className="text-center py-3 text-xs text-text-muted">
              Point of Sale Ai Kitchen Display System v2.4.1
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="bg-surface-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary">{t.logOutConfirm}</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              {t.logOutDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { onClose(); onLogOut?.(); }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]"
            >
              {t.logOut}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
}
