import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, CLIP } from '../theme';
import { ClipWindow } from '../components/ClipWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';

const TIPS = [
  { text: 'Add Truffle Fries to Table 15 — 62% take rate tonight.', tag: 'Menu' },
  { text: 'Suggest a dessert flight on Table 9. Party of four, no dessert yet.', tag: 'Upsell' },
  { text: 'Pair Delivery #29 with garlic knots. Frequently bought together.', tag: 'Learned' },
];

const TipCard: React.FC<{ tip: typeof TIPS[number]; at: number }> = ({ tip, at }) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < 0) return null;
  const enter = interpolate(local, [0, 16], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        opacity: enter,
        padding: '20px 24px',
        borderRadius: 20,
        background: 'rgba(4,5,11,0.86)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderLeft: `4px solid ${C.pink}`,
        boxShadow: '0 26px 70px rgba(0,0,0,0.6)',
        marginBottom: 16,
        width: 500,
      }}
    >
      <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 23, lineHeight: 1.3, color: C.white }}>
        {tip.text}
      </div>
      <div
        style={{
          marginTop: 12,
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: 999,
          fontFamily: 'Montserrat',
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: C.pink,
          border: `1px solid ${C.pink}88`,
        }}
      >
        {tip.tag}
      </div>
    </div>
  );
};

/** Scene 6 — upsell tips stacking beside the live board. */
export const S6Upsell: React.FC = () => (
  <AbsoluteFill>
    <ClipWindow src={CLIP.s6Kds} width={1420} scaleFrom={1} scaleTo={1.03} />
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, transparent 42%, rgba(5,6,12,0.88) 62%)' }} />
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-end', padding: '0 96px 0 0' }}>
      <div>
        {TIPS.map((tip, i) => (
          <TipCard key={tip.tag} tip={tip} at={26 + i * 28} />
        ))}
      </div>
    </AbsoluteFill>
    <Sparkles sparks={[{ x: 300, y: 240, size: 54, at: 40, color: C.pink }]} />
    <Headline eyebrow="Learns what works" line1="Upselling, handled." size={68} delay={20} />
  </AbsoluteFill>
);
