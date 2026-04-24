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
      className="rounded-xl p-5 mb-5 flex flex-col items-start border"
      style={{ background: 'hsl(var(--surface-card))', borderColor: 'hsl(var(--border))' }}
    >
      <div className="mb-4">
        <SettingsIconTile icon={icon} bgColor={iconColor} size="lg" />
      </div>
      <h1
        className="text-xl font-semibold mb-2"
        style={{ color: 'hsl(var(--text-primary))' }}
      >
        {title}
      </h1>
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
