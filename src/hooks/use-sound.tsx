import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface SoundContextType {
  muted: boolean;
  toggleMute: () => void;
  playSound: (type: 'newOrder' | 'urgent' | 'serviceBell') => void;
}

const SoundContext = createContext<SoundContextType>({
  muted: false,
  toggleMute: () => {},
  playSound: () => {},
});

// Simple beep using Web Audio API
function createBeep(frequency: number, duration: number, volume: number) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gain.gain.value = volume;

    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported
  }
}

const SOUND_MAP = {
  newOrder: () => {
    createBeep(880, 0.15, 0.3);
    setTimeout(() => createBeep(1100, 0.2, 0.3), 180);
  },
  urgent: () => {
    createBeep(1200, 0.1, 0.4);
    setTimeout(() => createBeep(1200, 0.1, 0.4), 150);
    setTimeout(() => createBeep(1500, 0.15, 0.4), 300);
  },
  serviceBell: () => {
    createBeep(1400, 0.3, 0.25);
  },
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(() => localStorage.getItem('kds-muted') === 'true');

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      localStorage.setItem('kds-muted', String(next));
      return next;
    });
  }, []);

  const playSound = useCallback((type: 'newOrder' | 'urgent' | 'serviceBell') => {
    if (localStorage.getItem('kds-muted') === 'true') return;
    SOUND_MAP[type]?.();
  }, []);

  return (
    <SoundContext.Provider value={{ muted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
