import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PosaiLogo from '@/components/PosaiLogo';
import { useLanguage } from '@/hooks/use-language';

interface SplashScreenProps {
  onReady: () => void;
}

const statusMessageKeys = [
  'Connecting to kitchen server...',
  'Syncing orders...',
  'Ready',
];

export default function SplashScreen({ onReady }: SplashScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isConnected] = useState(true);
  const { tui } = useLanguage();

  useEffect(() => {
    const timers = [
      setTimeout(() => setMessageIndex(1), 1200),
      setTimeout(() => setMessageIndex(2), 2400),
      setTimeout(() => onReady(), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onReady]);

  return (
    <div className="fixed inset-0 bg-surface-card flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* Logo */}
        <PosaiLogo variant="auto" className="h-28 object-contain" />

        <p className="text-text-secondary text-lg mt-2 font-medium">
          {tui('Kitchen Display System')}
        </p>

        {/* Loading dots */}
        <div className="flex gap-2 mt-10">
          <span className="w-3 h-3 rounded-full bg-brand-primary animate-dot-1" />
          <span className="w-3 h-3 rounded-full bg-brand-primary animate-dot-2" />
          <span className="w-3 h-3 rounded-full bg-brand-primary animate-dot-3" />
        </div>

        {/* Status message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mt-6 text-sm ${messageIndex === 2 ? 'text-success font-semibold' : 'text-text-muted'}`}
          >
            {tui(statusMessageKeys[messageIndex])}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Connection status */}
      <div className="absolute bottom-6 left-6 flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`} />
        <span className="text-sm text-text-muted">
          {isConnected ? tui('Connected') : tui('Offline (edgeOS mode)')}
        </span>
      </div>
    </div>
  );
}
