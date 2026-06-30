import { Eye, ConciergeBell, Check, Undo2 } from 'lucide-react';

export type LegacyPillVariant = 'seen' | 'bell' | 'check' | 'undo';

interface LegacyActionPillProps {
  variant: LegacyPillVariant;
  onClick?: () => void;
  title?: string;
  label?: string;
}

const variantStyles: Record<LegacyPillVariant, { bg: string; color: string; Icon: typeof Eye }> = {
  seen:  { bg: '#D9EAFF', color: '#176ACA', Icon: Eye },
  bell:  { bg: '#FADBD8', color: '#E74C3C', Icon: ConciergeBell },
  check: { bg: '#E8DAEF', color: '#7D3C98', Icon: Check },
  undo:  { bg: '#BDC1CD', color: '#FFFFFF', Icon: Undo2 },
};

export function LegacyActionPill({ variant, onClick, title, label }: LegacyActionPillProps) {
  const s = variantStyles[variant];
  const Icon = s.Icon;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      title={title}
      aria-label={label ?? variant}
      className="flex items-center justify-center shrink-0 active:brightness-95 transition"
      style={{
        width: 40,
        height: 30,
        borderRadius: 4,
        backgroundColor: s.bg,
      }}
    >
      <Icon size={18} color={s.color} strokeWidth={2.5} />
    </button>
  );
}
