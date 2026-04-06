import { useNavigate } from 'react-router-dom';
import { allCoursingOrders } from '@/data/mock-coursing-order';
import { OrderTypeBadge } from '@/components/kds/OrderTypeBadge';
import { CourseBlockSection } from '@/components/kds/coursing/CourseBlockSection';
import undoIcon from '@/assets/undo-icon.svg';

const orderTypeMap: Record<string, 'dine-in' | 'take-out' | 'delivery' | 'banquet'> = {
  'Dine In': 'dine-in',
  'Take Out': 'take-out',
  'Banquet': 'banquet',
};

export default function FullKDSView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-bg p-6 flex flex-col items-center">
      <div className="w-full max-w-[1200px]">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-modifier text-text-secondary hover:text-text-primary transition-colors"
        >
          &larr; Back to selector
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allCoursingOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg overflow-hidden bg-surface-card shadow-sm border border-border"
            >
              {/* Header */}
              <OrderTypeBadge
                type={orderTypeMap[order.orderType] ?? 'banquet'}
                time={order.elapsedTimer}
                tableInfo={order.tableOrLocation}
              />

              {/* Order number + status */}
              <div className="px-3 pt-2 pb-1">
                <div className="flex items-start justify-between">
                  <div className="text-order-num text-text-primary leading-none">
                    {order.orderNumber}
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-status-in-progress/15 text-status-in-progress">
                    {order.statusBadge}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono-timer text-timer text-warning">
                    {order.elapsedTimer}
                  </span>
                  <span className="text-modifier text-text-secondary">{order.waiterName}</span>
                </div>
              </div>

              {/* Course blocks */}
              <div className="border-t border-border">
                {order.courses.map((course) => (
                  <CourseBlockSection key={course.id} course={course} />
                ))}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-border flex gap-2">
                <button className="w-[44px] min-h-[44px] bg-muted rounded flex items-center justify-center hover:opacity-80 transition-colors shrink-0">
                  <img src={undoIcon} alt="Undo" className="w-8 h-6" />
                </button>
                <button className="flex-1 py-2.5 bg-primary text-primary-foreground text-cta rounded flex items-center justify-center gap-2 uppercase hover:opacity-90 transition-colors min-h-[44px]">
                  &#10003; Done
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
