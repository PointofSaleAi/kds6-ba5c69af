import { GlassIcon } from './GlassIcon';
import { useLanguage } from '@/hooks/use-language';
import { ACT_BTN, RED, fmt, type GlassItem, type GlassStage } from './glass-tickets-data';
import { glossItem, safetyStyle, stageVisualsFor, useGlassStyle } from './glass-theme';

/** "No …" removals read red alongside allergens. */
function Modifiers({ mods, muted, secondary, secondaryDir }: { mods?: string; muted: string; secondary?: boolean; secondaryDir?: 'ltr' | 'rtl' }) {
  const { tm, tmSecondary } = useLanguage();
  const parts = String(mods || '').split(' · ').filter(Boolean);
  if (!parts.length) return null;
  return (
    <>
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
                color: neg ? RED : muted,
              }}
            >
              {tm(p)}
              {i < parts.length - 1 ? ' ·' : ''}
            </span>
          );
        })}
      </div>
      {secondary && (
        <div
          dir={secondaryDir}
          style={{ marginTop: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0 6px', opacity: 0.72, unicodeBidi: 'plaintext', textAlign: secondaryDir === 'rtl' ? 'right' : 'left' }}
        >
          {parts.map((p, i) => (
            <span key={i} style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.35, color: muted }}>
              {tmSecondary(p)}
              {i < parts.length - 1 ? ' ·' : ''}
            </span>
          ))}
        </div>
      )}
    </>
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
  const { skin, rowScale, safety } = useGlassStyle();
  const { tp, tpSecondary, tn, tnSecondary, displayMode, showSecondaryMenu, secondaryLang } = useLanguage();
  const secondaryDir: 'ltr' | 'rtl' = secondaryLang === 'ar' ? 'rtl' : 'ltr';
  const showSecondary = displayMode === 'dual' && showSecondaryMenu;
  const iv = stageVisualsFor(stage, skin);
  const vPad = Math.round(14 * rowScale);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: `${vPad}px 0`, borderTop: `1px solid ${skin.hairline}`, color: skin.text }}>
      <div style={{ minWidth: 40, fontWeight: 700, fontSize: 23, lineHeight: 1.25, fontVariantNumeric: 'tabular-nums', color: skin.textMuted }}>
        {item.qty}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 23,
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            color: skin.text,
            textDecorationLine: stage === 'served' || stage === 'cleared' ? 'line-through' : 'none',
            textDecorationThickness: '2px',
          }}
        >
          {tp(item.name)}
        </div>
        {showSecondary && (
          <div
            dir={secondaryDir}
            style={{
              fontWeight: 600,
              fontSize: 19,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              color: skin.textSecondary,
              opacity: 0.8,
              unicodeBidi: 'plaintext',
              textAlign: secondaryDir === 'rtl' ? 'right' : 'left',
              textDecorationLine: stage === 'served' || stage === 'cleared' ? 'line-through' : 'none',
            }}
          >
            {tpSecondary(item.name)}
          </div>
        )}
        <Modifiers mods={item.mods} muted={skin.textSecondary} secondary={showSecondary} secondaryDir={secondaryDir} />
        {item.note && (
          <>
            <div style={{ marginTop: 2, fontStyle: 'italic', fontWeight: 500, fontSize: 17, lineHeight: 1.4, color: skin.textSecondary }}>
              {tn(item.note)}
            </div>
            {showSecondary && (
              <div
                dir={secondaryDir}
                style={{ fontStyle: 'italic', fontWeight: 500, fontSize: 15, lineHeight: 1.35, color: skin.textSecondary, opacity: 0.72, unicodeBidi: 'plaintext', textAlign: secondaryDir === 'rtl' ? 'right' : 'left' }}
              >
                {tnSecondary(item.note)}
              </div>
            )}
          </>
        )}
        {item.tags && item.tags.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {item.tags.map((tag) => (
              <div key={tag} style={{ ...glossItem(skin), ...safetyStyle(safety) }}>
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
              color: skin.dark
                ? stage === 'preparing' ? '#ffca7a' : '#8ce8ab'
                : stage === 'preparing' ? '#8a4b06' : '#0f6b3c',
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
