import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Delete, Check } from 'lucide-react';
import PosaiLogo from '@/components/PosaiLogo';
import { useLanguage } from '@/hooks/use-language';

type ForgotStep = 'request' | 'otp' | 'success';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

export default function ForgotPasswordScreen({ onBack, onComplete }: ForgotPasswordScreenProps) {
  const [step, setStep] = useState<ForgotStep>('request');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(45);
  const [successCountdown, setSuccessCountdown] = useState(3);
  const { tui } = useLanguage();

  useEffect(() => {
    if (step === 'otp' && countdown > 0) {
      const t = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(t);
    }
  }, [step, countdown]);

  useEffect(() => {
    if (step === 'success') {
      const t = setInterval(() => {
        setSuccessCountdown((c) => {
          if (c <= 1) { onComplete(); return 0; }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [step, onComplete]);

  const handleOtpDigit = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleSendOtp = () => {
    // TODO: Replace with API call
    setStep('otp');
  };

  const handleVerify = () => {
    // TODO: Replace with API call for OTP verification
    setStep('success');
  };

  return (
    <div className="fixed inset-0 bg-surface-card flex items-center justify-center">
      <AnimatePresence mode="wait">
        {step === 'request' && (
          <motion.div
            key="request"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md px-8"
          >
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 min-h-[44px]">
              <ArrowLeft size={20} />
              <span className="text-sm">{tui('Back')}</span>
            </button>

            <div className="text-center mb-8">
              <PosaiLogo variant="light" className="h-28 object-contain mx-auto" />
              <p className="text-text-muted text-sm mt-2">{tui('Kitchen Display System')}</p>
            </div>

            <h2 className="text-xl font-bold text-text-primary mb-2">{tui('Forgot Password')}</h2>
            <p className="text-text-secondary text-sm mb-6">{tui('Choose How to Reset Your Password')}</p>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-1">{tui('Email Address')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
                  placeholder="kitchen@restaurant.com"
                />
              </div>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-text-muted text-sm">{tui('Or')}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary block mb-1">{tui('Mobile Number')}</label>
                <div className="flex gap-2">
                  <select className="px-2 py-2.5 rounded-lg border border-input bg-surface-card text-text-primary text-sm min-h-[44px]">
                    <option>+1</option>
                    <option>+44</option>
                    <option>+91</option>
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-lg border border-input bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <button onClick={handleSendOtp} className="w-full py-3 bg-brand-primary text-primary-foreground text-cta uppercase rounded-lg hover:bg-brand-primary/90 transition-colors min-h-[48px] mt-4">
                {tui('SEND OTP')}
              </button>

              <button onClick={onBack} className="w-full text-center text-sm text-brand-primary hover:underline mt-2">
                {tui('Back to Sign In')}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md px-8"
          >
            <button onClick={() => setStep('request')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 min-h-[44px]">
              <ArrowLeft size={20} />
              <span className="text-sm">{tui('Back')}</span>
            </button>

            <h2 className="text-xl font-bold text-text-primary mb-2">{tui('Enter Verification Code')}</h2>
            <p className="text-text-secondary text-sm mb-8">
              {tui('A 6-digit code was sent to {contact}', { contact: email ? `${email.slice(0, 3)}***` : `***${phone.slice(-4)}` })}
            </p>

            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigit(i, e.target.value)}
                  className="w-[52px] h-[52px] text-center text-xl font-bold border-2 border-input rounded-lg focus:border-brand-primary focus:outline-none bg-surface-card text-text-primary"
                />
              ))}
            </div>

            <p className="text-center text-sm text-text-muted mb-6">
              {countdown > 0 ? (
                <>{tui('Resend code in {time}', { time: `0:${String(countdown).padStart(2, '0')}` })}</>
              ) : (
                <button className="text-brand-primary hover:underline">{tui('Resend Code')}</button>
              )}
            </p>

            <button onClick={handleVerify} className="w-full py-3 bg-brand-primary text-primary-foreground text-cta uppercase rounded-lg hover:bg-brand-primary/90 transition-colors min-h-[48px]">
              {tui('VERIFY')}
            </button>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-brand-dark/60 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-surface-card rounded-2xl p-10 text-center max-w-sm mx-4 shadow-2xl"
            >
              <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-primary-foreground" strokeWidth={3} />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">{tui('Password Updated Successfully')}</h2>
              <p className="text-text-secondary text-sm mb-6">{tui('You can now sign in with your new password')}</p>
              <button onClick={onComplete} className="w-full py-3 bg-brand-primary text-primary-foreground text-cta uppercase rounded-lg min-h-[48px]">
                {tui('SIGN IN')}
              </button>
              <p className="text-text-muted text-xs mt-3">{tui('Auto-redirecting in {n}s', { n: successCountdown })}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
