import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, CLIP } from '../theme';
import { ClipWindow } from '../components/ClipWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';

const StatBadge: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at;
  if (local < -2) return null;
  const pop = spring({ frame: local, fps, config: { damping: 16, stiffness: 160 }, durationInFrames: 24 });
  const value = Math.round(interpolate(local, [0, 34], [0, 40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <div
      style={{
        position: 'absolute',
        right: 96,
        top: 92,
        padding: '24px 38px 28px',
        borderRadius: 26,
        background: 'rgba(4,5,11,0.78)',
        border: `1px solid ${C.pink}77`,
        boxShadow: '0 30px 80px rgba(0,0,0,0.65)',
        opacity: pop,
        textAlign: 'right',
      }}
    >
      <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 92, color: C.white, lineHeight: 1 }}>
        {value}%
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: 'Montserrat',
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: C.pink,
        }}
      >
        Faster than manual entry
      </div>
    </div>
  );
};

/** Scene 4 — orders landing on the kitchen display, live upsell. */
export const S4Ordering: React.FC = () => (
  <AbsoluteFill>
    <ClipWindow src={CLIP.s4Kds} width={1620} scaleFrom={1} scaleTo={1.05} />
    <Sparkles
      sparks={[
        { x: 380, y: 280, size: 60, at: 40 },
        { x: 1460, y: 640, size: 44, at: 96, color: C.pink },
      ]}
    />
    <StatBadge at={196} />
    <Headline
      line1="Orders captured, routed"
      line2="and upsold in real time."
      size={70}
      delay={18}
    />
  </AbsoluteFill>
);
