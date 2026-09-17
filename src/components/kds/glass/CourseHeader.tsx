import { GlassIcon } from './GlassIcon';
import { useGlassSkin } from './glass-theme';

export function CourseHeader({
  label,
  secondaryLabel,
  secondaryDir = 'ltr',
  meta,
  hasPrep,
  isOpen,
  onToggle,
}: {
  label: string;
  /** Dual-language mode: course name in the second language. */
  secondaryLabel?: string;
  secondaryDir?: 'ltr' | 'rtl';
  meta: string;
  hasPrep: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const skin = useGlassSkin();

  return (
    <div
      onClick={onToggle}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 0', cursor: 'pointer', borderTop: `1px solid ${skin.hairline}` }}
    >
      {isOpen ? (
        <GlassIcon name="chevD" size={17} sw={2.4} stroke={skin.text} />
      ) : (
        <GlassIcon name="chevR" size={17} sw={2.4} stroke={skin.textMuted} />
      )}
      <span
        style={{
          fontWeight: isOpen ? 800 : 700,
          fontSize: 16,
          lineHeight: 1,
          letterSpacing: '0.08em',
          color: isOpen ? skin.text : skin.textMuted,
        }}
      >
        {label}
      </span>
      {secondaryLabel && secondaryLabel !== label && (
        <span
          dir={secondaryDir}
          style={{
            fontWeight: 600,
            fontSize: 15,
            lineHeight: 1,
            letterSpacing: '0.04em',
            color: skin.textMuted,
            opacity: 0.75,
            unicodeBidi: 'plaintext',
          }}
        >
          · {secondaryLabel}
        </span>
      )}
      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, color: skin.textMuted }}>
        {hasPrep && <GlassIcon name="clock" size={16} sw={1.8} />}
        <span style={{ fontWeight: 600, fontSize: 15, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{meta}</span>
      </span>
    </div>
  );
}
