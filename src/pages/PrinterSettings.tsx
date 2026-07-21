import { useState } from 'react';
import { X, Printer, Wifi, WifiOff, AlertTriangle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PrinterSettingsProps {
  open: boolean;
  onClose: () => void;
}

interface PrinterDevice {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'low-paper';
}

const mockPrinters: PrinterDevice[] = [
  { id: 'p1', name: 'Kitchen Epson TM-T88', ip: '192.168.1.101', status: 'online' },
  { id: 'p2', name: 'Bar Printer', ip: '192.168.1.102', status: 'online' },
  { id: 'p3', name: 'Expo Printer', ip: '192.168.1.103', status: 'low-paper' },
  { id: 'p4', name: 'Backup Printer', ip: '192.168.1.104', status: 'offline' },
];

function StatusDot({ status }: { status: PrinterDevice['status'] }) {
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-destructive',
    'low-paper': 'bg-amber-500',
  };
  const labels = {
    online: 'Online',
    offline: 'Offline',
    'low-paper': 'Low paper',
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
      <span className="text-xs text-text-muted">{labels[status]}</span>
    </div>
  );
}

export default function PrinterSettings({ open, onClose }: PrinterSettingsProps) {
  const [mainPrinter, setMainPrinter] = useState('p1');

  if (!open) return null;

  const handleSetMain = (id: string) => {
    setMainPrinter(id);
    toast.success('Main printer updated');
  };

  const handleTestPrint = (name: string) => {
    toast.info(`Test print sent to ${name}`);
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
            <Printer size={20} className="text-text-muted" />
            <h2 className="text-lg font-bold text-text-primary">Printer Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Current main */}
            <div className="px-4 pt-4 pb-2">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Current Main Printer</div>
              {(() => {
                const current = mockPrinters.find((p) => p.id === mainPrinter);
                if (!current) return null;
                return (
                  <div className="flex items-center gap-3 bg-brand-primary/10 rounded-lg p-3 border border-brand-primary/20">
                    <Printer size={24} className="text-brand-primary shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-text-primary">{current.name}</div>
                      <div className="text-xs text-text-muted">{current.ip}</div>
                    </div>
                    <StatusDot status={current.status} />
                  </div>
                );
              })()}
            </div>

            {/* Available printers */}
            <div className="px-4 pt-4">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Available Printers</div>
              <div className="space-y-2">
                {mockPrinters.map((printer) => (
                  <div
                    key={printer.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors min-h-[56px] ${
                      mainPrinter === printer.id ? 'border-brand-primary bg-brand-primary/5' : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <button
                      onClick={() => setMainPrinter(printer.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        mainPrinter === printer.id ? 'border-brand-primary' : 'border-text-muted'
                      }`}>
                        {mainPrinter === printer.id && <div className="w-3 h-3 rounded-full bg-brand-primary" />}
                      </div>
                    </button>

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
                      Test
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Set as main CTA */}
            <div className="px-4 py-4">
              <button
                onClick={() => handleSetMain(mainPrinter)}
                className="w-full py-3 bg-brand-primary text-primary-foreground font-bold text-sm uppercase rounded-lg transition-colors hover:bg-brand-primary/90 min-h-[44px]"
              >
                Set as Main Printer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
