import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

/**
 * Persistent dark stage: near-black gradient with a slow violet bloom that
 * drifts behind the active window.
 */
export const Stage: React.FC<{ bloom?: number; children?: React.ReactNode }> = ({
  bloom = 1,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const drift = Math.sin((frame / 90) * Math.PI) * 26;
  const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin((frame / 120) * Math.PI * 2));
  const fadeIn = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames - 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg1} 0%, ${C.bg0} 62%, #02030699 100%)` }}>
      <AbsoluteFill
        style={{
          opacity: bloom * pulse * 0.5,
          background: `radial-gradient(46% 48% at ${50 + drift / 6}% ${44 + drift / 10}%, ${C.violet}55 0%, transparent 72%)`,
          filter: 'blur(2px)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: bloom * 0.24,
          background: `radial-gradient(30% 34% at ${16 - drift / 12}% 82%, ${C.magenta}44 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
