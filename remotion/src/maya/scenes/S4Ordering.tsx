import React from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, SHOT } from '../theme';
import { DeviceWindow } from '../components/DeviceWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';
import { TouchTap } from '../components/TouchTap';

const StatBadge: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at;
  if (local < -2) return null;
  const pop = spring({ frame: local, fps, config: { damping: 13, stiffness: 170 }, durationInFrames: 24 });
  const value = Math.round(interpolate(local, [0, 34], [0, 40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <div
      style={{
        position: 'absolute',
        right: 120,
        top: 150,
        padding: '26px 40px 30px',
        borderRadius: 26,
        background: 'linear-gradient(135deg, rgba(22,160,133,0.22), rgba(10,10,20,0.9))',
        border: `1px solid ${C.teal}88`,
        boxShadow: '0 30px 80px rgba(0,0,0,0.65)',
        opacity: pop,
        transform: `scale(${interpolate(pop, [0, 1], [0.86, 1])})`,
        textAlign: 'right',
      }}
    >
      <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 92, color: C.cream, lineHeight: 1 }}>
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
          color: C.teal,
        }}
      >
        Faster than manual entry
      </div>
    </div>
  );
};

/** Scene 4 — voice/text capture, straight to the kitchen, live upsell. */
export const S4Ordering: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={200}>
      <DeviceWindow
        src={SHOT.kdsBoard}
        from={{ scale: 1.06, x: 240, y: 20 }}
        to={{ scale: 1.16, x: 90, y: 10 }}
        width={1620}
      />
      <TouchTap taps={[{ x: 700, y: 470, at: 40 }]} />
      <Sparkles sparks={[{ x: 1480, y: 300, size: 62, at: 70 }]} />
    </Sequence>

    <Sequence from={200}>
      <DeviceWindow
        src={SHOT.kdsBoard}
        from={{ scale: 1.1, x: -320, y: 0 }}
        to={{ scale: 1.2, x: -430, y: -10 }}
        width={1620}
      />
      <Sparkles
        sparks={[
          { x: 1080, y: 420, size: 58, at: 18 },
          { x: 1320, y: 640, size: 44, at: 40, color: C.violet },
        ]}
      />
      <StatBadge at={30} />
    </Sequence>

    <Headline
      line1="Orders captured, routed"
      line2="and upsold in real time."
      accent={C.magenta}
      size={74}
      delay={18}
    />
  </AbsoluteFill>
);
