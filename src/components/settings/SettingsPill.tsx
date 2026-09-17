import { ChevronRight, type LucideIcon } from 'lucide-react';
import { isValidElement, type ReactNode } from 'react';
import { SettingsIconTile } from './SettingsIconTile';
import { SegmentedToggle } from './SettingsControls';
import { usePortrait } from '@/hooks/use-portrait';

interface SettingsPillProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  helper?: string;
  right?: ReactNode;
  onClick?: () => void;
  highlighted?: boolean;
  highContrast?: boolean;
  /**
   * Force-stack the right control under the label in portrait. Auto-detected
   * for SegmentedToggle (which expands full-width) but can be set explicitly
   * for any other wide control.
   */
  stackInPortrait?: boolean;
}

/**
 * Rounded pill row with a colored icon tile, label, optional right-side
 * control (segmented toggle, switch, value), and chevron when clickable.
 *
 * In portrait orientation, wide controls (segmented toggles or anything
 * passed with stackInPortrait) drop to a second row so their option labels
 * are not truncated. Compact controls (chevron, switch, single value text)
 * stay inline on the same row in both orientations.
 */
export function SettingsPill({
  icon,
  iconColor,
  label,
  helper,
  right,
  onClick,
  highlighted,
  highContrast = false,
  stackInPortrait,
}: SettingsPillProps) {
  const interactive = Boolean(onClick);
  const { isPortrait } = usePortrait();

  const rightIsSegmented =
    isValidElement(right) && right.type === SegmentedToggle;
  const shouldStack = isPortrait && (stackInPortrait || rightIsSegmented);

  // Container query thresholds keep landscape behavior identical to before.
  // When stacking in portrait we drop the @[340px] inline constraint so the
  // right control always wraps to its own full-width row.
  const rowClasses = shouldStack
    ? 'w-full flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4'
    : 'w-full flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 @[340px]/pill:flex-nowrap';

  const labelWrapClasses = shouldStack
    ? 'flex items-center gap-3 w-full min-w-0'
    : 'flex items-center gap-3 w-full min-w-0 @[340px]/pill:w-auto @[340px]/pill:flex-1';

  const labelTextClasses = shouldStack
    ? 'text-[13px] font-semibold text-left break-words min-w-0 flex-1'
    : 'text-[13px] font-semibold text-left break-words min-w-0 flex-1 @[340px]/pill:truncate';

  const rightWrapClasses = shouldStack
    ? 'flex items-center gap-2 w-full pl-[44px] justify-end'
    : 'flex items-center gap-2 w-full pl-[44px] @[340px]/pill:w-auto @[340px]/pill:pl-0 @[340px]/pill:shrink-0 @[340px]/pill:justify-end';

  return (
    <div className="mb-1 @container/pill">
      <div
        className="rounded-[22px] overflow-hidden transition-all"
        style={{
          background: 'hsl(var(--surface-card))',
          border: highlighted
            ? '1.5px solid hsl(var(--btn-seen))'
            : '1px solid hsl(var(--border))',
          boxShadow: highlighted
            ? '0 0 0 4px hsl(var(--btn-seen) / 0.12)'
            : 'none',
        }}
      >
        <div
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          onClick={interactive ? onClick : undefined}
          onKeyDown={
            interactive
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                  }
                }
              : undefined
          }
          className={`${rowClasses} ${
            interactive ? 'cursor-pointer active:opacity-70 active:scale-[0.995] transition-all duration-150' : 'cursor-default'
          }`}
          style={{ paddingTop: 7, paddingBottom: 7 }}
        >
          <div className={labelWrapClasses}>
            <SettingsIconTile icon={icon} bgColor={iconColor} />
            <span
              className={labelTextClasses}
              style={{ color: 'hsl(var(--text-primary))' }}
            >
              {label}
            </span>
          </div>
          <div
            className={rightWrapClasses}
            onClick={(e) => e.stopPropagation()}
          >
            {right}
            {interactive && !right && (
              <ChevronRight size={18} style={{ color: 'hsl(var(--foreground) / 0.7)' }} />
            )}
          </div>
        </div>
      </div>
      {helper && (
        <p
          className={`text-xs px-2 mb-3 mt-0.5 ${highContrast ? 'font-semibold' : 'font-medium'}`}
          style={{ color: highContrast ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))' }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

export default SettingsPill;
