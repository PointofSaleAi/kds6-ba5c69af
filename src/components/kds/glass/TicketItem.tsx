import { GlassIcon } from './GlassIcon';
import { GLOSS_ITEM, ACT_BTN, RED, fmt, stageVisuals, type GlassItem, type GlassStage } from './glass-tickets-data';

/** "No …" removals read red alongside allergens. */
function Modifiers({ mods }: { mods?: string }) {
  const parts = String(mods || '').split(' · ').filter(Boolean);
  if (!parts.length) return null;
  return (
    <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0 6px' }}>
      {parts.map((p, i) => {
        const neg = /^no\b/i.test(p.trim());
        return (
          <span
            key={i}
            style={{
              fontWeight: neg ? 700 : 500,
              fontSize: 17,
              lineHeight: 1.4,
              color: neg ? RED : 'rgba(60,60,67,0.8)',
            }}
          >
            {p}
            {i < parts.length - 1 ? ' ·' : ''}
          </span>
        );
      })}
    </div>
  );
}

export function TicketItem({
  item,
  stage,
  prepLabel,
  onTap,
}: {
  item: GlassItem;
  stage: GlassStage;
  prepLabel: string;
  onTap: () => void;
}) {
  const iv = stageVisuals(stage);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderTop: '1px solid rgba(60,60,67,0.14)' }}>
      <div style={{ minWidth: 40, fontWeight: 700, fontSize: 23, lineHeight: 1.25, fontVariantNumeric: 'tabular-nums', color: 'rgba(60,60,67,0.62)' }}>
        {item.qty}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 23,
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            textDecorationLine: stage === 'served' ? 'line-through' : 'none',
            textDecorationThickness: '2px',
          }}
        >
          {item.name}
        </div>
        <Modifiers mods={item.mods} />
        {item.note && (
          <div style={{ marginTop: 2, fontStyle: 'italic', fontWeight: 500, fontSize: 17, lineHeight: 1.4, color: 'rgba(60,60,67,0.75)' }}>
            {item.note}
          </div>
        )}
        {item.tags && item.tags.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {item.tags.map((tag) => (
              <div key={tag} style={GLOSS_ITEM}>
                <GlassIcon name="warn" size={13} sw={2.4} />
                <span>{tag} allergy</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {stage !== 'unseen' && (
          <div
            style={{
              padding: '6px 11px 7px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 16,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              background: stage === 'preparing' ? 'rgba(255,159,10,0.2)' : 'rgba(48,209,88,0.2)',
              color: stage === 'preparing' ? '#8a4b06' : '#0f6b3c',
              boxShadow: `0 0 14px rgba(${stage === 'preparing' ? '255,159,10,0.45' : '48,209,88,0.4'}), inset 0 1px 0 rgba(255,255,255,0.6)`,
            }}
          >
            {prepLabel}
          </div>
        )}
        <button
          type="button"
          onClick={onTap}
          className="active:scale-95 transition-transform"
          style={{ ...ACT_BTN, background: iv.bg, color: iv.fg, border: `1px solid ${iv.border}` }}
        >
          <GlassIcon name={iv.icon} size={21} sw={iv.sw} />
        </button>
      </div>
    </div>
  );
}

export { fmt };
