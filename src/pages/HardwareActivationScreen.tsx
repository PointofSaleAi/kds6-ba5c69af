import { useState, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, Delete, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PosaiLogo from '@/components/PosaiLogo';
import MainOrderView from '@/pages/MainOrderView';
import ResetFlow from '@/components/kds/ResetFlow';
import { blockDemoAuthInProd } from '@/lib/demo-auth';
import { useLanguage } from '@/hooks/use-language';

interface HardwareActivationScreenProps {
  onSuccess: () => void;
}

export default function HardwareActivationScreen({ onSuccess }: HardwareActivationScreenProps) {
  const [phase, setPhase] = useState<'activate' | 'set-pin' | 'forgot-password'>('activate');
  const { tui } = useLanguage();

  // Activation state
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [qrApproved, setQrApproved] = useState(false);

  // Set PIN state
  const [pinStep, setPinStep] = useState<'set' | 'confirm'>('set');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const currentPin = pinStep === 'set' ? pin : confirmPin;
  const setCurrentPin = pinStep === 'set' ? setPin : setConfirmPin;

  // Auto-detect input type
  const isEmail = input.includes('@');
  const isPhone = /^[+\d\s()-]*$/.test(input) && input.replace(/\D/g, '').length >= 3;
  const detectedMode: 'none' | 'email' | 'phone' = isEmail ? 'email' : (input.length > 0 && isPhone) ? 'phone' : 'none';

  const handleActivationSuccess = useCallback(() => {
    if (!blockDemoAuthInProd()) return;
    setPhase('set-pin');
  }, []);

  const handleEmailSignIn = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (input && password) handleActivationSuccess();
  }, [input, password, handleActivationSuccess]);

  const handleSendOtp = useCallback(() => {
    if (input) setOtpSent(true);
  }, [input]);

  const handleVerifyOtp = useCallback(() => {
    handleActivationSuccess();
  }, [handleActivationSuccess]);

  const handleOtpDigit = (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...otpCode];
    next[index] = value;
    setOtpCode(next);
    if (value && index < 5) {
      document.getElementById(`hw-otp-${index + 1}`)?.focus();
    }
  };

  const handleSimulateQrApproval = useCallback(() => {
    if (!blockDemoAuthInProd()) return;
    setQrApproved(true);
    setTimeout(() => handleActivationSuccess(), 1500);
  }, [handleActivationSuccess]);

  const handlePinDigit = useCallback((digit: string) => {
    setPinError(false);
    setCurrentPin(prev => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      if (next.length === 4) {
        if (pinStep === 'set') {
          setTimeout(() => setPinStep('confirm'), 400);
        } else {
          setTimeout(() => {
            if (next === pin) {
              if (!blockDemoAuthInProd()) { setConfirmPin(''); return; }
              onSuccess();
            } else {
              setPinError(true);
              setConfirmPin('');
            }
          }, 400);
        }
      }
      return next;
    });
  }, [pinStep, pin, onSuccess, setCurrentPin]);

  const handlePinClear = useCallback(() => {
    setPinError(false);
    setCurrentPin('');
  }, [setCurrentPin]);

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '56px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#FFFFFF', fontSize: '15px', padding: '0 16px', outline: 'none',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%', height: '56px', borderRadius: '8px',
    background: '#212121', boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
    border: 'none', color: '#FFFFFF',
    fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '15px',
    letterSpacing: '0.5px', cursor: 'pointer',
  };

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

        {/* Logo + Title row */}
        <div className="flex items-center justify-center gap-5 pt-14 pb-4">
          <PosaiLogo variant="light" className="h-24 object-contain" />
          <div>
            <h1 className="text-white text-xl font-bold font-montserrat">
              {phase === 'activate' ? tui('Kitchen Display System') : phase === 'set-pin' ? tui('Set Your PIN') : tui('Reset password')}
            </h1>
            <p className="text-sm font-montserrat" style={{ color: '#FFFFFF' }}>
              {phase === 'set-pin'
                ? (pinStep === 'set' ? tui('Choose a 4-digit PIN for quick access') : tui('Enter the same PIN again to confirm'))
                : phase === 'forgot-password' ? tui('Reset your account password') : ''}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'activate' ? (
            <motion.div key="activate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
              {/* LEFT: QR (primary) */}
              <div className="flex flex-col items-center justify-center px-10">
                <p className="text-white font-montserrat font-semibold mb-4" style={{ fontSize: '22px' }}>{tui('Scan to Activate')}</p>

                <AnimatePresence mode="wait">
                  {!qrApproved ? (
                    <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                      <div className="flex items-center justify-center rounded-xl bg-white p-5 mb-6 cursor-pointer" style={{ width: '300px', height: '300px' }} onClick={handleSimulateQrApproval}>
                        <QRCodeSVG
                          value="https://kds.posai.app/activate?device=kds-001&token=abc123"
                          size={260} level="M" fgColor="#1A1A2E" bgColor="#FFFFFF"
                        />
                      </div>
                      <div className="flex flex-col gap-[10px]" style={{ maxWidth: '340px' }}>
                        <div className="flex gap-2 items-start">
                          <span style={{ color: 'hsl(145, 63%, 42%)', fontSize: '14px', lineHeight: 1.6, flexShrink: 0 }}>●</span>
                          <p className="font-montserrat" style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: 1.6 }}>
                            {tui('Got a link in your email or text? Tap it, then scan this code to activate instantly.')}
                          </p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <span style={{ color: '#95A5A6', fontSize: '14px', lineHeight: 1.6, flexShrink: 0 }}>●</span>
                          <p className="font-montserrat" style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: 1.6 }}>
                            {tui('No link? Scan with your mobile camera and enter your email and password.')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="approved" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-8">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'hsl(145, 63%, 42%)' }}>
                        <Check className="w-8 h-8 text-white" strokeWidth={3} />
                      </div>
                      <p className="text-white font-montserrat font-bold">{tui('Device Approved')}</p>
                      <p className="text-xs font-montserrat mt-1" style={{ color: '#6C7A89' }}>{tui('Redirecting...')}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Or divider */}
              <div className="hidden md:flex absolute left-1/2 top-[180px] bottom-[60px] -translate-x-1/2 flex-col items-center justify-center">
                <div className="flex-1 max-h-[80px]" style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.10)' }} />
                <span className="text-white/50 font-montserrat font-semibold text-sm py-3">{tui('Or')}</span>
                <div className="flex-1 max-h-[80px]" style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.10)' }} />
              </div>

              {/* RIGHT: Smart sign-in */}
              <div className="flex flex-col justify-center px-10">
                <p className="text-white font-montserrat font-semibold mb-1" style={{ fontSize: '24px' }}>{tui('Activate')}</p>
                <p className="font-montserrat mb-5" style={{ color: '#FFFFFF', fontSize: '16px' }}>
                  {tui('Enter your email or mobile number to activate')}
                </p>

                <form onSubmit={detectedMode === 'email' ? handleEmailSignIn : (e) => { e.preventDefault(); handleSendOtp(); }} className="flex flex-col gap-4">
                  <div>
                    <label className="block font-montserrat font-medium mb-1.5" style={{ color: '#FFFFFF', fontSize: '15px' }}>{tui('Email or Mobile Number')}</label>
                    <input
                      type="text" value={input} onChange={(e) => setInput(e.target.value)}
                      placeholder={tui('Enter Your Email or Mobile Number')}
                      className="font-montserrat" style={inputStyle}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {detectedMode === 'email' && (
                      <motion.div key="pw" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4">
                        <div>
                          <label className="block font-montserrat font-medium text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{tui('Password')}</label>
                          <div style={{ position: 'relative' }}>
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={tui('Enter Password')} className="font-montserrat" style={{ ...inputStyle, paddingRight: '48px' }} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <button type="submit" style={btnStyle}>{tui('ACTIVATE')}</button>
                        <button type="button" onClick={() => setPhase('forgot-password')} className="text-sm font-montserrat text-center" style={{ color: '#FFFFFF', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                          {tui('Forgot password?')}
                        </button>
                      </motion.div>
                    )}

                    {detectedMode === 'phone' && !otpSent && (
                      <motion.div key="phone" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4">
                        <button type="submit" style={btnStyle}>{tui('SEND OTP')}</button>
                      </motion.div>
                    )}

                    {detectedMode === 'phone' && otpSent && (
                      <motion.div key="otp-verify" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4">
                        <p className="text-xs font-montserrat" style={{ color: '#95A5A6' }}>{tui('Enter the 6-digit code sent to your phone')}</p>
                        <div className="flex justify-center gap-2">
                          {otpCode.map((d, i) => (
                            <input key={i} id={`hw-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d} onChange={(e) => handleOtpDigit(i, e.target.value)}
                              className="w-[44px] h-[44px] text-center text-lg font-bold rounded-lg font-montserrat"
                              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', outline: 'none' }}
                            />
                          ))}
                        </div>
                        <button type="button" onClick={handleVerifyOtp} style={btnStyle}>{tui('VERIFY')}</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          ) : (
            /* SET PIN phase - replaces activation content */
            <motion.div key="set-pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center">
              <div className="w-full" style={{ maxWidth: '380px' }}>
                <button
                  onClick={() => { setPhase('activate'); setQrApproved(false); setPin(''); setConfirmPin(''); setPinStep('set'); setPinError(false); }}
                  className="flex items-center gap-2 font-montserrat font-semibold text-sm mb-6"
                  style={{ color: '#FFFFFF', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {tui('Back')}
                </button>
                {pinError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-montserrat font-semibold mb-4 text-center" style={{ color: '#E84C3D' }}>
                    {tui('PINs do not match. Try again.')}
                  </motion.p>
                )}

                <p className="text-center text-base font-montserrat font-medium mb-4" style={{ color: '#A0A0A0' }}>
                  {pinStep === 'set' ? tui('Enter a 4-digit PIN') : tui('Confirm your PIN')}
                </p>

                {/* PIN asterisks */}
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

                {/* Number pad */}
                <div className="grid grid-cols-3 gap-[8px] mb-[8px]">
                  {numKeys.map((key) => {
                    const tapAnim = { scale: 0.92, y: 2, boxShadow: '0 0 1px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)' };
                    const hoverAnim = { scale: 1.03 };
                    const transition = { type: 'spring' as const, stiffness: 600, damping: 20, mass: 0.5 };

                    if (key === 'C') return (
                      <motion.button key={key} onClick={handlePinClear} style={{ ...lightKey, color: '#E84C3D' }} whileTap={tapAnim} whileHover={hoverAnim} transition={transition}>C</motion.button>
                    );
                    if (key === 'BACK') return (
                      <motion.button key={key} onClick={() => setCurrentPin(p => p.slice(0, -1))} style={greyKey} aria-label={tui('Backspace')} whileTap={tapAnim} whileHover={hoverAnim} transition={transition}>
                        <Delete className="w-5 h-5" />
                      </motion.button>
                    );
                    return (
                      <motion.button key={key} onClick={() => handlePinDigit(key)} style={lightKey} whileTap={tapAnim} whileHover={hoverAnim} transition={transition}>{key}</motion.button>
                    );
                  })}
                </div>

                {/* Step indicator */}
                <div className="flex justify-center gap-2 mt-6">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFFFFF' }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pinStep === 'confirm' ? '#FFFFFF' : 'rgba(255,255,255,0.3)' }} />
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'forgot-password' && (
            <motion.div key="forgot-pw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center">
              <ResetFlow type="password" onBack={() => setPhase('activate')} onComplete={() => setPhase('activate')} />
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
      </div>
    </div>
  );
}
