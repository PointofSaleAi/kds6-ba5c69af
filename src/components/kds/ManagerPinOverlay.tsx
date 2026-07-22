import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const PIN_LENGTH = 4;

interface Props {
  open: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Reusable 4-digit manager PIN overlay. Any 4 digits unlock the action.
 * Visual style mirrors the sign-in / clock-in PIN pad.
 */
export default function ManagerPinOverlay({ open, title = 'Manager PIN Required', subtitle = 'Enter PIN to switch screen mode', onClose, onSuccess }: Props) {
  const [pin, setPin] = useState('');

  const submit = useCallback(() => {
    if (pin.length !== PIN_LENGTH) return;
    setPin('');
    onSuccess();
  }, [pin, onSuccess]);

  useEffect(() => {
    if (!open) return;
    setPin('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key >= '0' && e.key <= '9' && pin.length < PIN_LENGTH) setPin(p => p + e.key);
      else if (e.key === 'Backspace') setPin(p => p.slice(0, -1));
      else if (e.key === 'Enter') submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, pin, onClose, submit]);

  const keys = ['1','2','3','4','5','6','7','8','9','C','0','ENTER'];

  const keyBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '8px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
    fontSize: '24px', height: '56px', cursor: 'pointer', border: 'none',
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
          className="fixed inset-0 z-[10100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)', fontFamily: 'Montserrat, sans-serif' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl p-6"
            style={{ background: '#1A1A1F', color: '#FFFFFF' }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-center mb-1">{title}</h2>
            <p className="text-center text-white/60 text-xs mb-5">{subtitle}</p>

            <div className="flex justify-center gap-4 mb-5">
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <motion.span
                  key={i}
                  className="font-black text-white select-none"
                  style={{ fontSize: '2.5rem', lineHeight: 1 }}
                  animate={{ opacity: i < pin.length ? 1 : 0.3, scale: i < pin.length ? [1, 1.3, 1] : 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  ✱
                </motion.span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {keys.map(key => {
                const tap = { scale: 0.92, y: 2 };
                const hover = { scale: 1.03 };
                const transition = { type: 'spring' as const, stiffness: 600, damping: 20, mass: 0.5 };
                if (key === 'C') {
                  return (
                    <motion.button key={key} onClick={() => setPin('')} style={{ ...lightKey, color: '#E84C3D' }} whileTap={tap} whileHover={hover} transition={transition}>C</motion.button>
                  );
                }
                if (key === 'ENTER') {
                  const enabled = pin.length === PIN_LENGTH;
                  return (
                    <motion.button
                      key={key}
                      onClick={submit}
                      disabled={!enabled}
                      style={{ ...(enabled ? lightKey : greyKey), fontSize: '14px', fontWeight: 600, opacity: enabled ? 1 : 0.5, cursor: enabled ? 'pointer' : 'not-allowed' }}
                      whileTap={enabled ? tap : undefined}
                      whileHover={enabled ? hover : undefined}
                      transition={transition}
                    >
                      Enter
                    </motion.button>
                  );
                }
                return (
                  <motion.button
                    key={key}
                    onClick={() => setPin(p => (p.length < PIN_LENGTH ? p + key : p))}
                    style={lightKey}
                    whileTap={tap}
                    whileHover={hover}
                    transition={transition}
                  >
                    {key}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
