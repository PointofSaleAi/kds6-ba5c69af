import React from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, SHOT } from '../theme';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';

const MiniScreen: React.FC<{ src: string; x: number; y: number; w: number; rot: number; at: number }> = ({
  src,
  x,
  y,
  w,
  rot,
  at,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at;
  const enter = spring({ frame: local, fps, config: { damping: 200 }, durationInFrames: 30 });
  const recede = interpolate(frame, [92, 140], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 34px 90px rgba(0,0,0,0.7)',
        opacity: enter * recede * 0.85,
        transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px) rotate(${rot}deg) scale(${interpolate(recede, [0, 1], [0.9, 1])})`,
      }}
    >
      <Img src={staticFile(src)} style={{ width: '100%', display: 'block' }} />
    </div>
  );
};

/** Scene 9 — screens recede, eatOS lockup lands. */
export const S9Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lockup = spring({ frame: frame - 128, fps, config: { damping: 200 }, durationInFrames: 30 });

  return (
    <AbsoluteFill>
      <MiniScreen src={SHOT.kdsBoard} x={-120} y={190} w={820} rot={-2.4} at={0} />
      <MiniScreen src={SHOT.menusync} x={640} y={110} w={760} rot={1.6} at={14} />
      <MiniScreen src={SHOT.askMaya} x={1290} y={300} w={760} rot={-1.4} at={28} />

      <Sparkles
        sparks={[
          { x: 960, y: 240, size: 62, at: 44 },
          { x: 420, y: 720, size: 44, at: 62, color: C.violet },
        ]}
      />

      <Sequence durationInFrames={126}>
        <Headline
          line1="Running the restaurant,"
          line2="so you can run the room."
          accent={C.blueBright}
          size={80}
          delay={44}
          place="center"
        />
      </Sequence>

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            opacity: lockup,
            transform: `translateY(${interpolate(lockup, [0, 1], [34, 0])}px)`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 900,
              fontSize: 128,
              letterSpacing: -4,
              color: C.cream,
              lineHeight: 1,
            }}
          >
            eat<span style={{ color: C.blueBright }}>OS</span>
          </div>
          <div
            style={{
              marginTop: 22,
              fontFamily: 'Montserrat',
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: 10,
              textTransform: 'uppercase',
              color: C.magenta,
            }}
          >
            Maya AI Automation
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
