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
      style={course.status === 'active' ? { borderLeftColor: '#0F4C81' } : undefined}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between flex-nowrap ${getHeaderBg(course.status)}`}
        style={{ padding: '4px 8px' }}
      >
        <span
          className={`text-[11px] uppercase tracking-wider flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis ${getNameColor(course.status)}`}
        >
          {label}
        </span>
        <div className="flex items-center shrink-0" style={{ gap: '4px' }}>
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
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-muted text-text-primary">
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
      <div className="px-3 pt-1 pb-3">
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
      return `${course.name} \u00B7 Served`;
    case 'active':
      return `${course.name} \u00B7 Active`;
    case 'pending':
      return `${course.name} \u00B7 Queued`;
  }
}

function getHeaderBg(status: CourseBlock['status']): string {
  switch (status) {
    case 'fired':
      return 'bg-success/10';
    case 'active':
      return 'bg-[#EFF6FF]';
    case 'pending':
      return 'bg-surface-card';
  }
}

function getNameColor(status: CourseBlock['status']): string {
  switch (status) {
    case 'fired':
      return 'text-success font-normal';
    case 'active':
      return 'text-[#0F4C81] font-medium';
    case 'pending':
      return 'text-muted-foreground font-normal';
  }
}
