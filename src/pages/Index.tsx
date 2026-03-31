import { useState, useCallback } from 'react';
import DevScenarioSelector from '@/pages/DevScenarioSelector';
import SplashScreen from '@/pages/SplashScreen';
import PinPadScreen from '@/pages/PinPadScreen';
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
import StatusSettings from '@/pages/StatusSettings';
import WebSocketSettings from '@/pages/WebSocketSettings';

// Show dev selector in non-production builds (DEV or preview)
const isDev = import.meta.env.DEV || import.meta.env.MODE !== 'production' || !window.location.hostname.includes('.lovable.app') || window.location.hostname.includes('-preview--');

type AppScreen = 'dev-selector' | 'splash' | 'pin-first-time' | 'pin-login' | 'forgot' | 'main' | 'performance';

const Index = () => {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sub-screen states
  const [languageOpen, setLanguageOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [printerOpen, setPrinterOpen] = useState(false);
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [revenueFilterOpen, setRevenueFilterOpen] = useState(false);
  const [staggerOpen, setStaggerOpen] = useState(false);
  const [statusSettingsOpen, setStatusSettingsOpen] = useState(false);
  const [websocketOpen, setWebsocketOpen] = useState(false);
  const [printersScreenOpen, setPrintersScreenOpen] = useState(false);

  const handleSplashReady = useCallback(() => setScreen('pin-login'), []);
  const handleSignIn = useCallback(() => setScreen('main'), []);
  const handleForgotPassword = useCallback(() => setScreen('forgot'), []);
  const handleBackToPin = useCallback(() => setScreen('pin-login'), []);
  const handleLogOut = useCallback(() => { setSettingsOpen(false); setScreen('pin-login'); }, []);

  const handleNavigate = useCallback((target: string) => {
    switch (target) {
      case 'home': setScreen('main'); break;
      case 'alerts': setAlertsOpen(true); break;
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
      case 'status-settings': setStatusSettingsOpen(true); break;
      case 'websocket-settings': setWebsocketOpen(true); break;
      case 'printers': setPrintersScreenOpen(true); break;
    }
  }, []);

  return (
    <>
      {screen === 'dev-selector' && (
        <DevScenarioSelector
          onSelectHardware={() => setScreen('pin-first-time')}
          onSelectBYOD={() => setScreen('splash')}
          onExitDevMode={() => setScreen('splash')}
        />
      )}
      {screen === 'splash' && <SplashScreen onReady={handleSplashReady} />}
      {screen === 'pin-first-time' && <PinPadScreen isFirstTime onSuccess={handleSignIn} />}
      {screen === 'pin-login' && <PinPadScreen onSuccess={handleSignIn} />}
      {screen === 'forgot' && <ForgotPasswordScreen onBack={handleBackToPin} onComplete={handleBackToPin} />}
      {screen === 'main' && (
        <MainOrderView
          onNavigate={handleNavigate}
          settingsOpen={settingsOpen}
          onCloseSettings={() => setSettingsOpen(false)}
          onOpenSub={handleOpenSub}
          onLogOut={handleLogOut}
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
      <StatusSettings open={statusSettingsOpen} onClose={() => setStatusSettingsOpen(false)} />
      <WebSocketSettings open={websocketOpen} onClose={() => setWebsocketOpen(false)} />
    </>
  );
};

export default Index;
