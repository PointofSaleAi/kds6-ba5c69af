import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { E_LOGO } from '../theme';

/** Final scene — the "e" logo lockup on the dark stage. */
export const S9Close: React.FC = () => {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 110], [0.96, 1.02], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ opacity: inOp, transform: `scale(${scale})`, textAlign: 'center' }}>
        <Img src={staticFile(E_LOGO)} style={{ width: 420, display: 'block', margin: '0 auto' }} />
      </div>
    </AbsoluteFill>
  );
};
