import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';
import PosaiLogo from '@/components/PosaiLogo';
import { useLanguage } from '@/hooks/use-language';

interface SetPinScreenProps {
  onComplete: () => void;
}

export default function SetPinScreen({ onComplete }: SetPinScreenProps) {
  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const { tui } = useLanguage();

  const currentPin = step === 'set' ? pin : confirmPin;
  const setCurrentPin = step === 'set' ? setPin : setConfirmPin;

  const handleDigit = useCallback((digit: string) => {
    setError(false);
    setCurrentPin(prev => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      if (next.length === 4) {
        if (step === 'set') {
          setTimeout(() => setStep('confirm'), 400);
        } else {
          // Confirm step
          setTimeout(() => {
            if (next === pin) {
              onComplete();
            } else {
              setError(true);
              setConfirmPin('');
            }
          }, 400);
        }
      }
      return next;
    });
  }, [step, pin, onComplete, setCurrentPin]);

  const handleClear = useCallback(() => {
    setError(false);
    setCurrentPin('');
  }, [setCurrentPin]);

  const numKeys = ['1','2','3','4','5','6','7','8','9','C','0','BACK'];

  const keyBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '8px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
    fontSize: '24px', height: '72px', cursor: 'pointer', border: 'none', transition: 'filter 0.1s',
  };
  const lightKey: React.CSSProperties = {
    ...keyBase, background: 'linear-gradient(180deg, #ECECEC 0%, #D4D4D4 100%)',
    boxShadow: '0 2px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.7)', color: '#1A1A2E',
  };
  const greyKey: React.CSSProperties = {
    ...keyBase, background: 'linear-gradient(180deg, #8C8C8C 0%, #6E6E6E 100%)',
    boxShadow: '0 2px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)', color: '#FFFFFF',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#0D0D1A' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px] px-6 flex flex-col items-center">
        <PosaiLogo variant="light" className="h-20 object-contain mb-4" />
        <h1 className="text-white text-xl font-bold font-montserrat mb-1">
          {step === 'set' ? tui('Set Your PIN') : tui('Confirm Your PIN')}
        </h1>
        <p className="text-sm font-montserrat mb-6" style={{ color: '#6C7A89' }}>
          {step === 'set' ? tui('Choose a 4-digit PIN for quick access') : tui('Enter the same PIN again to confirm')}
        </p>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-montserrat font-semibold mb-4" style={{ color: '#E84C3D' }}>
            {tui('PINs do not match. Try again.')}
          </motion.p>
        )}

        {/* PIN dots */}
        <div className="flex justify-center gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.span
              key={i}
              className="font-montserrat font-black text-white select-none"
              style={{ fontSize: '4.5rem', lineHeight: 1 }}
              animate={{ opacity: i < currentPin.length ? 1 : 0.3, scale: i < currentPin.length ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              ✱
            </motion.span>
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-[8px] w-full">
          {numKeys.map((key) => {
            const tapAnim = { scale: 0.92, y: 2 };
            if (key === 'C') return (
              <motion.button key={key} onClick={handleClear} style={{ ...lightKey, color: '#E84C3D' }} whileTap={tapAnim}>C</motion.button>
            );
            if (key === 'BACK') return (
              <motion.button key={key} onClick={() => setCurrentPin(p => p.slice(0, -1))} style={greyKey} whileTap={tapAnim} aria-label={tui('Backspace')}>
                <Delete className="w-5 h-5" />
              </motion.button>
            );
            return (
              <motion.button key={key} onClick={() => handleDigit(key)} style={lightKey} whileTap={tapAnim}>{key}</motion.button>
            );
          })}
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mt-6">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFFFFF' }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: step === 'confirm' ? '#FFFFFF' : 'rgba(255,255,255,0.3)' }} />
        </div>
      </motion.div>
    </div>
  );
}
