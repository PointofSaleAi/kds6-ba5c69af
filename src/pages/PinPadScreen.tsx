import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Check, QrCode } from 'lucide-react';

interface PinPadScreenProps {
  isFirstTime?: boolean;
  onSuccess: () => void;
  onEmailSignIn?: () => void;
}

type SetupPhase = 'detecting' | 'set-pin' | 'confirm-pin' | 'success' | 'ready';
type DetectStep = 0 | 1 | 2;

export default function PinPadScreen({ isFirstTime = false, onSuccess, onEmailSignIn }: PinPadScreenProps) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [activeTab, setActiveTab] = useState<'pin' | 'qr'>('pin');
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  // First-time setup
  const [setupPhase, setSetupPhase] = useState<SetupPhase>(isFirstTime ? 'detecting' : 'ready');
  const [detectStep, setDetectStep] = useState<DetectStep>(0);
  const [firstPin, setFirstPin] = useState('');

  // Clock
  const [now, setNow] = useState(new Date());

  // QR countdown
  const [qrSeconds, setQrSeconds] = useState(300);

  const pinRef = useRef(pin);
  pinRef.current = pin;

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // QR countdown
  useEffect(() => {
    if (activeTab !== 'qr') return;
    const t = setInterval(() => {
      setQrSeconds(s => (s <= 1 ? 300 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [activeTab]);

  // First-time auto-detection sequence
  useEffect(() => {
    if (!isFirstTime) return;
    const t1 = setTimeout(() => setDetectStep(1), 800);
    const t2 = setTimeout(() => setDetectStep(2), 1600);
    const t3 = setTimeout(() => setSetupPhase('set-pin'), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isFirstTime]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => { setShake(false); setPin(''); }, 500);
  }, []);

  const handleDigit = useCallback((digit: string) => {
    if (locked) return;
    setPin(prev => {
      if (prev.length >= 4) return prev;
      const newPin = prev + digit;

      if (newPin.length === 4) {
        // Auto-submit on 4th digit
        setTimeout(() => {
          if (setupPhase === 'set-pin') {
            setFirstPin(newPin);
            setPin('');
            setSetupPhase('confirm-pin');
          } else if (setupPhase === 'confirm-pin') {
            if (newPin === firstPin) {
              setSetupPhase('success');
              setTimeout(() => onSuccess(), 1500);
            } else {
              triggerShake();
              setSetupPhase('set-pin');
              setFirstPin('');
            }
          } else {
            // Normal login - TODO: replace with API validation
            // For now, accept any 4-digit PIN
            setTimeout(() => onSuccess(), 300);
          }
        }, 200);
      }

      return newPin;
    });
  }, [locked, setupPhase, firstPin, onSuccess, triggerShake]);

  const handleClear = useCallback(() => {
    setPin('');
  }, []);

  const handleBackspace = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
  }, []);

  // Format time
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // QR timer format
  const qrMin = Math.floor(qrSeconds / 60);
  const qrSec = (qrSeconds % 60).toString().padStart(2, '0');

  const getLabel = () => {
    if (setupPhase === 'set-pin') return 'Set your PIN';
    if (setupPhase === 'confirm-pin') return 'Confirm your PIN';
    return 'Enter your PIN';
  };

  const detectMessages: Record<DetectStep, { text: string; color: string }> = {
    0: { text: 'Connecting...', color: '#95A5A6' },
    1: { text: 'Detecting device...', color: '#95A5A6' },
    2: { text: '✓ Ready', color: '#2ECC71' },
  };

  const padKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'back'];

  return (
    <div className="fixed inset-0 flex" style={{ backgroundColor: '#0D0D1A' }}>
      {/* Left panel - Clock & Weather */}
      <div className="hidden md:flex w-[45%] flex-col justify-center px-12 lg:px-16">
        <p className="text-white/80 text-lg font-montserrat font-medium mb-2">{dateStr}</p>
        <div className="flex items-baseline">
          <span className="text-white font-montserrat font-black" style={{ fontSize: '7rem', lineHeight: 1 }}>
            {displayHours}:{displayMinutes}
          </span>
          <span className="text-white/60 font-montserrat font-bold text-3xl ml-2">{ampm}</span>
        </div>

        {/* Weather */}
        <div className="mt-8">
          <div className="flex items-center gap-3">
            <span className="text-white font-montserrat font-light" style={{ fontSize: '3rem' }}>27°</span>
            <span style={{ fontSize: '2.5rem' }}>☀️</span>
          </div>
          <p className="text-white font-montserrat font-bold text-2xl mt-1">Bengaluru,</p>
          <p className="text-white font-montserrat font-bold text-2xl">Karnataka</p>
        </div>
      </div>

      {/* Right panel - PIN Pad */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[380px]">
          {/* Auto-detection state */}
          {setupPhase === 'detecting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={detectStep}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-sm font-montserrat font-medium"
                  style={{ color: detectMessages[detectStep].color }}
                >
                  {detectMessages[detectStep].text}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Success state */}
          {setupPhase === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#2ECC71' }}>
                <Check className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-montserrat font-bold text-lg">PIN saved</p>
            </motion.div>
          )}

          {/* Main PIN/QR content */}
          {setupPhase !== 'detecting' && setupPhase !== 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tabs */}
              <div className="flex justify-center gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('pin')}
                  className="px-4 py-1.5 rounded-full text-xs font-montserrat font-semibold transition-all"
                  style={{
                    backgroundColor: activeTab === 'pin' ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: activeTab === 'pin' ? '#FFFFFF' : '#6C7A89',
                    border: activeTab === 'pin' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  }}
                >
                  Enter PIN
                </button>
                <button
                  onClick={() => { setActiveTab('qr'); setQrSeconds(300); }}
                  className="px-4 py-1.5 rounded-full text-xs font-montserrat font-semibold transition-all"
                  style={{
                    backgroundColor: activeTab === 'qr' ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: activeTab === 'qr' ? '#FFFFFF' : '#6C7A89',
                    border: activeTab === 'qr' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  }}
                >
                  Scan QR
                </button>
              </div>

              {activeTab === 'pin' ? (
                <>
                  {/* Label */}
                  <p className="text-center text-sm font-montserrat font-medium mb-4" style={{ color: '#95A5A6' }}>
                    {getLabel()}
                  </p>

                  {/* PIN dots */}
                  <div className={`flex justify-center gap-4 mb-6 ${shake ? 'animate-shake' : ''}`}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full transition-all duration-200"
                        style={{
                          backgroundColor: i < pin.length ? '#E84C3D' : 'transparent',
                          border: i < pin.length ? '2px solid #E84C3D' : '2px solid rgba(255,255,255,0.3)',
                        }}
                      />
                    ))}
                  </div>

                  {/* Locked state */}
                  {locked && (
                    <p className="text-center text-sm font-montserrat font-medium mb-4" style={{ color: '#E84C3D' }}>
                      Too many attempts. Please sign in with email.
                    </p>
                  )}

                  {/* Number pad */}
                  <div className="grid grid-cols-3 gap-2">
                    {padKeys.map((key, i) => {
                      if (key === 'C') {
                        return (
                          <button
                            key={i}
                            onClick={handleClear}
                            disabled={locked}
                            className="flex items-center justify-center rounded-lg font-montserrat font-bold text-xl transition-all active:scale-95 disabled:opacity-30"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              color: '#E84C3D',
                              minHeight: '60px',
                            }}
                          >
                            C
                          </button>
                        );
                      }
                      if (key === 'back') {
                        return (
                          <button
                            key={i}
                            onClick={handleBackspace}
                            disabled={locked}
                            className="flex items-center justify-center rounded-lg font-montserrat transition-all active:scale-95 disabled:opacity-30"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.12)',
                              minHeight: '60px',
                            }}
                            aria-label="Backspace"
                          >
                            <Delete className="w-5 h-5" style={{ color: '#95A5A6' }} />
                          </button>
                        );
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => handleDigit(key)}
                          disabled={locked}
                          className="flex items-center justify-center rounded-lg font-montserrat font-bold text-xl transition-all active:scale-95 disabled:opacity-30"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: '#1A1A2E',
                            minHeight: '60px',
                          }}
                        >
                          {key}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* QR Tab */
                <div className="flex flex-col items-center py-4">
                  <p className="text-sm font-montserrat font-medium mb-6" style={{ color: '#95A5A6' }}>
                    Open your phone camera and scan this code
                  </p>

                  {/* QR Code placeholder */}
                  <div
                    className="w-48 h-48 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <QrCode className="w-32 h-32" style={{ color: '#1A1A2E' }} />
                  </div>

                  <p className="text-xs font-montserrat" style={{ color: '#6C7A89' }}>
                    Refreshes in {qrMin}:{qrSec}
                  </p>

                  <button
                    className="mt-4 text-xs font-montserrat underline transition-colors hover:text-white"
                    style={{ color: '#6C7A89' }}
                  >
                    Send link to my email or phone instead
                  </button>
                </div>
              )}

              {/* Email sign-in link */}
              <button
                onClick={onEmailSignIn}
                className={`w-full mt-6 text-center text-xs font-montserrat underline transition-colors hover:text-white ${locked ? 'text-base font-semibold' : ''}`}
                style={{ color: locked ? '#E84C3D' : '#6C7A89' }}
              >
                Sign in with email instead
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
