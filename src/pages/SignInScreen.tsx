import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Delete } from 'lucide-react';
import kitchenHero from '@/assets/kitchen-hero.jpg';
import posaiLogo from '@/assets/posai-logo.png';

type LoginMode = 'email' | 'pin' | 'create-pin';

interface SignInScreenProps {
  onSignIn: () => void;
  onForgotPassword: () => void;
  initialMode?: 'email' | 'pin';
}

export default function SignInScreen({ onSignIn, onForgotPassword, initialMode = 'email' }: SignInScreenProps) {
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [carouselDot] = useState(0);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // PIN entry for daily login
  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError('');
    if (next.length === 4) {
      const savedPin = localStorage.getItem('kds_device_pin');
      if (next === savedPin) {
        setTimeout(() => onSignIn(), 300);
      } else {
        setTimeout(() => {
          setError('Incorrect PIN');
          setPin('');
          triggerShake();
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  // Email sign in - on success, go to create-pin flow
  const handleEmailSignIn = () => {
    if (!email || !password) {
      setError('Please enter email and password');
      triggerShake();
      return;
    }
    // TODO: Replace with API call for email/password auth
    // On success, check if PIN already exists
    const existingPin = localStorage.getItem('kds_device_pin');
    if (existingPin) {
      onSignIn();
    } else {
      setMode('create-pin');
      setError('');
    }
  };

  // Create PIN flow
  const handleCreatePinDigit = (digit: string) => {
    if (pinStep === 'enter') {
      if (newPin.length >= 4) return;
      const next = newPin + digit;
      setNewPin(next);
      setError('');
      if (next.length === 4) {
        setTimeout(() => {
          setPinStep('confirm');
        }, 300);
      }
    } else {
      if (confirmPin.length >= 4) return;
      const next = confirmPin + digit;
      setConfirmPin(next);
      setError('');
      if (next.length === 4) {
        if (next === newPin) {
          localStorage.setItem('kds_device_pin', newPin);
          setTimeout(() => onSignIn(), 300);
        } else {
          setTimeout(() => {
            setError('PINs do not match. Try again.');
            setConfirmPin('');
            setNewPin('');
            setPinStep('enter');
            triggerShake();
          }, 300);
        }
      }
    }
  };

  const handleCreatePinBackspace = () => {
    if (pinStep === 'enter') {
      setNewPin(newPin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
    setError('');
  };

  const pinPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

  const renderPinPad = (onDigit: (d: string) => void, onBack: () => void) => (
    <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
      {pinPad.map((key, i) => {
        if (key === '') return <div key={i} />;
        if (key === 'back') {
          return (
            <button
              key={i}
              onClick={onBack}
              className="flex items-center justify-center py-3 rounded-lg hover:bg-muted transition-colors min-h-[56px]"
              aria-label="Backspace"
            >
              <Delete size={22} className="text-text-secondary" />
            </button>
          );
        }
        return (
          <button
            key={i}
            onClick={() => onDigit(key)}
            className="flex items-center justify-center py-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-xl font-semibold text-text-primary min-h-[56px]"
          >
            {key}
          </button>
        );
      })}
    </div>
  );

  const renderPinDots = (currentValue: string) => (
    <div className={`flex justify-center gap-3 mb-6 ${shake ? 'animate-shake' : ''}`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border-2 transition-all ${
            i < currentValue.length
              ? error ? 'bg-destructive border-destructive' : 'bg-brand-primary border-brand-primary'
              : 'border-border'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 flex">
      {/* Left panel - Hero image */}
      <div className="hidden md:flex w-[60%] relative overflow-hidden">
        <img
          src={kitchenHero}
          alt="Professional restaurant kitchen with chefs cooking"
          className="absolute inset-0 w-full h-full object-cover"
          width={1024}
          height={768}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
            No more chaos<br />in the kitchen
          </h2>
          <p className="text-primary-foreground/70 mt-3 text-lg">
            Restaurants Made Simple
          </p>
          <div className="flex gap-2 mt-6">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === carouselDot ? 'bg-primary-foreground w-6' : 'bg-primary-foreground/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-surface-card flex flex-col items-center justify-center px-8 md:px-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={posaiLogo} alt="POS ai" className="h-12 object-contain mx-auto" />
            <p className="text-text-secondary text-sm mt-2">Kitchen Display System</p>
          </div>

          {/* PIN Login (daily use) */}
          {mode === 'pin' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-center text-text-secondary text-sm mb-4">Enter your 4-digit PIN</p>
              {renderPinDots(pin)}
              {error && <p className="text-center text-destructive text-sm mb-3">{error}</p>}
              {renderPinPad(handlePinDigit, handleBackspace)}
              <button
                onClick={() => { setMode('email'); setError(''); setPin(''); }}
                className="w-full mt-6 text-center text-sm text-[hsl(var(--brand-button))] hover:underline"
              >
                Sign in with email instead
              </button>
            </motion.div>
          )}

          {/* Email Login (first time / recovery) */}
          {mode === 'email' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`space-y-4 ${shake ? 'animate-shake' : ''}`}>
                <div>
                  <label className="text-sm font-montserrat font-semibold text-text-primary block mb-1.5 tracking-wide">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${error ? 'border-destructive' : 'border-border hover:border-brand-primary/40'} bg-background text-text-primary font-montserrat text-base focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 min-h-[48px] transition-colors placeholder:text-text-muted`}
                    placeholder="kitchen@restaurant.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-montserrat font-semibold text-text-primary block mb-1.5 tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border-2 ${error ? 'border-destructive' : 'border-border hover:border-brand-primary/40'} bg-background text-text-primary font-montserrat text-base focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 min-h-[48px] transition-colors placeholder:text-text-muted`}
                      placeholder="Enter password"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-brand-primary min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-destructive text-sm font-montserrat font-medium">{error}</p>}

                <button
                  onClick={handleEmailSignIn}
                  className="w-full py-3.5 bg-[hsl(var(--brand-button))] text-primary-foreground font-montserrat font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[hsl(var(--brand-button)/0.85)] active:scale-[0.98] transition-all min-h-[48px] mt-1 shadow-md shadow-black/15"
                >
                  SIGN IN
                </button>
              </div>

              <button
                onClick={onForgotPassword}
                className="w-full mt-3 text-center text-sm text-[hsl(var(--brand-button))] hover:underline transition-colors"
              >
                Forgot password?
              </button>

              {localStorage.getItem('kds_device_pin') && (
                <button
                  onClick={() => { setMode('pin'); setError(''); }}
                  className="w-full mt-2 text-center text-sm text-[hsl(var(--brand-button))] hover:underline"
                >
                  Sign in with PIN instead
                </button>
              )}
            </motion.div>
          )}

          {/* Create PIN (after first email login) */}
          {mode === 'create-pin' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-center text-text-primary text-base font-semibold mb-1">
                {pinStep === 'enter' ? 'Create a Device PIN' : 'Confirm Your PIN'}
              </p>
              <p className="text-center text-text-secondary text-sm mb-5">
                {pinStep === 'enter'
                  ? 'Set a 4-digit PIN for quick daily access'
                  : 'Enter the same PIN again to confirm'}
              </p>
              {renderPinDots(pinStep === 'enter' ? newPin : confirmPin)}
              {error && <p className="text-center text-destructive text-sm mb-3">{error}</p>}
              {renderPinPad(handleCreatePinDigit, handleCreatePinBackspace)}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
