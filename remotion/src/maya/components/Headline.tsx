import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

/**
 * Bold, high-contrast scene copy in white with a pink accent line.
 * Fades in on the spot — never slides sideways — sits on a soft dark scrim so
 * it stays readable over live footage, and holds until the scene ends.
 */
export const Headline: React.FC<{
  eyebrow?: string;
  line1: string;
  line2?: string;
  accent?: string;
  size?: number;
  delay?: number;
  place?: 'bottom-left' | 'center' | 'top-left';
}> = ({ eyebrow, line1, line2, accent = C.pink, size = 86, delay = 0, place = 'bottom-left' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const enter = interpolate(frame, [delay, delay + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames - 2], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = enter * out;

  const box: React.CSSProperties =
    place === 'center'
      ? { justifyContent: 'center', alignItems: 'center', textAlign: 'center' }
      : place === 'top-left'
        ? { justifyContent: 'flex-start', alignItems: 'flex-start', padding: '92px 0 0 100px' }
        : { justifyContent: 'flex-end', alignItems: 'flex-start', padding: '0 0 84px 100px' };

  return (
    <AbsoluteFill style={{ ...box, pointerEvents: 'none' }}>
      <div
        style={{
          opacity,
          maxWidth: 1420,
          padding: '26px 40px 30px',
          borderRadius: 26,
          background: 'rgba(4,5,11,0.62)',
          boxShadow: '0 30px 90px rgba(0,0,0,0.55)',
        }}
      >
        {eyebrow ? (
          <div
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: 5,
              textTransform: 'uppercase',
              color: C.pink,
              marginBottom: 14,
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
            lineHeight: 1.04,
            letterSpacing: -1.5,
            color: C.white,
            textShadow: '0 14px 44px rgba(0,0,0,0.85)',
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
              fontSize: size * 0.64,
              lineHeight: 1.1,
              letterSpacing: -0.6,
              color: accent === C.white ? C.white : C.pink,
              textShadow: '0 12px 36px rgba(0,0,0,0.8)',
            }}
          >
            {line2}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
