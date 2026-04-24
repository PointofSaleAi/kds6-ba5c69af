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
 * Borderless settings row: colored icon tile, label, optional right-side
 * control (segmented toggle, switch, value), and chevron when clickable.
 * Helper text renders below the row. Highlighted state (deep-link target)
 * shows a soft rounded background + ring instead of a permanent border.
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
    <div className="mb-3">
      <div
        className="rounded-2xl transition-all"
        style={{
          background: highlighted ? 'hsl(var(--btn-seen) / 0.08)' : 'transparent',
          boxShadow: highlighted ? '0 0 0 2px hsl(var(--btn-seen) / 0.35)' : 'none',
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
          className={`w-full flex items-center justify-between gap-3 py-2.5 ${
            interactive ? 'cursor-pointer active:opacity-70 active:scale-[0.995] transition-all duration-150' : 'cursor-default'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <SettingsIconTile icon={icon} bgColor={iconColor} />
            <span
              className="text-[15px] font-medium truncate text-left"
              style={{ color: 'hsl(var(--text-primary))' }}
            >
              {label}
            </span>
          </div>
          <div
            className="flex items-center gap-2 shrink-0"
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
          className="text-xs mt-1 mb-1"
          style={{ color: 'hsl(var(--text-muted))' }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

export default SettingsPill;
