import { useState } from 'react';
import { X, Volume2, VolumeX, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SoundSettingsProps {
  open: boolean;
  onClose: () => void;
}

const soundOptions = ['Bell', 'Chime', 'Ding', 'Buzz'];
const urgentOptions = ['Alarm', 'Double Bell', 'Pulse'];
const serviceBellOptions = ['Classic Bell', 'Digital Chime', 'Soft Tone'];

export default function SoundSettings({ open, onClose }: SoundSettingsProps) {
  const [volume, setVolume] = useState(75);
  const [muteAll, setMuteAll] = useState(false);
  const [newOrderSound, setNewOrderSound] = useState('Bell');
  const [urgentSound, setUrgentSound] = useState('Alarm');
  const [serviceBell, setServiceBell] = useState('Classic Bell');

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-brand-dark/60 z-50 flex items-end justify-center sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface-card rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <Volume2 size={20} className="text-text-muted" />
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary">Sound Settings</h2>
              {muteAll && (
                <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full uppercase">
                  Muted
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Volume */}
            <div className="px-4 pt-4 pb-2">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Volume</div>
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-text-secondary shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={muteAll ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  disabled={muteAll}
                  className="flex-1 h-2 rounded-full appearance-none bg-muted accent-brand-primary cursor-pointer disabled:opacity-50"
                />
                <span className="text-sm font-semibold text-text-primary w-10 text-right">
                  {muteAll ? '0' : volume}%
                </span>
                <button
                  className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Test sound"
                >
                  <Play size={16} className="text-brand-primary" />
                </button>
              </div>
            </div>

            {/* Sound type pickers */}
            <div className="px-4 pt-4">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Alert Sounds</div>

              <SoundPicker label="New Order Alert" options={soundOptions} value={newOrderSound} onChange={setNewOrderSound} />
              <SoundPicker label="Urgent / Overtime Alert" options={urgentOptions} value={urgentSound} onChange={setUrgentSound} />
              <SoundPicker label="Service Bell (Manual)" options={serviceBellOptions} value={serviceBell} onChange={setServiceBell} />
            </div>

            {/* Mute toggle */}
            <div className="px-4 pt-4">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Master</div>
              <button
                onClick={() => setMuteAll(!muteAll)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <VolumeX size={20} className="text-text-muted" />
                  <span className="text-sm font-medium text-text-primary">Mute All Sounds</span>
                </div>
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors min-w-[44px] ${muteAll ? 'bg-brand-primary' : 'bg-border'}`}
                  role="switch"
                  aria-checked={muteAll}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-surface-card rounded-full transition-transform shadow-sm ${muteAll ? 'translate-x-5' : ''}`} />
                </div>
              </button>
            </div>

            {/* Save */}
            <div className="px-4 py-4">
              <button
                onClick={onClose}
                className="w-full py-3 bg-brand-primary text-primary-foreground font-bold text-sm uppercase rounded-lg transition-colors hover:bg-brand-primary/90 min-h-[44px]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SoundPicker({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-text-primary mb-2">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[44px] ${
              value === opt
                ? 'bg-brand-primary text-primary-foreground'
                : 'bg-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
