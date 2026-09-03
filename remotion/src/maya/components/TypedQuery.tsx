import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../theme';

/** A Maya prompt bar with a typewriter query and a blinking caret. */
export const TypedQuery: React.FC<{
  text: string;
  at: number;
  perChar?: number;
  width?: number;
}> = ({ text, at, perChar = 1.4, width = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at;

  const enter = spring({ frame: local, fps, config: { damping: 200 }, durationInFrames: 20 });
  const chars = Math.max(0, Math.min(text.length, Math.floor(local / perChar)));
  const caretOn = Math.floor(local / 8) % 2 === 0;

  if (local < -2) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 118,
        width,
        transform: `translate(-50%, ${interpolate(enter, [0, 1], [40, 0])}px)`,
        opacity: enter,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '22px 28px',
        borderRadius: 999,
        background: 'linear-gradient(135deg, rgba(20,20,34,0.96), rgba(10,10,20,0.94))',
        border: `1px solid ${C.violet}77`,
        boxShadow: `0 26px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.violet}, ${C.magenta})`,
          flexShrink: 0,
          boxShadow: `0 0 22px ${C.violet}aa`,
        }}
      />
      <div
        style={{
          fontFamily: 'Montserrat',
          fontWeight: 700,
          fontSize: 30,
          color: C.cream,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {text.slice(0, chars)}
        <span style={{ opacity: caretOn ? 1 : 0, color: C.magenta }}>|</span>
      </div>
    </div>
  );
};
