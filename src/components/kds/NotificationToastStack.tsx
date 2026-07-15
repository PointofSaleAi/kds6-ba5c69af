import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowRightLeft, Utensils, Plus, Flame, Megaphone, AlertTriangle, Bell, Info, PackageX } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import type { NotificationType } from '@/types/notification';

const typeIcons: Record<NotificationType, React.ElementType> = {
  'table-transfer': ArrowRightLeft,
  'item-moved': Utensils,
  'new-item-added': Plus,
  'course-fired': Flame,
  'general-alert': Megaphone,
  'overtime': AlertTriangle,
  'new-order': Bell,
  'recalled': Info,
  'low-stock': PackageX,
  'pos-86d': Ban,
  'system': Info,
};

export function NotificationToastStack() {
  const { activeToasts, dismissToast } = useNotifications();

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-[560px] px-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {activeToasts.map((toast) => {
          const Icon = typeIcons[toast.type] || Bell;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ y: -40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={() => dismissToast(toast.id)}
              className="pointer-events-auto cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl"
              style={{ backgroundColor: 'hsl(220 20% 14%)', color: '#fff' }}
            >
              <Icon size={16} className="shrink-0 opacity-80" />
              <p className="flex-1 text-[14px] font-medium leading-snug truncate">{toast.message}</p>
              <button
                onClick={(e) => { e.stopPropagation(); dismissToast(toast.id); }}
                className="shrink-0 p-1 rounded hover:bg-white/10 min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X size={14} className="opacity-60" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
