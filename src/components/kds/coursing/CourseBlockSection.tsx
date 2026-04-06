import type { CourseBlock } from '@/types/kds';
import { ItemRow } from './ItemRow';
import { FireButton } from './FireButton';

interface CourseBlockSectionProps {
  course: CourseBlock;
  /** Override labels per page variant */
  nameLabel?: string;
  /** Whether to show the fire button */
  showFireButton?: boolean;
  fireButtonLabel?: string;
  onFire?: () => void;
}

export function CourseBlockSection({
  course,
  nameLabel,
  showFireButton = true,
  fireButtonLabel,
  onFire,
}: CourseBlockSectionProps) {
  const label = nameLabel ?? getDefaultLabel(course);
  const dimmed = course.status !== 'active';

  return (
    <div
      className={`border-b border-border ${
        course.status === 'active' ? 'border-l-[3px]' : ''
      }`}
      style={course.status === 'active' ? { borderLeftColor: '#7F77DD' } : undefined}
    >
      {/* Header */}
      <div
        className={`px-3 py-2 flex items-center justify-between ${getHeaderBg(course.status)}`}
      >
        <span
          className={`text-section-label uppercase ${getNameColor(course.status)}`}
        >
          {label}
        </span>
        <div className="flex items-center gap-2">
          {course.status === 'fired' && course.firedAgoLabel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-order-take-out/15 text-order-take-out">
              Done {course.firedAgoLabel}
            </span>
          )}
          {course.status === 'active' && course.prepTimerLabel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success/15 text-success">
              Prep: {course.prepTimerLabel}
            </span>
          )}
          {course.status === 'pending' && course.autoFireLabel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-muted text-muted-foreground">
              {course.autoFireLabel}
            </span>
          )}
          {showFireButton && course.status !== 'fired' && (
            <FireButton
              label={fireButtonLabel ?? `Fire ${course.name.toLowerCase()}`}
              disabled={course.status !== 'active'}
              onClick={onFire}
            />
          )}
        </div>
      </div>

      {/* Items */}
      <div className="px-3 py-1">
        {course.items.map((item) => (
          <ItemRow key={item.id} item={item} dimmed={dimmed} />
        ))}
      </div>
    </div>
  );
}

function getDefaultLabel(course: CourseBlock): string {
  switch (course.status) {
    case 'fired':
      return `${course.name} \u00B7 Fired`;
    case 'active':
      return `${course.name} \u00B7 Active`;
    case 'pending':
      return `${course.name} \u00B7 Pending`;
  }
}

function getHeaderBg(status: CourseBlock['status']): string {
  switch (status) {
    case 'fired':
      return 'bg-success/10';
    case 'active':
      return 'bg-[#EEEDFE]';
    case 'pending':
      return 'bg-surface-card';
  }
}

function getNameColor(status: CourseBlock['status']): string {
  switch (status) {
    case 'fired':
      return 'text-success';
    case 'active':
      return 'text-[#7F77DD] font-medium';
    case 'pending':
      return 'text-muted-foreground';
  }
}
