import { useNavigate } from 'react-router-dom';
import { mockCoursingOrder } from '@/data/mock-coursing-order';
import { OrderTypeBadge } from '@/components/kds/OrderTypeBadge';
import { CourseBlockSection } from '@/components/kds/coursing/CourseBlockSection';
import undoIcon from '@/assets/undo-icon.svg';

const orderTypeMap: Record<string, 'dine-in' | 'take-out' | 'delivery' | 'banquet'> = {
  'Dine In': 'dine-in',
  'Take Out': 'take-out',
  'Banquet': 'banquet',
};

const STATION_COURSE = 'Entree';

function getStationLabel(course: typeof mockCoursingOrder.courses[number]): string {
  if (course.name === STATION_COURSE) {
    return `${course.name} \u00B7 Your station \u2014 active`;
  }
  if (course.status === 'fired') {
    return `${course.name} \u00B7 Other station`;
  }
  return `${course.name} \u00B7 Other station \u2014 pending`;
}

export default function StationKDSView() {
  const navigate = useNavigate();
  const order = mockCoursingOrder;

  // Check if the course before the station's course is fired
  const stationIndex = order.courses.findIndex((c) => c.name === STATION_COURSE);
  const prevCourseFired = stationIndex > 0 && order.courses[stationIndex - 1].status === 'fired';
  const prevCourse = stationIndex > 0 ? order.courses[stationIndex - 1] : null;

  return (
    <div className="min-h-screen bg-surface-bg p-6 flex flex-col items-center">
      <div className="w-full max-w-[480px]">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-modifier text-text-secondary hover:text-text-primary transition-colors"
        >
          &larr; Back to selector
        </button>

        <div className="rounded-lg overflow-hidden bg-surface-card shadow-sm border border-border">
          {/* Header */}
          <div className="relative">
            <OrderTypeBadge
              type={orderTypeMap[order.orderType] ?? 'banquet'}
              time={order.elapsedTimer}
              tableInfo={order.tableOrLocation}
            />
            {/* Station identity badge overlay in header row */}
          </div>

          {/* Order number + status + station badge */}
          <div className="px-3 pt-2 pb-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="text-order-num text-text-primary leading-none">
                  {order.orderNumber}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: '#EEEDFE', color: '#3C3489' }}
                >
                  Entree station
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-status-in-progress/15 text-status-in-progress">
                  {order.statusBadge}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono-timer text-timer text-warning">
                {order.elapsedTimer}
              </span>
              <span className="text-modifier text-text-secondary">{order.waiterName}</span>
            </div>
          </div>

          {/* Notification strip */}
          {prevCourseFired && prevCourse && (
            <div className="px-3 py-2 flex items-center gap-2 bg-success/10">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              <span className="text-[11px] font-medium text-success">
                {prevCourse.name} fired {prevCourse.firedAgoLabel} - entree prep triggered automatically
              </span>
            </div>
          )}

          {/* Course blocks */}
          <div className="border-t border-border">
            {order.courses.map((course) => (
              <CourseBlockSection
                key={course.id}
                course={course}
                nameLabel={getStationLabel(course)}
                showFireButton={course.name === STATION_COURSE}
                fireButtonLabel="Fire mains"
              />
            ))}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border flex gap-2">
            <button className="w-[44px] min-h-[44px] bg-muted rounded flex items-center justify-center hover:opacity-80 transition-colors shrink-0">
              <img src={undoIcon} alt="Undo" className="w-8 h-6" />
            </button>
            <button className="flex-1 py-2.5 bg-primary text-primary-foreground text-cta rounded flex items-center justify-center gap-2 uppercase hover:opacity-90 transition-colors min-h-[44px]">
              &#10003; Done - fire dessert station
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
