import { useState, useEffect, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import MainOrderView from '@/pages/MainOrderView';

interface PinPadScreenProps {
  isFirstTime?: boolean;
  onSuccess: () => void;
  onEmailSignIn?: () => void;
}

export default function PinPadScreen({ onSuccess }: PinPadScreenProps) {
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'pin' | 'qr'>('pin');
  const [view, setView] = useState<'main' | 'email'>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleDigit = useCallback((digit: string) => {
    setPin(prev => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      if (next.length === 4) {
        setTimeout(() => onSuccess(), 400);
      }
      return next;
    });
  }, [onSuccess]);

  const handleClear = useCallback(() => setPin(''), []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const numKeys = ['1','2','3','4','5','6','7','8','9','C','0','BACK'];

  // Shared button base
  const keyBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    fontSize: '24px',
    height: '72px',
    cursor: 'pointer',
    border: 'none',
    transition: 'filter 0.1s',
  };

  const lightKey: React.CSSProperties = {
    ...keyBase,
    background: 'linear-gradient(180deg, #ECECEC 0%, #D4D4D4 100%)',
    boxShadow: '0 2px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.7)',
    color: '#1A1A2E',
  };

  const greyKey: React.CSSProperties = {
    ...keyBase,
    background: 'linear-gradient(180deg, #8C8C8C 0%, #6E6E6E 100%)',
    boxShadow: '0 2px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
    color: '#FFFFFF',
  };

  return (
    <div className="fixed inset-0">
      {/* Blurred KDS background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <MainOrderView
          onNavigate={() => {}}
          settingsOpen={false}
          onCloseSettings={() => {}}
          onOpenSub={() => {}}
          onLogOut={() => {}}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(15,15,12,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full">
        {/* LEFT: Clock + Weather */}
        <div className="hidden md:flex w-[40%] flex-col justify-center pl-20 pr-8">
          <p className="text-white/70 text-lg font-montserrat font-medium mb-2">{dateStr}</p>
          <div className="flex items-baseline">
            <span className="text-white font-montserrat font-black" style={{ fontSize: '8rem', lineHeight: 1, letterSpacing: '-4px' }}>
              {displayHours}:{displayMinutes}
            </span>
            <span className="text-white/50 font-montserrat font-bold text-5xl ml-3">{ampm}</span>
          </div>
          <div className="mt-10">
            <div className="flex items-center gap-3">
              <span className="text-white font-montserrat font-light" style={{ fontSize: '3.5rem' }}>27°</span>
              <span style={{ fontSize: '2.8rem' }}>☀️</span>
            </div>
            <p className="text-white font-montserrat font-bold text-2xl mt-2">Bengaluru,</p>
            <p className="text-white font-montserrat font-bold text-2xl">Karnataka</p>
          </div>
        </div>

        {/* RIGHT: PIN Panel */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full" style={{ maxWidth: '480px' }}>

            {/* Tab Switcher */}
            <div className="flex mb-6" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
              {(['pin', 'qr'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 font-montserrat font-bold text-sm py-3 transition-colors duration-200"
                  style={{
                    background: activeTab === tab
                      ? 'linear-gradient(180deg, #3A3A3A 0%, #2A2A2A 100%)'
                      : 'transparent',
                    color: activeTab === tab ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.5px',
                  }}
                >
                  {tab === 'pin' ? 'PIN' : 'QR CODE'}
                </button>
              ))}
            </div>

            <div style={{ minHeight: '420px' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'pin' ? (
                <motion.div
                  key="pin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Label */}
                  <p className="text-center text-base font-montserrat font-medium mb-4" style={{ color: '#A0A0A0' }}>
                    Enter your PIN to Sign In
                  </p>

                  {/* Asterisks */}
                  <div className="flex justify-center gap-6 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="font-montserrat font-black text-white select-none"
                        style={{ fontSize: '4.5rem', lineHeight: 1 }}
                        animate={{
                          opacity: i < pin.length ? 1 : 0.3,
                          scale: i < pin.length ? [1, 1.3, 1] : 1,
                        }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        ✱
                      </motion.span>
                    ))}
                  </div>

                  {/* Keypad */}
                  <div className="grid grid-cols-3 gap-[8px] mb-[8px]">
                    {numKeys.map((key) => {
                      const tapAnim = { scale: 0.92, y: 2, boxShadow: '0 0 1px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)' };
                      const hoverAnim = { scale: 1.03 };
                      const transition = { type: 'spring' as const, stiffness: 600, damping: 20, mass: 0.5 };

                      if (key === 'C') {
                        return (
                          <motion.button
                            key={key}
                            onClick={handleClear}
                            style={{ ...lightKey, color: '#E84C3D' }}
                            whileTap={tapAnim}
                            whileHover={hoverAnim}
                            transition={transition}
                          >
                            C
                          </motion.button>
                        );
                      }
                      if (key === 'BACK') {
                        return (
                          <motion.button
                            key={key}
                            onClick={() => setPin(p => p.slice(0, -1))}
                            style={{ ...greyKey }}
                            aria-label="Backspace"
                            whileTap={tapAnim}
                            whileHover={hoverAnim}
                            transition={transition}
                          >
                            <Delete className="w-5 h-5" />
                          </motion.button>
                        );
                      }
                      return (
                        <motion.button
                          key={key}
                          onClick={() => handleDigit(key)}
                          style={lightKey}
                          whileTap={tapAnim}
                          whileHover={hoverAnim}
                          transition={transition}
                        >
                          {key}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-center text-base font-montserrat font-medium mb-6" style={{ color: '#A0A0A0' }}>
                    Scan QR code to sign in
                  </p>

                  {/* QR Code */}
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '280px',
                      height: '280px',
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      padding: '20px',
                      marginBottom: '24px',
                    }}
                  >
                    <QRCodeSVG
                      value="https://kds.posai.app/auth/qr?device=kds-001&ts=1711900000"
                      size={240}
                      level="M"
                      fgColor="#1A1A2E"
                      bgColor="#FFFFFF"
                    />
                  </div>

                  <p className="text-center text-sm font-montserrat" style={{ color: '#B0B8C1', maxWidth: '320px' }}>
                    Open the POS AI app on your phone and scan this code to sign in instantly
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            </div>

            {/* Sign in with email */}
            <button
              onClick={() => {}}
              style={{
                width: '100%',
                marginTop: '10px',
                height: '60px',
                borderRadius: '8px',
                background: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                letterSpacing: '0.5px',
                cursor: 'pointer',
              }}
            >
              Sign in with email
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
