import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import posaiLogo from '@/assets/posai-logo.png';

interface GlassPinPadProps {
  onPinComplete: (pin: string) => void;
  onEmailLogin: () => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function GlassPinPad({ onPinComplete, onEmailLogin, error, onErrorClear }: GlassPinPadProps) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [error]);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    onErrorClear?.();
    if (next.length === 4) {
      setTimeout(() => onPinComplete(next), 200);
    }
  };

  const handleClear = () => {
    setPin('');
    onErrorClear?.();
  };

  const handleEnter = () => {
    if (pin.length === 4) {
      onPinComplete(pin);
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', 'ENTER'],
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[hsl(240,33%,6%)]">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,33%,8%)] via-[hsl(240,33%,6%)] to-[hsl(240,20%,4%)]" />
      
      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex flex-col items-center w-full max-w-[420px] px-8 py-10"
      >
        {/* Logo */}
        <img src={posaiLogo} alt="POS ai" className="h-10 object-contain mb-6 opacity-90" />

        {/* Label */}
        <p className="text-[hsl(0,0%,55%)] font-montserrat text-sm tracking-widest uppercase mb-2">
          KDS Access
        </p>
        <p className="text-[hsl(0,0%,85%)] font-montserrat text-base font-medium mb-8">
          Enter PIN
        </p>

        {/* PIN dots */}
        <div className={`flex justify-center gap-5 mb-8 ${shake ? 'animate-shake' : ''}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? error
                    ? 'bg-[hsl(var(--destructive))] shadow-[0_0_12px_hsl(var(--destructive)/0.5)]'
                    : 'bg-[hsl(0,0%,90%)] shadow-[0_0_12px_hsl(0,0%,90%,0.3)]'
                  : 'border-2 border-[hsl(0,0%,30%)]'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[hsl(var(--destructive))] text-sm font-montserrat font-medium mb-4"
          >
            {error}
          </motion.p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[340px]">
          {keys.flat().map((key) => {
            const isC = key === 'C';
            const isEnter = key === 'ENTER';

            return (
              <button
                key={key}
                onClick={() => {
                  if (isC) handleClear();
                  else if (isEnter) handleEnter();
                  else handleDigit(key);
                }}
                className={`
                  font-montserrat font-bold rounded-xl transition-all duration-150
                  min-h-[64px] min-w-[64px] flex items-center justify-center
                  active:scale-95
                  ${isC
                    ? 'bg-[hsl(4,60%,45%)/0.8] text-[hsl(0,0%,95%)] text-lg hover:bg-[hsl(4,60%,40%)]'
                    : isEnter
                      ? 'bg-[hsl(0,0%,40%)/0.6] text-[hsl(0,0%,90%)] text-sm tracking-wider hover:bg-[hsl(0,0%,45%)/0.6]'
                      : 'bg-[hsl(0,0%,90%)/0.12] text-[hsl(0,0%,92%)] text-2xl hover:bg-[hsl(0,0%,90%)/0.2] backdrop-blur-sm'
                  }
                  shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
                `}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Email login link */}
        <button
          onClick={onEmailLogin}
          className="mt-8 text-[hsl(0,0%,50%)] font-montserrat text-sm hover:text-[hsl(0,0%,70%)] transition-colors"
        >
          Sign in with email instead
        </button>
      </motion.div>
    </div>
  );
}
