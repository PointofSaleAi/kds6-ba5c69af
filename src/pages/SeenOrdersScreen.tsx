import { useMemo, type ReactNode } from 'react';
import { Eye, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderCard } from '@/components/kds/OrderCard';
import { useOrderStore } from '@/hooks/use-order-store';
import { useKDSMode } from '@/hooks/use-kds-mode';
import { useLanguage } from '@/hooks/use-language';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { getKdsScaleClasses } from '@/lib/kds-scale';
import { usePortrait } from '@/hooks/use-portrait';
import type { ViewMode } from '@/types/kds';
import type { ItemStatus } from '@/components/kds/CourseSection';

interface SeenOrdersScreenProps {
  orders?: import('@/types/kds').Order[];
  viewMode: ViewMode;
  showAllergens: boolean;
  onBump: (orderId: string) => void;
  onStepBack: (orderId: string) => void;
  onFireCourse: (orderId: string, course: string) => void;
  onItemStatusChange: (itemId: string, status: ItemStatus | undefined) => void;
  onMarkSeen?: (orderId: string) => void;
  onItemDismiss?: (orderId: string, item: import("@/types/kds").OrderItem) => void;
  renderCard?: (order: import('@/types/kds').Order) => ReactNode;
}

const cardVariants = {
  initial: { opacity: 0, x: 80, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 200 } },
  exit: { opacity: 0, scale: 0.9, filter: 'grayscale(1)', transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function SeenOrdersScreen({ orders: ordersProp, viewMode, showAllergens, onBump, onStepBack, onFireCourse, onItemStatusChange, onMarkSeen, onItemDismiss }: SeenOrdersScreenProps) {
  const { orders: storeOrders, seenOrderIds } = useOrderStore();
  const orders = ordersProp ?? storeOrders;
  const { mode: kdsMode, stationCourse } = useKDSMode();
  const isStationView = kdsMode === 'Prep' && !!stationCourse;
  const { t } = useLanguage();
  const { isPortrait } = usePortrait();
  const { textSize, ticketSpacing } = useKDSSettings();
  const scaleClasses = getKdsScaleClasses(textSize, ticketSpacing);

  const seenOrders = useMemo(() => {
    let list = orders.filter(o => o.status !== 'served' && seenOrderIds.has(o.id));
    if (isStationView && stationCourse) {
      list = list
        .filter(o =>
          o.courses.some(c =>
            c.items.some(i => !i.isCompleted && !i.isCancelled && i.category === stationCourse)
          )
        )
        .map(o => ({
          ...o,
          courses: o.courses
            .map(c => ({ ...c, items: c.items.filter(i => i.category === stationCourse) }))
            .filter(c => c.items.length > 0),
        }));
    }
    return list;
  }, [orders, seenOrderIds, isStationView, stationCourse]);

  if (seenOrders.length === 0) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center px-8 ${scaleClasses}`}>
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-5">
          <Eye size={40} className="text-text-muted" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-1.5">Nothing seen yet</h2>
        <p className="text-text-muted text-sm">
          {isStationView && stationCourse
            ? `No seen ${stationCourse} orders right now`
            : 'Orders you acknowledge will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${scaleClasses}`}>
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2 shrink-0">
        <span className="text-[11px] font-bold uppercase text-text-muted bg-muted px-2.5 py-1 rounded tracking-wider">
          Seen Orders
        </span>
        <span className="bg-[#2980B9] text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {seenOrders.length}
        </span>
        {isStationView && stationCourse && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-[#4F46E5] px-2 py-0.5 rounded">
            {stationCourse} station
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-1.5">
        {viewMode === 'grid' ? (
          <div className={`grid gap-1.5 items-start ${isPortrait ? 'grid-cols-2 min-[960px]:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'}`}>
            <AnimatePresence mode="popLayout">
              {seenOrders.map(order => (
                <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit" className="min-w-0">
                  <OrderCard order={order} onBump={onBump} onRecall={onStepBack} onFireCourse={onFireCourse} onItemStatusChange={onItemStatusChange} showAllergens={showAllergens} highlightItemNames={new Set()} onMarkSeen={onMarkSeen} onItemDismiss={onItemDismiss} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : viewMode === 'horizontal' ? (
          <div className="flex gap-1.5 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
            <AnimatePresence mode="popLayout">
              {seenOrders.map(order => (
                <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit" className="shrink-0 w-[180px] sm:w-[190px] lg:w-[200px] xl:w-[210px]">
                  <OrderCard order={order} onBump={onBump} onRecall={onStepBack} onFireCourse={onFireCourse} onItemStatusChange={onItemStatusChange} showAllergens={showAllergens} highlightItemNames={new Set()} onMarkSeen={onMarkSeen} onItemDismiss={onItemDismiss} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-row flex-wrap gap-3 items-start">
            <AnimatePresence mode="popLayout">
              {seenOrders.map(order => (
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
