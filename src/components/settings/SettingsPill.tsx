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
    <div className="mb-1.5">
      <div
        className="rounded-full overflow-hidden transition-all"
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
        <button
          type="button"
          onClick={onClick}
          disabled={!interactive}
          className={`w-full flex items-center justify-between gap-3 py-3 px-4 ${
            interactive ? 'active:opacity-70 active:scale-[0.995] transition-all duration-150' : 'cursor-default'
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
          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {right}
            {interactive && !right && (
              <ChevronRight size={18} style={{ color: 'hsl(var(--text-muted))' }} />
            )}
          </div>
        </button>
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
