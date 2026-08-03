import { CourseHeader } from './CourseHeader';
import { GlassIcon } from './GlassIcon';
import { TicketItem } from './TicketItem';
import {
  CTA,
  DARK,
  GLOSS_TICKET,
  activeCourse,
  fmt,
  keyOf,
  stageVisuals,
  ticketStage,
  timerTone,
  type GlassStage,
  type GlassTicket,
} from './glass-tickets-data';

interface TicketCardProps {
  ticket: GlassTicket;
  items: Record<string, GlassStage>;
  open: Record<string, boolean>;
  now: number;
  elapsedSeconds: number;
  prepLabelFor: (key: string, stage: GlassStage) => string;
  onTapItem: (key: string) => void;
  onToggleCourse: (courseKey: string, current: boolean) => void;
  onStepTicket: (ticket: GlassTicket, dir: number) => void;
  /** Horizontal view: card fills the column height and the item list scrolls. */
  fillHeight?: boolean;
}

export function TicketCard({
  ticket: t,
  items,
  open,
  elapsedSeconds,
  prepLabelFor,
  onTapItem,
  onToggleCourse,
  onStepTicket,
  fillHeight = false,
}: TicketCardProps) {
  const stage = ticketStage(t, items);
  const vis = stageVisuals(stage);
  const tone = timerTone(elapsedSeconds);
  const light = stage === 'unseen' || stage === 'ready';
  const aIdx = activeCourse(t, items);


  return (
    <div
      data-screen-label={`${t.type} #${t.num}`}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 26,
        background: 'rgba(255,255,255,0.62)',
        backdropFilter: 'blur(30px) saturate(185%)',
        WebkitBackdropFilter: 'blur(30px) saturate(185%)',
        border: '1px solid rgba(255,255,255,0.75)',
        boxShadow: '0 18px 44px rgba(28,33,54,0.16), inset 0 1px 0 rgba(255,255,255,0.95)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '0 0 auto 0',
          height: 120,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0))',
          pointerEvents: 'none',
        }}
      />

      {/* header */}
      <div style={{ position: 'relative', flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
        <div style={{ fontWeight: 800, fontSize: 68, lineHeight: 0.82, letterSpacing: '-0.055em', fontVariantNumeric: 'tabular-nums' }}>
          {t.num}
        </div>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GlassIcon name={t.kind} size={26} sw={2} stroke="#0b0b0c" />
            <div style={{ fontWeight: 800, fontSize: 30, lineHeight: 1, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>{t.type}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(60,60,67,0.62)' }}>
            <GlassIcon name="runner" size={22} sw={2.1} />
            <div style={{ fontWeight: 700, fontSize: 25, lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{t.server}</div>
          </div>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            flex: '0 0 auto',
            padding: '9px 17px 10px',
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 27,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            background: tone.bg,
            color: tone.fg,
            boxShadow: `0 0 22px rgba(${tone.glow},0.8), inset 0 1px 0 rgba(255,255,255,0.5)`,
          }}
        >
          {fmt(elapsedSeconds)}
        </div>
      </div>

      {/* ticket-level allergies */}
      <div style={{ position: 'relative', flex: '0 0 auto', display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 18px 14px' }}>
        {t.allergies.map((a) => (
          <div key={a} style={GLOSS_TICKET}>{a}</div>
        ))}
      </div>

      {/* POS block */}
      {t.posMessage && (
        <div
          style={{
            position: 'relative',
            flex: '0 0 auto',
            margin: '0 14px 12px',
            borderRadius: 18,
            background: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'rgba(120,130,150,0.1)' }}>
            <GlassIcon name="chat" size={17} sw={1.8} stroke="rgba(60,60,67,0.7)" />
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1 }}>Point of Sale terminal 1</div>
            <div style={{ marginLeft: 'auto', fontWeight: 400, fontSize: 14, lineHeight: 1, color: 'rgba(60,60,67,0.55)' }}>5m ago</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 17, lineHeight: 1.45 }}>{t.posMessage}</div>
              <div style={{ marginTop: 6, fontWeight: 400, fontSize: 14, lineHeight: 1, color: 'rgba(60,60,67,0.55)' }}>Maria S. – Server</div>
            </div>
            <div
              style={{
                width: 44, height: 44, flex: '0 0 auto', display: 'grid', placeItems: 'center', borderRadius: 14,
                background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 12px rgba(28,33,54,0.1)',
              }}
            >
              <GlassIcon name="eye" size={20} sw={1.8} stroke="#0b0b0c" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderTop: '1px solid rgba(60,60,67,0.12)' }}>
            <div style={{ marginTop: 3, flex: '0 0 auto' }}>
              <GlassIcon name="note" size={18} sw={1.8} stroke="rgba(60,60,67,0.7)" />
            </div>
            <div style={{ flex: 1, fontWeight: 500, fontSize: 17, lineHeight: 1.45 }}>{t.posNote}</div>
            <div
              style={{
                width: 44, height: 44, flex: '0 0 auto', display: 'grid', placeItems: 'center', borderRadius: 14,
                background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 12px rgba(28,33,54,0.1)',
              }}
            >
              <GlassIcon name="eye" size={20} sw={1.8} stroke="#0b0b0c" />
            </div>
          </div>
        </div>
      )}

      {/* courses + items */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0, padding: '0 18px' }}>
        {t.courses.map((c, ci) => {
          const ck = `${t.id}:${c.id}`;
          const isOpen = ck in open ? open[ck] : ci === aIdx;
          const done = c.items.every((_, i) => (items[keyOf(t.id, c.id, i)] || 'unseen') === 'served');
          const meta = c.prep ? c.prep : done ? `${c.items.length} items · done` : `${c.items.length} items`;

          return (
            <div key={ck}>
              {c.showHeader !== false && (
                <CourseHeader
                  label={c.label || ''}
                  meta={meta}
                  hasPrep={Boolean(c.prep)}
                  isOpen={isOpen}
                  onToggle={() => onToggleCourse(ck, isOpen)}
                />
              )}
              {isOpen &&
                c.items.map((it, i) => {
                  const ik = keyOf(t.id, c.id, i);
                  const istage = items[ik] || 'unseen';
                  return (
                    <TicketItem
                      key={ik}
                      item={it}
                      stage={istage}
                      prepLabel={prepLabelFor(ik, istage)}
                      onTap={() => onTapItem(ik)}
                    />
                  );
                })}
            </div>
          );
        })}
      </div>

      {/* footer */}
      <div style={{ position: 'relative', flex: '0 0 auto', display: 'flex', gap: 10, padding: '14px 16px 16px' }}>
        {stage !== 'unseen' && (
          <button
            type="button"
            onClick={() => onStepTicket(t, -1)}
            className="active:scale-95 transition-transform"
            style={{
              width: 58, height: 56, flex: '0 0 auto', display: 'grid', placeItems: 'center', cursor: 'pointer', borderRadius: 17,
              background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.9)', color: '#0b0b0c',
              boxShadow: '0 6px 16px rgba(28,33,54,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <GlassIcon name="back" size={22} sw={2} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onStepTicket(t, 1)}
          className="active:scale-95 transition-transform"
          style={{
            flex: 1, minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, cursor: 'pointer',
            borderRadius: 17, fontWeight: 700, fontSize: 22, lineHeight: 1, letterSpacing: '0.01em',
            background: light ? 'rgba(255,255,255,0.7)' : DARK,
            color: light ? '#0b0b0c' : '#fff',
            border: `1px solid ${light ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.18)'}`,
            boxShadow: '0 8px 22px rgba(28,33,54,0.16), inset 0 1px 0 rgba(255,255,255,0.55)',
          }}
        >
          <GlassIcon name={vis.icon} size={23} sw={vis.sw} />
          <span>{CTA[stage]}</span>
        </button>
      </div>
    </div>
  );
}
