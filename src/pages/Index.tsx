import { useState, useCallback } from 'react';
import SplashScreen from '@/pages/SplashScreen';
import SignInScreen from '@/pages/SignInScreen';
import ForgotPasswordScreen from '@/pages/ForgotPasswordScreen';
import MainOrderView from '@/pages/MainOrderView';
import OrderHistoryScreen from '@/pages/OrderHistoryScreen';
import AlertsPanel from '@/pages/AlertsPanel';
import SettingsScreen from '@/pages/SettingsScreen';
import PerformanceDashboard from '@/pages/PerformanceDashboard';

type AppScreen = 'splash' | 'signin' | 'forgot' | 'main' | 'history' | 'performance';

const Index = () => {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSplashReady = useCallback(() => setScreen('signin'), []);
  const handleSignIn = useCallback(() => setScreen('main'), []);
  const handleForgotPassword = useCallback(() => setScreen('forgot'), []);
  const handleBackToSignIn = useCallback(() => setScreen('signin'), []);

  const handleNavigate = useCallback((target: string) => {
    switch (target) {
      case 'home': setScreen('main'); break;
      case 'history': setScreen('history'); break;
      case 'alerts': setAlertsOpen(true); break;
      case 'settings': setSettingsOpen(true); break;
      case 'performance': setScreen('performance'); break;
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
      <SettingsScreen open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default Index;
