import { useState } from 'react';
import { X, Wifi, WifiOff, RefreshCw, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/use-language';

interface WebSocketSettingsProps {
  open: boolean;
  onClose: () => void;
}

export default function WebSocketSettings({ open, onClose }: WebSocketSettingsProps) {
  const { tui } = useLanguage();
  const [localBackup, setLocalBackup] = useState(true);
  const [backupAddress, setBackupAddress] = useState('192.168.1.50');
  const [deviceName, setDeviceName] = useState('Kitchen Display 1');
  const [cloudConnected] = useState(true);

  if (!open) return null;

  const handleSync = () => toast.success(tui('Sync complete'));
  const handleForceSync = () => toast.info(tui('Force sync initiated. Brief interruption may occur.'));

  const syncLog = [
    { time: '14:32:05', event: tui('Orders synced ({n} new)', { n: 12 }) },
    { time: '14:30:00', event: tui('Cloud heartbeat OK') },
    { time: '14:28:45', event: tui('Local backup synced') },
  ];

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
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <Server size={20} className="text-text-secondary" />
            <h2 className="text-lg font-bold text-text-primary">{tui('Connection Settings')}</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={tui('Close')}>
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Local Backup */}
            <div className="px-4 pt-4">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">{tui('Local Backup Server')}</div>
              <button
                onClick={() => setLocalBackup(!localBackup)}
                className="w-full flex items-center justify-between py-3 min-h-[52px]"
              >
                <div>
                  <div className="text-sm font-medium text-text-primary text-left">{tui('Enable Local Backup')}</div>
                  <div className="text-xs text-text-secondary text-left">{tui('Keeps Kitchen Display System working even if internet goes down')}</div>
                </div>
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors min-w-[44px] ${localBackup ? 'bg-brand-primary' : 'bg-border'}`}
                  role="switch"
                  aria-checked={localBackup}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-surface-card rounded-full transition-transform shadow-sm ${localBackup ? 'translate-x-5' : ''}`} />
                </div>
              </button>
              {localBackup && (
                <div className="mt-2 mb-3">
                  <div className="text-xs text-text-secondary mb-1">{tui('Backup Server Address')}</div>
                  <input
                    type="text"
                    value={backupAddress}
                    onChange={(e) => setBackupAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-muted rounded-lg border border-border text-sm text-text-primary min-h-[44px]"
                  />
                </div>
              )}
            </div>

            {/* Cloud Server */}
            <div className="px-4 pt-4">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">{tui('Cloud Server')}</div>
              <div className="flex items-center gap-3 py-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  cloudConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {cloudConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                  {cloudConnected ? tui('Connected') : tui('Disconnected')}
                </div>
              </div>
              <div className="text-xs text-text-secondary mt-1">{tui('Server: {server}', { server: 'ws.posai.com' })}</div>
            </div>

            {/* Device info */}
            <div className="px-4 pt-4">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">{tui('Device Info')}</div>
              <div className="mb-2">
                <div className="text-xs text-text-secondary mb-1">{tui('Device Name')}</div>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted rounded-lg border border-border text-sm text-text-primary min-h-[44px]"
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-xs text-text-secondary">{tui('Last Order Number')}</div>
                  <div className="text-sm font-semibold text-text-primary">#1,247</div>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <RefreshCw size={16} className="text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Sync actions */}
            <div className="px-4 pt-4">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">{tui('Sync')}</div>
              <div className="space-y-2">
                <button
                  onClick={handleSync}
                  className="w-full py-3 bg-brand-primary text-primary-foreground font-bold text-sm uppercase rounded-lg transition-colors hover:bg-brand-primary/90 min-h-[44px]"
                >
                  {tui('Sync now')}
                </button>
                <button
                  onClick={handleForceSync}
                  className="w-full py-3 text-sm font-semibold text-text-secondary border border-border rounded-lg hover:bg-muted transition-colors min-h-[44px]"
                >
                  {tui('Force Sync')}
                </button>
                <div className="text-xs text-text-secondary text-center">{tui('May Cause a Brief Interruption')}</div>
              </div>
            </div>

            {/* Connection log */}
            <div className="px-4 pt-4 pb-4">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">{tui('Recent Sync Events')}</div>
              <div className="space-y-1">
                {syncLog.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1">
                    <span className="text-text-secondary font-mono">{entry.time}</span>
                    <span className="text-text-secondary">{entry.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
