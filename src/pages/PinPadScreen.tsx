import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import MainOrderView from '@/pages/MainOrderView';

interface PinPadScreenProps {
  onSuccess: () => void;
  onFallback?: () => void;
}

export default function PinPadScreen({ onSuccess, onFallback }: PinPadScreenProps) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [qrApproved, setQrApproved] = useState(false);

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

  const handleSimulateQrApproval = useCallback(() => {
    setQrApproved(true);
    setTimeout(() => onSuccess(), 1500);
  }, [onSuccess]);

  const numKeys = ['1','2','3','4','5','6','7','8','9','C','0','BACK'];

  const keyBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '8px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
    fontSize: '32px', height: '72px', cursor: 'pointer', border: 'none', transition: 'filter 0.1s',
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
    <div className="fixed inset-0">
      {/* Blurred KDS background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <MainOrderView onNavigate={() => {}} settingsOpen={false} onCloseSettings={() => {}} onOpenSub={() => {}} onLogOut={() => {}} />
      </div>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15,15,12,0.72)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }} />

      <div className="relative z-10 flex flex-col h-full w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col h-full"
        >
          {/* Empty top area - minimal spacing */}
          <div className="pt-10" />

          {/* 2-column: QR left, PIN right */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
            {/* LEFT: QR */}
            <div className="flex flex-col items-center justify-center px-10">
              <p className="text-white font-montserrat font-semibold mb-4" style={{ fontSize: '22px' }}>Scan to Sign In</p>

              <AnimatePresence mode="wait">
                {!qrApproved ? (
                  <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                    <div className="flex items-center justify-center rounded-xl bg-white p-5 mb-6 cursor-pointer" style={{ width: '300px', height: '300px' }} onClick={handleSimulateQrApproval}>
                      <QRCodeSVG
                        value="https://kds.posai.app/auth/qr?pin-login=true"
                        size={260} level="M" fgColor="#1A1A2E" bgColor="#FFFFFF"
                      />
                    </div>
                    <div className="flex flex-col gap-[10px]" style={{ maxWidth: '340px' }}>
                      <div className="flex gap-2 items-start">
                        <span style={{ color: 'hsl(145, 63%, 42%)', fontSize: '14px', lineHeight: 1.6, flexShrink: 0 }}>●</span>
                        <p className="font-montserrat" style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: 1.6 }}>
                          Tap the link sent to your email or phone, scan this QR, then tap Approve to auto-login. No password needed.
                        </p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span style={{ color: '#95A5A6', fontSize: '14px', lineHeight: 1.6, flexShrink: 0 }}>●</span>
                        <p className="font-montserrat" style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: 1.6 }}>
                          No link? Scan directly with your phone camera. You will be asked to enter your email, password to verify.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="approved" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'hsl(145, 63%, 42%)' }}>
                      <Check className="w-8 h-8 text-white" strokeWidth={3} />
                    </div>
                    <p className="text-white font-montserrat font-bold">Signed In</p>
                    <p className="text-xs font-montserrat mt-1" style={{ color: '#6C7A89' }}>Redirecting...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Vertical divider */}
            <div className="hidden md:block absolute left-1/2 top-[100px] bottom-[60px]" style={{ width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.10)' }} />

            {/* RIGHT: PIN pad */}
            <div className="flex flex-col items-center justify-center px-10">
              <div className="w-full" style={{ maxWidth: '380px' }}>
                <p className="text-center text-base font-montserrat font-medium mb-4" style={{ color: '#A0A0A0' }}>
                  Enter your PIN
                </p>

                {/* PIN dots */}
                <motion.div
                  className="flex justify-center gap-5 mb-8"
                  animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onAnimationComplete={() => { if (shake) { setShake(false); setPin(''); } }}
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="rounded-full"
                      style={{
                        width: '20px', height: '20px',
                        border: i < pin.length ? 'none' : '2px solid rgba(255,255,255,0.3)',
                        backgroundColor: i < pin.length ? '#E84C3D' : 'transparent',
                      }}
                      animate={{ scale: i < pin.length ? [1, 1.3, 1] : 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  ))}
                </motion.div>

                {/* Number pad */}
                <div className="grid grid-cols-3 gap-[8px] mb-[8px]">
                  {numKeys.map((key) => {
                    const tapAnim = { scale: 0.92, y: 2, boxShadow: '0 0 1px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)' };
                    const hoverAnim = { scale: 1.03 };
                    const transition = { type: 'spring' as const, stiffness: 600, damping: 20, mass: 0.5 };

                    if (key === 'C') return (
                      <motion.button key={key} onClick={handleClear} style={{ ...lightKey, color: '#E84C3D' }} whileTap={tapAnim} whileHover={hoverAnim} transition={transition}>C</motion.button>
                    );
                    if (key === 'BACK') return (
                      <motion.button key={key} onClick={() => setPin(p => p.slice(0, -1))} style={greyKey} aria-label="Backspace" whileTap={tapAnim} whileHover={hoverAnim} transition={transition}>
                        <Delete className="w-5 h-5" />
                      </motion.button>
                    );
                    return (
                      <motion.button key={key} onClick={() => handleDigit(key)} style={lightKey} whileTap={tapAnim} whileHover={hoverAnim} transition={transition}>{key}</motion.button>
                    );
                  })}
                </div>

                {/* Fallback link */}
                {onFallback && (
                  <button
                    onClick={onFallback}
                    className="w-full text-center text-sm font-montserrat mt-4"
                    style={{ color: '#6C7A89', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Sign in with email or mobile instead
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
