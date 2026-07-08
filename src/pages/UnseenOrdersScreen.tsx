import { useMemo, type ReactNode } from 'react';
import { CheckCircle, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderCard } from '@/components/kds/OrderCard';
import { useOrderStore } from '@/hooks/use-order-store';
import { useKDSMode } from '@/hooks/use-kds-mode';
import { useLanguage } from '@/hooks/use-language';
import { usePortrait } from '@/hooks/use-portrait';
import { useKDSSettings } from '@/hooks/use-kds-settings';
import { getKdsScaleClasses } from '@/lib/kds-scale';
import type { ViewMode } from '@/types/kds';
import type { ItemStatus } from '@/components/kds/CourseSection';

interface UnseenOrdersScreenProps {
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

function distributeIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const safeColumnCount = Math.max(1, columnCount);
  const columns = Array.from({ length: safeColumnCount }, () => [] as T[]);
  items.forEach((item, i) => {
    columns[i % safeColumnCount].push(item);
  });
  return columns;
}

export default function UnseenOrdersScreen({ orders: ordersProp, viewMode, showAllergens, onBump, onStepBack, onFireCourse, onItemStatusChange, onMarkSeen, onItemDismiss, renderCard }: UnseenOrdersScreenProps) {
  const { orders: storeOrders, seenOrderIds } = useOrderStore();
  const sourceOrders = ordersProp ?? storeOrders;
  const { mode: kdsMode, stationCourse } = useKDSMode();
  const isStationView = kdsMode === 'Prep' && !!stationCourse;
  const { isPortrait } = usePortrait();
  const { t } = useLanguage();
  const { textSize, ticketSpacing } = useKDSSettings();
  const scaleClasses = getKdsScaleClasses(textSize, ticketSpacing);

  const unseenOrders = useMemo(() => {
    let list = sourceOrders.filter(o => o.status !== 'served' && !seenOrderIds.has(o.id));
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
  }, [sourceOrders, seenOrderIds, isStationView, stationCourse]);

  if (unseenOrders.length === 0) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center px-8 ${scaleClasses}`}>
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-5">
          <CheckCircle size={40} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-1.5">{t.allCaughtUp}</h2>
        <p className="text-text-muted text-sm">
          {isStationView && stationCourse ? `No new ${stationCourse} orders` : t.noNewUnseen}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${scaleClasses}`}>
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2 shrink-0">
        <span className="text-[11px] font-bold uppercase text-text-muted bg-muted px-2.5 py-1 rounded tracking-wider">
          {t.unseenOrdersHeader}
        </span>
        <span className="bg-[#E84C3D] text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {unseenOrders.length}
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
                <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit" className="shrink-0 w-[180px] sm:w-[190px] lg:w-[200px] xl:w-[210px]">
                  <OrderCard order={order} onBump={onBump} onRecall={onStepBack} onFireCourse={onFireCourse} onItemStatusChange={onItemStatusChange} showAllergens={showAllergens} highlightItemNames={new Set()} onMarkSeen={onMarkSeen} onItemDismiss={onItemDismiss} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          (() => {
            const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
            const columnCount = isPortrait ? (vw >= 960 ? 3 : 2) : 4;
            const columns = distributeIntoColumns(unseenOrders, columnCount);
            return (
              <div className="flex gap-1.5 sm:gap-2 lg:gap-2.5 items-start">
                {columns.map((col, colIdx) => (
                  <div key={colIdx} className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2 lg:gap-2.5">
                    <AnimatePresence mode="popLayout">
                      {col.map(order => (
                        <motion.div key={order.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit" className="min-w-0">
                          <OrderCard order={order} onBump={onBump} onRecall={onStepBack} onFireCourse={onFireCourse} onItemStatusChange={onItemStatusChange} showAllergens={showAllergens} highlightItemNames={new Set()} onMarkSeen={onMarkSeen} onItemDismiss={onItemDismiss} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
