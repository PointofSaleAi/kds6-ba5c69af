import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { SettingsIconTile } from './SettingsIconTile';

interface SectionHeaderCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
}

export function SectionHeaderCard({
  icon,
  iconColor,
  title,
  shortDescription,
  longDescription,
}: SectionHeaderCardProps) {
  const [showMore, setShowMore] = useState(false);
  const hasMore = Boolean(longDescription);

  return (
    <div
      className="rounded-2xl mb-5 flex flex-col items-start"
      style={{
        background: 'hsl(var(--surface-card))',
        border: '1px solid hsl(var(--border))',
        padding: 12,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <SettingsIconTile icon={icon} bgColor={iconColor} size="md" />
        <h1
          className="text-xl font-semibold"
          style={{ color: 'hsl(var(--text-primary))' }}
        >
          {title}
        </h1>
      </div>
      <p
        className="text-[15px] leading-relaxed w-full"
        style={{ color: 'hsl(var(--text-secondary))' }}
      >
        {showMore && hasMore ? longDescription : shortDescription}
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="ml-1 text-[15px] font-medium"
            style={{ color: 'hsl(var(--btn-seen))' }}
          >
            {showMore ? 'Learn less' : 'Learn more...'}
          </button>
        )}
      </p>
    </div>
  );
}

export default SectionHeaderCard;
