import { GlassIcon } from './GlassIcon';

export function CourseHeader({
  label,
  meta,
  hasPrep,
  isOpen,
  onToggle,
}: {
  label: string;
  meta: string;
  hasPrep: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 0', cursor: 'pointer', borderTop: '1px solid rgba(60,60,67,0.14)' }}
    >
      {isOpen ? (
        <GlassIcon name="chevD" size={17} sw={2.4} stroke="#0b0b0c" />
      ) : (
        <GlassIcon name="chevR" size={17} sw={2.4} stroke="rgba(60,60,67,0.7)" />
      )}
      <span
        style={{
          fontWeight: isOpen ? 800 : 700,
          fontSize: 16,
          lineHeight: 1,
          letterSpacing: '0.08em',
          color: isOpen ? '#0b0b0c' : 'rgba(60,60,67,0.72)',
        }}
      >
        {label}
      </span>
      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(60,60,67,0.65)' }}>
        {hasPrep && <GlassIcon name="clock" size={16} sw={1.8} />}
        <span style={{ fontWeight: 600, fontSize: 15, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{meta}</span>
      </span>
    </div>
  );
}
