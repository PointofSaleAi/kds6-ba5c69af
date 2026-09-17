import { useState } from 'react';
import { X, Printer, Search, AlertTriangle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/use-language';

interface PrintersScreenProps {
  open: boolean;
  onClose: () => void;
}

interface PrinterDevice {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'low-paper';
  paired: boolean;
}

const mockPrinters: PrinterDevice[] = [
  { id: 'p1', name: 'Kitchen Epson TM-T88', ip: '192.168.1.101', status: 'online', paired: true },
  { id: 'p2', name: 'Bar Printer', ip: '192.168.1.102', status: 'online', paired: true },
  { id: 'p3', name: 'Expo Printer', ip: '192.168.1.103', status: 'low-paper', paired: true },
  { id: 'p4', name: 'Backup Printer', ip: '192.168.1.104', status: 'offline', paired: false },
];

function StatusDot({ status }: { status: PrinterDevice['status'] }) {
  const { tui } = useLanguage();
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-destructive',
    'low-paper': 'bg-amber-500',
  };
  const labels = {
    online: tui('Online'),
    offline: tui('Offline'),
    'low-paper': tui('Low paper'),
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
      <span className="text-xs text-text-muted">{labels[status]}</span>
    </div>
  );
}

export default function PrintersScreen({ open, onClose }: PrintersScreenProps) {
  const { tui } = useLanguage();
  const [detecting, setDetecting] = useState(false);

  if (!open) return null;

  const pairedPrinters = mockPrinters.filter((p) => p.paired);

  const handleTestPrint = (name: string) => {
    toast.info(tui('Test print sent to {name}', { name }));
  };

  const handleDetect = () => {
    setDetecting(true);
    setTimeout(() => {
      setDetecting(false);
      toast.success(tui('Device detection complete'));
    }, 2000);
  };

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
            <div className="text-xs text-text-muted font-medium">{tui('Printers')} &gt; {tui('Paired Printers')}</div>
            <h2 className="text-lg font-bold text-text-primary">{tui('Printers')}</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={tui('Close')}>
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 px-4 pt-4">
            <button
              onClick={() => handleTestPrint('all paired printers')}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-primary text-primary-foreground font-bold text-sm uppercase rounded-lg transition-colors hover:bg-brand-primary/90 min-h-[44px]"
            >
              <Printer size={16} />
              {tui('Test Printer')}
            </button>
            <button
              onClick={handleDetect}
              disabled={detecting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted text-text-primary font-bold text-sm uppercase rounded-lg transition-colors hover:bg-muted/80 min-h-[44px] disabled:opacity-50"
            >
              <Search size={16} className={detecting ? 'animate-pulse' : ''} />
              {detecting ? tui('Detecting...') : tui('Detect device')}
            </button>
          </div>

          {/* Paired printers list */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
            <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
              {tui('Paired Printers')} ({pairedPrinters.length})
            </div>
            <div className="space-y-2">
              {pairedPrinters.map((printer) => (
                <div
                  key={printer.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted/30 transition-colors min-h-[56px]"
                >
                  <Printer size={20} className="text-text-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{printer.name}</span>
                      {printer.status === 'low-paper' && <AlertTriangle size={14} className="text-amber-500" />}
                    </div>
                    <div className="text-xs text-text-muted">{printer.ip}</div>
                  </div>
                  <StatusDot status={printer.status} />
                  <button
                    onClick={() => handleTestPrint(printer.name)}
                    className="px-3 py-2 text-xs font-semibold text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/10 transition-colors min-h-[44px]"
                  >
                    {tui('Test')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
