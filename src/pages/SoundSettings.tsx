import { useState, useRef, useCallback } from 'react';
import { X, Volume2, VolumeX, Play, Upload, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SoundSettingsProps {
  open: boolean;
  onClose: () => void;
}

function beep(ctx: AudioContext, freq: number, start: number, dur: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = 'sine';
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.start(start);
  osc.stop(start + dur);
}

const PRESET_PLAYERS: Record<string, (vol: number) => void> = {
  'default-beep': (vol) => {
    try {
      const ctx = new AudioContext();
      const v = vol / 100 * 0.4;
      beep(ctx, 880, ctx.currentTime, 0.15, v);
      beep(ctx, 1100, ctx.currentTime + 0.18, 0.2, v);
    } catch {}
  },
  'double-chime': (vol) => {
    try {
      const ctx = new AudioContext();
      const v = vol / 100 * 0.35;
      beep(ctx, 659, ctx.currentTime, 0.2, v);
      beep(ctx, 784, ctx.currentTime + 0.25, 0.25, v);
    } catch {}
  },
  'urgent-alert': (vol) => {
    try {
      const ctx = new AudioContext();
      const v = vol / 100 * 0.45;
      beep(ctx, 1200, ctx.currentTime, 0.1, v);
      beep(ctx, 1200, ctx.currentTime + 0.15, 0.1, v);
      beep(ctx, 1500, ctx.currentTime + 0.3, 0.15, v);
    } catch {}
  },
  'soft-ding': (vol) => {
    try {
      const ctx = new AudioContext();
      const v = vol / 100 * 0.25;
      beep(ctx, 1047, ctx.currentTime, 0.4, v);
    } catch {}
  },
};

const presetSounds = [
  { id: 'default-beep', label: 'Default beep' },
  { id: 'double-chime', label: 'Double chime' },
  { id: 'urgent-alert', label: 'Urgent alert' },
  { id: 'soft-ding', label: 'Soft ding' },
];

const urgentOptions = ['Alarm', 'Double bell', 'Pulse'];
const serviceBellOptions = ['Classic Bell', 'Digital chime', 'Soft tone'];

const OTHER_SOUND_PLAYERS: Record<string, (vol: number) => void> = {
  'Alarm': (vol) => {
    try {
      const ctx = new AudioContext();
      const v = vol / 100 * 0.45;
      for (let i = 0; i < 4; i++) {
        beep(ctx, 1400, ctx.currentTime + i * 0.12, 0.08, v);
      }
    } catch {}
  },
  'Double bell': (vol) => {
    try {
      const ctx = new AudioContext();
      const v = vol / 100 * 0.35;
      beep(ctx, 900, ctx.currentTime, 0.25, v);
      beep(ctx, 900, ctx.currentTime + 0.3, 0.25, v);
    } catch {}
  },
  'Pulse': (vol) => {
    try {
      const ctx = new AudioContext();
      const v = vol / 100 * 0.4;
      for (let i = 0; i < 3; i++) {
        beep(ctx, 1000, ctx.currentTime + i * 0.2, 0.1, v);
      }
    } catch {}
  },
  'Classic Bell': (vol) => {
    try {
      const ctx = new AudioContext();
      const v = vol / 100 * 0.3;
      beep(ctx, 1400, ctx.currentTime, 0.4, v);
    } catch {}
  },
  'Digital chime': (vol) => {
    try {
      const ctx = new AudioContext();
      const v = vol / 100 * 0.3;
      beep(ctx, 523, ctx.currentTime, 0.15, v);
      beep(ctx, 659, ctx.currentTime + 0.15, 0.15, v);
      beep(ctx, 784, ctx.currentTime + 0.3, 0.2, v);
    } catch {}
  },
  'Soft tone': (vol) => {
    try {
      const ctx = new AudioContext();
      const v = vol / 100 * 0.2;
      beep(ctx, 440, ctx.currentTime, 0.5, v);
    } catch {}
  },
};

export default function SoundSettings({ open, onClose }: SoundSettingsProps) {
  const [volume, setVolume] = useState(75);
  const [alertVolume, setAlertVolume] = useState(80);
  const [muteAll, setMuteAll] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('default-beep');
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [urgentSound, setUrgentSound] = useState('Alarm');
  const [serviceBell, setServiceBell] = useState('Classic Bell');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playPreset = useCallback((id: string) => {
    if (muteAll) return;
    PRESET_PLAYERS[id]?.(alertVolume);
  }, [muteAll, alertVolume]);

  const playMainVolume = useCallback(() => {
    if (muteAll) return;
    PRESET_PLAYERS['default-beep']?.(volume);
  }, [muteAll, volume]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File must be under 2MB');
      return;
    }
    setCustomFile(file);
    setSelectedPreset('');
  };

  const removeCustomFile = () => {
    setCustomFile(null);
    setSelectedPreset('default-beep');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectPreset = (id: string) => {
    setSelectedPreset(id);
    setCustomFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
              <h2 className="text-lg font-bold text-text-primary">Sound settings</h2>
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
                  onClick={playMainVolume}
                  className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Test Sound"
                >
                  <Play size={16} className="text-brand-primary" />
                </button>
              </div>
            </div>

            {/* New order alert sound */}
            <div className="px-4 pt-4">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">New order alert sound</div>

              {/* Preset sounds */}
              <div className="text-[12px] font-semibold text-text-secondary mb-2">Preset sounds</div>
              <div className="flex flex-col gap-1.5 mb-4">
                {presetSounds.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => selectPreset(preset.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors min-h-[44px] ${
                      selectedPreset === preset.id && !customFile
                        ? 'bg-brand-dark text-primary-foreground'
                        : 'bg-muted text-text-primary hover:bg-muted/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedPreset === preset.id && !customFile
                            ? 'border-primary-foreground'
                            : 'border-text-muted'
                        }`}
                      >
                        {selectedPreset === preset.id && !customFile && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <span className="text-[13px] font-medium">{preset.label}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPreset(preset.id);
                      }}
                      className={`p-1.5 rounded-md transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${
                        selectedPreset === preset.id && !customFile
                          ? 'hover:bg-white/10'
                          : 'hover:bg-muted/60'
                      }`}
                      aria-label={`Play ${preset.label}`}
                    >
                      <Play size={14} className={selectedPreset === preset.id && !customFile ? 'text-primary-foreground' : 'text-brand-primary'} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Custom Sound Upload */}
              <div className="text-[12px] font-semibold text-text-secondary mb-2">Upload custom sound</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                onChange={handleFileChange}
                className="hidden"
              />
              {customFile ? (
                <div className="flex items-center justify-between px-3 py-2 bg-brand-dark text-primary-foreground rounded-lg min-h-[44px] mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                    <span className="text-[13px] font-medium truncate max-w-[260px]">{customFile.name}</span>
                  </div>
                  <button
                    onClick={removeCustomFile}
                    className="p-1.5 hover:bg-white/10 rounded-md min-h-[32px] min-w-[32px] flex items-center justify-center"
                    aria-label="Remove Custom Sound"
                  >
                    <XIcon size={14} className="text-primary-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-muted text-text-primary rounded-lg text-[13px] font-medium hover:bg-muted/80 transition-colors min-h-[44px] mb-1"
                >
                  <Upload size={14} className="text-text-muted" />
                  Choose File
                </button>
              )}
              <p className="text-[11px] text-text-muted mb-4">Accepted formats: MP3, WAV - Max size: 2MB</p>

              {/* Alert volume */}
              <div className="text-[12px] font-semibold text-text-secondary mb-2">Alert volume</div>
              <div className="flex items-center gap-3 mb-4">
                <Volume2 size={16} className="text-text-secondary shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={muteAll ? 0 : alertVolume}
                  onChange={(e) => setAlertVolume(Number(e.target.value))}
                  disabled={muteAll}
                  className="flex-1 h-2 rounded-full appearance-none bg-muted accent-brand-primary cursor-pointer disabled:opacity-50"
                />
                <span className="text-[13px] font-semibold text-text-primary w-10 text-right">
                  {muteAll ? '0' : alertVolume}%
                </span>
              </div>
            </div>

            {/* Other alert sounds */}
            <div className="px-4 pt-2">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Other alert sounds</div>
              <SoundPicker label="Urgent / Overtime Alert" options={urgentOptions} value={urgentSound} onChange={setUrgentSound} onPlay={(opt) => { if (!muteAll) OTHER_SOUND_PLAYERS[opt]?.(alertVolume); }} />
              <SoundPicker label="Service Bell (Manual)" options={serviceBellOptions} value={serviceBell} onChange={setServiceBell} onPlay={(opt) => { if (!muteAll) OTHER_SOUND_PLAYERS[opt]?.(alertVolume); }} />
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
                  <span className="text-sm font-medium text-text-primary">Mute all sounds</span>
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
                Save changes
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SoundPicker({ label, options, value, onChange, onPlay }: { label: string; options: string[]; value: string; onChange: (v: string) => void; onPlay?: (opt: string) => void }) {
  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-text-primary mb-2">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => { onChange(opt); onPlay?.(opt); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[44px] flex items-center gap-1.5 ${
              value === opt
                ? 'bg-brand-primary text-primary-foreground'
                : 'bg-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            <Play size={12} />
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
