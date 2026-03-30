import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import posaiLogo from '@/assets/posai-logo.png';

interface GlassCreatePinProps {
  onPinCreated: (pin: string) => void;
}

export default function GlassCreatePin({ onPinCreated }: GlassCreatePinProps) {
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [error]);

  const currentPin = step === 'enter' ? newPin : confirmPin;

  const handleDigit = (digit: string) => {
    if (currentPin.length >= 4) return;
    const next = currentPin + digit;
    setError('');

    if (step === 'enter') {
      setNewPin(next);
      if (next.length === 4) {
        setTimeout(() => setStep('confirm'), 300);
      }
    } else {
      setConfirmPin(next);
      if (next.length === 4) {
        if (next === newPin) {
          setTimeout(() => onPinCreated(next), 200);
        } else {
          setTimeout(() => {
            setError('PINs do not match. Try again.');
            setConfirmPin('');
            setNewPin('');
            setStep('enter');
          }, 300);
        }
      }
    }
  };

  const handleClear = () => {
    if (step === 'enter') setNewPin('');
    else setConfirmPin('');
    setError('');
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', 'ENTER'],
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[hsl(240,33%,6%)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,33%,8%)] via-[hsl(240,33%,6%)] to-[hsl(240,20%,4%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex flex-col items-center w-full max-w-[420px] px-8 py-10"
      >
        <img src={posaiLogo} alt="POS ai" className="h-10 object-contain mb-6 opacity-90" />

        <p className="text-[hsl(0,0%,85%)] font-montserrat text-base font-semibold mb-1">
          {step === 'enter' ? 'Create a Device PIN' : 'Confirm Your PIN'}
        </p>
        <p className="text-[hsl(0,0%,55%)] font-montserrat text-sm mb-8">
          {step === 'enter'
            ? 'Set a 4-digit PIN for quick daily access'
            : 'Enter the same PIN again to confirm'}
        </p>

        <div className={`flex justify-center gap-5 mb-8 ${shake ? 'animate-shake' : ''}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full transition-all duration-200 ${
                i < currentPin.length
                  ? error
                    ? 'bg-[hsl(var(--destructive))] shadow-[0_0_12px_hsl(var(--destructive)/0.5)]'
                    : 'bg-[hsl(0,0%,90%)] shadow-[0_0_12px_hsl(0,0%,90%,0.3)]'
                  : 'border-2 border-[hsl(0,0%,30%)]'
              }`}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[hsl(var(--destructive))] text-sm font-montserrat font-medium mb-4"
          >
            {error}
          </motion.p>
        )}

        <div className="grid grid-cols-3 gap-3 w-full max-w-[340px]">
          {keys.flat().map((key) => {
            const isC = key === 'C';
            const isEnter = key === 'ENTER';

            return (
              <button
                key={key}
                onClick={() => {
                  if (isC) handleClear();
                  else if (!isEnter) handleDigit(key);
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
      </motion.div>
    </div>
  );
}
