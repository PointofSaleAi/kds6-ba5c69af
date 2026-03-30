import { useState, useCallback } from 'react';
import SplashScreen from '@/pages/SplashScreen';
import SignInScreen from '@/pages/SignInScreen';
import ForgotPasswordScreen from '@/pages/ForgotPasswordScreen';
import MainOrderView from '@/pages/MainOrderView';
import OrderHistoryScreen from '@/pages/OrderHistoryScreen';
import AlertsPanel from '@/pages/AlertsPanel';
import SettingsScreen from '@/pages/SettingsScreen';
import PerformanceDashboard from '@/pages/PerformanceDashboard';
import LanguageSettings from '@/pages/LanguageSettings';
import SoundSettings from '@/pages/SoundSettings';
import PrinterSettings from '@/pages/PrinterSettings';
import CategoryFilterPanel from '@/pages/CategoryFilterPanel';
import RevenueCenterFilter from '@/pages/RevenueCenterFilter';
import StaggerModeSettings from '@/pages/StaggerModeSettings';
import StatusSettings from '@/pages/StatusSettings';
import WebSocketSettings from '@/pages/WebSocketSettings';

type AppScreen = 'splash' | 'signin' | 'forgot' | 'main' | 'history' | 'performance';

const Index = () => {
  const hasPin = Boolean(localStorage.getItem('kds_device_pin'));
  const [screen, setScreen] = useState<AppScreen>('signin');
  const [signinMode, setSigninMode] = useState<'email' | 'pin'>(hasPin ? 'pin' : 'email');
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

  const handleSplashReady = useCallback(() => setScreen('signin'), []);
  const handleSignIn = useCallback(() => setScreen('main'), []);
  const handleForgotPassword = useCallback(() => setScreen('forgot'), []);
  const handleBackToSignIn = useCallback(() => setScreen('signin'), []);
  const handleLogOut = useCallback(() => { setSettingsOpen(false); setScreen('signin'); }, []);

  const handleNavigate = useCallback((target: string) => {
    switch (target) {
      case 'home': setScreen('main'); break;
      case 'history': setScreen('history'); break;
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
    }
  }, []);

  return (
    <>
      {screen === 'splash' && <SplashScreen onReady={handleSplashReady} />}
      {screen === 'signin' && <SignInScreen onSignIn={handleSignIn} onForgotPassword={handleForgotPassword} />}
      {screen === 'forgot' && <ForgotPasswordScreen onBack={handleBackToSignIn} onComplete={handleBackToSignIn} />}
      {screen === 'main' && <MainOrderView onNavigate={handleNavigate} />}
      {screen === 'history' && <OrderHistoryScreen onBack={() => setScreen('main')} onRecall={() => setScreen('main')} />}
      {screen === 'performance' && <PerformanceDashboard onBack={() => setScreen('main')} />}

      <AlertsPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />
      <SettingsScreen open={settingsOpen} onClose={() => setSettingsOpen(false)} onOpenSub={handleOpenSub} onLogOut={handleLogOut} />
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
