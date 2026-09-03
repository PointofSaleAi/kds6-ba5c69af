import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, framePath } from '../theme';

/**
 * A supplied screen recording (as an extracted frame sequence) staged as a
 * framed window on the dark stage. Scale-only hold: the frame never drifts
 * left or right, so on-screen product text stays stable and legible.
 */
export const ClipWindow: React.FC<{
  src: { dir: string; count: number };
  width?: number;
  scaleFrom?: number;
  scaleTo?: number;
  y?: number;
  children?: React.ReactNode;
}> = ({ src, width = 1560, scaleFrom = 1, scaleTo = 1.04, y = -12, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const enter = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' });
  const t = interpolate(frame, [0, durationInFrames - 1], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(t, [0, 1], [scaleFrom, scaleTo]);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          position: 'relative',
          width,
          borderRadius: 22,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.13)',
          boxShadow: '0 50px 130px rgba(0,0,0,0.72), 0 0 0 10px rgba(124,58,237,0.07)',
          background: C.bg1,
          opacity: enter,
          transform: `translateY(${y}px) scale(${scale})`,
        }}
      >
        <Img src={staticFile(framePath(src.dir, frame, src.count))} style={{ width: '100%', display: 'block' }} />
        {children}
      </div>
    </AbsoluteFill>
  );
};
