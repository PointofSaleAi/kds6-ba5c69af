import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionHeaderCardProps {
  icon?: LucideIcon;
  iconColor: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  iconSrc?: string;
  iconNode?: ReactNode;
}

export function SectionHeaderCard({
  icon: Icon,
  iconColor,
  title,
  shortDescription,
  longDescription,
  iconSrc,
  iconNode,
}: SectionHeaderCardProps) {
  const [showMore, setShowMore] = useState(false);
  const hasMore = Boolean(longDescription);

  return (
    <div
      className="rounded-2xl mb-4 flex flex-col items-start"
      style={{
        background: 'hsl(var(--surface-card))',
        border: '1px solid hsl(var(--border))',
        padding: 16,
      }}
    >
      <div
        className="flex items-center justify-center shrink-0 mb-2.5"
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          backgroundColor: iconColor,
          color: '#FFFFFF',
        }}
      >
        {iconNode ? (
          iconNode
        ) : iconSrc ? (
          <img src={iconSrc} alt={title} style={{ width: 22, height: 22, objectFit: 'contain' }} />
        ) : Icon ? (
          <Icon size={22} color="#FFFFFF" strokeWidth={2.2} />
        ) : null}
      </div>
      <h1
        className="mb-1.5"
        style={{
          color: 'hsl(var(--text-primary))',
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      <p
        className="w-full leading-relaxed"
        style={{ color: 'hsl(var(--text-secondary))', fontSize: 12.5, fontWeight: 500 }}
      >
        {showMore && hasMore ? longDescription : shortDescription}
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="ml-1"
            style={{ color: 'hsl(var(--btn-seen))', fontSize: 12.5, fontWeight: 600 }}
          >
            {showMore ? 'Learn less' : 'Learn more...'}
          </button>
        )}
      </p>
    </div>
  );
}

export default SectionHeaderCard;
