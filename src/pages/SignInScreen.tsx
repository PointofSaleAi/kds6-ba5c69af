import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Delete } from 'lucide-react';
import kitchenHero from '@/assets/kitchen-hero.jpg';

interface SignInScreenProps {
  onSignIn: () => void;
  onForgotPassword: () => void;
}

export default function SignInScreen({ onSignIn, onForgotPassword }: SignInScreenProps) {
  const [pin, setPin] = useState('');
  const [useEmail, setUseEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [carouselDot] = useState(0);

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 6) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');
    if (newPin.length === 6) {
      // TODO: Replace with API call for PIN validation
      setTimeout(() => onSignIn(), 300);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleEmailSignIn = () => {
    if (!email || !password) {
      setError('Please enter email and password');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    // TODO: Replace with API call for email/password auth
    onSignIn();
  };

  const pinPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

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
          {/* Carousel dots */}
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

      {/* Right panel - Login */}
      <div className="flex-1 bg-surface-card flex flex-col items-center justify-center px-8 md:px-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={posaiLogo} alt="POS ai" className="h-12 object-contain mx-auto" />
            <p className="text-text-secondary text-sm mt-2">Kitchen Display System</p>
          </div>

          {!useEmail ? (
            /* PIN Login */
            <div>
              <p className="text-center text-text-secondary text-sm mb-4">Enter your 6-digit PIN</p>

              {/* PIN dots */}
              <div className={`flex justify-center gap-3 mb-6 ${shake ? 'animate-shake' : ''}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      i < pin.length
                        ? error ? 'bg-destructive border-destructive' : 'bg-brand-primary border-brand-primary'
                        : 'border-border'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-center text-destructive text-sm mb-3">{error}</p>
              )}

              {/* Number pad */}
              <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
                {pinPad.map((key, i) => {
                  if (key === '') return <div key={i} />;
                  if (key === 'back') {
                    return (
                      <button
                        key={i}
                        onClick={handleBackspace}
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
                      onClick={() => handlePinDigit(key)}
                      className="flex items-center justify-center py-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-xl font-semibold text-text-primary min-h-[56px]"
                    >
                      {key}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setUseEmail(true)}
                className="w-full mt-6 text-center text-sm text-brand-primary hover:underline"
              >
                Sign in with email instead
              </button>
            </div>
          ) : (
            /* Email Login */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`space-y-3 ${shake ? 'animate-shake' : ''}`}>
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className={`w-full px-3 py-2.5 rounded-lg border ${error ? 'border-destructive' : 'border-input'} bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]`}
                    placeholder="kitchen@restaurant.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary block mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className={`w-full px-3 py-2.5 pr-10 rounded-lg border ${error ? 'border-destructive' : 'border-input'} bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]`}
                      placeholder="Enter password"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}

                <button
                  onClick={handleEmailSignIn}
                  className="w-full py-3 bg-brand-primary text-primary-foreground text-cta uppercase rounded-lg hover:bg-brand-primary/90 transition-colors min-h-[48px] mt-2"
                >
                  SIGN IN
                </button>
              </div>

              <button
                onClick={onForgotPassword}
                className="w-full mt-3 text-center text-sm text-text-muted hover:text-brand-primary transition-colors"
              >
                Forgot password?
              </button>

              <button
                onClick={() => { setUseEmail(false); setError(''); }}
                className="w-full mt-2 text-center text-sm text-brand-primary hover:underline"
              >
                Sign in with PIN instead
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
