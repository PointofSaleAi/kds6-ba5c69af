import { ReactNode } from 'react';

interface AiSectionHeaderProps {
  title: string;
  subtitle?: string;
  pain?: string;
  right?: ReactNode;
}

export function AiSectionHeader({ title, subtitle, pain, right }: AiSectionHeaderProps) {
  return (
    <header className="px-8 pt-8 pb-4 flex items-start justify-between gap-6 border-b border-[hsl(var(--border))]">
      <div>
        <h1 className="text-[22px] font-extrabold text-[hsl(var(--text-primary))] tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-[hsl(var(--text-secondary))] mt-1 max-w-2xl">{subtitle}</p>
        )}
        {pain && (
          <p className="text-[11px] italic text-[hsl(var(--text-muted))] mt-2 max-w-2xl border-l-2 border-[hsl(var(--text-muted))]/40 pl-2">
            Pain point solved: {pain}
          </p>
        )}
      </div>
      {right}
    </header>
  );
}
