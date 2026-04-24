import { useMemo } from 'react';
import { CheckCircle, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderCard } from '@/components/kds/OrderCard';
import { useOrderStore } from '@/hooks/use-order-store';
import { useLanguage } from '@/hooks/use-language';
import { usePortrait } from '@/hooks/use-portrait';
import type { ViewMode } from '@/types/kds';
import type { ItemStatus } from '@/components/kds/CourseSection';

interface UnseenOrdersScreenProps {
  viewMode: ViewMode;
  showAllergens: boolean;
  onBump: (orderId: string) => void;
  onStepBack: (orderId: string) => void;
  onFireCourse: (orderId: string, course: string) => void;
  onItemStatusChange: (itemId: string, status: ItemStatus | undefined) => void;
  onMarkSeen?: (orderId: string) => void;
  onItemDismiss?: (orderId: string, item: import("@/types/kds").OrderItem) => void;
}

const cardVariants = {
  initial: { opacity: 0, x: 80, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 200 } },
  exit: { opacity: 0, scale: 0.9, filter: 'grayscale(1)', transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function UnseenOrdersScreen({ viewMode, showAllergens, onBump, onStepBack, onFireCourse, onItemStatusChange, onMarkSeen, onItemDismiss }: UnseenOrdersScreenProps) {
  const { orders, seenOrderIds } = useOrderStore();
  const { isPortrait } = usePortrait();
  const { t } = useLanguage();

  const unseenOrders = useMemo(() =>
    orders.filter(o => o.status !== 'served' && !seenOrderIds.has(o.id)),
    [orders, seenOrderIds]
  );

  if (unseenOrders.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-5">
          <CheckCircle size={40} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-1.5">{t.allCaughtUp}</h2>
        <p className="text-text-muted text-sm">{t.noNewUnseen}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2 shrink-0">
        <span className="text-[11px] font-bold uppercase text-text-muted bg-muted px-2.5 py-1 rounded tracking-wider">
          {t.unseenOrdersHeader}
        </span>
        <span className="bg-[#E84C3D] text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {unseenOrders.length}
        </span>
      </div>
      <div className="flex-1 overflow-auto p-1.5">
        {isPortrait ? (
          <div className="grid grid-cols-2 gap-1.5">
            <AnimatePresence mode="popLayout">
              {unseenOrders.map(order => (
                <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit">
                  <OrderCard order={order} onBump={onBump} onRecall={onStepBack} onFireCourse={onFireCourse} onItemStatusChange={onItemStatusChange} showAllergens={showAllergens} highlightItemNames={new Set()} onMarkSeen={onMarkSeen} onItemDismiss={onItemDismiss} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-1.5 items-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {unseenOrders.map(order => (
                <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit" className="min-w-0">
                  <OrderCard order={order} onBump={onBump} onRecall={onStepBack} onFireCourse={onFireCourse} onItemStatusChange={onItemStatusChange} showAllergens={showAllergens} highlightItemNames={new Set()} onMarkSeen={onMarkSeen} onItemDismiss={onItemDismiss} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : viewMode === 'horizontal' ? (
          <div className="flex gap-1.5 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
            <AnimatePresence mode="popLayout">
              {unseenOrders.map(order => (
                <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit" className="shrink-0 w-[280px]">
                  <OrderCard order={order} onBump={onBump} onRecall={onStepBack} onFireCourse={onFireCourse} onItemStatusChange={onItemStatusChange} showAllergens={showAllergens} highlightItemNames={new Set()} onMarkSeen={onMarkSeen} onItemDismiss={onItemDismiss} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-row flex-wrap gap-3 items-start">
            <AnimatePresence mode="popLayout">
              {unseenOrders.map(order => (
                <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit" className="flex-1" style={{ minWidth: 280, maxWidth: 400 }}>
                  <OrderCard order={order} onBump={onBump} onRecall={onStepBack} onFireCourse={onFireCourse} onItemStatusChange={onItemStatusChange} showAllergens={showAllergens} highlightItemNames={new Set()} onMarkSeen={onMarkSeen} onItemDismiss={onItemDismiss} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
