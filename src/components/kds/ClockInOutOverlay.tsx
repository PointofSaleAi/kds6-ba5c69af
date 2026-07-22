import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Fingerprint, ScanFace, ChevronDown, Delete } from 'lucide-react';


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
            <p className="text-lg font-semibold mb-6">{dateLabel}</p>
            <div className="flex items-baseline gap-2 mb-10">
              <span className="font-black leading-none tabular-nums" style={{ fontSize: 'clamp(120px, 18vw, 220px)' }}>
                {displayHour}
                <span className="inline-flex flex-col align-middle mx-2" style={{ fontSize: '0.25em', lineHeight: 1 }}>
                  <span className="w-3 h-3 rounded-full bg-white mb-2" />
                  <span className="w-3 h-3 rounded-full bg-white" />
                </span>
                {minStr}
              </span>
              <span className="font-black text-white/40" style={{ fontSize: 'clamp(40px, 5vw, 72px)' }}>
                {isPM ? 'PM' : 'AM'}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl font-semibold">27°</span>
              <Sun className="w-10 h-10 text-yellow-400" />
            </div>
            <p className="text-xl font-semibold">Bengaluru, Karnataka</p>
          </div>

          {/* Right: pin pad */}
          <div className="w-[480px] flex flex-col justify-center px-8 py-10">
            <p className="text-center text-white/60 text-sm mb-4">Enter PIN to Clock In</p>

            <div className="flex justify-center gap-6 mb-6">
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <img
                  key={i}
                  src={i < pin.length ? pinIndicatorFilledIcon : pinIndicatorIcon}
                  alt=""
                  className="w-10 h-10"
                  onError={(e) => {
                    // Fallback if icon missing
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ))}
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {keys.map(key => {
                if (key === 'C') return (
                  <button key={key} onClick={() => setPin('')} className="h-16 rounded-lg bg-white text-[#E84C3D] text-2xl font-bold shadow active:scale-95 transition-transform">C</button>
                );
                if (key === 'ENTER') return (
                  <button key={key} className="h-16 rounded-lg bg-[#6E6E6E] text-white text-lg font-bold shadow active:scale-95 transition-transform">ENTER</button>
                );
                return (
                  <button
                    key={key}
                    onClick={() => handleDigit(key)}
                    className="h-16 rounded-lg bg-white text-[#1A1A2E] text-2xl font-bold shadow active:scale-95 transition-transform"
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            {/* Action row */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <button className="h-14 rounded-lg bg-[#922B21] text-white font-semibold shadow active:scale-95 transition-transform">Clock Out</button>
              <button className="h-14 rounded-lg bg-[#6E6E6E] text-white font-semibold shadow active:scale-95 transition-transform">Break</button>
              <button className="h-14 rounded-lg bg-[#16A085] text-white font-semibold shadow active:scale-95 transition-transform">Clock In</button>
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
