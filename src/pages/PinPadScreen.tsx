import { useState, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Check, Eye, EyeOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PosaiLogo from '@/components/PosaiLogo';
import MainOrderView from '@/pages/MainOrderView';
import ResetFlow from '@/components/kds/ResetFlow';
import { blockDemoAuthInProd } from '@/lib/demo-auth';
import { useActiveIdentity } from '@/hooks/use-active-identity';
import { useLanguage } from '@/hooks/use-language';

interface PinPadScreenProps {
  onSuccess: () => void;
  onFallback?: () => void;
  context?: 'login' | 'staff-switch';
  onCancel?: () => void;
}

export default function PinPadScreen({ onSuccess, onFallback, context = 'login', onCancel }: PinPadScreenProps) {
  const { identity, signInWithPin, signInAsRestaurant } = useActiveIdentity();
  const { tui } = useLanguage();
  const currentLabel = identity.kind === 'restaurant' ? identity.name : identity.name;
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [qrApproved, setQrApproved] = useState(false);
  const [rightMode, setRightMode] = useState<'pin' | 'signin' | 'forgot-pin' | 'forgot-password'>('pin');

  // Sign-in form state
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);


  const isEmail = input.includes('@');
  const isPhone = /^[+\d\s()-]*$/.test(input) && input.replace(/\D/g, '').length >= 3;
  const detectedMode: 'none' | 'email' | 'phone' = isEmail ? 'email' : (input.length > 0 && isPhone) ? 'phone' : 'none';

  const handleDigit = useCallback((digit: string) => {
    setPin(prev => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      if (next.length === 4) {
        setTimeout(() => {
          if (!blockDemoAuthInProd()) { setPin(''); return; }
          signInWithPin(next);
          onSuccess();
        }, 400);
      }
      return next;
    });
  }, [onSuccess, signInWithPin]);

  const handleClear = useCallback(() => setPin(''), []);

  const handleSimulateQrApproval = useCallback(() => {
    if (!blockDemoAuthInProd()) return;
    setQrApproved(true);
    signInAsRestaurant();
    setTimeout(() => onSuccess(), 1500);
  }, [onSuccess, signInAsRestaurant]);

  const handleEmailSignIn = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (input && password && blockDemoAuthInProd()) { signInAsRestaurant(); onSuccess(); }
  }, [input, password, onSuccess, signInAsRestaurant]);

  const handleSendOtp = useCallback(() => {
    if (input) setOtpSent(true);
  }, [input]);

  const handleVerifyOtp = useCallback(() => {
    if (!blockDemoAuthInProd()) return;
    signInAsRestaurant();
    onSuccess();
  }, [onSuccess, signInAsRestaurant]);

  const handleOtpDigit = (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...otpCode];
    next[index] = value;
    setOtpCode(next);
    if (value && index < 5) {
      document.getElementById(`pin-otp-${index + 1}`)?.focus();
    }
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

  const linkStyle: React.CSSProperties = {
    color: '#FFFFFF', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
  };

  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <MainOrderView onNavigate={() => {}} settingsOpen={false} onCloseSettings={() => {}} onOpenSub={() => {}} onLogOut={() => {}} />
      </div>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(15,15,12,0.72)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }} />

      <div className="relative z-10 flex flex-col h-full w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full">
          <div className="flex items-center justify-center gap-5 pt-14 pb-1">
            <PosaiLogo variant="light" className="h-24 object-contain" />
            <h1 className="text-white text-xl font-bold font-montserrat">{tui('Kitchen Display System')}</h1>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
            {/* LEFT: QR */}
            <div className="flex flex-col items-center justify-center px-10">
              <p className="text-white font-montserrat font-semibold mb-4" style={{ fontSize: '22px' }}>{tui('Scan to Sign In')}</p>
              <AnimatePresence mode="wait">
                {!qrApproved ? (
                  <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                    <div className="flex items-center justify-center rounded-xl bg-white p-5 mb-6 cursor-pointer" style={{ width: '300px', height: '300px' }} onClick={handleSimulateQrApproval}>
                      <QRCodeSVG value="https://kds.posai.app/auth/qr?pin-login=true" size={260} level="M" fgColor="#1A1A2E" bgColor="#FFFFFF" />
                    </div>
                    <div style={{ maxWidth: '340px' }}>
                      <p className="font-montserrat" style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: 1.6 }}>
                        {tui('Scan with your phone camera to sign in.')}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="approved" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'hsl(145, 63%, 42%)' }}>
                      <Check className="w-8 h-8 text-white" strokeWidth={3} />
                    </div>
                    <p className="text-white font-montserrat font-bold">{tui('Signed In')}</p>
                    <p className="text-xs font-montserrat mt-1" style={{ color: '#6C7A89' }}>{tui('Redirecting...')}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Or divider */}
            <div className="hidden md:flex absolute left-1/2 top-[100px] bottom-[60px] -translate-x-1/2 flex-col items-center justify-center">
              <div className="flex-1 max-h-[80px]" style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.10)' }} />
              <span className="text-white/50 font-montserrat font-semibold text-sm py-3">{tui('Or')}</span>
              <div className="flex-1 max-h-[80px]" style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.10)' }} />
            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-center justify-center px-10">
              <AnimatePresence mode="wait">
                {rightMode === 'pin' && (
                  <motion.div key="pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full" style={{ maxWidth: '380px' }}>
                    {context === 'staff-switch' && (
                      <p className="text-center font-montserrat mb-2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                        {tui('Currently signed in as: ')}<span style={{ color: '#FFFFFF', fontWeight: 600 }}>{currentLabel}</span>
                      </p>
                    )}
                    <p className="text-center text-base font-montserrat font-medium mb-4" style={{ color: '#A0A0A0' }}>
                      {tui('Enter your PIN')}
                    </p>

                    <motion.div
                      className="flex justify-center gap-5 mb-8"
                      animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      onAnimationComplete={() => { if (shake) { setShake(false); setPin(''); } }}
                    >
                      {Array.from({ length: 4 }).map((_, i) => (
                        <motion.span
                          key={i}
                          className="font-montserrat font-black text-white select-none"
                          style={{ fontSize: '4.5rem', lineHeight: 1 }}
                          animate={{ opacity: i < pin.length ? 1 : 0.3, scale: i < pin.length ? [1, 1.3, 1] : 1 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                          ✱
                        </motion.span>
                      ))}
                    </motion.div>

                    <div className="grid grid-cols-3 gap-[8px] mb-[8px]">
                      {numKeys.map((key) => {
                        const tapAnim = { scale: 0.92, y: 2, boxShadow: '0 0 1px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)' };
                        const hoverAnim = { scale: 1.03 };
                        const transition = { type: 'spring' as const, stiffness: 600, damping: 20, mass: 0.5 };

                        if (key === 'C') return (
                          <motion.button key={key} onClick={handleClear} style={{ ...lightKey, color: '#E84C3D' }} whileTap={tapAnim} whileHover={hoverAnim} transition={transition}>C</motion.button>
                        );
                        if (key === 'BACK') return (
                          <motion.button key={key} onClick={() => setPin(p => p.slice(0, -1))} style={greyKey} aria-label={tui('Backspace')} whileTap={tapAnim} whileHover={hoverAnim} transition={transition}>
                            <Delete className="w-5 h-5" />
                          </motion.button>
                        );
                        return (
                          <motion.button key={key} onClick={() => handleDigit(key)} style={lightKey} whileTap={tapAnim} whileHover={hoverAnim} transition={transition}>{key}</motion.button>
                        );
                      })}
                    </div>

                    <div className="flex justify-between mt-4">
                      <button onClick={() => setRightMode('forgot-pin')} className="text-sm font-montserrat" style={linkStyle}>
                        {tui('Forgot PIN?')}
                      </button>
                      <button onClick={() => setRightMode('signin')} className="text-sm font-montserrat" style={linkStyle}>
                        {tui('Sign in with email or mobile')}
                      </button>
                    </div>
                    {context === 'staff-switch' && onCancel && (
                      <div className="flex justify-center mt-3">
                        <button onClick={onCancel} className="text-sm font-montserrat" style={{ ...linkStyle, opacity: 0.75 }}>
                          {tui('Cancel')}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {rightMode === 'signin' && (
                  <motion.div key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full" style={{ maxWidth: '380px' }}>
                    <p className="text-white font-montserrat font-semibold mb-1" style={{ fontSize: '24px' }}>{tui('Sign In')}</p>
                    <p className="font-montserrat mb-5" style={{ color: '#FFFFFF', fontSize: '16px' }}>
                      {tui('Enter your email or mobile number')}
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
                              <div className="flex justify-end mt-1.5">
                                <button type="button" onClick={() => setRightMode('forgot-password')} className="text-xs font-montserrat" style={linkStyle}>
                                  {tui('Forgot password?')}
                                </button>
                              </div>
                            </div>
                            <button type="submit" style={btnStyle}>{tui('SIGN IN')}</button>
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
                                <input key={i} id={`pin-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d} onChange={(e) => handleOtpDigit(i, e.target.value)}
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

                    <button
                      onClick={() => { setRightMode('pin'); setInput(''); setPassword(''); setOtpSent(false); }}
                      className="w-full text-center text-sm font-montserrat mt-4"
                      style={linkStyle}
                    >
                      {tui('Sign in with PIN instead')}
                    </button>
                  </motion.div>
                )}

                {rightMode === 'forgot-pin' && (
                  <ResetFlow type="pin" onBack={() => setRightMode('pin')} onComplete={() => setRightMode('pin')} />
                )}

                {rightMode === 'forgot-password' && (
                  <ResetFlow type="password" onBack={() => setRightMode('signin')} onComplete={() => setRightMode('signin')} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}