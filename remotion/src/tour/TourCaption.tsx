import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const ACCENT = '#1DA94A';
const CREAM = '#F0F2F5';

export const TourCaption: React.FC<{
  title: string;
  sub: string;
  step: number;
  total: number;
}> = ({ title, sub, step, total }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const inS = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 24 });
  const outS = interpolate(frame, [durationInFrames - 18, durationInFrames - 4], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const x = interpolate(inS, [0, 1], [-70, 0]);
  const clip = interpolate(inS, [0, 1], [0, 100]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', justifyContent: 'flex-end' }}>
      <div
        style={{
          margin: '0 0 76px 84px',
          padding: '26px 40px 28px',
          maxWidth: 1080,
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(9,10,18,0.86), rgba(9,10,18,0.62))',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          backdropFilter: undefined,
          transform: `translateX(${x}px)`,
          opacity: inS * outS,
          clipPath: `inset(0 ${100 - clip}% 0 0)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: 'Montserrat',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 3,
            color: ACCENT,
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: ACCENT,
              display: 'inline-block',
            }}
          />
          {`Step ${step} of ${total}`}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: 'Montserrat',
            fontWeight: 900,
            fontSize: 60,
            lineHeight: 1.04,
            color: CREAM,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: 'Montserrat',
            fontWeight: 500,
            fontSize: 27,
            color: 'rgba(240,242,245,0.74)',
          }}
        >
          {sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};
