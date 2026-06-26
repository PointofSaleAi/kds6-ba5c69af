import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionHeaderCardProps {
  icon?: LucideIcon;
  iconColor: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  iconSrc?: string;
}

export function SectionHeaderCard({
  icon: Icon,
  iconColor,
  title,
  shortDescription,
  longDescription,
  iconSrc,
}: SectionHeaderCardProps) {
  const [showMore, setShowMore] = useState(false);
  const hasMore = Boolean(longDescription);

  return (
    <div
      className="rounded-2xl mb-5 flex flex-col items-start"
      style={{
        background: 'hsl(var(--surface-card))',
        border: '1px solid hsl(var(--border))',
        padding: 20,
      }}
    >
      <div
        className="flex items-center justify-center shrink-0 mb-3"
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          backgroundColor: iconColor,
        }}
      >
        {iconSrc ? (
          <img src={iconSrc} alt={title} style={{ width: 28, height: 28, objectFit: 'contain' }} />
        ) : Icon ? (
          <Icon size={26} color="#FFFFFF" strokeWidth={2.2} />
        ) : null}
      </div>
      <h1
        className="mb-2"
        style={{
          color: 'hsl(var(--text-primary))',
          fontSize: 22,
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      <p
        className="w-full leading-relaxed"
        style={{ color: 'hsl(var(--text-secondary))', fontSize: 14, fontWeight: 500 }}
      >
        {showMore && hasMore ? longDescription : shortDescription}
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="ml-1"
            style={{ color: 'hsl(var(--btn-seen))', fontSize: 14, fontWeight: 600 }}
          >
            {showMore ? 'Learn less' : 'Learn more...'}
          </button>
        )}
      </p>
    </div>
  );
}

export default SectionHeaderCard;
