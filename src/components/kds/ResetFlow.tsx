import { useState, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { blockDemoAuthInProd } from '@/lib/demo-auth';

interface ResetFlowProps {
  type: 'pin' | 'password';
  onBack: () => void;
  onComplete: () => void;
}

export default function ResetFlow({ type, onBack, onComplete }: ResetFlowProps) {
  const [step, setStep] = useState<'email' | 'otp' | 'new-password'>('email');
  const [input, setInput] = useState('');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPinDigits, setNewPinDigits] = useState<string[]>(['', '', '', '']);
  const [confirmPinDigits, setConfirmPinDigits] = useState<string[]>(['', '', '', '']);

  const isEmail = input.includes('@');
  const isPhone = /^[+\d\s()-]*$/.test(input) && input.replace(/\D/g, '').length >= 3;
  const hasInput = isEmail || isPhone;

  const handleSendOtp = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (hasInput) setStep('otp');
  }, [hasInput]);

  const handleVerifyOtp = useCallback(() => {
    if (!blockDemoAuthInProd()) return;
    setStep('new-password');
  }, []);

  const handleOtpDigit = (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...otpCode];
    next[index] = value;
    setOtpCode(next);
    if (value && index < 5) {
      document.getElementById(`reset-otp-${index + 1}`)?.focus();
    }
  };

  const handlePinBoxChange = (field: 'new' | 'confirm', index: number, value: string) => {
    if (value.length > 1) return;
    const arr = field === 'new' ? [...newPinDigits] : [...confirmPinDigits];
    arr[index] = value;
    if (field === 'new') setNewPinDigits(arr); else setConfirmPinDigits(arr);
    if (value && index < 3) {
      document.getElementById(`reset-${field}-pin-${index + 1}`)?.focus();
    }
  };

  const handleReset = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (type === 'pin') {
      const np = newPinDigits.join('');
      const cp = confirmPinDigits.join('');
      if (np.length === 4 && np === cp) onComplete();
    } else {
      if (newPassword && newPassword === confirmPassword) onComplete();
    }
  }, [type, newPassword, confirmPassword, newPinDigits, confirmPinDigits, onComplete]);

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

  const label = type === 'pin' ? 'PIN' : 'Password';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full" style={{ maxWidth: '380px' }}>
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-montserrat font-semibold text-sm mb-5"
        style={{ color: '#FFFFFF', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <p className="text-white font-montserrat font-semibold mb-1" style={{ fontSize: '24px' }}>
        Reset {label}
      </p>

      <AnimatePresence mode="wait">
        {step === 'email' && (
          <motion.form key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSendOtp} className="flex flex-col gap-4 mt-4">
            <p className="font-montserrat text-sm" style={{ color: '#A0A0A0' }}>
              Enter your email or mobile number to receive a verification code
            </p>
            <div>
              <label className="block font-montserrat font-medium mb-1.5" style={{ color: '#FFFFFF', fontSize: '15px' }}>Email or mobile number</label>
              <input
                type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Enter Your Email or Mobile Number"
                className="font-montserrat" style={inputStyle}
              />
            </div>
            {hasInput && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <button type="submit" style={btnStyle}>SEND OTP</button>
              </motion.div>
            )}
          </motion.form>
        )}

        {step === 'otp' && (
          <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 mt-4">
            <p className="text-sm font-montserrat" style={{ color: '#A0A0A0' }}>
              Enter the 6-digit code sent to {isEmail ? 'your email' : 'your phone'}
            </p>
            <div className="flex justify-center gap-2">
              {otpCode.map((d, i) => (
                <input
                  key={i} id={`reset-otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                  value={d} onChange={(e) => handleOtpDigit(i, e.target.value)}
                  className="w-[44px] h-[44px] text-center text-lg font-bold rounded-lg font-montserrat"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', outline: 'none' }}
                />
              ))}
            </div>
            <button type="button" onClick={handleVerifyOtp} style={btnStyle}>VERIFY</button>
            <button
              type="button"
              onClick={() => { setStep('email'); setOtpCode(['', '', '', '', '', '']); }}
              className="text-sm font-montserrat text-center"
              style={{ color: '#FFFFFF', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Resend code
            </button>
          </motion.div>
        )}

        {step === 'new-password' && (
          <motion.form key="new-pw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleReset} className="flex flex-col gap-4 mt-4">
            <p className="text-sm font-montserrat" style={{ color: '#A0A0A0' }}>
              {type === 'pin' ? 'Enter your new 4-digit PIN' : 'Enter your new password'}
            </p>

            {type === 'pin' ? (
              <>
                <div>
                  <label className="block font-montserrat font-medium text-xs mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>New PIN</label>
                  <div className="grid grid-cols-4 gap-3 w-full">
                    {newPinDigits.map((d, i) => (
                      <input
                        key={i} id={`reset-new-pin-${i}`} type="text" inputMode="numeric" maxLength={1}
                        value={d} onChange={(e) => handlePinBoxChange('new', i, e.target.value)}
                        className="w-full h-[56px] text-center text-xl font-bold rounded-lg font-montserrat"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', outline: 'none' }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-montserrat font-medium text-xs mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Confirm PIN</label>
                  <div className="grid grid-cols-4 gap-3 w-full">
                    {confirmPinDigits.map((d, i) => (
                      <input
                        key={i} id={`reset-confirm-pin-${i}`} type="text" inputMode="numeric" maxLength={1}
                        value={d} onChange={(e) => handlePinBoxChange('confirm', i, e.target.value)}
                        className="w-full h-[56px] text-center text-xl font-bold rounded-lg font-montserrat"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', outline: 'none' }}
                      />
                    ))}
                  </div>
                </div>
                {newPinDigits.join('').length === 4 && confirmPinDigits.join('').length === 4 && newPinDigits.join('') !== confirmPinDigits.join('') && (
                  <p className="text-xs font-montserrat font-semibold text-center" style={{ color: '#E84C3D' }}>
                    PINs do not match
                  </p>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block font-montserrat font-medium text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>New password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? 'text' : 'password'} value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter New Password"
                      className="font-montserrat"
                      style={{ ...inputStyle, paddingRight: '48px' }}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-montserrat font-medium text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Confirm password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm New Password"
                      className="font-montserrat"
                      style={{ ...inputStyle, paddingRight: '48px' }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs font-montserrat font-semibold" style={{ color: '#E84C3D' }}>
                    Passwords do not match
                  </p>
                )}
              </>
            )}
            <button type="submit" style={btnStyle}>RESET {label.toUpperCase()}</button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
