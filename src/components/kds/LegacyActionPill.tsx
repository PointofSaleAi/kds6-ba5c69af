import undoIcon from '@/assets/undo-icon.svg';
import seenIcon from '@/assets/seen-icon.svg';
import preparingIcon from '@/assets/preparing-icon.svg';
import itemReadyIcon from '@/assets/item-ready-icon.svg';

export type LegacyPillVariant = 'seen' | 'bell' | 'check' | 'undo';

interface LegacyActionPillProps {
  variant: LegacyPillVariant;
  onClick?: () => void;
  title?: string;
  label?: string;
}

const variantSrc: Record<LegacyPillVariant, string> = {
  seen: seenIcon,
  bell: preparingIcon,
  check: itemReadyIcon,
  undo: undoIcon,
};

export function LegacyActionPill({ variant, onClick, title, label }: LegacyActionPillProps) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      title={title}
      aria-label={label ?? variant}
      className="flex items-center justify-center shrink-0 active:brightness-95 transition"
    >
      <img src={variantSrc[variant]} alt="" style={{ width: 40, height: 30 }} />
    </button>
  );
}
