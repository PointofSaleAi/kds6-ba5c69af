import { useState } from 'react';
import { X, Printer, Search, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export type PrinterModalType = 'kot' | 'label';

interface PrinterRoutingModalProps {
  open: boolean;
  onClose: () => void;
  type?: PrinterModalType;
  onConfirm?: (printer: { id: string; name: string; status: 'online' | 'offline' | 'low-paper' }) => void;
  initialSelectedId?: string | null;
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

const mockLabelPrinters: PrinterDevice[] = [
  { id: 'lp1', name: 'Zebra ZD421', ip: '192.168.1.201', status: 'online' },
  { id: 'lp2', name: 'Dymo LabelWriter 450', ip: '192.168.1.202', status: 'online' },
  { id: 'lp3', name: 'Zebra ZD230', ip: '192.168.1.203', status: 'low-paper' },
  { id: 'lp4', name: 'Dymo LabelWriter 550', ip: '192.168.1.204', status: 'offline' },
];

function StatusDot({ status }: { status: PrinterDevice['status'] }) {
  const colors = {
    online: 'bg-status-done',
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
      <span className="text-xs font-semibold text-text-secondary">{labels[status]}</span>
    </div>
  );
}

const titles: Record<PrinterModalType, string> = {
  kot: 'KOT printer',
  label: 'Label Printer',
};

const ctas: Record<PrinterModalType, string> = {
  kot: 'SET AS KOT PRINTER',
  label: 'SET AS LABEL PRINTER',
};

export default function PrinterRoutingModal({
  open,
  onClose,
  type = 'kot',
  onConfirm,
  initialSelectedId,
}: PrinterRoutingModalProps) {
  const printers = type === 'label' ? mockLabelPrinters : mockPrinters;
  const [selected, setSelected] = useState(initialSelectedId || printers[0]?.id || '');
  const [detecting, setDetecting] = useState(false);

  if (!open) return null;

  const handleTestPrint = (name: string) => {
    toast.info(`Test print sent to ${name}`);
  };

  const handleDetect = () => {
    setDetecting(true);
    setTimeout(() => {
      setDetecting(false);
      toast.success('Device detection complete');
    }, 2000);
  };

  const handleConfirm = () => {
    const printer = printers.find((p) => p.id === selected);
    if (printer) {
      toast.success(`Print destination set to ${printer.name}`);
      onConfirm?.({ id: printer.id, name: printer.name, status: printer.status });
    }
    onClose();
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
          className="bg-surface-card rounded-t-2xl sm:rounded-[20px] w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <Printer size={20} className="text-text-secondary" />
            <h2 className="text-lg font-bold text-text-primary">{titles[type]}</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Detect button */}
          <div className="px-4 pt-4">
            <button
              onClick={handleDetect}
              disabled={detecting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted text-text-primary font-bold text-sm uppercase rounded-lg transition-colors hover:bg-muted/80 min-h-[44px] disabled:opacity-50"
            >
              <Search size={16} className={detecting ? 'animate-pulse' : ''} />
              {detecting ? 'Detecting...' : 'Detect device'}
            </button>
          </div>

          {/* Printer list */}
          <div className="flex-1 overflow-y-auto px-4 pt-4">
            <div className="text-xs font-bold text-text-primary uppercase tracking-widest mb-3">
              Available printers ({printers.length})
            </div>
            <div className="space-y-2">
              {printers.map((printer) => (
                <div
                  key={printer.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors min-h-[56px] ${
                    selected === printer.id ? 'border-brand-primary bg-brand-primary/5' : 'border-border hover:bg-muted/30'
                  }`}
                >
                  <button
                    onClick={() => setSelected(printer.id)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selected === printer.id ? 'border-brand-primary' : 'border-text-muted'
                    }`}>
                      {selected === printer.id && <div className="w-3 h-3 rounded-full bg-brand-primary" />}
                    </div>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{printer.name}</span>
                      {printer.status === 'low-paper' && <AlertTriangle size={14} className="text-amber-500" />}
                    </div>
                    <div className="text-xs font-medium text-text-secondary">{printer.ip}</div>
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

          {/* Confirm button */}
          <div className="px-4 py-4 shrink-0">
            <button
              onClick={handleConfirm}
              className="w-full py-3 bg-brand-dark text-primary-foreground font-bold text-sm uppercase rounded-lg transition-colors hover:bg-brand-dark/90 min-h-[44px]"
            >
              {ctas[type]}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
