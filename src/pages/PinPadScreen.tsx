import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';
import MainOrderView from '@/pages/MainOrderView';

interface PinPadScreenProps {
  isFirstTime?: boolean;
  onSuccess: () => void;
  onEmailSignIn?: () => void;
}

export default function PinPadScreen({ onSuccess }: PinPadScreenProps) {
  const [pin, setPin] = useState('');
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
    borderRadius: '6px',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    fontSize: '20px',
    height: '56px',
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
        style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full">
        {/* LEFT: Clock + Weather */}
        <div className="hidden md:flex w-[40%] flex-col justify-center pl-16 pr-8">
          <p className="text-white/70 text-base font-montserrat font-medium mb-1">{dateStr}</p>
          <div className="flex items-baseline">
            <span className="text-white font-montserrat font-black" style={{ fontSize: '6.5rem', lineHeight: 1, letterSpacing: '-2px' }}>
              {displayHours}:{displayMinutes}
            </span>
            <span className="text-white/50 font-montserrat font-bold text-3xl ml-2">{ampm}</span>
          </div>
          <div className="mt-8">
            <div className="flex items-center gap-2">
              <span className="text-white font-montserrat font-light" style={{ fontSize: '2.8rem' }}>27°</span>
              <span style={{ fontSize: '2.2rem' }}>☀️</span>
            </div>
            <p className="text-white font-montserrat font-bold text-xl mt-1">Bengaluru,</p>
            <p className="text-white font-montserrat font-bold text-xl">Karnataka</p>
          </div>
        </div>

        {/* RIGHT: PIN Panel */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-full" style={{ maxWidth: '370px' }}>

            {/* Label */}
            <p className="text-center text-sm font-montserrat font-medium mb-3" style={{ color: '#A0A0A0' }}>
              Enter PIN to Clock In
            </p>

            {/* Asterisks */}
            <div className="flex justify-center gap-4 mb-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className="font-montserrat font-black text-white select-none"
                  style={{ fontSize: '2.4rem', lineHeight: 1, opacity: i < pin.length ? 1 : 0.3 }}
                >
                  ✱
                </span>
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-[6px] mb-[6px]">
              {numKeys.map((key) => {
                if (key === 'C') {
                  return (
                    <button key={key} onClick={handleClear} style={{ ...lightKey, color: '#E84C3D' }}>
                      C
                    </button>
                  );
                }
                if (key === 'BACK') {
                  return (
                    <button key={key} onClick={() => setPin(p => p.slice(0, -1))} style={{ ...greyKey }} aria-label="Backspace">
                      <Delete className="w-5 h-5" />
                    </button>
                  );
                }
                return (
                  <button key={key} onClick={() => handleDigit(key)} style={lightKey}>
                    {key}
                  </button>
                );
              })}
            </div>

            {/* Sign in with email */}
            <button
              onClick={() => {}}
              style={{
                width: '100%',
                marginTop: '6px',
                height: '50px',
                borderRadius: '6px',
                background: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
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
