import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

export type Focus = { scale: number; x: number; y: number };

/**
 * A product screenshot staged as a floating rounded device window on the dark
 * stage. Never full-bleed (the sources are sub-1080p), always with a slow
 * push-in from `from` to `to` so the region under discussion reads clearly.
 */
export const DeviceWindow: React.FC<{
  src: string;
  from?: Focus;
  to?: Focus;
  width?: number;
  align?: 'center' | 'left' | 'right';
  delay?: number;
  children?: React.ReactNode;
}> = ({
  src,
  from = { scale: 1, x: 0, y: 0 },
  to = { scale: 1.06, x: 0, y: 0 },
  width = 1500,
  align = 'center',
  delay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 26 });
  const t = interpolate(frame, [delay, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(t, [0, 1], [from.scale, to.scale]) * interpolate(enter, [0, 1], [0.955, 1]);
  const x = interpolate(t, [0, 1], [from.x, to.x]);
  const y = interpolate(t, [0, 1], [from.y, to.y]) + interpolate(enter, [0, 1], [34, 0]);

  const offsetX = align === 'center' ? 0 : align === 'left' ? -170 : 170;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          position: 'relative',
          width,
          borderRadius: 22,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.13)',
          boxShadow: `0 50px 130px rgba(0,0,0,0.72), 0 0 0 10px rgba(124,58,237,0.07)`,
          background: C.bg1,
          opacity: enter,
          transform: `translate(${offsetX + x}px, ${y}px) scale(${scale})`,
        }}
      >
        <Img src={staticFile(src)} style={{ width: '100%', display: 'block' }} />
        {children}
      </div>
    </AbsoluteFill>
  );
};
