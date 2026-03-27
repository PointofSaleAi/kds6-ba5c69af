import { useState } from 'react';
import { X, Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Alert {
  id: string;
  type: 'overtime' | 'new-order' | 'recalled' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
}

// TODO: Replace with API data
const mockAlerts: Alert[] = [
  { id: 'a1', type: 'overtime', message: 'Order #22 is 10+ minutes overtime', timestamp: '2 min ago', read: false },
  { id: 'a2', type: 'new-order', message: 'New order #27 received (DINE IN, Table 9)', timestamp: '3 min ago', read: false },
  { id: 'a3', type: 'recalled', message: 'Order #18 recalled by Manager', timestamp: '12 min ago', read: false },
  { id: 'a4', type: 'system', message: 'Printer "Kitchen HP" is offline', timestamp: '25 min ago', read: true },
  { id: 'a5', type: 'new-order', message: 'New order #26 received (BANQUET)', timestamp: '30 min ago', read: true },
];

const alertIcons: Record<string, { icon: React.ElementType; color: string }> = {
  overtime: { icon: AlertTriangle, color: 'text-destructive' },
  'new-order': { icon: Bell, color: 'text-warning' },
  recalled: { icon: Info, color: 'text-status-in-progress' },
  system: { icon: Info, color: 'text-order-take-out' },
};

interface AlertsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function AlertsPanel({ open, onClose }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState(mockAlerts);

  const markAllRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  const dismiss = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-dark/30 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[360px] bg-surface-card shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Alerts</h2>
              <div className="flex items-center gap-3">
                <button onClick={markAllRead} className="text-sm text-brand-primary hover:underline">Mark all read</button>
                <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close alerts">
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <CheckCircle size={48} className="text-success mb-4" />
                  <p className="text-text-primary font-semibold">No alerts, all clear</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {alerts.map((alert) => {
                    const config = alertIcons[alert.type];
                    return (
                      <div key={alert.id} className={`flex gap-3 px-4 py-3 ${!alert.read ? 'bg-brand-primary/5' : ''}`}>
                        <config.icon size={20} className={`${config.color} shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!alert.read ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">{alert.timestamp}</p>
                        </div>
                        <button onClick={() => dismiss(alert.id)} className="p-1 hover:bg-muted rounded shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Dismiss alert">
                          <X size={14} className="text-text-muted" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
