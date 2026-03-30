import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import kitchenHero from '@/assets/kitchen-hero.jpg';
import posaiLogo from '@/assets/posai-logo.png';
import GlassPinPad from '@/components/kds/GlassPinPad';
import GlassCreatePin from '@/components/kds/GlassCreatePin';

type LoginMode = 'email' | 'pin' | 'create-pin';

interface SignInScreenProps {
  onSignIn: () => void;
  onForgotPassword: () => void;
  initialMode?: 'email' | 'pin';
}

export default function SignInScreen({ onSignIn, onForgotPassword, initialMode = 'email' }: SignInScreenProps) {
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [pinError, setPinError] = useState('');

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleEmailSignIn = () => {
    if (!email || !password) {
      setError('Please enter email and password');
      triggerShake();
      return;
    }
    const existingPin = localStorage.getItem('kds_device_pin');
    if (existingPin) {
      onSignIn();
    } else {
      setMode('create-pin');
      setError('');
    }
  };

  // PIN login
  if (mode === 'pin') {
    return (
      <GlassPinPad
        error={pinError}
        onErrorClear={() => setPinError('')}
        onPinComplete={(pin) => {
          const savedPin = localStorage.getItem('kds_device_pin');
          if (pin === savedPin) {
            onSignIn();
          } else {
            setPinError('Incorrect PIN');
          }
        }}
        onEmailLogin={() => { setMode('email'); setPinError(''); }}
      />
    );
  }

  // Create PIN after first email login
  if (mode === 'create-pin') {
    return (
      <GlassCreatePin
        onPinCreated={(pin) => {
          localStorage.setItem('kds_device_pin', pin);
          onSignIn();
        }}
      />
    );
  }

  // Email login
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
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-surface-card flex flex-col items-center justify-center px-8 md:px-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src={posaiLogo} alt="POS ai" className="h-12 object-contain mx-auto" />
            <p className="text-text-secondary text-sm mt-2">Kitchen Display System</p>
          </div>

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
                className="w-full py-3.5 bg-primary text-primary-foreground font-montserrat font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-primary/85 active:scale-[0.98] transition-all min-h-[48px] mt-1 shadow-md shadow-black/15"
              >
                SIGN IN
              </button>
            </div>

            <button
              onClick={onForgotPassword}
              className="w-full mt-3 text-center text-sm text-primary hover:underline transition-colors"
            >
              Forgot password?
            </button>

            {localStorage.getItem('kds_device_pin') && (
              <button
                onClick={() => { setMode('pin'); setError(''); }}
                className="w-full mt-2 text-center text-sm text-primary hover:underline"
              >
                Sign in with PIN instead
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
