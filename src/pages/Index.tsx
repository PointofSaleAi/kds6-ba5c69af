import { useState, useCallback } from 'react';
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
import PrinterSettings from '@/pages/PrinterSettings';
import PrintersScreen from '@/pages/PrintersScreen';
import CategoryFilterPanel from '@/pages/CategoryFilterPanel';
import RevenueCenterFilter from '@/pages/RevenueCenterFilter';
import StaggerModeSettings from '@/pages/StaggerModeSettings';

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
  const [screen, setScreen] = useState<AppScreen>(isDevMode() ? 'dev-selector' : 'splash');
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sub-screen states
  const [languageOpen, setLanguageOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [printerOpen, setPrinterOpen] = useState(false);
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [revenueFilterOpen, setRevenueFilterOpen] = useState(false);
  const [staggerOpen, setStaggerOpen] = useState(false);
  
  const [websocketOpen, setWebsocketOpen] = useState(false);
  const [printersScreenOpen, setPrintersScreenOpen] = useState(false);

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
      case 'settings': setSettingsOpen(true); break;
      case 'performance': setScreen('performance'); break;
    }
  }, []);

  const handleOpenSub = useCallback((sub: string) => {
    switch (sub) {
      case 'language-settings': setLanguageOpen(true); break;
      case 'sound-settings': setSoundOpen(true); break;
      case 'printer-settings': setPrinterOpen(true); break;
      case 'category-filter': setCategoryFilterOpen(true); break;
      case 'revenue-filter': setRevenueFilterOpen(true); break;
      case 'stagger-mode': setStaggerOpen(true); break;
      case 'status-settings': break; // handled inline in SettingsPanel
      case 'websocket-settings': setWebsocketOpen(true); break;
      case 'printers': setPrintersScreenOpen(true); break;
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
      <PrinterSettings open={printerOpen} onClose={() => setPrinterOpen(false)} />
      <CategoryFilterPanel open={categoryFilterOpen} onClose={() => setCategoryFilterOpen(false)} onApply={() => {}} />
      <RevenueCenterFilter open={revenueFilterOpen} onClose={() => setRevenueFilterOpen(false)} onApply={() => {}} />
      <StaggerModeSettings open={staggerOpen} onClose={() => setStaggerOpen(false)} />
      
      <WebSocketSettings open={websocketOpen} onClose={() => setWebsocketOpen(false)} />
      <PrintersScreen open={printersScreenOpen} onClose={() => setPrintersScreenOpen(false)} />
    </>
  );
};

export default Index;
