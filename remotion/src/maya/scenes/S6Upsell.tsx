import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, SHOT } from '../theme';
import { DeviceWindow } from '../components/DeviceWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';

const TIPS: { text: string; tag: string; color: string }[] = [
  { text: 'Add Truffle Fries to Table 15 — 62% take rate tonight.', tag: 'Menu', color: C.teal },
  { text: 'Suggest a dessert flight on Table 9. Party of four, no dessert yet.', tag: 'Upsell', color: C.magenta },
  { text: 'Pair Delivery #29 with garlic knots. Frequently bought together.', tag: 'Learned', color: C.violet },
];

const TipCard: React.FC<{ tip: typeof TIPS[number]; at: number }> = ({ tip, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at;
  if (local < -2) return null;
  const enter = spring({ frame: local, fps, config: { damping: 18, stiffness: 150 }, durationInFrames: 26 });

  return (
    <div
      style={{
        opacity: enter,
        transform: `translateX(${interpolate(enter, [0, 1], [90, 0])}px)`,
        padding: '22px 26px',
        borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(22,22,38,0.97), rgba(9,9,18,0.95))',
        border: '1px solid rgba(255,255,255,0.1)',
        borderLeft: `4px solid ${tip.color}`,
        boxShadow: '0 26px 70px rgba(0,0,0,0.6)',
        marginBottom: 18,
        width: 520,
      }}
    >
      <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 24, lineHeight: 1.3, color: C.cream }}>
        {tip.text}
      </div>
      <div
        style={{
          marginTop: 14,
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: 999,
          fontFamily: 'Montserrat',
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: tip.color,
          border: `1px solid ${tip.color}88`,
          background: `${tip.color}1f`,
        }}
      >
        {tip.tag}
      </div>
    </div>
  );
};

/** Scene 6 — upsell tips stacking beside the live ticket. */
export const S6Upsell: React.FC = () => (
  <AbsoluteFill>
    <DeviceWindow
      src={SHOT.kdsBoard}
      from={{ scale: 1.04, x: 300, y: 0 }}
      to={{ scale: 1.1, x: 250, y: 0 }}
      width={1500}
      align="left"
    />
    <AbsoluteFill style={{ background: 'linear-gradient(90deg, transparent 34%, rgba(5,6,12,0.86) 58%)' }} />
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-end', padding: '0 110px 0 0' }}>
      <div>
        {TIPS.map((tip, i) => (
          <TipCard key={i} tip={tip} at={26 + i * 30} />
        ))}
      </div>
    </AbsoluteFill>
    <Sparkles sparks={[{ x: 1320, y: 200, size: 54, at: 40 }]} />
    <Headline
      eyebrow="Learns what works"
      line1="Upselling, handled."
      accent={C.magenta}
      size={72}
      delay={20}
    />
  </AbsoluteFill>
);
