import { useState, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PosaiLogo from '@/components/PosaiLogo';
import { blockDemoAuthInProd } from '@/lib/demo-auth';

interface PersonalDeviceLoginScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function PersonalDeviceLoginScreen({ onSuccess, onBack }: PersonalDeviceLoginScreenProps) {
  const [method, setMethod] = useState<'email' | 'otp'>('email');
  const [showQr, setShowQr] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailSignIn = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (email && password && blockDemoAuthInProd()) onSuccess();
  }, [email, password, onSuccess]);

  const handleSendOtp = useCallback(() => {
    if (phone) setOtpSent(true);
  }, [phone]);

  const handleVerifyOtp = useCallback(() => {
    if (!blockDemoAuthInProd()) return;
    onSuccess();
  }, [onSuccess]);

  const handleOtpDigit = (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...otpCode];
    next[index] = value;
    setOtpCode(next);
    if (value && index < 5) {
      document.getElementById(`pd-otp-${index + 1}`)?.focus();
    }
  };

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
        className="w-full max-w-[480px] px-6"
      >
        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 font-montserrat font-medium text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <PosaiLogo variant="light" className="h-20 object-contain mx-auto mb-2" />
          <h1 className="text-white text-xl font-bold font-montserrat">Sign In to Kitchen Display System</h1>
          <p className="text-sm font-montserrat" style={{ color: '#6C7A89' }}>Personal device login</p>
        </div>

        {/* Method tabs */}
        <div className="flex mb-6" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
          {(['email', 'otp'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setMethod(tab); setShowQr(false); }}
              className="flex-1 font-montserrat font-bold text-sm py-3 transition-colors"
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

        <div style={{ minHeight: '320px' }}>
          <AnimatePresence mode="wait">
            {showQr ? (
              <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <div className="flex items-center justify-center rounded-xl bg-white p-5 mb-6" style={{ width: '240px', height: '240px' }}>
                  <QRCodeSVG value="https://kds.posai.app/auth/qr?device=byod-001" size={200} level="M" fgColor="#1A1A2E" bgColor="#FFFFFF" />
                </div>
                <p className="text-xs font-montserrat text-center mb-4" style={{ color: '#95A5A6' }}>
                  Scan with your phone to sign in
                </p>
                <button onClick={() => setShowQr(false)} className="text-xs underline font-montserrat" style={{ color: '#6C7A89' }}>
                  Back to email/OTP login
                </button>
              </motion.div>
            ) : method === 'email' ? (
              <motion.form key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
                <div>
                  <label className="block font-montserrat font-medium text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kitchen@restaurant.com" className="font-montserrat" style={inputStyle} />
                </div>
                <div>
                  <label className="block font-montserrat font-medium text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" className="font-montserrat" style={{ ...inputStyle, paddingRight: '48px' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button type="submit" style={btnStyle}>SIGN IN</button>
                <button type="button" onClick={() => setShowQr(true)} className="text-xs font-montserrat mt-2 text-center" style={{ color: '#6C7A89' }}>
                  Login using QR instead
                </button>
              </motion.form>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                {!otpSent ? (
                  <>
                    <div>
                      <label className="block font-montserrat font-medium text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Mobile Number</label>
                      <div className="flex gap-2">
                        <select className="px-2 py-2.5 rounded-lg text-sm font-montserrat min-h-[44px]" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF' }}>
                          <option>+1</option><option>+44</option><option>+91</option>
                        </select>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" className="font-montserrat" style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    </div>
                    <button type="button" onClick={handleSendOtp} style={btnStyle}>SEND OTP</button>
                    <button type="button" onClick={() => setShowQr(true)} className="text-xs font-montserrat mt-2 text-center" style={{ color: '#6C7A89' }}>
                      Login using QR instead
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-montserrat" style={{ color: '#95A5A6' }}>Enter the 6-digit code sent to your phone</p>
                    <div className="flex justify-center gap-2">
                      {otpCode.map((d, i) => (
                        <input key={i} id={`pd-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d} onChange={(e) => handleOtpDigit(i, e.target.value)}
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
      </motion.div>
    </div>
  );
}
