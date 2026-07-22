import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Fingerprint, ScanFace, ChevronDown } from 'lucide-react';


const PIN_LENGTH = 4;
const REVENUE_CENTERS = ['Dine Center', 'Bar', 'Patio', 'Takeout'];

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * KDS Clock In / Clock Out overlay. Mirrors the POS mobile Clock In screen:
 * left column with day/time/weather, right column with PIN pad, action row
 * (Clock Out / Break / Clock In), biometrics, revenue center picker and
 * a Logout button. Purely visual for KDS — no auth wiring.
 */
export default function ClockInOutOverlay({ open, onClose }: Props) {
  const [now, setNow] = useState(() => new Date());
  const [pin, setPin] = useState('');
  const [revenueCenter, setRevenueCenter] = useState('Dine Center');
  const [rcOpen, setRcOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key >= '0' && e.key <= '9' && pin.length < PIN_LENGTH) setPin(p => p + e.key);
      else if (e.key === 'Backspace') setPin(p => p.slice(0, -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, pin, onClose]);

  const handleDigit = useCallback((d: string) => {
    setPin(p => (p.length < PIN_LENGTH ? p + d : p));
  }, []);

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const hours = now.getHours();
  const mins = now.getMinutes();
  const isPM = hours >= 12;
  const displayHour = ((hours + 11) % 12) + 1;
  const minStr = mins.toString().padStart(2, '0');

  const keys: Array<string> = ['1','2','3','4','5','6','7','8','9','C','0','ENTER'];

  const keyBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '8px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
    fontSize: '28px', height: '64px', cursor: 'pointer', border: 'none', transition: 'filter 0.1s',
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
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10050] flex"
          style={{ background: '#000000', fontFamily: 'Montserrat, sans-serif' }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: date / time / weather */}
          <div className="flex-1 flex flex-col justify-center px-12 lg:px-20 text-white">
            <p className="text-lg font-semibold mb-2">{dateLabel}</p>
            <div className="flex items-baseline gap-3 mb-4 whitespace-nowrap">
              <span className="font-black leading-none tabular-nums" style={{ fontSize: 'clamp(96px, 14vw, 180px)' }}>
                {displayHour}
                <span className="inline-flex flex-col justify-center align-middle mx-2" style={{ height: '0.78em', position: 'relative', top: '-0.06em' }}>
                  <span className="rounded-full bg-white" style={{ width: '0.2em', height: '0.2em', marginBottom: '0.18em' }} />
                  <span className="rounded-full bg-white" style={{ width: '0.2em', height: '0.2em' }} />
                </span>
                {minStr}
              </span>
              <span className="font-black text-white/40" style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}>
                {isPM ? 'PM' : 'AM'}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-5xl font-semibold">27°</span>
              <Sun className="w-10 h-10 text-yellow-400" />
            </div>
            <p className="text-xl font-semibold">Bengaluru, Karnataka</p>
          </div>

          {/* Right: pin pad */}
          <div className="flex-1 flex flex-col justify-center px-8 py-10 mr-16">
            <p className="text-center text-white/60 text-sm mb-4">Enter PIN to Clock In</p>

            <div className="flex justify-center gap-5 mb-6">
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <motion.span
                  key={i}
                  className="font-montserrat font-black text-white select-none"
                  style={{ fontSize: '3.5rem', lineHeight: 1 }}
                  animate={{ opacity: i < pin.length ? 1 : 0.3, scale: i < pin.length ? [1, 1.3, 1] : 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  ✱
                </motion.span>
              ))}
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-[8px] mb-2">
              {keys.map(key => {
                const tapAnim = { scale: 0.92, y: 2 };
                const hoverAnim = { scale: 1.03 };
                const transition = { type: 'spring' as const, stiffness: 600, damping: 20, mass: 0.5 };
                if (key === 'C') return (
                  <motion.button key={key} onClick={() => setPin('')} style={{ ...lightKey, color: '#E84C3D' }} whileTap={tapAnim} whileHover={hoverAnim} transition={transition}>C</motion.button>
                );
                if (key === 'ENTER') {
                  const enabled = pin.length === PIN_LENGTH;
                  return (
                    <motion.button key={key} onClick={() => { if (enabled) setPin(''); }} disabled={!enabled} style={{ ...(enabled ? lightKey : greyKey), fontSize: '16px', fontWeight: 600, opacity: enabled ? 1 : 0.5, cursor: enabled ? 'pointer' : 'not-allowed' }} aria-label="Enter" whileTap={enabled ? tapAnim : undefined} whileHover={enabled ? hoverAnim : undefined} transition={transition} className="whitespace-nowrap">
                      Enter
                    </motion.button>
                  );
                }
                return (
                  <motion.button key={key} onClick={() => handleDigit(key)} style={lightKey} whileTap={tapAnim} whileHover={hoverAnim} transition={transition}>{key}</motion.button>
                );
              })}
            </div>

            {/* Action row */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {(() => {
                const enabled = pin.length === PIN_LENGTH;
                return (
                  <>
                    <button disabled={!enabled} className="h-14 rounded-lg bg-[#922B21] text-white font-semibold shadow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">Clock Out</button>
                    <button className="h-14 rounded-lg bg-[#6E6E6E] text-white font-semibold shadow active:scale-95 transition-transform">Break</button>
                    <button disabled={!enabled} className="h-14 rounded-lg bg-[#16A085] text-white font-semibold shadow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">Clock In</button>
                  </>
                );
              })()}
            </div>

            {/* Biometrics + revenue center */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <button aria-label="Fingerprint" className="h-14 rounded-lg bg-[#3A3A3C] text-white flex items-center justify-center shadow active:scale-95 transition-transform">
                <Fingerprint className="w-6 h-6" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setRcOpen(v => !v)}
                  className="w-full h-14 rounded-lg bg-white text-[#1A1A2E] flex flex-col items-center justify-center shadow active:scale-95 transition-transform"
                >
                  <span className="text-[9px] font-bold tracking-wide text-[#6C7A89]">REVENUE CENTER</span>
                  <span className="text-sm font-semibold flex items-center gap-1">
                    {revenueCenter} <ChevronDown className="w-3 h-3" />
                  </span>
                </button>
                {rcOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                    {REVENUE_CENTERS.map(rc => (
                      <button
                        key={rc}
                        onClick={() => { setRevenueCenter(rc); setRcOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-[#1A1A2E] hover:bg-black/5"
                      >
                        {rc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button aria-label="Face ID" className="h-14 rounded-lg bg-[#3A3A3C] text-white flex items-center justify-center shadow active:scale-95 transition-transform">
                <ScanFace className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full h-12 rounded-lg bg-[#1A1A1F] text-white font-bold tracking-wider border border-white/10 hover:bg-[#26262C] transition-colors"
            >
              LOGOUT
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
