import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DevScenarioSelector from '@/pages/DevScenarioSelector';
import SplashScreen from '@/pages/SplashScreen';
import PinPadScreen from '@/pages/PinPadScreen';
import HardwareActivationScreen from '@/pages/HardwareActivationScreen';
import PersonalDeviceLoginScreen from '@/pages/PersonalDeviceLoginScreen';
import SetPinScreen from '@/pages/SetPinScreen';
import DeviceActivatedScreen from '@/pages/DeviceActivatedScreen';
import ForgotPasswordScreen from '@/pages/ForgotPasswordScreen';
import MainOrderView from '@/pages/MainOrderView';

import AlertsPanel from '@/pages/AlertsPanel';
import PerformanceDashboard from '@/pages/PerformanceDashboard';
import LanguageSettings from '@/pages/LanguageSettings';
import SoundSettings from '@/pages/SoundSettings';
import PrinterRoutingModal from '@/pages/PrinterRoutingModal';
import type { PrinterModalType } from '@/pages/PrinterRoutingModal';
import CategoryFilterPanel from '@/pages/CategoryFilterPanel';
import RevenueCenterFilter from '@/pages/RevenueCenterFilter';
import StaggerModeSettings from '@/pages/StaggerModeSettings';
import { usePrinterAssignments } from '@/hooks/use-printer-assignments';
import { useOrderStore } from '@/hooks/use-order-store';
import { getActiveSummaryCategories } from '@/lib/summary-categories';

import WebSocketSettings from '@/pages/WebSocketSettings';
import { X } from 'lucide-react';
import { useDockLayout } from '@/hooks/use-dock-layout';
import { getOverlayInsets } from '@/lib/dock-insets';

const isDevMode = () => true;

