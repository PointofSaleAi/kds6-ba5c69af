import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

/**
 * Bold, high-contrast scene copy. One short line (optionally two), Montserrat
 * 900, always inside the safe area.
 */
export const Headline: React.FC<{
  eyebrow?: string;
  line1: string;
  line2?: string;
  accent?: string;
  size?: number;
  delay?: number;
  place?: 'bottom-left' | 'center' | 'top-left';
}> = ({ eyebrow, line1, line2, accent = C.blueBright, size = 86, delay = 0, place = 'bottom-left' }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 24 });
  const out = interpolate(frame, [durationInFrames - 20, durationInFrames - 6], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const clip = interpolate(enter, [0, 1], [0, 100]);
  const shift = interpolate(enter, [0, 1], [46, 0]);

  const box: React.CSSProperties =
    place === 'center'
      ? { justifyContent: 'center', alignItems: 'center', textAlign: 'center' }
      : place === 'top-left'
        ? { justifyContent: 'flex-start', alignItems: 'flex-start', padding: '96px 0 0 108px' }
        : { justifyContent: 'flex-end', alignItems: 'flex-start', padding: '0 0 88px 108px' };

  return (
    <AbsoluteFill style={{ ...box, pointerEvents: 'none' }}>
      <div style={{ opacity: enter * out, transform: `translateY(${shift}px)`, maxWidth: 1360 }}>
        {eyebrow ? (
          <div
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: 5,
              textTransform: 'uppercase',
              color: accent,
              marginBottom: 16,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: 'Montserrat',
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1.03,
            letterSpacing: -1.5,
            color: C.cream,
            textShadow: '0 18px 50px rgba(0,0,0,0.75)',
            clipPath: `inset(0 ${100 - clip}% 0 0)`,
          }}
        >
          {line1}
        </div>
        {line2 ? (
          <div
            style={{
              marginTop: 10,
              fontFamily: 'Montserrat',
              fontWeight: 900,
              fontSize: size * 0.62,
              lineHeight: 1.1,
              letterSpacing: -0.6,
              color: accent,
              textShadow: '0 14px 40px rgba(0,0,0,0.7)',
              clipPath: `inset(0 ${100 - clip}% 0 0)`,
            }}
          >
            {line2}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
