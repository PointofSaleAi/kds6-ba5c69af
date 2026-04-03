import { useState, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import posaiLogo from '@/assets/posai-logo-white.png';
import MainOrderView from '@/pages/MainOrderView';

interface HardwareActivationScreenProps {
  onSuccess: () => void;
}

export default function HardwareActivationScreen({ onSuccess }: HardwareActivationScreenProps) {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [qrApproved, setQrApproved] = useState(false);

  // Auto-detect input type
  const isEmail = input.includes('@');
  const isPhone = /^[+\d\s()-]*$/.test(input) && input.replace(/\D/g, '').length >= 3;
  const detectedMode: 'none' | 'email' | 'phone' = isEmail ? 'email' : (input.length > 0 && isPhone) ? 'phone' : 'none';

  const handleEmailSignIn = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (input && password) onSuccess();
  }, [input, password, onSuccess]);

  const handleSendOtp = useCallback(() => {
    if (input || phone) setOtpSent(true);
  }, [input, phone]);

  const handleVerifyOtp = useCallback(() => {
    onSuccess();
  }, [onSuccess]);

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
    setQrApproved(true);
    setTimeout(() => onSuccess(), 1500);
  }, [onSuccess]);

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '56px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#FFFFFF', fontSize: '15px', padding: '0 16px', outline: 'none',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%', height: '56px', borderRadius: '8px',
    background: '#212121',
    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
    border: 'none', color: '#FFFFFF',
    fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '15px',
    letterSpacing: '0.5px', cursor: 'pointer',
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
          <img src={posaiLogo} alt="POS ai" className="h-14 object-contain" />
          <div>
            <h1 className="text-white text-xl font-bold font-montserrat">KDS Activation</h1>
            <p className="text-sm font-montserrat" style={{ color: '#FFFFFF' }}>
              Activate this KDS device to get started
            </p>
          </div>
        </div>

        {/* 2-column: QR left, Login right — full remaining height */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
          {/* LEFT: QR (primary) */}
          <div className="flex flex-col items-center justify-center px-10">
            <p className="text-white font-montserrat font-semibold mb-4" style={{ fontSize: '22px' }}>Scan to Activate</p>

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
                  <p className="text-white font-montserrat font-bold">Device Approved</p>
                  <p className="text-xs font-montserrat mt-1" style={{ color: '#6C7A89' }}>Redirecting...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block absolute left-1/2 top-[180px] bottom-[60px]" style={{ width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.10)' }} />

          {/* RIGHT: Smart sign-in */}
          <div className="flex flex-col justify-center px-10">
            <p className="text-white font-montserrat font-semibold mb-1" style={{ fontSize: '24px' }}>Sign In</p>
            <p className="font-montserrat mb-5" style={{ color: '#FFFFFF', fontSize: '16px' }}>
              Enter your email or mobile number to activate
            </p>

            <form onSubmit={detectedMode === 'email' ? handleEmailSignIn : (e) => { e.preventDefault(); handleSendOtp(); }} className="flex flex-col gap-4">
              {/* Smart input */}
              <div>
                <label className="block font-montserrat font-medium mb-1.5" style={{ color: '#FFFFFF', fontSize: '15px' }}>Email or mobile number</label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your email or mobile number"
                  className="font-montserrat"
                  style={inputStyle}
                />
              </div>

              <AnimatePresence mode="wait">
                {detectedMode === 'email' && (
                  <motion.div key="pw" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4">
                    <div>
                      <label className="block font-montserrat font-medium text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Password</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="font-montserrat" style={{ ...inputStyle, paddingRight: '48px' }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" style={btnStyle}>SIGN IN</button>
                  </motion.div>
                )}

                {detectedMode === 'phone' && !otpSent && (
                  <motion.div key="phone" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4">
                    <button type="submit" style={btnStyle}>SEND OTP</button>
                  </motion.div>
                )}

                {detectedMode === 'phone' && otpSent && (
                  <motion.div key="otp-verify" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4">
                    <p className="text-xs font-montserrat" style={{ color: '#95A5A6' }}>Enter the 6-digit code sent to your phone</p>
                    <div className="flex justify-center gap-2">
                      {otpCode.map((d, i) => (
                        <input key={i} id={`hw-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d} onChange={(e) => handleOtpDigit(i, e.target.value)}
                          className="w-[44px] h-[44px] text-center text-lg font-bold rounded-lg font-montserrat"
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', outline: 'none' }}
                        />
                      ))}
                    </div>
                    <button type="button" onClick={handleVerifyOtp} style={btnStyle}>VERIFY</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
