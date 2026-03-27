import type { OrderStatus } from '@/types/kds';

const statusConfig: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  'new': { bg: 'bg-status-new/15', text: 'text-status-new', label: 'NEW' },
  'in-progress': { bg: 'bg-status-in-progress/15', text: 'text-status-in-progress', label: 'IN PROGRESS' },
  'seen': { bg: 'bg-status-seen/15', text: 'text-status-seen', label: 'SEEN' },
  'served': { bg: 'bg-status-served/15', text: 'text-status-served', label: 'SERVED' },
  'overtime': { bg: 'bg-status-overtime/15', text: 'text-status-overtime', label: 'OVERTIME' },
  'cancelled': { bg: 'bg-destructive/15', text: 'text-destructive', label: 'CANCELLED' },
  'recalled': { bg: 'bg-order-take-out/15', text: 'text-order-take-out', label: 'RECALLED' },
};

interface StatusChipProps {
  status: OrderStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
