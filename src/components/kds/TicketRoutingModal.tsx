import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Order, StationName } from '@/types/kds';
import { StationBadge, stationColors } from './StationBadge';
import { useLanguage } from '@/hooks/use-language';

const allStations: { name: StationName; activeItems: number }[] = [
  { name: 'Grill', activeItems: 3 },
  { name: 'Fry', activeItems: 2 },
  { name: 'Salad', activeItems: 1 },
  { name: 'Dessert', activeItems: 2 },
];

interface TicketRoutingModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (orderId: string, newStation: StationName) => void;
}

export function TicketRoutingModal({ order, onClose, onConfirm }: TicketRoutingModalProps) {
  const [selected, setSelected] = useState<StationName | null>(null);
  const { tp } = useLanguage();

  const orderLabel = `Ticket #${order.orderNumber} \u00B7 ${
    order.orderType === 'dine-in' ? 'Dine In' : order.orderType === 'take-out' ? 'Take Out' : order.orderType === 'delivery' ? 'Delivery' : 'Banquet'
  } \u00B7 ${order.tableName}`;

  const allItems = order.courses.flatMap(c => c.items).filter(i => !i.isCancelled);

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(order.id, selected);
    toast.success(`All items in ticket #${order.orderNumber} moved to ${selected} station`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
        <motion.div
          className="relative z-10 w-[90vw] flex flex-col"
          style={{
            maxWidth: 500,
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: 16,
            maxHeight: '85vh',
            overflow: 'auto',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 pb-2">
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>Re-route entire ticket</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{orderLabel}</div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center shrink-0"
              style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#374151' }}
            >
              <X size={14} color="#9ca3af" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pb-4 flex flex-col" style={{ gap: 16 }}>
            {/* Warning box */}
            <div style={{ backgroundColor: '#451a03', border: '1px solid #92400e', borderRadius: 8, padding: '10px 12px' }}>
              <span style={{ fontSize: 12, color: '#fcd34d', lineHeight: 1.5 }}>
                All items will move to the selected station. Current station assignments will be overridden.
              </span>
            </div>

            {/* Items list */}
            <div style={{ backgroundColor: '#111827', borderRadius: 8, border: '1px solid #374151' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', padding: '8px 12px 4px' }}>Items in this ticket</div>
              {allItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                  style={{
                    padding: '6px 12px',
                    borderTop: idx > 0 ? '1px solid #1f2937' : undefined,
                  }}
                >
                  <span style={{ fontSize: 13, color: '#fff' }}>{tp(item.name)}</span>
                  {item.station && <StationBadge station={item.station} />}
                </div>
              ))}
            </div>

            {/* Station selector */}
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', marginBottom: 8 }}>Move all items to:</div>
              <div className="grid grid-cols-2" style={{ gap: 8 }}>
                {allStations.map((s) => {
                  const isSelected = s.name === selected;
                  const dotColor = stationColors[s.name].text;
                  return (
                    <button
                      key={s.name}
                      onClick={() => setSelected(s.name)}
                      className="text-left"
                      style={{
                        backgroundColor: isSelected ? '#1e1535' : '#111827',
                        border: `1.5px solid ${isSelected ? '#7c3aed' : '#374151'}`,
                        borderRadius: 10,
                        padding: '12px 14px',
                        cursor: 'pointer',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: dotColor, display: 'inline-block' }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{s.name}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{s.activeItems} active items</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 pt-0">
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="w-full flex items-center justify-center"
              style={{
                padding: '12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: selected ? '#7c3aed' : '#374151',
                color: selected ? '#fff' : '#9ca3af',
                cursor: selected ? 'pointer' : 'default',
                border: 'none',
              }}
            >
              {selected ? `Move all items to ${selected}` : 'Select a station'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
