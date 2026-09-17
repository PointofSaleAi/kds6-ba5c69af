import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import PosaiLogo from '@/components/PosaiLogo';
import { useLanguage } from '@/hooks/use-language';

interface DeviceActivatedScreenProps {
  onComplete: () => void;
}

export default function DeviceActivatedScreen({ onComplete }: DeviceActivatedScreenProps) {
  const [countdown, setCountdown] = useState(3);
  const { tui } = useLanguage();

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { onComplete(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#0D0D1A' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center text-center px-6"
      >
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'hsl(145, 63%, 42%)' }}>
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>

        <PosaiLogo variant="light" className="h-28 object-contain mb-3" />

        <h1 className="text-white text-2xl font-bold font-montserrat mb-2">{tui('Device Activated')}</h1>
        <p className="text-sm font-montserrat" style={{ color: '#6C7A89' }}>
          {tui('Entering Kitchen Display System in {n}s...', { n: countdown })}
        </p>
      </motion.div>
    </div>
  );
}
