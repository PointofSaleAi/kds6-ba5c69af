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
import { useOnboarding } from '@/hooks/use-onboarding';
import { useOrderStore } from '@/hooks/use-order-store';
import { getActiveSummaryCategories } from '@/lib/summary-categories';

import WebSocketSettings from '@/pages/WebSocketSettings';

// Prototype flow selector: always enabled so the published preview shows the
// same "INTERNAL FLOW SELECTOR" entry point as the dev build (including
// incognito sessions where no prior state is cached).
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

interface IndexProps {
  cardVariant?: 'default' | 'v1' | 'v2' | 'v3' | 'v4' | 'v5';
  legacyActions?: boolean;
}

const Index = ({ cardVariant = 'default', legacyActions = false }: IndexProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = '/kds/v1';
  const inSettings = location.pathname.startsWith(`${basePath}/settings`);
  const isVariantRoute = cardVariant !== 'default';
  // When opened directly on a settings or variant route, skip dev selector and go to main.
  const [screen, setScreen] = useState<AppScreen>(
    (inSettings || isVariantRoute || legacyActions) ? 'main' : (isDevMode() ? 'dev-selector' : 'splash')
  );
  const [alertsOpen, setAlertsOpen] = useState(false);

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
  const availableCategories = getActiveSummaryCategories(orders);
  

  // Track where to return for fallback flows
  const [returnToSelector, setReturnToSelector] = useState(false);

  const { start, startIfFirstLogin } = useOnboarding();

  const handleSplashReady = useCallback(() => setScreen('hardware-existing'), []);

  // Hardware activation now handles set-pin internally, so onSuccess goes straight to main
  const handleFirstTimeLoginSuccess = useCallback(() => {
    setScreen('main');
    setTimeout(() => start(), 300);
  }, [start]);

  // After PIN is set (legacy, kept for other flows)
  const handlePinSet = useCallback(() => setScreen('device-activated'), []);

  // After activation, enter KDS
  const handleActivated = useCallback(() => setScreen('main'), []);

  // Existing user PIN success goes straight to KDS
  const handlePinLoginSuccess = useCallback(() => {
    setScreen('main');
    setTimeout(() => startIfFirstLogin(), 300);
  }, [startIfFirstLogin]);

  // Fallback from PIN screen to email/OTP login
  const handlePinFallback = useCallback(() => setScreen('byod-new'), []);

  const handleLogOut = useCallback(() => {
    setScreen(isDevMode() ? 'dev-selector' : 'splash');
  }, []);

  const handleNavigate = useCallback((target: string) => {
    switch (target) {
      case 'home': {
        const stored = localStorage.getItem('kds-tickets-route') || 'Default';
        const route = stored === 'Default' ? '/kds/default' : `/kds/${stored}`;
        navigate(route);
        setScreen('main');
        break;
      }
      case 'alerts': setAlertsOpen((v) => !v); break;
      case 'settings': navigate(`${basePath}/settings`); break;
      case 'performance': setScreen('performance'); break;
    }
  }, [navigate, basePath]);

  // Keep main screen mounted whenever we land on a settings route.
  useEffect(() => {
    if (inSettings && screen !== 'main') setScreen('main');
  }, [inSettings, screen]);

  // If the user lands directly on a main-screen route (e.g. /kds/default),
  // the login flow is skipped — trigger the first-login walkthrough here so
  // the sample ticket appears for brand-new users.
  useEffect(() => {
    if (screen === 'main') {
      const t = setTimeout(() => startIfFirstLogin(), 300);
      return () => clearTimeout(t);
    }
  }, [screen, startIfFirstLogin]);

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
          onCloseSettings={() => navigate(basePath)}
          onOpenSub={handleOpenSub}
          onLogOut={handleLogOut}
          onDevModeChange={() => {}}
          historyCategories={historyCategories}
          historyCenters={historyCenters}
          onClearHistoryCategories={() => setHistoryCategories([])}
          onClearHistoryCenters={() => setHistoryCenters([])}
          onSetHistoryCategories={setHistoryCategories}
          onSetHistoryCenters={setHistoryCenters}
          cardVariant={cardVariant}
          legacyActions={legacyActions}
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
      
    </>
  );
};

export default Index;
