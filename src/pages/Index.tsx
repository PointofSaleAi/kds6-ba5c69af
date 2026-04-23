import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

import WebSocketSettings from '@/pages/WebSocketSettings';

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
  const [screen, setScreen] = useState<AppScreen>(isDevMode() ? 'dev-selector' : 'splash');
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [settingsOpen] = useState(false);

  // Sub-screen states
  const [languageOpen, setLanguageOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [printerModalType, setPrinterModalType] = useState<PrinterModalType>('kot');
  const [printerRoutingOpen, setPrinterRoutingOpen] = useState(false);
  const printerAssignments = usePrinterAssignments();
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [revenueFilterOpen, setRevenueFilterOpen] = useState(false);
  const [staggerOpen, setStaggerOpen] = useState(false);
  
  const [websocketOpen, setWebsocketOpen] = useState(false);
  

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
    setSettingsOpen(false);
    setScreen(isDevMode() ? 'dev-selector' : 'splash');
  }, []);

  const handleNavigate = useCallback((target: string) => {
    switch (target) {
      case 'home': setScreen('main'); break;
      case 'alerts': setAlertsOpen(true); break;
      case 'settings': navigate('/kds/full/settings'); break;
      case 'performance': setScreen('performance'); break;
    }
  }, []);

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
          settingsOpen={settingsOpen}
          onCloseSettings={() => setSettingsOpen(false)}
          onOpenSub={handleOpenSub}
          onLogOut={handleLogOut}
          onDevModeChange={() => {}}
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
      <CategoryFilterPanel open={categoryFilterOpen} onClose={() => setCategoryFilterOpen(false)} onApply={() => {}} />
      <RevenueCenterFilter open={revenueFilterOpen} onClose={() => setRevenueFilterOpen(false)} onApply={() => {}} />
      <StaggerModeSettings open={staggerOpen} onClose={() => setStaggerOpen(false)} />
      
      <WebSocketSettings open={websocketOpen} onClose={() => setWebsocketOpen(false)} />
      
    </>
  );
};

export default Index;
