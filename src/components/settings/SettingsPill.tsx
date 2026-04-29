import { ChevronRight, type LucideIcon } from 'lucide-react';
import { SettingsIconTile } from './SettingsIconTile';
import type { ReactNode } from 'react';

interface SettingsPillProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  helper?: string;
  right?: ReactNode;
  onClick?: () => void;
  highlighted?: boolean;
}

/**
 * Rounded pill row with a colored icon tile, label, optional right-side
 * control (segmented toggle, switch, value), and chevron when clickable.
 * Helper text is rendered below the pill via the parent.
 */
export function SettingsPill({
  icon,
  iconColor,
  label,
  helper,
  right,
  onClick,
  highlighted,
}: SettingsPillProps) {
  const interactive = Boolean(onClick);

  return (
    <div className="mb-1.5 @container/pill">
      <div
        className="rounded-[28px] overflow-hidden transition-all"
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
          className={`w-full flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 px-4 @[340px]/pill:flex-nowrap ${
            interactive ? 'cursor-pointer active:opacity-70 active:scale-[0.995] transition-all duration-150' : 'cursor-default'
          }`}
        >
          <div className="flex items-center gap-3 w-full min-w-0 @[340px]/pill:w-auto @[340px]/pill:flex-1">
            <SettingsIconTile icon={icon} bgColor={iconColor} />
            <span
              className="text-[15px] font-medium text-left break-words min-w-0 flex-1 @[340px]/pill:truncate"
              style={{ color: 'hsl(var(--text-primary))' }}
            >
              {label}
            </span>
          </div>
          <div
            className="flex items-center gap-2 w-full pl-[52px] @[340px]/pill:w-auto @[340px]/pill:pl-0 @[340px]/pill:shrink-0 @[340px]/pill:justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            {right}
            {interactive && !right && (
              <ChevronRight size={18} style={{ color: 'hsl(var(--text-muted))' }} />
            )}
          </div>
        </div>
      </div>
      {helper && (
        <p
          className="text-xs px-2 mb-3 mt-0.5"
          style={{ color: 'hsl(var(--text-muted))' }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

export default SettingsPill;
