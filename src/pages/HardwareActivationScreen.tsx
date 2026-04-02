import { useState, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import posaiLogo from '@/assets/posai-logo-white.png';

interface HardwareActivationScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function HardwareActivationScreen({ onSuccess, onBack }: HardwareActivationScreenProps) {
  const [method, setMethod] = useState<'qr' | 'email' | 'otp'>('qr');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [qrApproved, setQrApproved] = useState(false);

  const handleEmailSignIn = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (email && password) onSuccess();
  }, [email, password, onSuccess]);

  const handleSendOtp = useCallback(() => {
    if (phone) setOtpSent(true);
  }, [phone]);

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

  // Simulate QR approval
  const handleSimulateQrApproval = useCallback(() => {
    setQrApproved(true);
    setTimeout(() => onSuccess(), 1500);
  }, [onSuccess]);

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '52px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#FFFFFF', fontSize: '15px', padding: '0 16px', outline: 'none',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%', height: '56px', borderRadius: '8px',
    background: 'linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 100%)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF',
    fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '15px',
    letterSpacing: '0.5px', cursor: 'pointer',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#0D0D1A' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[900px] px-6"
      >
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-montserrat font-medium text-sm mb-6"
          style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <img src={posaiLogo} alt="POS ai" className="h-12 object-contain mx-auto mb-2" />
          <h1 className="text-white text-xl font-bold font-montserrat">Hardware Activation</h1>
          <p className="text-sm font-montserrat" style={{ color: '#6C7A89' }}>
            Activate this KDS device to get started
          </p>
        </div>

        {/* 2-column: QR dominant left, Login right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT: QR (primary) */}
          <div className="flex flex-col items-center rounded-xl p-8" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white font-montserrat font-bold text-base mb-1">Scan to Activate</p>
            <p className="text-xs font-montserrat mb-6" style={{ color: '#6C7A89' }}>
              Scan with your phone to approve this device
            </p>

            <AnimatePresence mode="wait">
              {!qrApproved ? (
                <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                  <div className="flex items-center justify-center rounded-xl bg-white p-5 mb-6" style={{ width: '240px', height: '240px' }}>
                    <QRCodeSVG
                      value="https://kds.posai.app/activate?device=kds-001&token=abc123"
                      size={200} level="M" fgColor="#1A1A2E" bgColor="#FFFFFF"
                    />
                  </div>
                  <p className="text-xs font-montserrat text-center" style={{ color: '#95A5A6', maxWidth: '260px' }}>
                    Scan this QR code with your phone. Open the secure link and tap Approve to activate.
                  </p>
                  {/* Dev: simulate approval */}
                  <button
                    onClick={handleSimulateQrApproval}
                    className="mt-4 text-xs underline font-montserrat"
                    style={{ color: '#6C7A89' }}
                  >
                    [Dev] Simulate approval
                  </button>
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

          {/* RIGHT: Email / OTP login */}
          <div className="rounded-xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white font-montserrat font-bold text-base mb-1">Or Sign In</p>
            <p className="text-xs font-montserrat mb-5" style={{ color: '#6C7A89' }}>
              Use email or mobile OTP as an alternative
            </p>

            {/* Method tabs */}
            <div className="flex mb-5" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
              {(['email', 'otp'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMethod(tab)}
                  className="flex-1 font-montserrat font-bold text-xs py-2.5 transition-colors"
                  style={{
                    background: method === tab ? 'linear-gradient(180deg, #3A3A3A 0%, #2A2A2A 100%)' : 'transparent',
                    color: method === tab ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  {tab === 'email' ? 'EMAIL' : 'MOBILE OTP'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {method === 'email' ? (
                <motion.form key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
                  <div>
                    <label className="block font-montserrat font-medium text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kitchen@restaurant.com" className="font-montserrat" style={inputStyle} />
                  </div>
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
                </motion.form>
              ) : (
                <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  {!otpSent ? (
                    <>
                      <div>
                        <label className="block font-montserrat font-medium text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Mobile Number</label>
                        <div className="flex gap-2">
                          <select className="px-2 py-2.5 rounded-lg text-sm font-montserrat min-h-[44px]" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF' }}>
                            <option>+1</option><option>+44</option><option>+91</option>
                          </select>
                          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" className="font-montserrat" style={{ ...inputStyle, flex: 1 }} />
                        </div>
                      </div>
                      <button type="button" onClick={handleSendOtp} style={btnStyle}>SEND OTP</button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