type AppScreen =
  | 'dev-selector'
  | 'splash'
  | 'hardware-new'
  | 'hardware-existing'
  | 'byod-new'
  | 'byod-existing'
  | 'set-pin'
  | 'device-activated'
  | 'forgot'
  | 'main'
  | 'performance';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inSettings = location.pathname.startsWith('/kds/full/settings');
  // When opened directly on a settings route, skip dev selector and go to main.
  const [screen, setScreen] = useState<AppScreen>(
    inSettings ? 'main' : (isDevMode() ? 'dev-selector' : 'splash')
  );
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);

  // Sub-screen states
  const [languageOpen, setLanguageOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [printerModalType, setPrinterModalType] = useState<PrinterModalType>('kot');
  const [printerRoutingOpen, setPrinterRoutingOpen] = useState(false);
  const printerAssignments = usePrinterAssignments();
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [revenueFilterOpen, setRevenueFilterOpen] = useState(false);
  const [historyCategories, setHistoryCategories] = useState<string[]>([]);
  const [historyCenters, setHistoryCenters] = useState<string[]>([]);
  const [staggerOpen, setStaggerOpen] = useState(false);
  
  const [websocketOpen, setWebsocketOpen] = useState(false);
  const { orders } = useOrderStore();
  const { layout: dockLayout } = useDockLayout();
  const posInsets = getOverlayInsets(dockLayout);
  const availableCategories = getActiveSummaryCategories(orders);
  

  // Track where to return for fallback flows
  const [returnToSelector, setReturnToSelector] = useState(false);

  const handleSplashReady = useCallback(() => setScreen('hardware-existing'), []);

  // Hardware activation now handles set-pin internally, so onSuccess goes straight to main
  const handleFirstTimeLoginSuccess = useCallback(() => setScreen('main'), []);

  // After PIN is set (legacy, kept for other flows)
  const handlePinSet = useCallback(() => setScreen('device-activated'), []);

  // After activation, enter KDS
  const handleActivated = useCallback(() => setScreen('main'), []);

  // Existing user PIN success goes straight to KDS
  const handlePinLoginSuccess = useCallback(() => setScreen('main'), []);

  // Fallback from PIN screen to email/OTP login
  const handlePinFallback = useCallback(() => setScreen('byod-new'), []);

  const handleLogOut = useCallback(() => {
    setScreen(isDevMode() ? 'dev-selector' : 'splash');
  }, []);

  const handleNavigate = useCallback((target: string) => {
    switch (target) {
      case 'home': navigate('/kds/full'); setScreen('main'); break;
      case 'alerts': setAlertsOpen(true); break;
      case 'settings': navigate('/kds/full/settings'); break;
      case 'performance': setScreen('performance'); break;
      case 'switch-pos': setPosOpen(true); break;
    }
  }, [navigate]);

  // Keep main screen mounted whenever we land on a settings route.
  useEffect(() => {
    if (inSettings && screen !== 'main') setScreen('main');
  }, [inSettings, screen]);

  const handleOpenSub = useCallback((sub: string) => {
    switch (sub) {
      case 'language-settings': setLanguageOpen(true); break;
      case 'sound-settings': setSoundOpen(true); break;
      case 'printer-routing': setPrinterModalType('kot'); setPrinterRoutingOpen(true); break;
      case 'printer-kot': setPrinterModalType('kot'); setPrinterRoutingOpen(true); break;
      case 'printer-label': setPrinterModalType('label'); setPrinterRoutingOpen(true); break;
      case 'category-filter': setCategoryFilterOpen(true); break;
      case 'revenue-filter': setRevenueFilterOpen(true); break;
      case 'stagger-mode': setStaggerOpen(true); break;
      case 'status-settings': break; // handled inline in SettingsPanel
      case 'websocket-settings': setWebsocketOpen(true); break;
      
    }
  }, []);

  return (
    <>
      {screen === 'dev-selector' && (
        <DevScenarioSelector
          onNewUser={() => setScreen('hardware-new')}
          onExistingUser={() => setScreen('hardware-existing')}
        />
      )}

      {screen === 'splash' && <SplashScreen onReady={handleSplashReady} />}

      {screen === 'hardware-new' && (
        <HardwareActivationScreen
          onSuccess={handleFirstTimeLoginSuccess}
        />
      )}

      {screen === 'hardware-existing' && (
        <PinPadScreen
          onSuccess={handlePinLoginSuccess}
          onFallback={() => setScreen('hardware-new')}
        />
      )}

      {screen === 'byod-new' && (
        <PersonalDeviceLoginScreen
          onSuccess={handleFirstTimeLoginSuccess}
          onBack={() => setScreen(isDevMode() ? 'dev-selector' : 'splash')}
        />
      )}

      {screen === 'byod-existing' && (
        <PinPadScreen
          onSuccess={handlePinLoginSuccess}
          onFallback={() => setScreen('byod-new')}
        />
      )}

      {screen === 'set-pin' && <SetPinScreen onComplete={handlePinSet} />}

      {screen === 'device-activated' && <DeviceActivatedScreen onComplete={handleActivated} />}

      {screen === 'forgot' && <ForgotPasswordScreen onBack={() => setScreen('hardware-existing')} onComplete={() => setScreen('hardware-existing')} />}

      {screen === 'main' && (
        <MainOrderView
          onNavigate={handleNavigate}
          settingsOpen={inSettings}
          onCloseSettings={() => navigate('/kds/full')}
          onOpenSub={handleOpenSub}
          onLogOut={handleLogOut}
          onDevModeChange={() => {}}
          historyCategories={historyCategories}
          historyCenters={historyCenters}
          onClearHistoryCategories={() => setHistoryCategories([])}
          onClearHistoryCenters={() => setHistoryCenters([])}
          onSetHistoryCategories={setHistoryCategories}
          onSetHistoryCenters={setHistoryCenters}
        />
      )}

      {screen === 'performance' && <PerformanceDashboard onBack={() => setScreen('main')} />}

      <AlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />
      <LanguageSettings open={languageOpen} onClose={() => setLanguageOpen(false)} />
      <SoundSettings open={soundOpen} onClose={() => setSoundOpen(false)} />
      <PrinterRoutingModal
        open={printerRoutingOpen}
        onClose={() => setPrinterRoutingOpen(false)}
        type={printerModalType}
        initialSelectedId={printerModalType === 'kot' ? printerAssignments.kot.printerId : printerAssignments.label.printerId}
        onConfirm={(printer) => {
          if (printerModalType === 'kot') {
            printerAssignments.setKotPrinter({ printerId: printer.id, printerName: printer.name, status: printer.status });
          } else {
            printerAssignments.setLabelPrinter({ printerId: printer.id, printerName: printer.name, status: printer.status });
          }
        }}
      />
      <CategoryFilterPanel open={categoryFilterOpen} onClose={() => setCategoryFilterOpen(false)} activeCategories={historyCategories} availableCategories={availableCategories} onApply={(cats) => setHistoryCategories(cats)} />
      <RevenueCenterFilter open={revenueFilterOpen} onClose={() => setRevenueFilterOpen(false)} activeCenters={historyCenters} onApply={(cs) => setHistoryCenters(cs)} />
      <StaggerModeSettings open={staggerOpen} onClose={() => setStaggerOpen(false)} />
      
      <WebSocketSettings open={websocketOpen} onClose={() => setWebsocketOpen(false)} />

      {posOpen && (
        <div
          className="fixed z-40 bg-background flex flex-col"
          style={{
            top: posInsets.top,
            bottom: posInsets.bottom,
            left: posInsets.left,
            right: posInsets.right,
          }}
        >
          <div className="flex items-center justify-between px-4 h-11 border-b bg-card shrink-0">
            <span className="text-sm font-semibold">Point of Sale</span>
            <button
              onClick={() => setPosOpen(false)}
              className="p-1 rounded hover:bg-muted"
              aria-label="Close Point of Sale"
            >
              <X size={18} />
            </button>
          </div>
          <iframe
            src="https://mobileposapp.lovable.app"
            title="Point of Sale"
            className="flex-1 w-full border-0"
          />
        </div>
      )}

    </>
  );
};

export default Index;
