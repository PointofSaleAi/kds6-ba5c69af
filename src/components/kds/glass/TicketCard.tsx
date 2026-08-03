import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CourseHeader } from './CourseHeader';
import { GlassIcon } from './GlassIcon';
import { TicketItem } from './TicketItem';
import { useGlassBoard } from './glass-board-context';
import { KitchenReplyDialog } from '../KitchenReplyDialog';
import type { KitchenMessage } from '@/types/kitchen-message';
import { glossTicket, safetyStyle, stageVisualsFor, useGlassStyle } from './glass-theme';
import {
  CTA,
  activeCourse,
  fmt,
  keyOf,
  itemKey,
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
  /** Ticket Studio personalize: hero shows the order number or the guest name. */
  identifier?: 'order' | 'guest';
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
  identifier = 'order',
}: TicketCardProps) {
  const { skin, padScale, safety, appearance } = useGlassStyle();
  const stage = ticketStage(t, items);
  const vis = stageVisualsFor(stage, skin);
  const tone = timerTone(elapsedSeconds);
  const light = stage === 'unseen' || stage === 'ready';
  const aIdx = activeCourse(t, items);

  const { notesAck, setNoteAck, posSeen, setPosSeen, view, recallItem } = useGlassBoard();
  /** Served screen: taps recall instead of advancing (product + ticket level). */
  const recallMode = view === 'history';
  const noteAcked = !!notesAck[t.id];
  const msgSeen = !!posSeen[t.id];
  const [replyOpen, setReplyOpen] = useState(false);

  const pad = (v: number) => Math.round(v * padScale);
  /** Appearance "Header" renders the ticket head only. */
  const headerOnly = appearance === 'header';
  const showSecondary = appearance === 'standard';

  /* Notes: single tap acknowledges (disables the note), double tap undoes. */
  const noteTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNoteTap = () => {
    if (noteTapTimer.current) {
      clearTimeout(noteTapTimer.current);
      noteTapTimer.current = null;
      setNoteAck(t.id, false);
      return;
    }
    noteTapTimer.current = setTimeout(() => {
      noteTapTimer.current = null;
      setNoteAck(t.id, true);
    }, 260);
  };

  /* POS message: first tap marks seen (icon becomes reply), then opens reply. */
  const handlePosTap = () => {
    if (!msgSeen) {
      setPosSeen(t.id, true);
      return;
    }
    setReplyOpen(true);
  };

  const replyMessage: KitchenMessage = {
    message_id: `glass-${t.id}`,
    message_text: t.posMessage || '',
    employee_name: 'Maria S.',
    employee_role: 'Server',
    terminal_name: 'Point of Sale terminal 1',
    linked_order_number: Number(t.num) || undefined,
    timestamp: new Date(),
    status: msgSeen ? 'acknowledged' : 'pending',
  };

  const heroLabel = identifier === 'guest' ? t.server.split('·')[0].trim() : t.num;

  return (
    <div
      data-screen-label={`${t.type} #${t.num}`}
      style={{
        position: 'relative',
        width: '100%',
        ...(fillHeight ? { height: '100%' } : {}),

        display: 'flex',
        flexDirection: 'column',
        borderRadius: 26,
        color: skin.text,
        background: skin.card,
        backdropFilter: 'blur(30px) saturate(185%)',
        WebkitBackdropFilter: 'blur(30px) saturate(185%)',
        border: `1px solid ${skin.cardBorder}`,
        boxShadow: skin.cardShadow,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '0 0 auto 0',
          height: 120,
          background: skin.sheen,
          pointerEvents: 'none',
        }}
      />

      {/* header */}
      <div
        style={{
          position: 'relative',
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: `${pad(14)}px ${pad(18)}px`,
          ...(appearance === 'header'
            ? { background: skin.panelHeader, borderBottom: `1px solid ${skin.hairline}` }
            : {}),
        }}
      >
        <div style={{ flex: '0 0 auto', fontWeight: 800, fontSize: identifier === 'guest' ? 34 : 68, lineHeight: identifier === 'guest' ? 1 : 0.82, letterSpacing: '-0.055em', fontVariantNumeric: 'tabular-nums', maxWidth: identifier === 'guest' ? 190 : undefined }}>
          {heroLabel}
        </div>
        <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{ flex: '0 0 auto', display: 'flex' }}>
              <GlassIcon name={t.kind} size={26} sw={2} stroke={skin.text} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 30, lineHeight: 1, letterSpacing: '-0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.type}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, color: skin.textMuted }}>
            {/* shrink-0 wrapper: long server labels used to squeeze the icon away */}
            <div style={{ flex: '0 0 auto', display: 'flex' }}>
              <GlassIcon name="runner" size={22} sw={2.1} />
            </div>
            <div style={{ minWidth: 0, fontWeight: 700, fontSize: 25, lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.server}</div>
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
      {t.allergies.length > 0 && !headerOnly && (
        <div style={{ position: 'relative', flex: '0 0 auto', display: 'flex', flexWrap: 'wrap', gap: 8, padding: `0 ${pad(18)}px ${pad(14)}px` }}>
          {t.allergies.map((a) => (
            <div key={a} style={{ ...glossTicket(skin), ...safetyStyle(safety) }}>{a}</div>
          ))}
        </div>
      )}

      {/* POS block */}
      {t.posMessage && showSecondary && (
        <div
          style={{
            position: 'relative',
            flex: '0 0 auto',
            margin: `0 ${pad(14)}px ${pad(12)}px`,
            borderRadius: 18,
            background: skin.panel,
            border: `1px solid ${skin.panelBorder}`,
            boxShadow: skin.panelShadow,
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: skin.panelHeader }}>
            <GlassIcon name="chat" size={17} sw={1.8} stroke={skin.textSecondary} />
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1 }}>Point of Sale terminal 1</div>
            <div style={{ marginLeft: 'auto', fontWeight: 400, fontSize: 14, lineHeight: 1, color: skin.textMuted }}>5m ago</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px' }}>
            <div style={{ flex: 1, opacity: msgSeen ? 0.5 : 1 }}>
              <div style={{ fontWeight: 500, fontSize: 17, lineHeight: 1.45 }}>{t.posMessage}</div>
              <div style={{ marginTop: 6, fontWeight: 400, fontSize: 14, lineHeight: 1, color: skin.textMuted }}>Maria S. – Server</div>
            </div>
            <button
              type="button"
              onClick={handlePosTap}
              aria-label={msgSeen ? 'Reply to Point of Sale message' : 'Mark message as seen'}
              className="active:scale-95 transition-transform"
              style={{
                width: 44, height: 44, flex: '0 0 auto', display: 'grid', placeItems: 'center', borderRadius: 14, cursor: 'pointer',
                background: msgSeen ? skin.fill : skin.btnBg,
                border: `1px solid ${msgSeen ? skin.fillBorder : skin.btnBorder}`,
                boxShadow: '0 4px 12px rgba(28,33,54,0.1)',
              }}
            >
              <GlassIcon name={msgSeen ? 'reply' : 'eye'} size={20} sw={1.8} stroke={msgSeen ? skin.fillFg : skin.btnFg} />
            </button>
          </div>
          <div
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
              borderTop: `1px solid ${skin.hairline}`,
              background: noteAcked ? skin.ackRowBg : undefined,
            }}
          >
            <div style={{ marginTop: 3, flex: '0 0 auto' }}>
              <GlassIcon name="note" size={18} sw={1.8} stroke={skin.textSecondary} />
            </div>
            {/* Acknowledged notes read as disabled — never struck through. */}
            <div
              style={{
                flex: 1, fontWeight: 500, fontSize: 17, lineHeight: 1.45,
                color: noteAcked ? skin.textMuted : skin.text,
                opacity: noteAcked ? 0.5 : 1,
                pointerEvents: noteAcked ? 'none' : undefined,
              }}
            >
              {t.posNote}
            </div>
            <button
              type="button"
              onClick={handleNoteTap}
              aria-label={noteAcked ? 'Double tap to undo note acknowledgement' : 'Acknowledge note'}
              className="active:scale-95 transition-transform"
              style={{
                width: 44, height: 44, flex: '0 0 auto', display: 'grid', placeItems: 'center', borderRadius: 14, cursor: 'pointer',
                background: noteAcked ? skin.ackBg : skin.btnBg,
                border: `1px solid ${noteAcked ? skin.ackBorder : skin.btnBorder}`,
                boxShadow: '0 4px 12px rgba(28,33,54,0.1)',
              }}
            >
              <GlassIcon name={noteAcked ? 'tick' : 'eye'} size={20} sw={1.8} stroke={noteAcked ? skin.ackFg : skin.btnFg} />
            </button>
          </div>
        </div>
      )}

      {/* Reply modal is portalled to the body so it is a true screen-level
          modal — the board is `zoom`ed, which would otherwise trap `fixed`. */}
      {t.posMessage && replyOpen &&
        createPortal(
          <KitchenReplyDialog
            message={replyMessage}
            onSend={() => setReplyOpen(false)}
            onClose={() => setReplyOpen(false)}
          />,
          document.body,
        )}

      {/* courses + items */}
      {!headerOnly && (
      <div style={{ position: 'relative', flex: 1, minHeight: 0, padding: `0 ${pad(18)}px`, overflowY: fillHeight ? 'auto' : 'visible' }}>
        {t.courses.map((c, ci) => {
          const ck = `${t.id}:${c.id}`;
          const isOpen = ck in open ? open[ck] : ci === aIdx;
          const done = c.items.every((it, i) => (items[itemKey(t, c, it, i)] || 'unseen') === 'served');
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
                  const ik = itemKey(t, c, it, i);
                  const istage = items[ik] || 'unseen';
                  return (
                    <TicketItem
                      key={ik}
                      item={it}
                      stage={istage}
                      prepLabel={prepLabelFor(ik, istage)}
                      onTap={() => (recallMode ? recallItem(ik) : onTapItem(ik))}
                    />
                  );
                })}
            </div>
          );
        })}
      </div>
      )}

      {/* footer */}
      {!headerOnly && (
      <div style={{ position: 'relative', flex: '0 0 auto', display: 'flex', gap: 10, padding: `${pad(14)}px ${pad(16)}px ${pad(16)}px` }}>
        {recallMode ? (
          <button
            type="button"
            onClick={() => onStepTicket(t, -1)}
            className="active:scale-95 transition-transform"
            style={{
              flex: 1, minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, cursor: 'pointer',
              borderRadius: 17, fontWeight: 700, fontSize: 22, lineHeight: 1, letterSpacing: '0.01em',
              background: 'linear-gradient(180deg,#ff453a,#e0281c)', color: '#ffffff',
              border: '1px solid rgba(224,40,28,0.9)',
              boxShadow: '0 8px 22px rgba(224,40,28,0.28), inset 0 1px 0 rgba(255,255,255,0.35)',
            }}
          >
            <GlassIcon name="back" size={23} sw={2} stroke="#ffffff" />
            <span>RECALL</span>
          </button>
        ) : (
        <>
        {stage !== 'unseen' && (
          <button
            type="button"
            onClick={() => onStepTicket(t, -1)}
            className="active:scale-95 transition-transform"
            style={{
              width: 58, height: 56, flex: '0 0 auto', display: 'grid', placeItems: 'center', cursor: 'pointer', borderRadius: 17,
              background: skin.btnBg, border: `1px solid ${skin.btnBorder}`, color: skin.btnFg,
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
            background: light ? skin.btnBg : skin.fill,
            color: light ? skin.btnFg : skin.fillFg,
            border: `1px solid ${light ? skin.btnBorder : skin.fillBorder}`,
            boxShadow: '0 8px 22px rgba(28,33,54,0.16), inset 0 1px 0 rgba(255,255,255,0.55)',
          }}
        >
          <GlassIcon name={vis.icon} size={23} sw={vis.sw} />
          <span>{CTA[stage]}</span>
        </button>
        </>
        )}
      </div>
      )}
    </div>
  );
}
