import { CheckCircle, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function EmptyState() {
  // TODO: Replace with API data
  const stats = [
    { label: 'Orders Served', value: '48', icon: CheckCircle, color: 'text-success' },
    { label: 'Avg Ticket Time', value: '14 min', icon: Clock, color: 'text-warning' },
    { label: 'Fastest Ticket', value: '6 min', icon: Zap, color: 'text-brand-primary' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6"
      >
        <CheckCircle size={48} className="text-success" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-text-primary mb-2"
      >
        Queue is clear, great work!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-text-secondary text-sm mb-8"
      >
        Last order served at 2:34 PM - 48 orders completed today
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-card rounded-lg p-4 min-w-[140px] text-center shadow-sm border border-border">
            <stat.icon size={24} className={`${stat.color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
            <div className="text-xs text-text-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
